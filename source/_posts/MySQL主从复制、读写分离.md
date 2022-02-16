---
title: MySQL主从复制、读写分离
date: 2021-06-16 17:47:23
tags: mysql 数据库 sql
categories: MySQL
---

<!--more-->

### MySQL主从复制、读写分离

- [为什么要用主从复制、读写分离？](#_3)
- [主从复制](#_14)
- - [原理](#_15)
  - [配置实现](#_25)
  - - [一主一从](#_26)
    - [双主双从](#_95)
- [读写分离](#_131)
- - [读写分离的实现方式](#_133)
  - [通过mycat实现](#mycat_137)

# 为什么要用主从复制、读写分离？

为了提高数据库的可用性、并发性能。你想如果是一台单机数据库，所有请求都打在它上面，那么就会导致I/O频率过高。假如有三台，一台主负责写，两台从负责读，那就会大幅提高性能。

**在这块儿其实有个问题：`如果主库突然宕机，然后恰好数据还没同步到从库，那么有些数据可能在从库上是没有的，有些数据可能就丢失了。`**

MySQL 实际上在这一块有两个机制：  
一个是**半同步复制**，用来解决**主库数据丢失**问题；

> 大概流程就是master写入binlog后就强制将此刻的数据同步到从库，从库把变动写入到本地的relay-log后就会返回一个`ack`给master，master收到一个以上从库发来的`ack`就认为写操作完成了。

一个是**并行复制**，用来解决主从**同步延时**问题。

> 指的就是从库开启多个线程，并行读relay-log，这是库级别的并行，粒度比较大

# 主从复制

## 原理

> Relay log，我们翻译成中文，一般叫做中继日志，一般情况下它在MySQL主从同步读写分离集群的从节点才开启。主节点一般不需要这个日志。

1.  当master进行改动数据的操作时，会按照顺序记录到binlog中，然后slave会连接master，Master有多少个slave就会创建多少个binlog dump线程。
2.  当Master的binlog发生变化时，binlog dump 线程会通知所有的salve节点，并将相应的binlog传给slave
3.  slave会把binlog的内容写到自己本地的relay-log，这一步是io线程来做的不是sql线程
4.  SQL线程会读取relay-log日志的内容并应用到从服务器，从而使从服务器和主服务器的数据保持一致。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210616171115323.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 配置实现

### 一主一从

> 前提假设有maser、slave两台机器

1、在maset上修改/etc/my.cnf的文件

```yml
#mysql服务唯一id，不同的mysql服务必须拥有全局唯一的id
server-id=1
#启动二进制日期
log-bin=mysql-bin
#设置不要复制的数据库
binlog-ignore-db=mysql
binlog-ignore-db=information-schema
#设置需要复制的数据库
binlog-do-db=xxx
#设置binlog的格式
binlog_format=statement
```

2、在slave上修改/etc/my.cnf文件

```yml
#服务器唯一id
server-id=2
#启动中继日志
relay-log=mysql-relay
```

3、重新启动两台机器的mysql服务

4、在master上创建账户并授权slave

```sql
grant replication slave on *.* to 'root'@'%' identified by 'yourpassword';
--在进行授权的时候，如果提示密码的问题，把密码验证取消
set global validate_password_policy=0;
set global validate_password_length=1;
```

5、查看master的状态，拿到要同步哪个log`MASTER_LOG_FILE`，以及起始位置`MASTER_LOG_POS`

```sql
show master status
```

6、在slave上配置需要复制的主机

```sql
CHANGE MASTER TO MASTER_HOST='192.168.80.17',MASTER_USER='root',MASTER_PASSWORD='root1234',MASTER_LOG_FILE='mysql-bin.000001',MASTER_LOG_POS=154;
```

7、启动从服务器复制功能

```sql
start slave;
```

8、查看从服务器状态

```sql
show slave status\G
```

当执行完成之后，会看到两个关键的属性Slave\_IO\_Running，Slave\_SQL\_Running，当这两个属性都是yes的时候，表示主从复制已经准备好了，可以进行具体的操作了

当然经常会遇到一些bug，比如我遇到的 Fatal error: The slave I/O thread stops because master and slave have equal MySQL server UUIDs  
即两台机器的uuid重复了。只需要修改slave的uuid然后重启mysql服务即可。

```sql
cd /var/lib/mysql
vi auto.cnf
```

**一主一从验证：**  
在主从库分别建立好数据库`tset`。  
然后在主的库执行:

```sql
create table mytbl(id int,name varchar(20));
create table mytbl(id int,name varchar(20));
```

检查从库也会出现表和记录。

### 双主双从

> 假设有node1、node2、node3、node4，4台机器，1、3为master，2、4为slave  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/4d3c34494ba34e69851a5e78d193402a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
> 在此架构中，可以让一台主机用来处理所有写请求，此时，它的从机和备机，以及备机的从机复制所有读请求，当主机宕机之后，另一台主机负责写请求，两台主机互为备机。

**配置步骤：**  
1、首先master1、slave1，与master2、slave2的配置就和一主一从相同。所以剩下的问题就是master1,2之间如何同步。  
2、我们采用的办法就是让master1,2互为备机。即在master1,2上分别执行

```sql
--在master1上执行
CHANGE MASTER TO MASTER_HOST='192.168.80.19',MASTER_USER='root',MASTER_PASSWORD='123456',MASTER_LOG_FILE='mysql-bin.000001',MASTER_LOG_POS=442;
--开启slave
start slave
--查看状态
show slave status\G
--在master2上执行
CHANGE MASTER TO MASTER_HOST='192.168.80.17',MASTER_USER='root',MASTER_PASSWORD='123456',MASTER_LOG_FILE='mysql-bin.000002',MASTER_LOG_POS=442;
--开启slave
start slave
--查看状态
show slave status\G
```

**双主双从验证：**  
在master1上执行如下语句：

```sql
create database test;
create table mytbl(id int,name varchar(20));
insert into mytbl values(1,'zhangsan');
--完成上述命令之后可以去其他机器验证是否同步成功
```

# 读写分离

## 读写分离的实现方式

1、采用AOP的方式，通过方法名判断，方法名中有get、select、query开头的则连接slave，其他的则连接master数据库。  
2、可以用现成的框架 例如`ShardingSphere-JDBC`、`MyCat`

## 通过mycat实现

**实现方式：**  
我们在配置mycat的时候需要`修改schema.xml文件`,就是在该文件中配置了读写分离。

```xml
<?xml version="1.0"?>
<!DOCTYPE mycat:schema SYSTEM "schema.dtd">
<mycat:schema xmlns:mycat="http://io.mycat/">
	<schema name="TESTDB" checkSQLschema="false" sqlMaxLimit="100" dataNode="dn1">
	</schema>
	<dataNode name="dn1" dataHost="host1" database="msb" />
	<dataHost name="host1" maxCon="1000" minCon="10" balance="1"
			  writeType="0" dbType="mysql" dbDriver="native" switchType="1"  slaveThreshold="100">
		<heartbeat>select user()</heartbeat>
		<writeHost host="hostM1" url="192.168.85.111:3306" user="root"
				   password="123456">
			<readHost host="hostS1" url="192.168.85.112:3306" user="root" password="123456"></readHost>
		</writeHost>
		<writeHost host="hostM2" url="192.168.85.113:3306" user="root"
				   password="123456">
			<readHost host="hostS2" url="192.168.85.114:3306" user="root" password="123456"></readHost>
		</writeHost>
	</dataHost>
</mycat:schema>
```

修改schema.xml文件。

在当前mysql架构中，我们使用的是双主双从的架构，因此可以将balance设置为1

除此之外我们需要注意，还需要了解一些参数：

**参数writeType，表示写操作发送到哪台机器，此参数有两个值可以进行设置：**

- writeType=0:所有写操作都发送到配置的第一个writeHost，第一个挂了切换到还生存的第二个

- writeType=1:所有写操作都随机的发送到配置的writehost中，1.5之后废弃，

**参数switchType:表示如何进行切换：**

- switchType=1:默认值，自动切换

- switchType=-1:表示不自动切换

- switchType=2：基于mysql主从同步的状态决定是否切换

**balance，此属性有四个值，用来做负载均衡的，下面我们来详细介绍**

- balance=0 :不开启读写分离机制，所有读操作都发送到当前可用的writehost上

- balance=1:全部的readhost和stand by writehost参与select 语句的负载均衡，简单的说，当双主双从模式下，除了第一个写节点，其他的节点都参与select语句的负载均衡

- balance=2:所有读操作都随机的在writehost，readhost上分发

- balance=3:所有读请求随机的分发到readhost执行，writehost不负担读压力

**验证：**

```sql
--插入以下语句，使数据不一致
insert into mytbl values(2,@@hostname);
--通过查询mycat表中的数据，发现查询到的结果在node02,node03,node04之间切换，符合正常情况
select * from mytbl;
--停止node01的mysql服务
service mysqld stop
--重新插入语句
insert into mytbl values(3,@@hostname);
--开启node01的mysql服务
service mysqld start
--执行相同的查询语句，此时发现在noede01，node02,node04之间切换，符合情况【证明主master切换为node3，现在它负责写请求】
```