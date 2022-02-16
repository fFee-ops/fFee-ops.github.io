---
title: springCloud→Gateway：Gateway工作原理
date: 2020-10-22 10:14:19
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### Gateway工作原理

工作流程图如下：  
![请添加图片描述](https://img-blog.csdnimg.cn/30d54166ca6a446d86608b2a5b0da810.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**Gateway的执行流程如下：**

1.  Gateway的客户端会向Spring Cloud Gateway发起请求，请求首先会被 `HttpWebHandlerAdapter`进行提取组装成网关的上下文，然后网关的上下文会传递到DispatcherHandler。

2.  `DispatcherHandler`是所有请求的分发处理器，DispatcherHandler主要负责分发请求对应的处理器，比如将请求分发到对应RoutePredicateHandlerMapping\(路由断言处理器映射器）。

3.  `RoutePredicateHandlerMapping`路由断言处理映射器主要用于路由的查找，以及找到路由后返回对应的FilteringWebHandler。

4.  `FilteringWebHandler`主要负责组装Filter链表并调用Filter执行一系列Filter处理，然后把请求转到后端对应的代理服务处理，处理完毕后，将Response返回到Gateway客户端。在Filter链中，通过虚线分割Filter的原因是，过滤器可以在转发请求之前处理或者接收到被代理服务的返回结果之后处理。所有的Pre类型的Filter执行完毕之后，才会转发请求到被代理的服务处理。被代理的服务把所有请求完毕之后，才会执行Post类型的过滤器。