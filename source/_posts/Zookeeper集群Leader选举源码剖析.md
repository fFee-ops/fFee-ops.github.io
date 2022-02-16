---
title: Zookeeper集群Leader选举源码剖析
date: 2021-11-12 23:52:24
tags: zookeeper 分布式 云原生
categories: zookeeper
---

<!--more-->

### Zookeeper集群Leader选举源码剖析

- [QuorumPeer工作流程](#QuorumPeer_6)
- [QuorumCnxManager源码分析](#QuorumCnxManager_31)
- [FastLeaderElection算法源码分析](#FastLeaderElection_51)
- [Zookeeper选举投票剖析](#Zookeeper_86)
- - [选举概念](#_89)
  - [选举过程](#_100)
  - [投票规则](#_111)

关于这篇的理论基础，即`Paxos算法和ZAB协议`、选举流程分析。 已经在另一篇博客单独写出来了，这里就不赘述了。但是这里还是贴一下选举流程的图，便于理解源码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2bb5737ff9984814a81f2af1e4bc6202.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# QuorumPeer工作流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/052b241fe3b74aad93ad4727f8b3132d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**QuorumCnxManager**：负责各台服务器之间的底层Leader选举过程中的网络通信对应的类。每台服务器在启动的过程中，会启动一个QuorumPeer 。

Zookeeper 对于每个节点 `QuorumPeer`的设计相当的灵活， QuorumPeer 主要包括**四个组件**：

1.  客户端请求接收器\( ServerCnxnFactory \)
    > ServerCnxnFactory负责维护与客户端的连接\(接收客户端的请求并发送相应的响应\);（1001行）
2.  数据引擎\( ZKDatabase \)
    > ZKDatabase负责存储/加载/查找数据\(基于目录树结构的KV+操作日志+客户端Session\);（129行）
3.  选举器\( Election \)
    > Election负责选举集群的一个Leader节点;（998行）
4.  核心功能组件\(Leader/Follower/Observer \)。
    > Leader/Follower/Observer确认是QuorumPeer节点应该完成的核心职责;\(1270行\)

QuorumPeer 工作流程比较复杂，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f265be7f7dd44345acb43d8380966532.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

QuorumPeer工作流程：

> 1:初始化配置  
> 2:加载当前存在的数据  
> 3:启动网络通信组件  
> 4:启动控制台  
> 5:开启选举协调者，并执行选举（这个过程是会持续，并不是一次操作就结束了）

# QuorumCnxManager源码分析

`QuorumCnxManager`内部维护了一系列的队列，用来保存接收到的、待发送的消息以及消息的发送器，除接收队列以外，其他队列都按照`SID`分组形成队列集合，如一个集群中除了自身还有3台机器，那么就会为这3台机器分别创建一个发送队列，互不干扰。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/eef5b93ec5bc4cf3baa3c0154b13f69f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**QuorumCnxManager.Listener ：** 为了能够相互投票，Zookeeper集群中的所有机器都需要建立起网络连接。`QuorumCnxManager`在启动时会创建一个`ServerSocket`来监听Leader选举的**通信端口**。开启监听后，Zookeeper能够不断地接收到来自其他服务器地创建连接请求，在接收到其他服务器地TCP连接请求时，会进行处理。为了避免两台机器之间重复地创建TCP连接，Zookeeper只允许`SID`大的服务器主动和其他机器建立连接，否则断开连接。在接收到创建连接请求后，服务器通过对比自己和远程服务器的SID值来判断是否接收连接请求，如果当前服务器发现自己的SID更大，那么会断开当前连接，然后自己主动和远程服务器将连接（自己作为“客户端”）。一旦连接建立，就会根据远程服务器的SID来创建相应的消息发送器`SendWorker`和消息接收器`RecvWorker`，并启动。

QuorumCnxManager.Listener 监听启动可以查看QuorumCnxManager.Listener 的 run 方法，源代码如下，可以断点调试看到此时监听的正是我们所说的投票端口：

![在这里插入图片描述](https://img-blog.csdnimg.cn/15c64b88f42f432f9f8cc552583a6df9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面是监听器，各个服务之间进行通信我们需要开启 ListenerHandler 线程，在`QuorumCnxManager.Listener.ListenerHandler`的`run`方法中有一个方法 `acceptConnections()` 调用，该方法就是用于**接受每次选举投票的信息**，如果只有一个节点或者没有投票信息的时候，此时方法会阻塞，一旦执行选举，程序会往下执行，我们可以先启动1台服务，再启动第2台、第3台，此时会收到有客户端参与投票链接，程序会往下执行，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a69369ede9244e62af1d9f032c0c87a2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们启动2台服务，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/af725009eea64f68b2ffa8d69627552a.png)  
上面虽然能证明投票访问了当前监听的端口，但怎么知道是哪台服务呢？我们可以沿着`acceptConnections()` 中调用的`receiveConnection()`源码继续研究，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/239779e45fc348c3bde2adaca2f08a79.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`receiveConnection()`方法只是获取了数据流，并没做特殊处理，并且调用了 `handleConnection()`方法，该方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9e581bc685594a00bc5bdbcc50a9c467.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
这就表明了是通过网络连接获取数据sid，获取sid表示是哪一台连过来的。

# FastLeaderElection算法源码分析

![在这里插入图片描述](https://img-blog.csdnimg.cn/100a38ccfcfa4f8c9c509e8f6a2c5839.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在 Zookeeper 集群中，主要分为三者角色，而每一个节点同时只能扮演一种角色，这三种角色分别是：  
\(1\) **Leader** ：接受所有Follower的提案请求并统一协调发起提案的投票，负责与所有的Follower进行内部的数据交换\(同步\);  
\(2\) **Follower** ： 直接为客户端提供服务并参与提案的投票，同时与 Leader 进行数据交换\(同步\);  
\(3\) **Observer** ： 直接为客户端服务但并不参与提案的投票，同时也与Leader 进行数据交换\(同步\);

`FastLeaderElection` 选举算法是标准的 Fast Paxos 算法实现，可解决 `LeaderElection` 选举算法收敛速度慢的问题。创建 FastLeaderElection 只需要 `new FastLeaderElection()`即可，如下代码：

![在这里插入图片描述](https://img-blog.csdnimg.cn/7af167cd018b440892f3e740532049cc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
创建 FastLeaderElection 会调用 starter\(\) 方法，该方法会创建 `sendqueue 、 recvqueue 队列、Messenger` 对象，其中 Messenger 对象的作用非常关键，方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/91a78d7f576e4bcc80104a5076c34925.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
创建Messenger的时候，会创建 WorkerSender 并封装成 `wsThread` 线程，创建 WorkerReceiver 并封装成 `wrThread` 线程，看名字就很容易理解， wsThread 用于**发送数据**， wrThread 用于**接收数据**，Messenger 创建源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d6a5856f81d54ae4a6cffd8e8a5f9377.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
创建完 FastLeaderElection 后接着会调用它的 start\(\) 方法启动选举算法，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f9cc1491482243acaedb40643939e874.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
start\(\)方法如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/82187e553746437898c0c7a6a34fd988.png)  
上图意味着 wsThread 和 wrThread 线程都将启动。

wsThread 由 WorkerSender 封装而来，此时会调用 WorkerSender 的 run 方法，run方法会调用`process()`方法，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e17bd3c0eb044f8ba4f6794f42173cbb.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
process 方法调用了 manager 的`toSend` 方法，此时是把对应的sid作为了消息发送出去，这里其实是发送投票信息，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/12fdbcd2b5c0493982d21de49d2d1664.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
投票可以投自己，也可以投别人，如果是选票选自己，只需要把投票信息添加到 recvQueue 中即可，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a1483e211b8b4a418678f709ff5528f4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

在`WorkerReceiver.run`方法中会从 recvQueue 中获取 Message ，并把发送给其他服务的投票封装到`sendqueue` 队列中，交给 WorkerSender 发送处理，部分源码如下：  
**由于这块代码太多，所以就只截取了run方法中关键的代码**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a2651631080e4160acbb2ff93699ed81.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4ae971568e20442693edeb49e5c08ed8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# Zookeeper选举投票剖析

选举是个很复杂的过程，要考虑很多场景，而且选举过程中有很多概念需要理解。

## 选举概念

1\)ZK服务状态：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c57b75729a3843248746568c6f826a2a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
2\)服务角色:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/364eebe16537438da6b41417e0ba6e09.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)  
3\)投票消息广播:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0724ba3a0e0142d79a319615f04a7233.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
4\)选票模型:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bac0da9bb9014e11861647e68096a911.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
5\)消息发送对象:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/adebd07db4a9487681abbb972d4727c1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 选举过程

QuorumPeer本身是个线程，在集群启动的时候会执行 `quorumPeer.start();`，此时会调用它重写的`start()`方法，最后会调用父类的 start\(\) 方法，所以该线程会启动执行，因此会执行它的`run`方法，而run方法正是选举流程的入口，我们看run方法关键源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0fbb8fab9de64ec0b5d8c405a0f07193.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
所有节点初始状态都为LOOKING，会进入到选举流程，选举流程首先要获取算法，获取算法的方法是`makeLEStrategy()`，该方法返回的是`FastLeaderElection`实例，核心选举流程是FastLeaderElection 中的 `lookForLeader()`方法。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6e1aed7bb5ed4395812536f658784d43.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`lookForLeader()`是选举过程的关键流程，源码分析如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4a7f52b481e14055b2623e6748a28e04.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面多个地方都用到了过半数以上的判断方法： `hasAllQuorums()` 该方法用到了 `QuorumMaj`类，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0a56b8e02a6442f2b4d5ed18291f3afc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
QuorumMaj 构造函数中体现了过半数以上的操作，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f56e298073de4932800968d3251a254c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 投票规则

来看一下选票PK的方法 totalOrderPredicate\(\) ，该方法其实就是Leader选举规则，规则有如下三个：  
① EPOCH大的直接胜出  
② EPOCH相同,事务id大的胜出  
③事务id相同,服务器id大的胜出

源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fad3ae2de27a4abe8ffbd0ac1c8e6d6a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)