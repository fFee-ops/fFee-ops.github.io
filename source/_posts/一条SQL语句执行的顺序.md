---
title: 一条SQL语句执行的顺序
date: 2022-11-21 17:41:29
tags: sql 数据库 mysql
categories: MySQL
---

<!--more-->

# 1\. 查询语句

## 1.1 总体流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/1fe1b858099647e1bf047f8912f65815.png)  
大体来说，MySQL可以分为Server层和存储引擎层两部分。  
Server层包括连接器、查询缓存、分析器、优化器、执行器等，涵盖MySQL的大多数核心服务 功能，以及所有的内置函数\(如日期、时间、数学和加密函数等\)，所有跨存储引擎的功能都在 这一层实现，比如存储过程、触发器、视图等。

存储引擎层负责数据的存储和提取。其架构模式是插件式的，支持InnoDB、MyISAM、 Memory等多个存储引擎。现在最常用的存储引擎是InnoDB，它从MySQL 5.5.5版本开始成为了 默认存储引擎。

## 1.2 流程细分

用一条查询语句来举例

```sql
select * from table where id = 10
```

### 1.2.1 连接器

第一步，你会先连接到这个数据库上，这时候接待你的就是连接器。连接器负责跟客户端建立连 接、获取权限、维持和管理连接。在完成经典的TCP握手后，连接器 就要开始认证你的身份，这个时候用的就是你输入的用户名和密码。

- 如果用户名或密码不对，你就会收到一个"Access denied for user"的错误，然后客户端程序 结束执行。
- 如果用户名密码认证通过，连接器会到权限表里面查出你拥有的权限。之后，这个连接里面 的权限判断逻辑，都将依赖于此时读到的权限。【这就意味着，一个用户成功建立连接后，即使你用管理员账号对这个用户的权限做了修改，也不 会影响已经存在连接的权限。修改完成后，只有再新建的连接才会使用新的权限设置。】

连接完成后，如果你没有后续的动作，这个连接就处于空闲状态，你可以在show processlist命 令中看到它。文本中这个图是show processlist的结果，其中的Command列显示为“Sleep”的这 一行，就表示现在系统里面有一个空闲连接。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3f5cbcb0309c4f378a905db5867c0e1a.png)  
客户端如果太长时间没动静，连接器就会自动将它断开。这个时间是由参数wait\_timeout控制 的，默认值是8小时。  
如果在连接被断开之后，客户端再次发送请求的话，就会收到一个错误提醒: Lost connection to MySQL server during query。这时候如果你要继续，就需要重连，然后再执行请求了。

数据库里面，长连接是指连接成功后，如果客户端持续有请求，则一直使用同一个连接。短连接 则是指每次执行完很少的几次查询就断开连接，下次查询再重新建立一个。  
建立连接的过程通常是比较复杂的，所以在使用中要尽量减少建立连接的动作，也就是尽量使用长连接。

但是全部使用长连接后，你可能会发现，有些时候MySQL占用内存涨得特别快。长连接累积下来，可能导致内存占用太大，被系统强行杀掉\(OOM\)，从现 象看就是MySQL异常重启了。  
可以考虑以下两种方案来解决这个问题：

1.  定期断开长连接。使用一段时间，或者程序里面判断执行过一个占用内存的大查询后，断开 连接，之后要查询再重连。
2.  如果你用的是MySQL5.7或更新版本，可以在每次执行一个比较大的操作后，通过执行 mysql\_reset\_connection来重新初始化连接资源。这个过程不需要重连和重新做权限验证， 但是会将连接恢复到刚刚创建完时的状态。

### 1.2.2 查询缓存

大概了解下就行，8.0版本已经删除了。  
连接建立完成后，你就可以执行select语句了。执行逻辑就会来到第二步:查询缓存。

MySQL拿到一个查询请求后，会先到查询缓存看看，之前是不是执行过这条语句。之前执行过 的语句及其结果可能会以key-value对的形式，被直接缓存在内存中。key是查询的语句，value是 查询的结果。如果你的查询能够直接在这个缓存中找到key，那么这个value就会被直接返回给客 户端。

如果语句不在查询缓存中，就会继续后面的执行阶段。执行完成后，执行结果会被存入查询缓存 中。你可以看到，如果查询命中缓存，MySQL不需要执行后面的复杂操作，就可以直接返回结果，这个效率会很高。

但是用查询缓存的是利大于弊的：  
查询缓存的失效非常频繁，只要有对一个表的更新，这个表上所有的查询缓存都会被清空。对于更新压力大的数据库 来说，查询缓存的命中率会非常低。除非你的业务就是有一张静态表，很长时间才会更新一次。 比如，一个系统配置表，那这张表上的查询才适合使用查询缓存

### 1.2.3 分析器

如果没有命中查询缓存，就要开始真正执行语句了。首先，MySQL需要知道你要做什么，因此 需要对SQL语句做解析。

分析器先会做“**词法分析**”。你输入的是由多个字符串和空格组成的一条SQL语句，MySQL需要识 别出里面的字符串分别是什么，代表什么。

MySQL从你输入的"select"这个关键字识别出来，这是一个查询语句。它也要把字符串“T”识别 成“表名T”，把字符串“ID”识别成“列ID”。

做完了这些识别以后，就要做“**语法分析**”。根据词法分析的结果，语法分析器会根据语法规则， 判断你输入的这个SQL语句是否满足MySQL语法。  
如果你的语句不对，就会收到“You have an error in your SQL syntax”的错误提醒。

### 1.2.4 优化器

经过了分析器，MySQL就知道你要做什么了。在开始执行之前，还要先经过优化器的处理。 优化器是在表里面有多个索引的时候，决定使用哪个索引;或者在一个语句有多表关联\(join\)的时候，决定各个表的连接顺序。

### 1.2.5 执行器

MySQL通过分析器知道了你要做什么，通过优化器知道了该怎么做，于是就进入了执行器阶 段，开始执行语句。  
开始执行的时候，要先判断一下你对这个表有没有执行查询的权限，如果没有，就会返回没有 权限的错误。  
如果有权限，就打开表继续执行。打开表的时候，执行器就会根据表的引擎定义，去使用这个引 擎提供的接口。假设id字段没有索引

1.  调用InnoDB引擎接口取这个表的第一行，判断ID值是不是10，如果不是则跳过，如果是则  
    将这行存在结果集中;
2.  调用引擎接口取“下一行”，重复相同的判断逻辑，直到取到这个表的最后一行。
3.  执行器将上述遍历过程中所有满足条件的行组成的记录集作为结果集返回给客户端。  
    至此，这个语句就执行完成了。

# 2\. 修改语句

## 2.1 总体流程

总体流程其实和查询语句差不多，主要要注意两个日志，redoLog和binLog。

1.  执行语句前要先连接数据库，这是连接器的工作。

2.  前面说过，在一个表上有更新的时候，跟这个表有关的查询缓存会失效，所以这条语句就会 把表T上所有缓存结果都清空。这也就是一般不建议使用查询缓存的原因。

3.  接下来，分析器会通过词法和语法解析知道这是一条更新语句。优化器决定要使用ID这个索引。

4.  然后，执行器负责具体执行，找到这一行，然后更新。

假设有一条更新语句

```sql
update T set c=c+1 where ID=2;
```

## 2.2 redoLog

> 重做日志
> 
> **作用：** 确保事务的持久性。防止在发生故障的时间点，尚有脏页未写入磁盘，在重启mysql服务的时候，根据redo log进行重做，从而达到事务的持久性这一特性。
> 
> **内容：** 物理格式的日志，记录的是物理数据页面的修改的信息，其redo log是顺序写入redo log file的物理文件中去的。

在MySQL里有个问题，如果每一次的更新操作都需要写进磁盘，然后磁盘也要找到 对应的那条记录，然后再更新，整个过程IO成本、查找成本都很高。  
MySQL里经常说到的WAL技术，WAL的全称是Write- Ahead Logging，它的关键点就是先写日志，再写磁盘，这样来解决成本高的问题。

详细点来说当有一条记录需要更新的时候，InnoDB引擎就会先把记录写到redo log里 面，并更新内存，这个时候更新就算完成了。同时，InnoDB引擎会在适当的时候，将这个操作记录更新到磁盘里面，而这个更新往往是在系统比较空闲的时候做。

InnoDB的redo log是固定大小的，比如可以配置为一组4个文件，每个文件的大小是 1GB，那么这块“粉板”总共就可以记录4GB的操作。从头开始写，写到末尾就又回到开头循环写入。

有了redo log，InnoDB就可以保证即使数据库发生异常重启，之前提交的记录都不会丢失，这个能力称为crash-safe。

## 2.3 binLog

> 归档日志（二进制日志）
> 
> **作用：** 用于复制，在主从复制中，从库利用主库上的binlog进行重播，实现主从同步。用于数据库的基于时间点的还原。
> 
> **内容：** 逻辑格式的日志，可以简单认为就是执行过的事务中的sql语句。
> 
> 但又不完全是sql语句这么简单，而是包括了执行的sql语句（增删改）反向的信息，也就意味着delete对应着delete本身和其反向的insert；update对应着update执行前后的版本的信息；insert对应着delete和insert本身的信息。
> 
> binlog 有三种模式：Statement（基于 SQL 语句的复制）、Row（基于行的复制） 以及 Mixed（混合模式）

MySQL整体来看，其实就有两块:一块是Server层，它主要做的是MySQL功能 层面的事情;还有一块是引擎层，负责存储相关的具体事宜。上面我们聊到的redo log是 **InnoDB引擎特有的**日志，而Server层也有自己的日志，称为binlog\(归档日志\)。

## 2.4 两种日志的比较

1.  redolog是InnoDB引擎特有的；binlog是MySQL的Server层实现的，所有引擎都可以使用。
2.  redolog是物理日志，记录的是“在某个数据页上做了什么修改”;binlog是逻辑日志，记录的是这个语句的原始逻辑，比如“给ID=2这一行的c字段加1 ”。
3.  redolog是循环写的，空间固定会用完;binlog是可以追加写入的。“追加写”是指binlog文件写到一定大小后会切换到下一个，并不会覆盖以前的日志。

## 2.5 两阶段提交

将redo log的写入拆成了两个步骤:prepare和commit，这就是"两阶段提交"。

### 2.5.1 为啥要有两阶段提交？

**简单说，redo log和binlog都可以用于表示事务的提交状态，而两阶段提交就是让这两个状态保 持逻辑上的一致。**

我们来思考一个问题，怎样让数据库恢复到半个月内任意一秒的状态\?

> 前面我们说过了，binlog会记录所有的逻辑操作，并且是采用“追加写”的形式。如果你的DBA承 诺说半个月内可以恢复，那么备份系统中一定会保存最近半个月的所有binlog，同时系统会定期 做整库备份。这里的“定期”取决于系统的重要性，可以是一天一备，也可以是一周一备。
> 
> 当需要恢复到指定的某一秒时，比如某天下午两点发现中午十二点有一次误删表，需要找回数 据，那你可以这么做:
> 
> - 首先，找到最近的一次全量备份，如果你运气好，可能就是昨天晚上的一个备份，从这个备 份恢复到临时库;
> - 然后，从备份的时间点开始，将备份的binlog依次取出来，重放到中午误删表之前的那个时 刻。
> 
> 这样你的临时库就跟误删之前的线上库一样了，然后你可以把表数据从临时库取出来，按需要恢 复到线上库去。

由于redo log和binlog是两个独立的逻辑，如果不用两阶段提交，要么就是先写完redo log再写 binlog，或者采用反过来的顺序。我们看看这两种方式会有什么问题。

仍然用前面的update语句来做例子。假设当前ID=2的行，字段c的值是0，再假设执行update语 句过程中在写完第一个日志后，第二个日志还没有写完期间发生了crash，会出现什么情况呢\?

- 先写redo log后写binlog。假设在redo log写完，binlog还没有写完的时候，MySQL进程异 常重启。由于我们前面说过的，redo log写完之后，系统即使崩溃，仍然能够把数据恢复回 来，所以恢复后这一行c的值是1。 但是由于binlog没写完就crash了，这时候binlog里面就没有记录这个语句。因此，之后备份日志的时候，存起来的binlog里面就没有这条语句。 然后你会发现，如果需要用这个binlog来恢复临时库的话，由于这个语句的binlog丢失，这 个临时库就会少了这一次更新，恢复出来的这一行c的值就是0，与原库的值不同。

- 先写binlog后写redo log。如果在binlog写完之后crash，由于redo log还没写，崩溃恢复以后这个事务无效，所以这一行c的值是0。但是binlog里面已经记录了“把c从0改成1”这个日 志。所以，在之后用binlog来恢复的时候就多了一个事务出来，恢复出来的这一行c的值就是 1，与原库的值不同。

可以看到，如果不使用“两阶段提交”，那么数据库的状态就有可能和用它的日志恢复出来的库的状态不一致。