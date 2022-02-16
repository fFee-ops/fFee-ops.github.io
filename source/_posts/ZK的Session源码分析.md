---
title: ZK的Session源码分析
date: 2021-11-11 13:07:07
tags: zk
categories: zookeeper
---

<!--more-->

### ZK的Session源码分析

- [服务端Session属性分析](#Session_5)
- [Session创建](#Session_27)
- [Session刷新](#Session_58)
- [Session失效](#Session_74)

本篇文章主要讲解**服务端** Session 会话处理流程。

# 服务端Session属性分析

Zookeeper服务端会话操作如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/17267712633f43849ba1e82afb480993.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在服务端通过 `SessionTrackerImpl` 和`ExpiryQueue`来保存Session会话信息。

**SessionTrackerImpl** 有以下属性：

1.  **sessionsById**： 用来存储ConcurrentHashMap\<Long, SessionImpl>  
    \{sessionId:SessionImpl\}
2.  **sessionExpiryQueue** ：ExpiryQueue失效队列
3.  **sessionsWithTimeout** ：ConcurrentMap\<Long, Integer>存储的是\{sessionId:sessionTimeout\}
4.  **nextSessionId** ：下一个sessionId

**ExpiryQueue** 失效队列有以下属性：

1.  `elemMap`： ConcurrentHashMap\<E, Long> 存储的是\{SessionImpl:newExpiryTime\} Session实例对象，失效时间。

2.  **expiryMap** ：ConcurrentHashMap\<Long, Set>存储的是\{time: set\} 失效时间，当前失效时间的Session对象集合。

3.  **nextExpirationTime**： 下一次失效时间 `{(System.nanoTime() / 1000000)/expirationInterval+1}*expirationInterval`当前系统时间毫秒值ms=System.nanoTime\(\) / 1000000。 nextExpirationTime=当前系统时间毫秒值+expirationInterval\(失效间隔\)。

4.  **expirationInterval** ：失效间隔，默认是10s，可以通过sessionlessCnxnTimeout修改。即是通过配置文件的tickTime修改。

# Session创建

**概览图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6e02183e4de244d28326036e465759f1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

假如客户端发起请求后，后端如何识别是第一次创建请求？在之前的  
案例源码 `NIOServerCnxn.readPayload()`中有所体现，NIOServerCnxn.readPayload\(\) 部分关键源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7d8b787380b5435fbd6576c49b55a671.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时如果 `initialized=false` ，表示第一次连接 需要创建`Session`，此处调用`readConnectRequest()`后，在 readConnectRequest\(\) 方法中会将 initialized 设置为 true ，只有在处理完连接请求之后才会把 initialized 设置为 true ，才可以处理客户端其他命令。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/346b29bc730140148c6666d94c083ff1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面方法还调用了`processConnectRequest ()`处理连接请求, processConnectRequest 第一次从请求中获取到的 `sessionId=0` ,此时会把创建 Session 作为一个业务，会调用`createSession()`方法，  
processConnectRequest 方法部分关键代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/78108e5427a44cf9ab2bd7d40c6a144a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
创建会话调用 `createSession()`，该方法会首先创建一个sessionId，并把该sessionId 作为会话ID创建一个创建session会话的请求，并将该请求交给业务链作为一个业务处理， createSession\(\) 源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bd62e2c679364cb1892f2daa130b4e40.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面方法用到的`sessionTracker.createSession(timeout)`做了2个操作分别是创建sessionId和配置sessionId的跟踪信息，方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b91a6b4b26a746a08cdd9c910b78c89c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
会话信息的跟踪其实就是将会话信息添加到队列中，任何地方可以根据会话ID找到会话信息，trackSession 方法实现了Session创建、Session队列存储、 Session 过期队列存储， trackSession方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/41f125df348447a5bf6d94ae295454fd.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在 `PrepRequestProcessor` 的 run 方法中调用`pRequest()->pRequestHelper()` 最终调用`pRequest2Txn`，关键代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cee51691f0f0452181bc576dcf78da3c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在 `SyncRequestProcessor` 对`txn(创建session的操作)`进行持久化，在 `FinalRequestProcessor` 会对Session进行提交，其实就是把 Session 的ID和 Timeout 存到 `sessionsWithTimeout` 中去。

由于`FinalRequestProcessor` 中调用链路太复杂，我们把调用链路写出来，可以按照这个顺序跟踪：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2ef1ad053b1741c2afc350c09ed47501.png)  
上面调用链路中 `processTxnForSessionEvents(request, hdr, request.getTxn());` 方法代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/abe83f9c2a2c46be81ea8040ada582e0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
其中的`SessionTrackerImpl.commitSession()`代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6c569f577b484241a3cbfbfbd8fdbc20.png)

# Session刷新

**概览图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e20ee4b309484128ae51e2c26dd213a1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

服务端无论接受什么请求命令都会更新Session的过期时间 。我们做增删或者ping命令的时候，都会经过 `RequestThrottler` ， RequestThrottler 的run方法中调用`zks.submitRequestNow()`，而 zks.submitRequestNow\(request\) 中调用了`touch(si.cnxn);`，该方法源码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/5b8632e12331418793cad0070c2cb0e4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
touchSession\(\) 方法更新`sessionExpiryQueue`失效队列中的失效时间，源码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/bf824f09af4c467d88335dc5cb453936.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
其实内部是调用了`sessionExpiryQueue.update(s, timeout);`源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ae4210021c574f468c7a907756944766.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
update\(\) 方法会在当前时间的基础上增加`timeout`，并更新失效时间为`newExpiryTime`，\*\*关键源码\(并非全部源码\)\*\*如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5ec1495c798348c296b60997faf8cfa5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# Session失效

**概览图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/61bd084d003c4f54988a061cb0f9fc53.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`SessionTrackerImpl` 是一个线程类，继承了 ·ZooKeeperCriticalThread· ，我们可以看它的run方法，它首先获取了下一个会话过期时间，并休眠等待会话过期时间到期，然后获取过期的客户端会话集合并循环关闭，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6ce0a43cc0924eaaa66e01e7082d7416.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面方法中调用了`sessionExpiryQueue.poll()`，该方法代码主要是获取过期时间对应的客户端会话集合，也就是key为过期时间，value为会话集合，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/647b4db330484d4d80dc2e6bcbfa950c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
最上面的 `setSessionClosing()`方法其实是把Session会话的 `isClosing` 状态设置为了true,方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/72db97ef27ec44e4adc2819ff794edb2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
而让客户端失效的方法`expirer.expire(s)`; 其实也是一个业务操作，主要调用了`ZooKeeperServer.expire()` 方法，而该方法获取SessionId后，又创建了一个  
`OpCode.closeSession`的请求，并交给业务链处理，我们查看ZooKeeperServer.expire\(\) 方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/741feac789ad489aacf9c0ae9adf2403.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

在 业务处理链的`PrepRequestProcessor.pRequest2Txn()`方法中 `OpCode.closeSession`操作里最后部分代理明确将会话Session的isClosing设置为了true，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4a051a86e137420aa54d97fb575f5d4e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
业务链处理对象 `FinalRequestProcessor.processRequest()`方法调用了  
`ZooKeeperServer.processTxn()`，并且在 processTxn\(\) 方法中执行了  
`processTxnForSessionEvents()` ，而 processTxnForSessionEvents\(\) 方法正好移除了会话信息，方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6375e8d5c1e44eb481e5ff12e0414e94.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
移除会话的方法 `SessionTrackerImpl.removeSession()`会移除会话ID以及过期会话对象，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/116e53905d10468fb51b8a12fac703b5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)