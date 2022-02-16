---
title: Netty 核心模块组件
date: 2021-06-30 23:02:50
tags: java
categories: Netty
---

<!--more-->

### Netty 核心模块组件

- - [Bootstrap、ServerBootstrap](#BootstrapServerBootstrap_4)
  - [Future、ChannelFuture](#FutureChannelFuture_7)
  - [Channel](#Channel_11)
  - [Selector](#Selector_15)
  - [ChannelHandler 及其实现类](#ChannelHandler__19)
  - [Pipeline /ChannelPipeline](#Pipeline_ChannelPipeline_24)
  - [ChannelHandlerContext](#ChannelHandlerContext_30)
  - [Unpooled 类](#Unpooled__33)

![在这里插入图片描述](https://img-blog.csdnimg.cn/1e03611beaba47df874656dbdb68839c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## Bootstrap、ServerBootstrap

Bootstrap是客户端的引导类，用于配置客户端的一些启动信息，而ServerBootstrap就是服务端的了

## Future、ChannelFuture

Netty 中所有的 IO 操作都是异步的，不能立刻得知消息是否被正确处理。但是可以过一会等它执行完成或者直接注册一个监听，具体的实现就是通过 Future 和 ChannelFutures，他们可以注册一个监听，当操作执行成功或失败时监听会自动触发注册的监听事件

## Channel

是Netty 网络通信的组件，能够注册到`Selector`用于执行网络 I/O 操作，不同协议、不同的阻塞类型的连接都有不同的 Channel 类型与之对应。

## Selector

将channel注册进来，用于监听它们是否发生selector关心的事件，如果发生了就进行处理

## ChannelHandler 及其实现类

它是一个接口，有很多实现类，我们经常需要自定义一个 Handler 类去继承 `ChannelInboundHandlerAdapter`，然后通过重写相应方法实现业逻辑，这也是真正进行业务处理的地方

## Pipeline /ChannelPipeline

1.  ChannelPipeline 是 保存 ChannelHandler 的 List，用于处理或拦截  
    Channel 的入站事件和出站操作
2.  在 Netty 中每个 Channel 都有且仅有一个 ChannelPipeline 与之对应，它们的组成关系如下
    > ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210630225857462.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## ChannelHandlerContext

保存 Channel 相关的所有上下文信息，同时关联一个 ChannelHandler 对象,可以从里面拿到很多东西

## Unpooled 类

是Netty 提供专门用来操作缓冲区\(即 Netty 的数据容器\)的工具类。  
常用方法：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210702100724699.png)