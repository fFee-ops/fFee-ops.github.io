---
title: ZK服务启动流程源码剖析
date: 2021-11-03 14:54:59
tags: zk
categories: zookeeper
---

<!--more-->

### ZK服务启动流程源码剖析

- [ZK启动入口分析](#ZK_4)
- [单机版启动流程](#_23)
- - [1\)单机启动入口](#1_29)
  - [2\)配置文件解析](#2_33)
  - [3\)单机启动主流程](#3_37)
- [集群版启动](#_43)
- - [1、集群配置](#1_48)
  - [2、集群启动流程分析](#2_60)

![流程图](https://img-blog.csdnimg.cn/d2604dd704084b688a64674fc75f4224.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# ZK启动入口分析

**启动入口类：QuorumPeerMain**  
该类是 zookeeper 单机/集群的启动入口类，是用来加载配置、启动 QuorumPeer \(选举相关\)线程、创建 ServerCnxnFactory 等，我们可以把代码切换到该类的主方法\( main \)中，从该类的主方法开始分析， main 方法代码分析如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/21da3dad2c2e451a937a3820a47ba27e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面main方法虽然只是做了初始化配置，但调用了 initializeAndRun\(\) 方法，  
initializeAndRun\(\) 方法中会根据配置来决定启动单机Zookeeper还是集群Zookeeper，源码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/3f33231b975e46368df910874b6c1f20.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

如果启动单机版，会调用 `ZooKeeperServerMain.main(args);` ，如果启动集群版，会调用`QuorumPeerMain.runFromConfig(config);`

# 单机版启动流程

**启动流程概览图：**  
![概览图](https://img-blog.csdnimg.cn/9621bec3a43b480ea4a83e5e9bb4c388.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**调用链路图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/03db31838b1b4d51983e8eb48a67acc7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1\)单机启动入口

按照上面的源码分析，我们找到 ZooKeeperServerMain.main\(args\) 方法，其中在 initializeAndRun 方法中执行初始化操作，并运行Zookeeper服务。main如下图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/103476274e0e4296bdb3ab785df7144e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2\)配置文件解析

initializeAndRun\(\) 方法会注册JMX，同时解析 zoo.cfg 配置文件，并调用 `runFromConfig()`方法启动Zookeeper服务，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f41435f3d2df4746936d1edbbc84c85a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3\)单机启动主流程

runFromConfig 方法是单机版启动的主要方法，该方法会做如下几件事：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ec223ee295394a539213ce1bb31e057e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8f37cc799296469e89a85df8609d15c0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 集群版启动

**概览图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f06c56602f894f38bb0d73b3967ed4f8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1、集群配置

我们不用复制三个项目，只需要写三份配置文件，再在启动台去配置三个启动类即可：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ff035d1da3af47b8a08ebf3f1e513c64.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/4f77d3f01d0b43c2972b3811c6af51a7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如上图：

1.  创建zoo1.cfg、zoo2.cfg、zoo3.cfg
2.  创建zkdata1、zkdata2、zkdata3
3.  创建3个myid，值分别为1、2、3

配置3个启动类，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/687e14e0858d4b5c85e97c90d6e66b9c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2、集群启动流程分析

程序启动，运行流程启动集群模式，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d61990d76ec64618a09ff880a09b7be5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`QuorumPeerMain中`的 `runFromConfig()` 调用了 `quorumPeer.start()`启动服务，如下代码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b42e3e46436a4b2284e83080ed3c65db.png)  
quorumPeer.start\(\) 方法代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0b6a29eb2d38470ebd407537f50a872f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`quorumPeer.start()` 方法启动的主要步骤：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b994a8aa322b49b78a7a1aef855641ea.png)  
`startLeaderElection()`开启Leader选举方法做了2件事，首先创建初始化选票选自己，接着创建选举投票方式，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/847a087a085a4ab69527695999484fc4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`createElectionAlgorithm()`创建选举算法只有第3种，其他2种均已废弃，方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/55c16e43862744d6ac03e41a997dbf49.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
这个方法创建了以下三个对象：  
①、创建QuorumCnxManager对象  
②、QuorumCnxManager.Listener  
③、FastLeaderElection