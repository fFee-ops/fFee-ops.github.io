---
title: RequestProcessor处理请求源码剖析
date: 2021-11-06 17:21:14
tags: zk
categories: zookeeper
---

<!--more-->

### RequestProcessor处理请求源码剖析

- [RequestProcessor结构](#RequestProcessor_16)
- [1、PrepRequestProcessor剖析](#1PrepRequestProcessor_41)
- [2、SyncRequestProcessor剖析](#2SyncRequestProcessor_65)
- [3、FinalRequestProcessor剖析](#3FinalRequestProcessor_76)

在上一次分析`ZK网络通信源码`的时候我们追溯到了`ZookeeperServer.processPacket()`就没有再深入了。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a3ef9d63e3cc40309489534df4816e1d.png)

本次就要来介绍具体业务处理的流程。入口为`ZookeeperServer.processPacket()`中的`submitRequest(si);`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/70ec3ac2cee94b72b894155ececefac6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**概览图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0493ed0ca95c4993b8ad55ce4b17af37.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# RequestProcessor结构

**概览图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/143dc06c809a41c1b908faf931cdb4ab.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

客户端请求过来，每次执行不同事务操作的时候，Zookeeper也提供了一套业务处理流程`RequestProcessor` ， RequestProcessor 的处理流程如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b02bd16d8ffd44e68527bbee37f65a5a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们来看一下 RequestProcessor 初始化流程【在启动zk服务，也就是在`zks.startup();`内部进行初始化的】， `ZooKeeperServer.setupRequestProcessors()`方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8815ec7acf344fd9a7231a2773dc7bbb.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
它的创建步骤：

1.  创建finalProcessor。
2.  创建syncProcessor，并将finalProcessor作为它的下一个业务链。
3.  启动syncProcessor。
4.  创建firstProcessor\(PrepRequestProcessor\)，将syncProcessor作为firstProcessor的下一个业务链。
5.  启动firstProcessor。

`syncProcessor` 创建时，将`finalProcessor` 作为参数传递进来源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5983e60dc83646b69ad5e3b6663a7544.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`firstProcessor`创建时，将 `syncProcessor` 作为参数传递进来源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3ebf5703fb71420c8bd43717ece93dab.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`PrepRequestProcessor`和 `SyncRequestProcessor` 的结构一样，都是实现了 Thread 的一个线程，所以在这里初始化时便启动了这两个线程。但是`FinalRequestProcessor`不是线程。

# 1、PrepRequestProcessor剖析

PrepRequestProcessor 是请求处理器的第1个处理器，我们把之前的请求业务处理衔接起来，一步一步分析。  
`ZooKeeperServer.processPacket()>submitRequest()>enqueueRequest()>RequestThrottler.submitRequest()`，来看下 RequestThrottler.submitRequest\(\) 源码,它将当前请求添加到`submittedRequests` 队列中了，源码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/0aaa7b719d814ca3ad521ee910a6f437.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
看 `RequestThrottler`的继承关系就知道它是个线程，我们看看它的 run 方法做了什么事，源码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/a7f94ba967af4612a29d8f3f88a0ef93.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

RequestThrottler 调用了 `ZooKeeperServer.submitRequestNow()`方法，而该方法又调用了`firstProcessor` 的方法，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2a990875bc1e4b68a3f699d9a9ec4573.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
从上段源码可以看出三个RequestProecessor 中最先调用的是`PrepRequestProcessor`。`PrepRequestProcessor.processRequest()` 方法将当前请求添加到了队列 submittedRequests 中，  
源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/896804cd99944ba09273a16920cfd0c1.png)  
上面方法中并未从 `submittedRequests`队列中获取请求，如何执行请求的呢，因为`PrepRequestProcessor` 是一个线程，因此会在 run 中执行，我们查看 run 方法源码的时候发现它调用了`pRequest()`方法， pRequest\(\) 方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2dcd1dc4451143e7a2d0e4ef3af90af8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
首先先执行`pRequestHelper()`方法，该方法是`PrepRequestProcessor`处理核心业务流程，主要是一些**过滤操作**，操作完成后，会将请求交给下一个业务链，也就是`SyncRequestProcessor.processRequest()`方法处理请求。

这里可能会好奇`pRequestHelper()`具体做了什么，看它的源码会发现做事的其实是`pRequest2Txn()`，而`pRequest2Txn()`主要做的就是**权限校验、快照记录、事务信息记录相关的事**，并未涉及到数据处理！！

也就是说 `PrepRequestProcessor`其实是做了操作前**权限校验、快照记录、事务信息记录相关的事。**

# 2、SyncRequestProcessor剖析

该处理器主要是**将请求数据高效率存入磁盘**，并且请求在写入磁盘之前是不会被转发到下个处理器的。  
我们先看请求被添加到队列的方法：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d6bb60a794274bb9b3e17d07918476fc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
同样 `SyncRequestProcessor` 是一个线程，执行队列中的请求也在线程中触发，我们看它的run方法，源码如下：  
![请添加图片描述](https://img-blog.csdnimg.cn/04896cb64eec483eaf122b22a995638c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
run 方法会从 `queuedRequests`队列中获取一个请求，如果获取不到就会阻塞等待直到获取到一个请求对象，程序才会继续往下执行，接下来会调用 `Snapshot Thread` 线程实现将客户端发送的数据以快照的方式写入磁盘，最终调用 flush\(\) 方法实现数据提交，`flush()`方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6eddba462b8b4016a93e6d588872253c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
flush\(\) 方法实现了数据提交，并且会将请求交给下一个业务链，下一个业务链为`FinalRequestProcessor`。

# 3、FinalRequestProcessor剖析

`FinalRequestProcessor`相对前面两个来说没那么复杂,该业务处理对象主要用于返回Response。  
![请添加图片描述](https://img-blog.csdnimg.cn/0a3e31242c204fc5b4d1d91226c90c61.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)