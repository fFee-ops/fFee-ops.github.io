---
title: Netty高级优化
date: 2021-10-31 23:01:22
tags: netty
categories: Netty
---

<!--more-->

### Netty高级优化

- [使用EventLoop的任务调度](#EventLoop_2)
- [减少ChannelPipline的调用长度](#ChannelPipline_16)
- [减少ChannelHandler的创建](#ChannelHandler_33)
- [BOSS与Worker线程配置优化](#BOSSWorker_50)
- - [BOSS线程优化](#BOSS_51)
  - [Worker（I/O）线程池优化](#WorkerIO_53)
- [线程隔离优化](#_60)
- [接收和发送缓冲区优化](#_65)
- [一些配置参数的设置](#_94)

# 使用EventLoop的任务调度

在EventLoop的支持线程外使用`channel.eventLoop().execute`，而不是直接使用channel.writeAndFlush\(data\)。

```java
channel.eventLoop().execute(new Runnable() {
@Override
public void run() {
channel.writeAndFlush(data)
}
});
```

前者会直接放入channel所对应的EventLoop的执行队列，而后者会导致线程的切换。

> 在writeAndFlush的底层，如果没有通过eventLoop执行的话，就会重新启动新的线程执行。

# 减少ChannelPipline的调用长度

```java
public class YourHandler extends ChannelInboundHandlerAdapter {
@Override
public void channelActive(ChannelHandlerContext ctx) {
// BAD (most of the times)
ctx.channel().writeAndFlush(msg);

// GOOD
ctx.writeAndFlush(msg);
}
}
```

前者是将msg从整个ChannelPipline中走一遍，所有的handler都要经过，而后者是从当前handler一直到pipline的尾部，调用更短。

# 减少ChannelHandler的创建

如果channelhandler是无状态的（即不需要保存任何状态参数），那么使用Sharable注解，并在bootstrap时只创建一个实例，减少GC。否则每次连接都会new出handler对象。

```java
@ChannelHandler.Shareable
public class StatelessHandler extends ChannelInboundHandlerAdapter {
@Override
public void channelActive(ChannelHandlerContext ctx) {}
}
public class MyInitializer extends ChannelInitializer<Channel> {
private static final ChannelHandler INSTANCE = new StatelessHandler();
@Override
public void initChannel(Channel ch) {
ch.pipeline().addLast(INSTANCE);
}
}
```

同时需要注意ByteToMessageDecoder之类的编解码器是有状态的，不能使用Sharable注解。

# BOSS与Worker线程配置优化

## BOSS线程优化

如果有大量设备客户端接入，需要对服务端的监听方式和线程模型做优化，即服务端监听多个端口，利用主从Reactor线程模型。由于同时监听了多个端口，每个ServerSocketChannel都对应一个独立的Acceptor线程，这样就能并行处理，加速客户端的接入速度，减少客户端连接超时失败率，提高单节点服务端的处理性能。

## Worker（I/O）线程池优化

对于I/O工作线程池的优化，可以先采用系统默认值（**cpu内核数\*2**）， 做性能测试，在测试过程中采集I/O线程的CPU占用率，看是否存在瓶颈，具体执行方法如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3a5be67a4c934611b3295fbc8adb50cc.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如果发现I/O线程停留在读或写操作时， 或停留在ChannelHandler，则可以通过加大NioEventLoop线程个数来提升网络的读写性能， 调整方式有两种：

1.  通过Netty的API接口指定：在创建NioEventLoopGroup时， 指定相应的线程数量。
2.  系统参数方式指定： 通过JDK运行时参数-Dio.netty.eventLoopThreads来指定NioEventLoopGroup线程池，采用这种方式要注意， 这属于系统层面配置， 所有创建NioEventLoopGroup地方都会采用该配置， 而不是默认的【CPU内核\*2】

# 线程隔离优化

为更好的提升性能， 将I/O线程与业务线程进行隔离优化：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e1886caabd3849fab70288d1db8ac9e4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/45375184aac749f0b578737b78e3c06b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 接收和发送缓冲区优化

对于不同的应用场景，收发缓冲区的最优值可能不同，用户需要根据实际场景，结合性能测试数据进行针对性的调优。  
比如， 客户端会周期性地上报数据和发送心跳， 单个链路的消息收发量并不大， 针对此类场景， 可以通过调小TCP的接收和发送缓冲区来降低单个TCP连接的资源占用率。

参数配置说明：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/faf430bd142f4792aa291b706c8352db.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

代码配置：

```java
.childHandler(new ChannelInitializer<SocketChannel>() {
@Override
protected void initChannel(SocketChannel socketChannel)
throws Exception {
//管道注册handler
ChannelPipeline pipeline = socketChannel.pipeline();
//编码通道处理
pipeline.addLast("decode", new StringDecoder());
//转码通道处理
pipeline.addLast("encode", new StringEncoder());
// 处理接收到的请求
pipeline.addLast(new NettyServerHandler());
}
})
// 配置接收区缓冲
.childOption(ChannelOption.SO_RCVBUF, 4* 1024)
// 配置发送区缓冲
.childOption(ChannelOption.SO_SNDBUF, 4*1024);
```

# 一些配置参数的设置

1.  ServerBootstrap启动时，通常`bossGroup`只需要设置为`1`即可，因为ServerSocketChannel在初始化阶段，只会注册到某一个eventLoop上，而这个eventLoop只会有一个线程在运行，所以没有必要设置为多线程。而`IO 线程`，为了充分利用 CPU，同时考虑减少线上下文切换的开销，通常设置为 `CPU 核数的两倍`，这也是 Netty提供的默认值。

2.  在对于响应时间有高要求的场景，使用.childOption\(ChannelOption.TCP\_NODELAY, true\) 和.option\(ChannelOption.TCP\_NODELAY, true\)来禁用nagle算法，不等待，立即发送。