---
title: Mysql之TCL
date: 2020-04-05 17:45:06
tags: 
categories: MySQL
---

<!--more-->

### TCL事务控制语句（Transaction Control Language）

- [事务](#_1)
- - [一、含义](#_2)
  - [二、特点（ACID）](#ACID_4)
  - [三、事务的使用步骤 ★](#__10)
  - [四、并发事务](#_30)

# 事务

## 一、含义

事务：一条或多条sql语句组成一个执行单位，一组sql语句要么都执行要么都不执行

## 二、特点（ACID）

A 原子性：一个事务是不可再分割的整体，要么都执行要么都不执行  
C 一致性：一个事务可以使数据从一个一致状态切换到另外一个一致的状态  
I 隔离性：一个事务不受其他事务的干扰，多个事务互相隔离的  
D 持久性：一个事务一旦提交了，则永久的持久化到本地

## 三、事务的使用步骤 ★

了解：  
隐式（自动）事务：没有明显的开启和结束，本身就是一条事务可以自动提交，比如insert、update、delete  
显式事务：具有明显的开启和结束

使用显式事务：  
①开启事务  
set autocommit=0;  
start transaction;#可以省略

②编写一组逻辑sql语句  
注意：sql语句支持的是insert、update、delete

设置回滚点：  
savepoint 回滚点名;

③结束事务  
提交：commit;  
回滚：rollback;  
回滚到指定的地方：rollback to 回滚点名;

## 四、并发事务

1、事务的并发问题是如何发生的？  
多个事务 同时 操作 同一个数据库的相同数据时  
2、并发问题都有哪些？  
脏读：一个事务读取了其他事务还没有提交的数据，读到的是其他事务“更新”的数据  
不可重复读：一个事务多次读取，结果不一样  
幻读：一个事务读取了其他事务还没有提交的数据，只是读到的是 其他事务“插入”的数据  
3、如何解决并发问题  
通过设置隔离级别来解决并发问题  
4、隔离级别

```
							脏读		     不可重复读		幻读
read uncommitted:读未提交     ×                ×           ×        
read committed：读已提交      √                ×            ×
repeatable read：可重复读     √                √            ×
serializable：串行化          √                √            √
```

脏读 不可重复读 幻读  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200411222047995.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)