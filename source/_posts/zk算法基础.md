---
title: zk算法基础
date: 2021-10-25 22:14:15
tags: 算法
categories: zookeeper
---

<!--more-->

### zk算法基础

- [拜占庭将军问题](#_2)
- [Paxos算法](#Paxos_7)
- - [算法概述](#_13)
  - [算法流程](#_35)
  - - [情况1](#1_52)
    - [情况2](#2_56)
    - [情况3](#3_59)
- [ZAB协议](#ZAB_64)
- - [概念](#_65)
  - [简介](#_70)

# 拜占庭将军问题

拜占庭将军问题是一个协议问题，拜占庭帝国军队的将军们必须全体一致的决定是否攻击某一支敌军。问题是这些将军在地理上是分隔开来的，并且将  
军中存在叛徒。叛徒可以任意行动以达到以下目标：欺骗某些将军采取进攻行动；促成一个不是所有将军都同意的决定，如当将军们不希望进攻时促成进攻行动；只有完全达成一致的努力才能获得胜利。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d3c4185e653248acadc423267b74004b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# Paxos算法

它是一种基于消息传递且具有高度容错特性的一致性算法。

**Paxos算法解决的问题**：就是如何快速正确的在一个分布式系统中对某个数据值达成一致，并且保证不论发生任何异常，都不会破坏整个系统的一致性。

## 算法概述

![在这里插入图片描述](https://img-blog.csdnimg.cn/a37d02dfce864ced82608e619adfb2b8.png)  
1、在一个Paxos系统中，首先将所有节点划分为Proposer（提议者），Acceptor（接受者），和Learner（学习者）。（注意：每个节点都可以身兼数职）。  
2、一个完整的Paxos算法流程分为三个阶段：

**① Prepare准备阶段**  
Proposer向多个Acceptor发出Propose请求Promise（承诺）

> 村长向村民做出请求，希望村民能支持自己

• Acceptor针对收到的Propose请求进行Promise（承诺）

> 村民收到村长的请求后对村长进行保证，保证答应村长要求的任何事情

**② Accept接受阶段**  
• Proposer收到多数Acceptor承诺的Promise后，向Acceptor发出Propose请求

> 村长收到半数以上的村民承诺后就可以对村民发出具体的要求了

• Acceptor针对收到的Propose请求进行Accept处理

> 村民对村长的要求进行处理，应答

• Learn学习阶段：Proposer将形成的决议发送给所有Learners

> 最后村长把形成的决策发给长老过目

## 算法流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/0bfb07db5bb9435cafb528feb67237e3.png)  
（1）**Prepare**: Proposer生成全局唯一且递增的Proposal ID，向所有Acceptor发送Propose请求，这里无需携带提案内容，只携带`Proposal ID`即可。

（2）**Promise**: Acceptor收到Propose请求后，做出“两个承诺，一个应答”。  
➢ 不再接受Proposal ID小于等于（注意：这里是 **\<=** ）当前请求的`Propose`请求。  
➢ 不再接受Proposal ID小于（注意：这里是 **\<** ）当前请求的`Accept`请求。  
➢ 不违背以前做出的承诺下，回复已经Accept过的提案中Proposal ID最大的那个提案的Value和Proposal ID，没有则返回空值。  
（3）**Propose**: Proposer收到多数Acceptor的Promise应答后，从应答中选择Proposal ID最大的提案的Value，作为本次要发起的提案。如果所有应答的提案Value均为空值，则可以自己随意决定提案Value。然后携带当前Proposal ID，向所有Acceptor发 送Propose请求。

（4）**Accept**: Acceptor收到Propose请求后，在不违背自己之前做出的承诺下，接受并持久化当前Proposal ID和提案Value。

（5）**Learn**: Proposer收到多数Acceptor的Accept后，决议形成，将形成的决议发送给所有Learner。

下面我们针对上述描述做三种情况的推演举例：为了简化流程，我们这里不设置 Learner。

### 情况1

![在这里插入图片描述](https://img-blog.csdnimg.cn/0301b74720d24b088a0f72bb98cd6c45.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 情况2

![在这里插入图片描述](https://img-blog.csdnimg.cn/f5acc845fea24bc28393f18530a74276.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 情况3

![在这里插入图片描述](https://img-blog.csdnimg.cn/8c8bf56f28d54c0b9d6a17c6d0b56e70.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
造成这种情况的原因是系统中有一个以上的 Proposer，多个 Proposers 相互争夺 Acceptor，造成迟迟无法达成一致的情况。针对这种情况，一种改进的 Paxos 算法被提出\(ZAB算法\)：从系统中选出一个节点作为`Leader`，只有 Leader 能够发起提案。

# ZAB协议

## 概念

ZooKeeper使用的是ZAB协议作为数据一致性的算法， ZAB（ZooKeeper Atomic Broadcast ） 全称为：**原子消息广播协议**。在Paxos算法基础上进行了扩展改造而来的，ZAB协议设计了支持原子广播、崩溃恢复，ZAB协议保证Leader广播的变更序列被顺序的处理。

## 简介

1.  zookeeper根据ZAB协议建立了主备模型保证zookeeper集群中个副本之间数据一致性。

2.  ZAB协议中存在着三种状态，每个节点都属于以下三种中的一种：

    - Looking ：系统刚启动时或者Leader崩溃后正处于选举状态
    - Following ：Follower节点所处的状态，Follower与Leader处于数据同步阶段；
    - Leading ：Leader所处状态，当前集群中有一个Leader为主进程；

**协议核心：**

1.  所有事务请求必须由一个全局唯一的服务器来协调处理，这样的服务器被称为Leader服务器，而余下的其他服务器称为Follower服务器。

2.  Leader服务器负责将一个客户端事务请求转换成一个事务Proposal\(提议\)，并将该Proposal分发给集群中所有的Follower服务器。

3.  之后Leader服务器需要等待所有的Follower服务器的反馈，一旦超过半数的Follower服务器进行了正确的反馈后，那么Leader就会再次向所有的Follower服务器分发Commit消息，要求其将前一个Proposal进提交。