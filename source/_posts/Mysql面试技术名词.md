---
title: Mysql面试技术名词
date: 2021-01-21 20:03:52
tags: 
categories: MySQL
---

<!--more-->

### 面试技术名词

- [回表](#_1)
- [覆盖索引](#_20)
- [最左匹配](#_32)
- [索引下推](#_36)
- - [举例](#_42)

# 回表

假如有两个B+树索引分别如下面的图：

（1）id为主键，聚集索引，叶子节点存储行记录；

（2）name为KEY，普通索引，叶子节点存储id值；  
　　  
然后现在有一条sql语句

```sql
select * from t where name='lisi';
```

看看执行过程：

- 如粉红色路径，需要扫码两遍索引树：  
  （1）先通过普通索引定位到主键值id=5；  
  （2）在通过聚集索引定位到行记录；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210121193620335.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
这就是所谓的回表查询，就是还要回表查询一次。

# 覆盖索引

还是用上面的例子，这次的sql语句换成下面这个：

```sql
select id,name from user where name='lisi';　
```

可以发现通过name的索引树就可以获取到所有需要的值，不需要回表查询这就叫覆盖索引。

> 而且用explain来看 Extra字段为`Using index`

# 最左匹配

在mysql建立联合索引时会遵循最左前缀匹配的原则，即最左优先，在检索数据时从联合索引的**最左边**开始匹配。

# 索引下推

- 不使用索引条件下推优化时存储引擎通过索引检索到数据，然后返回给MySQL服务器，服务器然后判断数据是否符合条件。
- 当使用索引条件下推优化时，如果存在某些被索引的列的判断条件时，MySQL服务器将这一部分判断条件传递给存储引擎，然后由存储引擎通过判断索引是否符合MySQL服务器传递的条件，只有当索引符合条件时才会将数据检索出来返回给MySQL服务器。

## 举例

准备一张用户表\(user\)，其中主要几个字段有：id、name、age、address。建立联合索引（name，age）。

①假设有一个需求，要求匹配姓名第一个为陈的所有用户，sql语句如下：

```sql
SELECT * from user where  name like '陈%'
```

> 根据 “最佳左前缀” 的原则，这里使用了联合索引（name，age）进行了查询，性能要比全表扫描肯定要高。  

②问题来了，如果有其他的条件呢？假设又有一个需求，要求匹配姓名第一个字为陈，年龄为20岁的用户，此时的sql语句如下：

```sql
SELECT * from user where  name like '陈%' and age=20
```

**语句执行的过程：**  
①5.6版本之前\<无索引下推>  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210121195216770.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
会忽略age这个字段，直接通过name进行查询，在\(name,age\)这颗索引树上查找到了两个结果，id分别为2,1，然后拿着取到的id值一次次的回表查询，因此这个过程需要回表两次。

②Mysql5.6及之后版本\<有索引下推>  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210121195345860.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
InnoDB并没有忽略age这个字段，而是在索引内部就判断了age是否等于20，对于不等于20的记录直接跳过，因此在\(name,age\)这棵索引树中只匹配到了一个记录，此时拿着这个id去主键索引树中回表查询全部数据，这个过程只需要回表一次。

**总结一下：**

- 在没有索引下推的时候，先把所有name符合条件的从存储引擎取出来，然后再在server层对age进行过滤。
- 而在有索引下推的时候，就是在从存储引擎中取name的时候就直接把不符合age的字段给去掉，在server层就不用再过滤了
- 索引下推优化技术其实就是充分利用了索引中的数据，尽量在查询出整行数据之前过滤掉无效的数据。
- 由于需要存储引擎将索引中的数据与条件进行判断，所以这个技术是基于存储引擎的，只有特定引擎可以使用。并且判断条件需要是在存储引擎这个层面可以进行的操作才可以，比如调用存储过程的条件就不可以，因为存储引擎没有调用存储过程的能力。