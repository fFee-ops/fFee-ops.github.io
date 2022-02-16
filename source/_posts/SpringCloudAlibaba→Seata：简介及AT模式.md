---
title: SpringCloudAlibaba→Seata：简介及AT模式
date: 2022-01-06 19:50:57
tags: java 分布式 微服务
categories: SpringCloudAlibaba
---

<!--more-->

### Seata 简介及AT模式

- [1、简介](#1_2)
- [2、Seata AT模式](#2Seata_AT_8)
- - [2.1 AT模式工作机制](#21_AT_22)
  - [2.2 AT模式工作流程描述](#22_AT_38)

# 1、简介

![在这里插入图片描述](https://img-blog.csdnimg.cn/9731cae1be0c4bc19bcac55ed6a857e2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Seata 是一款开源的分布式事务解决方案，致力于在微服务架构下提供高性能和简单易用的分布式事务服务。在 Seata 开源之前，Seata 对应的内部版本在阿里经济体内部一直扮演着分布式一致性中间件的角色，帮助经济体平稳的度过历年的双11，对各BU业务进行了有力的支撑。经过多年沉淀与积累，商业化产品先后在阿里云、金融云进行售卖。2019.1 为了打造更加完善的技术生态和普惠技术成果，Seata 正式宣布对外开源，开放以来，广受欢迎，不到一年已经成为最受欢迎的分布式事务解决方案。

![在这里插入图片描述](https://img-blog.csdnimg.cn/f330842d8ac5487a9ab3f5bd31ad4f38.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2、Seata AT模式

Seata 将为用户提供了 AT、TCC、SAGA 和 XA 事务模式，为用户打造一站式的分布式解决方案。其中AT模式最受欢迎，使用也非常简单，但它内在的原理不简单。

AT模式的前提：

1.  基于支持本地 ACID 事务的关系型数据库。
2.  Java 应用，通过 JDBC 访问数据库。

**整体机制：2PC协议的演变**

> **第一阶段**：业务数据和回滚日志记录在同一个本地事务中提交，释放本地锁和连接资源。  
> **第二阶段**：  
> 1\)提交异步化，非常快速地完成。  
> 2\)回滚通过一阶段的回滚日志进行反向补偿。

## 2.1 AT模式工作机制

![在这里插入图片描述](https://img-blog.csdnimg.cn/06861c60b5254e4c8197f9ee71acdee8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**一些重要名词解释：**

> Transaction ID XID：全局唯一的事务ID  
>   
> Transaction Coordinator\(TC\) ：事务协调器，维护全局事务的运行状态，负责协调并驱动全局事务的提交或回滚;  
>   
> Transaction Manager\( TM \) ：控制全局事务的边界，负责开启一个全局事务，并最终发起全局提交或全局回滚的决议;  
>   
> Resource Manager\(RM\) ：控制分支事务，负责分支注册，状态汇报，并接收事务协调器的指令，驱动分支（本地）事务的提交和回滚；

下图是AT模式的执行流程：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4f5c32a8f6dc4b9b9500b26d69e70ca5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.2 AT模式工作流程描述

以一个示例来说明整个 AT 分支的工作过程。  
假设有一张业务表： product  
![在这里插入图片描述](https://img-blog.csdnimg.cn/dbaa0637ae3c4ecfb770c892b887b53e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
执行修改操作：（SQL语句如下）

```sql
update product set name = 'GTS' where name = 'TXC';
```

**第一阶段：**  
① 解析 SQL 语句，得到类型为 UPDATE ,表为 product ，条件 where name = ‘TXC’ 。  
②根据解析的 SQL 语句进行要操作的结果查询：

```sql
select * product where name ='TXC'
```

得到的**修改前**数据结果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0c82914361774277a402bcd1af044620.png)  
③执行业务 SQL。查询修改后的结果：

```sql
select id, name, since from product where id = 1;
```

查询修改后的数据结果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b5823796d9114626ad177bd5d127c754.png)  
④镜像备份。将修改前的结果\(简称前镜\)和修改后的结果\(简称后镜\)添加到数据库表 undo\_log 中。

⑤提交前，向TC注册分支申请 product 表中id=1的数据的全局锁。

⑥本地事务提交。

⑦本地事务提交结果上报给TC。

**第二阶段-提交：**  
①收到 TC 的分支提交请求，把请求放入一个异步任务的队列中，马上返回提交成功的结果给 TC。

②异步任务阶段的分支提交请求将异步和批量地删除相应 UNDO LOG 记录。

因为“业务SQL"在一阶段已经提交至数据库，所以Seata框架只需将一阶段保存的快照数据和行锁删掉，**完成数据清理即可**。

**第二阶段-回滚：**  
二阶段如果是回滚的话。

①收到 TC 的分支回滚请求，开启一个本地事务，执行如下操作。

②通过 XID 和 Branch ID 查找到相应的 UNDO LOG 记录。

③数据校验：拿 UNDO LOG 中的后镜与当前数据进行比较，如果有不同，说明数据被当前全局事务之外的动作做了修改。这种情况，需要根据配置策略来做处理，详细的说明在另外的文章中介绍。

④根据 UNDO LOG 中的前镜像和业务 SQL 的相关信息生成并执行回滚的语句：

```sql
update product set name = 'TXC' where id = 1;
```

⑤提交本地事务。并把本地事务的执行结果（即分支事务回滚的结果）上报给 TC。

**注意：** `undo_log`表，在每个需要执行分布式事务操作的数据库中添加

```sql
-- 注意此处0.7.0+ 增加字段 context
CREATE TABLE `undo_log` (
		`id` bigint(20) NOT NULL AUTO_INCREMENT,
		`branch_id` bigint(20) NOT NULL,
		`xid` varchar(100) NOT NULL,
		`context` varchar(128) NOT NULL,
		`rollback_info` longblob NOT NULL,
		`log_status` int(11) NOT NULL,
		`log_created` datetime NOT NULL,
		`log_modified` datetime NOT NULL,
		PRIMARY KEY (`id`),
		UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
```