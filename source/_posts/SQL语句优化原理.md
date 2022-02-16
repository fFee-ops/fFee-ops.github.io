---
title: SQL语句优化原理
date: 2020-07-09 22:53:19
tags: 
categories: MySQL
---

<!--more-->

### 文章目录

首先客户端发送sql语句，服务端的连接层收到语句将语句传递给服务层，服务层将语句进行优化再由引擎层决定由什么引擎执行，再将数据进行存储。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200709224322492.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

- MYSQL逻辑分层 ：连接层 服务层 引擎层 存储层
- 引擎层的默认引擎：  
  InnoDB\(默认\) ：事务优先 （适合高并发操作；行锁）  
  MyISAM ：性能优先 （表锁）

---

查询数据库引擎： 支持哪些引擎

```sql
 show engines ;
```

查看当前使用的引擎:

```sql
show variables like '%storage_engine%' ;
```

指定数据库对象的引擎：

```sql
	create table tb(
		id int(4) auto_increment ,
		name varchar(5),
		dept varchar(5) ,
		primary key(id)		
	)ENGINE=MyISAM AUTO_INCREMENT=1
	 DEFAULT CHARSET=utf8   ;
```