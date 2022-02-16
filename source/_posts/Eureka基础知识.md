---
title: Eureka基础知识
date: 2020-10-17 11:05:46
tags: 
categories: Eureka
---

<!--more-->

### Eureka基础知识

**什么是服务治理**  
Spring Cloud封装了Net公司开发的 Eureka模块来实现服务治理，  
在传统的rpc远程调用框架中,管理每个服务与服务之间依赖关系比较复杂,管理比较复杂,所以需要使用服务治理,管理服务于服务之间依赖关系,可以实现服务调用、负载均衡、容错等,实现服务发现与注册。

**什么是服务注册与发现**

- Eureka采用了CS的设计架构, Eureka Server作为服务注册功能的服务器,它是服务注册中心。而系统中的其他微服务,使用 Eureka的客户端连接到Eureka server**并维持心跳连接。**
- 这样系统的维护人员就可以通过 Eureka Server来监控系统中各个微服务是否正常运行。
- 在服务注册与发现中,有一个注册中心。当服务器启动的时候,会把当前自己服务器的信息比如服务地址通讯地址等**以别名方式**注册到注册中心上。另一方\(消费者或服务提供者\),以该别名的方式去注册中心上获取到实际的服务通讯地址,然后再实现本地RPC调用RPC远程调用
- 框架核心设计思想:在于注册中心,因为使用注册中心管理每个服务与服务之间的一个依赖关系服务治理概念\)。在任何rpc远程框架中,都会有一个注册中心\(存放服务地址相关信息\(接口地址\)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201017110508572.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**Eureka两大组件**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020101711053362.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)