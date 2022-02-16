---
title: ZK网络通信源码剖析
date: 2021-11-05 21:24:25
tags: zk
categories: zookeeper
---

<!--more-->

### ZK网络通信源码剖析

- [NIOServerCnxnFactory工作流程源码剖析](#NIOServerCnxnFactory_12)
- - [AcceptThread剖析](#AcceptThread_19)
  - [SelectorThread剖析](#SelectorThread_34)
  - [WorkerThread剖析](#WorkerThread_45)
  - [ConnectionExpirerThread剖析](#ConnectionExpirerThread_60)
- [ZK通信优劣总结](#ZK_64)

Zookeeper 作为一个服务器,自然要与客户端进行网络通信, ZooKeeper 中使用 `ServerCnxnFactory` 管理与客户端的连接,其有两个实现,一个是`NIOServerCnxnFactory` ,使用Java原生 NIO 实现;一个是`NettyServerCnxnFactory` ,使用netty实现;  
使用 ServerCnxn 代表一个客户端与服务端的连接。从单机版启动中可以发现 Zookeeper 默认通信组件为 NIOServerCnxnFactory ，他们和ServerCnxnFactory 的关系如下图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/5c9ebc86631348c5b6ab992cc812c108.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**概览图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/87a2969b5534499cbcfbefbe60fc9058.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# NIOServerCnxnFactory工作流程源码剖析

NIOServerCnxnFactory 启动时会启动四类线程：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/624a88354c054c9ea6369eaa26e2fd77.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
它们的关系图如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/000fd468268c4737a9f19e0e7c500324.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## AcceptThread剖析

为了更容易理解AcceptThread，我把它的结构和方法调用关系画了一个详细的流程图，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e31a4e2f17034e2d8afe38d5c0f480b2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在 NIOServerCnxnFactory 类中有一个 `AccpetThread` 线程，为什么说它是一个线程？我们看下它的继承关系： `AcceptThread > AbstractSelectThread > ZooKeeperThread > Thread` ，该线程接收来自客户端的连接,并将其分配给`selector thread`\(启动一个线程\)。

该线程执行流程： `run()` 执行`selector.select()`,并调用 `doAccept()` 接收客户端连接，因此我们可以着重关注 doAccept\(\) 方法,该类源码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/604fe17611ed4f5d9553c23c62c3a3ca.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
doAccept\(\) 方法用于处理客户端链接，当客户端链接 Zookeeper 的时候，首先会调用该方法，调用该方法执行过程如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/318cb7a7b2e6417dadc11d7f797b4145.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`doAccept()` 方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ec78a17735b24454a696d9e8859af97b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面代码中 `addAcceptedConnection` 方法如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/afedb384e465444fbfb5fd2726e00f74.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## SelectorThread剖析

同样为了更容易梳理 SelectorThread ，我也把它的结构和方法调用关系梳理成了流程图，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/442cb6f31ee64c3384c36d108b46e6cc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
该线程的主要作用是从Socket读取数据，并封装成 `workRequest` ，并将 workRequest 交给workerPool 工作线程池处理，同时将`acceptedQueue`中未处理的链接取出，并为每个链接绑定`OP_READ` 读事件，并封装对应的上下文对象 `NIOServerCnxn`。 SelectorThread 的run方法如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/301e0a14664b41548e997d2b5bd55b40.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
run\(\) 方法中会调用 `select()`，而 select\(\) 中的核心调用地方是 `handleIO()` ，我们看名字其实就知道这里是处理客户端请求的数据，但客户端请求数据并非在`SelectorThread`线程中处理，我们接着看 handleIO\(\) 方法。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/893fe18129624dca98a488757990227e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`handleIO()`方法会封装当前 SelectorThread 为 IOWorkRequest ,并将 IOWorkRequest 交给`workerPool` 来调度，而 workerPool 调度才是读数据的开始，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/970d05f5fa574a00834842edd896e531.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## WorkerThread剖析

`WorkerThread`相比上面的线程而言，调用关系颇为复杂，设计到了多个对象方法调用，主要用于处理IO，但并未对数据做出处理，数据处理将由业务链对象`RequestProcessor`处理，调用关系图如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ad8afa0f248e41e19c9fe6885e942d66.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
ZooKeeper 中通过 `WorkerService` 管理一组 worker thread 线程,前面我们在看 SelectorThread 的时候，能够看到`workerPool` 的schedule方法被执行，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e13c73f9c64244c981d169feb1167fa5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们跟踪 `workerPool.schedule(workRequest);` 可以发现它调用了  
`WorkerService.schedule(workRequest) > WorkerService.schedule(WorkRequest, long) ，`该方法创建了一个新的线程 `ScheduledWorkRequest` ,并启动了该线程，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2ddade242ef5443e9cf0e323a082db61.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`ScheduledWorkRequest` 实现了 Runnable 接口，并在 run\(\) 方法中调用了 `IOWorkRequest`中的`doWork` 方法，在该方法中会调用 doIO 执行IO数据处理，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d58cc9e2e25b498f8a7d40d1dd13f680.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
IOWorkRequest 的 doWork 源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/64d1a0f27f9140188a37c1f006fc37d8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
接下来的调用链路比较复杂，我们把核心步骤列出，在能直接看到数据读取的地方详细分析源码。上面方法调用链路：`NIOServerCnxn.doIO()>readPayload()>readRequest()>ZookeeperServer.processPacket()`，最后一步方法是获取核心数据的地方，我们可以修改下代码读取数据：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3b4b52d7ccc24af887e6c5474cdfec44.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## ConnectionExpirerThread剖析

后台启动 ConnectionExpirerThread 清理线程清理过期的 session ,线程中无限循环,执行工作如下:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f5cf2b83c3d946fb81602452820e9cdc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# ZK通信优劣总结

Zookeeper在通信方面默认使用了NIO，并支持扩展Netty实现网络数据传输。相比传统IO，NIO在网络数据传输方面有很多明显优势，也就是BIO和NIO的区别。  
ZK在使用NIO通信虽然大幅提升了数据传输能力，但也存在一些代码诟病问题：  
1:Zookeeper通信源码部分学习成本高，需要掌握NIO和多线程  
2:多线程使用频率高，消耗资源多，但性能得到提升  
3:Zookeeper数据处理调用链路复杂，多处存在内部类，代码结构不清晰，写法比较经典