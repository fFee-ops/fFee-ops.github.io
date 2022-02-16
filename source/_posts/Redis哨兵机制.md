---
title: Redis哨兵机制
date: 2020-09-08 17:44:46
tags: redis 数据库
categories: Redis
---

<!--more-->

### Redis哨兵机制

- [前言](#_2)
- [1、哨兵机制简介](#1_7)
- [2、哨兵进程的作用](#2_15)
- [3、哨兵进程的工作方式](#3_31)
- [哨兵机制模拟演示](#_52)
- [相关面试题](#_79)
- - [1.故障转移时会从剩下的slave选举一个新的master，被选举为master的标准是什么？](#1slavemastermaster_80)
  - [2.执行切换的那个哨兵在完成故障转移后会做什么？](#2_86)
  - [3.同步配置的时候其他哨兵根据什么更新自己的配置呢？](#3_89)

# 前言

之前说的主从复制虽然一定程度上解决了问题但是还有一些缺点  
：没有办法对 master 进行动态选举（当 master 挂掉后，会通过一定的机制，从 slave 中选举出一个新的 master），需要使用 Sentinel 机制完成动态选举。

# 1、哨兵机制简介

1）Sentinel\(哨兵\) 进程是用于监控 Redis 集群中 Master 主服务器工作的状态

2）在 Master 主服务器发生故障的时候，可以实现 Master 和 Slave 服务器的切换，保证系统的高可用（High Availability）

3）哨兵机制被集成在 Redis2.6+ 的版本中，到了2.8版本后就稳定下来了。

# 2、哨兵进程的作用

1）监控\(Monitoring\)：哨兵\(sentinel\) 会不断地检查你的 Master 和 Slave 是否运作正常。

2）提醒\(Notification\)：当被监控的某个Redis节点出现问题时, 哨兵\(sentinel\) 可以通过 API 向管理员或者其他应用程序发送通知。（使用较少）

3.）自动故障迁移\(Automatic failover\)：当一个 Master 不能正常工作时，哨兵\(sentinel\) 会开始一次自动故障迁移操作。具体操作如下：

（1）它会将失效 Master 的其中一个 Slave 升级为新的 Master, 并让失效 Master 的其他Slave 改为复制新的 Master。

（2）当客户端试图连接失效的 Master 时，集群也会向客户端返回新 Master 的地址，使得集群可以使用现在的 Master 替换失效 Master。

（3）Master 和 Slave 服务器切换后，Master 的 redis.conf、Slave 的 redis.conf 和sentinel.conf 的配置文件的内容都会发生相应的改变，即 Master 主服务器的 redis.conf 配置文件中会多一行 slaveof 的配置，sentinel.conf 的监控目标会随之调换。

# 3、哨兵进程的工作方式

1.  每个 Sentinel（哨兵）进程以每秒钟一次的频率向整个集群中的 Master 主服务器，Slave 从服务器以及其他 Sentinel（哨兵）进程发送一个 PING 命令。

2.  如果一个实例（instance）距离最后一次有效回复 PING 命令的时间超过 down-after-milliseconds 选项所指定的值， 则这个实例会被 Sentinel（哨兵）进程标记为**主观下线（SDOWN）**。

3.  如果一个 Master 主服务器被标记为主观下线（SDOWN），则正在监视这个 Master 主服务器的所有 Sentinel（哨兵）进程要以每秒一次的频率确认 Master 主服务器的确进入了主观下线状态。

4.  当有足够数量的 Sentinel（哨兵）进程（大于等于配置文件指定的值）在指定的时间范围内确认 Master 主服务器进入了主观下线状态（SDOWN）， 则 Master 主服务器会被标记为**客观下线（ODOWN）**。

5.  在一般情况下， 每个 Sentinel（哨兵）进程会以每 10 秒一次的频率向集群中的所有Master 主服务器、Slave 从服务器发送 INFO 命令。

6.  当 Master 主服务器被 Sentinel（哨兵）进程标记为客观下线（ODOWN）时，Sentinel（哨兵）进程向下线的 Master 主服务器的所有 Slave 从服务器发送 INFO 命令的频率会从 10 秒一次改为每秒一次。

7.  若没有足够数量的 Sentinel（哨兵）进程同意 Master 主服务器下线， Master 主服务器的客观下线状态就会被移除。若 Master 主服务器重新向 Sentinel（哨兵）进程发送 PING 命令返回有效回复，Master 主服务器的主观下线状态就会被移除。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200908172210326.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

# 哨兵机制模拟演示

1、要使用 Sentinel 哨兵，需要去**源码包**中拷贝一个配置文件到 Redis/bin 目录（主从节点都可以）下，这个文件就是 **sentinel.conf**，哨兵的配置十分简单，只需要修改这个配置文件中的一个配置即可，用 vim 命令打开 sentinel.conf 文件，找到文件的第 98 行，修改为 master 的相关信息，mymaster 参数为主节点的名称，可任意修改，而最后一个参数 1，指的是可以参与选举的哨兵的个数，该示例中就使用了一个哨兵，所以值为 1。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200908173109112.png#pic_center)

2、配置完成后，先启动主从节点的 Redis 服务并连接上命令行客户端，然后通过下面的命令启动哨兵服务。

```shell
./redis-sentinel sentinel.conf
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200908173831175.png#pic_center)

出现以下界面证明启动成功  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200908173914958.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

3、可以通过 info replication 命令来查看主从节点的相关信息

4、所有的配置都完成了，下面来模拟主节点宕机，哨兵是如何工作的，直接杀死主节点进程  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200908174237781.png#pic_center)  
杀死进程之后，去观察哨兵给出的响应，这需要一定的时间

从哨兵反馈的日志可以看出，主节点先被 主观下线（SDOWN），经过哨兵选举后状态修改为客观下线（ODOWN），可以看到 ODOWN 命令后面有一个 #quorum（选举人数）1/1，说明哨兵进程大于等于配置文件指定的值，同意客观下线，最后将 **之前的从节点** 选举为了主节点，可使用 info 命令去查看。

# 相关面试题

## 1.故障转移时会从剩下的slave选举一个新的master，被选举为master的标准是什么？

（1）跟master断开连接的时长。  
（2）slave优先级。按照slave优先级进行排序，slave priority越低，优先级就越高  
（3）复制offset。如果slave priority相同，那么看offset，哪个slave复制了越多的数据，offset越靠后，优先级就越高  
（4）run id。如果上面两个条件都相同，那么选择一个run id比较小的那个slave

## 2.执行切换的那个哨兵在完成故障转移后会做什么？

会进行configuraiton配置信息传播。哨兵完成切换之后，会在自己本地更新生成最新的master配置，然后通过pub/sub消息机制同步给其他的哨兵。

## 3.同步配置的时候其他哨兵根据什么更新自己的配置呢？

执行切换的那个哨兵，会从要切换到的新master（salve->master）那里得到一个version号，每次切换的version号都必须是唯一的。  
如果第一个选举出的哨兵切换失败了，那么其他哨兵，会等待failover-timeout时间，然后接替继续执行切换，此时会重新获取一个新的version号。  
这个version号就很重要了，因为各种消息都是通过一个channel去发布和监听的，所以一个哨兵完成一次新的切换之后，新的master配置是跟着新的version号的，其他的哨兵都是根据版本号的大小来更新自己的master配置的。