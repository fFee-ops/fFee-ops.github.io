---
title: Redis Cluster集群的简介
date: 2020-09-08 22:30:45
tags: 
categories: Redis
---

# 1. 主从 + 哨兵 问题分析
![在这里插入图片描述](https://img-blog.csdnimg.cn/e281ef63733b450097f109eeab5aca04.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
（1）在主从 + 哨兵模式中，仍然只有一个Master节点。当并发写请求较大时，哨兵模式并不能缓解写压力
（2） 在Redis Sentinel模式中，每个节点需要保存全量数据，冗余比较多


# 2. Cluster概念
从3.0版本之后，官方推出了Redis Cluster，它的主要用途是实现数据分片(Data Sharding)，不过同样可以实现HA，是官方当前推荐的方案。
![在这里插入图片描述](https://img-blog.csdnimg.cn/bb328d08492f4ae6a793e274fa407c62.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)
1.Redis-Cluster采用无中心结构
2.只有当集群中的大多数节点同时fail整个集群才fail。
3.整个集群有**16384**个slot，当需要在 Redis 集群中放置一个 key-value 时，根据 `CRC16(key) mod16384`的值，决定将一个key放到哪个桶中。读取一个key时也是相同的算法。
4.当主节点fail时从节点会升级为主节点，fail的主节点online之后自动变成了从节点



# 3. 故障转移
![在这里插入图片描述](https://img-blog.csdnimg.cn/bd0afbe6c1904549b16973a771c3956b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

Redis集群的主节点内置了类似Redis Sentinel的节点故障检测和自动故障转移功能，当集群中的某个主节点下线时，集群中的其他在线主节点会注意到这一点，并对已下线的主节点进行故障转移。



# 4. 集群分片策略
Redis-cluster分片策略，是用来解决key存储位置的
常见的数据分布的方式：顺序分布、哈希分布、节点取余哈希、一致性哈希
![在这里插入图片描述](https://img-blog.csdnimg.cn/ca060414bf284cc6b839a7df854c71b3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 5. Redis 集群的数据分片
Redis 集群没有使用一致性hash, 而是引入了 哈希槽的概念。
预设虚拟槽，每个槽就相当于一个数字，有一定范围。
>Redis Cluster中预设虚拟槽的范围为0到16383

![在这里插入图片描述](https://img-blog.csdnimg.cn/474a27ddcc184a0b97c0061c3f656480.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
步骤：
1. 把16384槽按照节点数量进行平均分配，由节点进行管理
2. 对每个key按照CRC16规则进行hash运算
3. 把hash结果对16383进行取余
4. 把余数发送给Redis节点
5. 节点接收到数据，验证是否在自己管理的槽编号的范围
  - 如果在自己管理的槽编号范围内，则把数据保存到数据槽中，然后返回执行结果
  - 如果在自己管理的槽编号范围外，则会把数据发送给正确的节点，由正确的节点来把数据保存在对应的槽中

> 需要注意的是：Redis Cluster的节点之间会共享消息，每个节点都会知道是哪个节点负责哪个范围内的数据槽

虚拟槽分布方式中，由于每个节点管理一部分数据槽，数据保存到数据槽中。当节点扩容或者缩容时，对数据槽进行重新分配迁移即可，数据不会丢失。


# 6. Redis Cluster步骤分析
- 启动节点：将节点以集群方式启动，此时节点是独立的。
- 节点握手：将独立的节点连成网络。
- 槽指派：将16384个槽位分配给主节点，以达到分片保存数据库键值对的效果。
- 主从复制：为从节点指定主节点。
