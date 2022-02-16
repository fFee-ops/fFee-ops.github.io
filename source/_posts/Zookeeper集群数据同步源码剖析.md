---
title: Zookeeper集群数据同步源码剖析
date: 2021-11-13 12:08:47
tags: zookeeper 分布式 java
categories: zookeeper
---

<!--more-->

### Zookeeper集群数据同步源码剖析

- [Zookeeper同步流程](#Zookeeper_4)
- [Zookeeper Follower同步流程](#Zookeeper_Follower_19)
- [Zookeeper Leader同步流程](#Zookeeper_Leader_34)
- [LearnerHandler数据同步操作](#LearnerHandler_60)

所有事务操作都将由leader执行，并且会把数据同步到其他节点，比如follower、observer，我们可以分析leader和follower的操作行为即可分析出数据同步流程。

# Zookeeper同步流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/471fca5037be437fb5648d5502262b8b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
整体流程：

1.  当角色确立之后，leader调用leader.lead\(\);方法运行，创建一个接收连接的LearnerCnxAcceptor线程，在LearnerCnxAcceptor线程内部又建立一个阻塞的LearnerCnxAcceptorHandler线程等待Learner端的连接。Learner端以follower为例，follower调用follower.followLeader\(\);方法首先查找leader的Socket服务端，然后建立连接。当follower建立连接后，leader端会建立一个LearnerHandler线程相对应，用来处理follower与leader的数据包传输。
2.  follower端封装当前zk服务器的Zxid和Leader.FOLLOWERINFO的LearnerInfo数据包发送给leader
3.  leader端这时处于getEpochToPropose方法的阻塞时期，需要得到Learner端超过一半的服务器发送Epoch
4.  getEpochToPropose解阻塞之后，LearnerHandler线程会把超过一半的Epoch与leader比较得到最新的newLeaderZxid，并封装成Leader.LEADERINFO包发送给Learner端
5.  Learner端得到最新的Epoch，会更新当前服务器的Epoch。并把当前服务器所处的lastLoggedZxid位置封装成Leader.ACKEPOCH发送给leader
6.  此时leader端处于waitForEpochAck方法的阻塞时期，需要得到Learner端超过一半的服务器发送EpochACK
7.  当waitForEpochAck阻塞之后便可以在LearnerHandler线程内决定用那种方式进行同步。如果Learner端的`lastLoggedZxid`\>leader端的，Learner端将会被删除多余的部分。如果小于leader端的，将会以不同方式进行同步
8.  leader端发送Leader.NEWLEADER数据包给Learner端（6、7步骤都是另开一个线程来发送这些数据包）
9.  Learner端同步之后，会在一个while循环内处理各种leader端发送数据包，包括两阶段提交的Leader.PROPOSAL、Leader.COMMIT、Leader.INFORM等。在同步数据后会处理Leader.NEWLEADER数据包，然后发送Leader.ACK给leader端  
    10.此时leader端处于waitForNewLeaderAck阻塞等待超过一半节点发送ACK。

# Zookeeper Follower同步流程

Follower主要连接Leader实现数据同步，我们看看Follower做的事，我们仍然沿着QuorumPeer.run\(\)展开学习，关键代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2a77d09daea8479095dfcd630b7f00e9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
创建Follower的方法比较简单，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0aad040b7b504e70940d587f4b4294ac.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们看一下整个Follower在数据同步中做的所有操作 `follower.followLeader();`，源码如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b844226de1814990891075c8c1e8fb1c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面源码中的 follower.followLeader\(\) 方法主要做了如下几件事：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/789f1dce82254008979152dd57f41462.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们对 follower.followLeader\(\) 调用的其他方法进行剖析，其中 findLeader\(\) 是寻找当前Leader节点的，源代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5bb3d98ff0834c699965e1088dbaa4d3.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
followLeader\(\) 中调用了 registerWithLeader\(Leader.FOLLOWERINFO\); 该方法是向Leader注册Follower，会将当前Follower节点信息发送给Leader节点，Follower节点信息发给Leader是必须的，是Leader同步数据个基础，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/57cf0023f43246cab4a2b3dab031fe25.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
followLeader\(\) 中最后读取数据包执行同步的方法中调用了 readPacket\(qp\); ，这个方法就是读取Leader的数据包的封装，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fbd934cb79a1476f8d0327a5a371db4f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# Zookeeper Leader同步流程

我们查看 QuorumPeer.run\(\) 方法的LEADING部分，可以看到先创建了Leader对象，并设置了Leader，然后调用了 leader.lead\(\) ， leader.lead\(\) 是执行的核心业务流程，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/eea19823aad04d65aa4b9cbe8900797a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
leader.lead\(\) 方法是Leader执行的核心业务流程，源码如下  
![在这里插入图片描述](https://img-blog.csdnimg.cn/10ab46044c72489abbcec606638c743a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
leader.lead\(\) 方法会执行如下几个操作：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bca28c310b7d4e9aac3db19a068fe4d9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
lead\(\) 方法中会创建 LearnerCnxAcceptor ，该对象是一个线程，主要用于接收followers的连接，这里加了CountDownLatch根据配置的同步的地址的数量（例如：server.2=127.0.0.1:12881:13881 配置同步的端口是12881只有一个）， LearnerCnxAcceptor 的run方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2c95ec02f2e54fefa90c9c0e1c0a74b1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
LearnerCnxAcceptor 的run方法中创建了 LearnerCnxAcceptorHandler 对象，在接收到链接后，就会调用 LearnerCnxAcceptorHandler ，而LearnerCnxAcceptorHandler 是一个线程，它的run方法中调用了 acceptConnections\(\) 方法，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d333fad9817644de8b46cfca80ed9073.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
acceptConnections\(\) 方法会在这里阻塞接收followers的连接，当有连接过来会生成一个socket对象。然后根据当前socket生成一个LearnerHandler线程 ，每个Learner者都会开启一个LearnerHandler线程，方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7bd67d48e8c4492c83d54ccfea30b1c7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
LearnerHandler.run 这里就是读取或写数据包与Learner交换数据包。如果没有数据包读取，则会阻塞当前方法 ia.readRecord\(qp, “packet”\); ，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ee4faca1cc654394b034eb43855f6a6d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们再回到 leader.lead\(\) 方法，其中调用了 getEpochToPropose\(\) 方法，该方法是判断connectingFollowers发给leader端的Epoch是否过半，如果过半则会解阻塞，不过半会一直阻塞着，直到Follower把自己的Epoch数据包发送过来并符合过半机制，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bfcb5c2f9cff45dbae7d273acd237d7e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在 lead\(\) 方法中，当发送的Epoch过半之后，把当前zxid设置到zk，并等待EpochAck，关键源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9d995b9540f040e881a12539664f287a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
waitForEpochAck\(\) 方法也会等待超过一半的\(Follower和Observer\)获取了新的epoch，并且返回了Leader.ACKEPOCH，才会解除阻塞，否则会一直阻塞。等待EpochAck解阻塞后，把得到最新的epoch更新到当前服务，设置当前leader节点的zab状态是 SYNCHRONIZATION ，方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1d24bbde6c874140b1903964282e6f8d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
lead\(\) 方法中还需要等待超过一半的\(Follower和Observer\)进行数据同步成功，并且返回了Leader.ACK，程序才会解除阻塞，如下代码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6e927c3955644a7986d4793c726144cd.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面所有流程都走完之后，就证明数据已经同步成功了，会执行startZkServer\(\);

# LearnerHandler数据同步操作

LearnerHandler 线程是对应于 Learner 连接 Leader 端后，建立的一个与 Learner 端交换数据的线程。每一个 Learner 端都会创建一个LearnerHandler 线程。

我们详细讲解 `LearnerHandler.run()`方法。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f7e6161e720040578d748cb7ded132fa.png)  
readRecord 读取数据包 不断从 learner 节点读数据，如果没读到将会阻塞 readRecord 。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ef853d057fd64a0c8326c794e588726d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如果数据包类型不是Leader.FOLLOWERINFO或Leader.OBSERVERINFO将会返回，因为咱们这里本身就是Leader节点，读数据肯定是读非Leader节点数据。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0df49df7f74c4748a848c24dfeb2ff4f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
获取 learnerInfoData 来获取sid和版本信息。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2c88f5f3fd8b46fdba3433a76fa0539d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
获取followerInfo和lastAcceptedEpoch，信息如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a390b1f143904d1dab9be0ed80b3b8c1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
把Leader.NEWLEADER数据包放入到queuedPackets，并向其他节点发送，源码如下  
![在这里插入图片描述](https://img-blog.csdnimg.cn/76f40002ea654d379580db5245b302c7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)