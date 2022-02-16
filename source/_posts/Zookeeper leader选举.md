---
title: Zookeeper leader选举
date: 2020-07-08 15:12:08
tags: zookeeper 分布式 云原生
categories: zookeeper
---

<!--more-->

### Zookeeper leader选举

- [第一次启动](#_3)
- [非第一次启动](#_11)

zookeeper的leader选举要分为是不是第一次启动。

# 第一次启动

![在这里插入图片描述](https://img-blog.csdnimg.cn/ca757123f1df46cd961bdaf624be2958.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

1.  服务器1启动，发起一次选举。服务器1投自己一票。此时服务器1票数一票，不够半数以上（3票），选举无法完成，服务器1状态保持为LOOKING；
2.  服务器2启动，再发起一次选举。服务器1和2分别投自己一票并交换选票信息：此时服务器1发现服务器2的myid比自己的大，更改选票为推举服务器2。此时服务器1票数`0票`，服务器2票数`2票`，没有半数以上结果，选举无法完成，服务器1，2状态保持LOOKING
3.  服务器3启动，发起一次选举。此时服务器1和2都会更改选票为服务器3。此次投票结果：服务器1为0票，服务器2为0票，服务器3为3票。此时服务器3的票数已经超过半数，服务器3当选Leader。服务器1，2更改状态为FOLLOWING，服务器3更改状态为LEADING；
4.  之后第4、5台机器加入进来发现已经有leader了，就自动成为follower

# 非第一次启动

**SID**：服务器ID。用来唯一标识一台ZooKeeper集群中的机器，每台机器不能重复，和`myid`一致。

**ZXID**：事务ID。ZXID是一个事务ID，用来`标识一次服务器状态的变更。`在某一时刻，集群中的每台机器的ZXID值不一定完全一致，这和ZooKeeper服务器对于客户端“更新请求”的处理逻辑有关。

**Epoch**：每个`Leader任期的代号`。没有Leader时同一轮投票过程中的逻辑时钟值是相同的。每投完一次票这个数据就会增加。

1.  当ZooKeeper集群中的一台服务器出现以下两种情况之一时，就会开始进入Leader选举

    - 服务器初始化启动。
    - 服务器运行期间无法和Leader保持连接

2.  而当一台机器进入Leader选举流程时，当前集群也可能会处于以下两种状态：

    - 集群中本来就已经存在一个Leader。

    > 对于已经存在Leader的情况，机器试图去选举Leader时，会被告知当前服务器的Leader信息，对于该机器来说，仅仅需要和Leader机器建立连接，并进行状态同步即可。

    2.**集群中确实不存在Leader**  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/af43646be9474b58928b243958bdefea.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)