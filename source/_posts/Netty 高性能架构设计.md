---
title: Netty 高性能架构设计
date: 2021-06-27 17:18:02
tags: python
categories: Netty
---

<!--more-->

### Netty 高性能架构设计

- [线程模型基本介绍](#_2)
- - [传统阻塞 I/O 服务模型](#_IO__15)
  - [Reactor 模式（笼统概念版并未具体到三种实现）](#Reactor__29)
  - - [单 Reactor 单线程](#_Reactor__49)
    - [单 Reactor 多线程](#_Reactor__67)
    - [主从 Reactor 多线程](#_Reactor__81)
  - [Netty模型](#Netty_93)
- [异步模型](#_117)

  
netty要将worker的线程个数设置为2倍的cpu个数

# 线程模型基本介绍

目前存在的线程模型有：

- 传统阻塞 I/O 服务模型
- Reactor 模式

根据 Reactor 的数量和处理资源池线程的数量不同，有 3 种典型的实现

- 单 Reactor 单线程；
- 单 Reactor 多线程；
- 主从 Reactor 多线程

> Netty 线程模式\(Netty 主要基于主从 Reactor 多线程模型做了一定的改进，其中主从 Reactor 多线程模型有多个 Reactor\)

## 传统阻塞 I/O 服务模型

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210627164931516.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**模型特点**

1.  采用阻塞 IO 模式获取输入的数据
2.  每个连接都需要独立的线程完成数据的输入，业务处理, 数据返回

**问题分析**

1.  当并发数很大，就会创建大量的线程，占用很大系统资源
2.  连接创建后，如果当前线程暂时没有数据可读，该线程会阻塞在 read 操作，造成线程资源浪费

## Reactor 模式（笼统概念版并未具体到三种实现）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210627165242461.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**模型特点：**

1.  Reactor 模式，通过一个或多个输入同时传递给服务处理器的模式\(基于事件驱动\)
2.  服务器端程序处理传入的多个请求,并将它们同步分派到相应的处理线程
3.  Reactor 模式使用 IO 复用监听事件, 收到事件后，分发给某个线程\(进程\), 这点就是网络服务器高并发处理关键

可以发现它是

1.  **基于 I/O 复用模型**，也就是说多个连接公用一个阻塞对象，这就解决了传统io模型的第2点问题。
2.  **基于线程池复用线程资源：** 它不必再为每个连接创建线程，将连接完成后的业务处理任务分配给线程进行处理，一个线程可以处理多个连接的业务。（解决了传统模型第1点问题）
    > 比如第一个处理线程本来是处理client1的，当处理完了，又可以处理别的client事件

**Reactor 模式中 核心组成：**

1.  Reactor：Reactor 在一个单独的线程中运行，负责监听和分发事件，分发给适当的处理程序来对 IO 事件做出反应。 它就像公司的电话接线员，它接听来自客户的电话并将线路转移到适当的联系人；
2.  Handlers：处理程序执行 I/O 事件要完成的实际事件，类似于客户想要与之交谈的公司中的实际官员。Reactor通过调度适当的处理程序来响应 I/O 事件，处理程序执行非阻塞操作。

### 单 Reactor 单线程

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210628222343174.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
这个图很简单，大概流程就是：

1.  Reactor收到连接请求就会转发给`Acceptor`去建立一个连接，收到别的请求就会转发给`Handler`去处理
2.  处理完后`Hanlder`会用`send`方法返回给客户端结果

**优点：**  
模型简单，没有多线程、进程通信、竞争的问题，全部都在一个线程中完成

**缺点：**

1.  ：性能问题，只有一个线程，无法完全发挥多核 CPU 的性能。Hander在处理某一个事件的时候无法处理别的事件，还是会阻塞在这里
2.  不太可靠，如果崩了整个系统就没办法用了

**使用场景：**  
客户端的数量有限，业务处理非常快速，比如 Redis 在业务处理的时间复杂度 O\(1\) 的情况

### 单 Reactor 多线程

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210628223016165.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

对比上一个图来说，它增加了Hander的数量，然后还要注意，handler 只负责响应事件，不做具体的业务处理, 通过 read 读取数据后，会分发给后面的 worker 线程池的某个线程处理业务，然后work处理完后把结果返回给handler，handler再send给客户端

**优点：**  
可以充分的利用多核 cpu 的处理能力

**缺点：**

1.  多线程数据共享和访问比较复杂
2.  只有一个Reactor，高并发的情况下还是容易出现性能瓶颈

### 主从 Reactor 多线程

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210628223545243.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

大致流程其实还是差不多，但是：

1.  主Reactor只把连接请求分配给Acceptor，建立连接后Acceptor再转发到从Reactor
2.  如果是别的事件那么主Reactor会直接转发给从Reactor，再由从Reactor去分发，其实主要思路还是第一种模式的思路

**注意：红框的部分可以有多个**

## Netty模型

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210629095053717.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**上图小结：**

1.  Netty 抽象出两组线程池 BossGroup 专门负责接收客户端的连接, WorkerGroup 专门负责网络的读写

2.  BossGroup 和 WorkerGroup 类型都是 NioEventLoopGroup

3.  NioEventLoopGroup 相当于一个事件循环组，它里面包含了多个事件循，也就是NioEventLoop

4.  每一个NioEventLoop都会包含自己的selector,用于监听绑定在它上面的网络通讯事件

5.  NioEventLoopGroup中可以有多个NioEventLoop

6.  每个 Boss NioEventLoop 循环执行的步骤有 3 步

    1.  轮训监听accept事件
    2.  处理 accept 事件 , 与 client 建立连接 , 生成NioScocketChannel , 并将其注册到某个 workerGroup中的NIOEventLoop 上的 selector
    3.  继续处理任务队列的任务 ， 即 runAllTasks

7.  每个 Worker NIOEventLoop 循环执行的步骤：

    1.  轮询监听 read, write 事件
    2.  处理对应的read , write 事件，是在管道里面的channelHandler进行处理的
    3.  继续处理任务队列的任务 ， 即 runAllTask处理任务队列的任务 ， 即 runAllTask

8.  每个Worker NIOEventLoop 处理业务时，会使用pipeline\(管道\), pipeline 中包含了 channel , 即通过pipeline可以获取到对应通道, 管道中维护了很多的 处理器

> 可以把耗时长的任务放在`TaskQueue`中去，进行异步执行

# 异步模型

1.  Netty 中的 I/O 操作是异步的，包括 Bind、Write、Connect 等操作会简单的返回一个 ChannelFuture
2.  我们可以通过ChannelFuture去监控这个异步事件的返回，并且对其进行操作，类似于Ajax的回调函数！！

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021063022353523.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210630223601298.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)