---
title: Redis主从复制
date: 2020-09-08 16:35:55
tags: redis 数据库 运维
categories: Redis
---

#  1. 目前redis面临的问题
Redis有 两种不同的持久化方式， Redis 服务器通过持久化，把 Redis 内存中持久化到硬盘当中，当Redis 宕机时，我们重启 Redis 服务器时，可以由 RDB 文件或 AOF 文件恢复内存中的数据。
![在这里插入图片描述](https://img-blog.csdnimg.cn/c86c3ca15b084ac498d5c3952d1cdaf8.png)
**问题1**：不过持久化后的数据仍然只在一台机器上，因此当硬件发生故障时，比如主板或 CPU 坏了，这时候无法重启服务器，有什么办法可以保证服务器发生故障时数据的安全性？或者可以快速恢复数据呢？

**问题2**：容量瓶颈


**解决办法：**
针对这些问题，redis提供了 复制(replication) 的功能， 通过"主从(一主多从)"和"集群(多主多从)"的方式对redis的服务进行水平扩展,用多台redis服务器共同构建一个高可用的redis服务系统。


# 2. 主从复制概念
主从复制，是指将一台Redis服务器的数据，复制到其他的Redis服务器。前者称为主节点(master)，后者称为从节点(slave),数据的复制是单向的，只能由主节点到从节点。
![在这里插入图片描述](https://img-blog.csdnimg.cn/4d6a22f9fcb84ebc8fa24ce86129962f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_19,color_FFFFFF,t_70,g_se,x_16)

# 3. 常用策略
## 3.1 策略1 ：一主多从 主机(写)，从机(读)
![在这里插入图片描述](https://img-blog.csdnimg.cn/0c70e0c5a0694969bb4e13e681306904.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 3.2 策略2：薪火相传
![在这里插入图片描述](https://img-blog.csdnimg.cn/602489cd7d6b429bacbcc25fcb7eb696.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 4. 主从复制原理
Redis 的主从复制是异步复制，异步分为两个方面，一个是 master 服务器在将数据同步到 slave 时是异步的，因此master服务器在这里仍然可以接收其他请求，一个是slave在接收同步数据也是异步的。

## 4.1 复制方式
### 4.1.1 全量复制
master 服务器会将自己的 rdb 文件发送给 slave 服务器进行数据同步，并记录同步期间的其他写入，再发送给 slave 服务器，以达到完全同步的目的，这种方式称为全量复制。

![在这里插入图片描述](https://img-blog.csdnimg.cn/fc12faf5027c4a92867c4cbb9dca46c0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
1. slave发送psync告诉master它要进行数据同步。带了两个参数
  ①`?`：代表了runId，因为它现在不知道master的runId所以就是？
  ②`-1`：就是一个偏移量，可以理解为消费进度，-1代表从头开始

2. master知道要进行全量复制了，然后回传自己的runId与offset(在master中有多少字节数据要传输给slave)
3. slave保存master信息
4. master生成rdb文件
5. 发送给slave
6. 在生成rdb过程中master接收到的命令产生的数据会写入buffer，然后send给slave，来保证数据的一致
7. slave清空旧数据
8. 加载新收到的rdb文件


### 4.1.2 增量复制
 因为各种原因 master 服务器与 slave 服务器断开后， slave 服务器在重新连上 maste r服务器时会尝试重新获取断开后未同步的数据即部分同步，或者称为部分复制。
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/d3c641bc01ea4643bd3294ab3b1706e0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4.2 工作原理
master 服务器会记录一个 replicationId 的伪随机字符串，用于标识当前的数据集版本，还会记录一个当前数据集的偏移量 offset ，不管 master 是否有配置 slave 服务器，replication Id和offset会一直记录并成对存在，我们可以通过以下命令查看replication Id和offset：
```shell
info repliaction
```
通过redis-cli在master或slave服务器执行该命令会打印类似以下信息(不同服务器数据不同，打印信息不同)：
![在这里插入图片描述](https://img-blog.csdnimg.cn/0b5d1e86dd464daf8d305c40b7d222cb.png)
当master与slave正常连接时，slave使用PSYNC命令向master发送自己记录的旧master的replicationid和offset，而master会计算与slave之间的数据偏移量，并将缓冲区中的偏移数量同步到slave，此时master和slave的数据一致。

而如果slave引用的replication太旧了，master与slave之间的数据差异太大，则master与slave之间会使用全量复制的进行数据同步。



# 5. 配置主从复制
**注：主从复制的开启，完全是在从节点发起的；不需要我们在主节点做任何事情。**
从节点开启主从复制，有3种方式：
（1）配置文件：在从服务器的配置文件中加入：slaveof
（2）redis-server启动命令后加入 --slaveof
（3）Redis服务器启动后，直接通过客户端执行命令：slaveof ，则该Redis实例成为从节点


演示：
①、通过 info replication 命令查看三台节点角色
![在这里插入图片描述](https://img-blog.csdnimg.cn/53e463bb7c344d6d843f3aa3a81ab227.png)
初始状态，三台节点都是master


②、设置主从关系，从节点执行命令：SLAVEOF 127.0.0.1 6379
![在这里插入图片描述](https://img-blog.csdnimg.cn/2b504e2d012041e998f163f67bea9098.png)
再看主节点信息：
![在这里插入图片描述](https://img-blog.csdnimg.cn/40d69088a1394c4fadfc5f392d30ecb0.png)
这里通过命令来设置主从关系，一旦服务重启，那么角色关系将不复存在。想要永久的保存这种关系，可以通过配置redis.conf 文件来配置。
```shell
slaveof 127.0.0.1 6379
# 取消复制：slave of on one
```

# 6. 测试主从关系
**①、增量复制**
master 操作写入：
![在这里插入图片描述](https://img-blog.csdnimg.cn/bf7a8ae2a68041109971e0ac70d9bb37.png)
slave操作获取:
![在这里插入图片描述](https://img-blog.csdnimg.cn/f1c7760a662d4f9bb32acce84e321d12.png)
**②、全量复制**
通过执行 `SLAVEOF 127.0.0.1 6379`，如果主节点 6379 以前还存在一些 key，那么执行命令之后，从节点会将以前的信息也都复制过来

**③、主从读写分离**
尝试slave操作set：
![在这里插入图片描述](https://img-blog.csdnimg.cn/c03061ef7e9040fc8fa542b3f612204e.png)
原因是在配置文件 6380redis.conf 中对于 slave-read-only 的配置
![在这里插入图片描述](https://img-blog.csdnimg.cn/e75f8b167fc54d03b41e6d6d2673aee8.png)
如果我们将其修改为 no 之后，执行写命令是可以的，但是从节点写命令的数据从节点或者主节点都不能获取的。并没有任何的意义

**④、主节点宕机**
主节点 Maste 挂掉，两个从节点角色会发生变化吗？
![在这里插入图片描述](https://img-blog.csdnimg.cn/280cd8b250714939a53e03ebdc76cf65.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/84f888b5695c415789f56e70d6edb88f.png)
上图可知主节点 Master 挂掉之后，从节点角色还是不会改变的。


**⑤、主节点宕机后恢复**
主节点Master挂掉之后，马上启动主机Master，主节点扮演的角色还是 Master 吗？
![在这里插入图片描述](https://img-blog.csdnimg.cn/d87c9f16303547dc82fdd484c6b7235c.png)
也就是说主节点挂掉之后重启，又恢复了主节点的角色。

