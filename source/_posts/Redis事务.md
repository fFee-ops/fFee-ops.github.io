---
title: Redis事务
date: 2020-09-06 09:49:11
tags: 
categories: Redis
---

<!--more-->

### Redis事务

- [简介](#_4)
- [应用场景](#_76)

Redis 事务可以一次执行多个命令，（按顺序地串行化执行，执行中不会被其它命令插入，不许加塞）

# 简介

Redis 事务可以一次执行多个命令（允许在一次单独的步骤中执行一组命令）， 并且带有以下两个重要的保证：  
  
批量操作在发送 EXEC 命令前被放入队列缓存。 收到 EXEC 命令后进入事务执行，事务中任意命令执行失败，  
其余的命令依然被执行。 在事务执行过程，其他客户端提交的命令请求不会插入到事务执行命令序列中。

1.  Redis会将一个事务中的所有命令序列化，然后按顺序执行
2.  执行中不会被其它命令插入，不许出现加塞行为

**常用命令**

```sql
DISCARD
:取消事务，放弃执行事务块内的所有命令。
EXEC
:执行所有事务块内的命令。
MULTI
:标记一个事务块的开始。
UNWATCH
:取消 WATCH 命令对所有 key 的监视。
WATCH key [key ...]
:监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令所改动，那么事务将被打断。
```

---

一个事务从开始到结束会经历以下3个阶段（开始事务。命令入队。执行事务。），以下为示例：

**示例1、 MULTI EXEC**  
转帐功能，A向B帐号转帐50元 一个事务的例子，它先以 MULTI 开始一个事务，然后将多个命令入队到事务中，最后由 EXEC 命令触发事务。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020090609420649.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
**①输入Multi命令开始，输入的命令都会依次进入命令队列中，但不会执行  
②直到输入Exec后，Redis会将之前的命令队列中的命令依次执行**

---

**示例2 、DISCARD放弃队列运行**

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020090609441462.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**③命令队列的过程中可以通过discard来放弃队列运行**

---

**示例3、事务的错误处理**  
事务的错误处理：  
① 如果执行的某个命令报出了错误，则只有报错的命令不会被执行，而其它的命令都会执行，不会回滚。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906094614475.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**②队列中的某个命令出现了报告错误，执行时整个的所有队列都会被取消。**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906094736113.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

**示例5、事务的WATCH**

```sql
WATCH key [key ...]
:监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令
所改动，那么事务将被打断。
```

需求：某一帐户在一事务内进行操作，在提交事务前，另一个进程对该帐户进行操作。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906094852122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 应用场景

秒杀