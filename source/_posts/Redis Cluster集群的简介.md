---
title: Redis Cluster集群的简介
date: 2020-09-08 22:30:45
tags: 
categories: Redis
---

<!--more-->

### Redis Cluster集群的简介

- [简介](#_1)
- [Redis Cluster集群特点](#Redis_Cluster_11)
- [Redis Cluster容错](#Redis_Cluster_24)
- [redis-cluster节点分配](#rediscluster_39)
- [Redis Cluster高可用（Redis Cluster主从模式）](#Redis_ClusterRedis_Cluster_55)
- [Redis Cluster总结](#Redis_Cluster_68)

# 简介

• 为什么使用redis-cluster？  
      为了在大流量访问下提供稳定的业务，集群化是存储的必然形态

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200908220237852.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

Redis集群搭建的方式有多种，但从**redis 3.0**之后版本支持redis-cluster集群，**至少需要3\(Master\)+3\(Slave\)才能建立集群**。Redis-Cluster采用无中心结构，每个节点保存数据和整个集群状态,每个节点都和其他所有 节点连接。

# Redis Cluster集群特点

1、所有的redis节点彼此互联\(PING-PONG机制\),内部使用二进制协议优化传输速度和带宽。

2、节点的fail是通过集群中**超过半数的节点**检测失效时才生效。

3、客户端与redis节点直连,不需要中间proxy层.客户端不需要连接集群所有节点,连接集群中任何一个可用节点即可。

4、redis-cluster把所有的物理节点映射到\[0-16383\]插槽上（不一定是平均分配）,cluster 负责维护

5、Redis集群预分好16384个哈希槽，当需要在 Redis 集群中放置一个 key-value 时， redis 先对key 使用 crc16 算法算出一个结果，然后把结果对 16384 求余数，这样每个 key 都会对应一个编号在 0-16383 之间的哈希槽，redis 会根据节点数量大致均等的将哈希槽映射到不同的节

# Redis Cluster容错

**容错性**，是指软件检测应用程序所运行的软件或硬件中发生的错误并从错误中恢复的能力，通常可以从系统的可靠性、可用性、可测性等几个方面来衡量。

**redis-cluster投票:容错**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200908221437958.png#pic_center)  
①投票过程是集群中所有master参与,如果半数以上master节点与master节点通信超时\(cluster-node-timeout\),认为当前master节点挂掉.

②**什么时候整个集群不可用\(cluster\_state:fail\)\?**

如果集群任意master挂掉,且当前master没有slave.集群进入fail状态,也可以理解成集群的slot映射\[0-16383\]不完整时进入fail状态. 如果集群超过半数以上master挂掉，无论是否有slave，集群进入fail状态.

# redis-cluster节点分配

**（官方推荐）** 三个主节点分别是：A, B, C 三个节点，它们可以是一台机器上的三个端口，也可以是三台不同的服务器。那么，采用哈希槽 \(hash slot\)的方式来分配16384个slot 的话，它们三个节点分别承担的slot 区间是  
节点A覆盖0－5460;  
节点B覆盖5461－10922;  
节点C覆盖10923－16383

还有新增一个主节点：

新增一个节点D, redis cluster的这种做法是从各个节点的前面各拿取一部分slot到D上。  
节点A覆盖1365-5460  
节点B覆盖6827- 10922  
节点C覆盖12288-16383  
节点D覆盖0-1364, 5461-6826,10923-12287

# Redis Cluster高可用（Redis Cluster主从模式）

redis cluster 为了保证数据的高可用性，加入了主从模式，一个主节点对应一个或多个从节点，主节点提供数据存取，从节点则是从主节点拉取数据备份，当这个主节点挂掉后，就会有这个从节点选取一个来充当主节点，从而保证集群不会挂掉。

集群有ABC三个主节点, 如果这3个节点都没有加入从节点，如果B挂掉了，我们就无法访问整个集群了。A和C的slot也无法访问。

所以在集群建立的时候，**一定要为每个主节点都添加从节点**, 比如像这样, 集群包含主节点A、B、C, 以及从节点A1、B1、C1, 那么即使B挂掉系统也可以继续正确工作。

B1节点替代了B节点，所以Redis集群将会选择B1节点作为新的主节点，集群将会继续正确地提供服务。 当B重新开启后，它就会变成B1的从节点。

不过需要注意，如果节点B和B1同时挂了，Redis集群就无法继续正确地提供服务了。

# Redis Cluster总结

①拥有将数据自动切分到多个节点的能力。  
②当集群中的一部分节点失效或者无法进行通讯时， 仍然可以继续处理命令请求的能力