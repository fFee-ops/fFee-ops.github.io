---
title: Service Mesh简介
date: 2022-01-16 13:55:26
tags: mesh 云原生 cloud native
categories: ServiceMesh
---

<!--more-->

### Service Mesh简介

- [目前微服务架构面临的一些挑战](#_2)
- [技术架构演进](#_18)
- - [发展历史时间轴](#_22)
  - [单机小型机时代](#_25)
  - [垂直拆分](#_27)
  - [集群化负载均衡架构](#_30)
  - [服务化改造架构](#_33)
  - [服务治理](#_38)
  - [微服务时代](#_50)
  - [服务⽹格新时期 （Service Mesh）](#_Service_Mesh_68)
- [什么是Service Mesh](#Service_Mesh_83)
- [Service Mesh产品](#Service_Mesh_88)
- - [CNCF](#CNCF_89)
  - [Linkerd](#Linkerd_91)
  - [Envoy](#Envoy_93)
  - [Istio](#Istio_95)
  - [Conduit](#Conduit_97)
  - [国内产品](#_99)

# 目前微服务架构面临的一些挑战

⽬前，微服务的架构⽅式在企业中得到了极⼤的发展，主要原因是其解决了传统的单体架构中存在的问题。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1f0c228964cc43b8a68a835a8f0a7141.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
当单体架构拆分成微服务架构了之后也存在很多的挑战：

- 原来的单个应⽤拆分成了许多分散的微服务，它们之间相互调⽤才能完成⼀个任务，⽽⼀旦某个过程出错（组件越多，出错的概率也就越⼤），就⾮常难以排查。
- 如果⽤户请求的响应太慢，我们就需要知道到底哪些地⽅⽐较慢？整个链路的调⽤各阶段耗时是多少？哪些调⽤是并发执⾏的，哪些是串⾏的？这些问题需要我们能⾮常清楚整个集群的调⽤以及流量情况。
- 微服务拆分成这么多组件，如果单个组件出错的概率不变，那么整体有地⽅出错的概率就会增⼤。服务调⽤的时候如果没有错误处理机制，那么会导致⾮常多的问题。
- 应⽤数量的增多，对于⽇常的应⽤发布来说也是个难题。应⽤的发布需要⾮常谨慎，如果应⽤都是⼀次性升级的，出现错误会导致整个线上应⽤不可⽤，影响范围太⼤。
- 很多情况我们需要同时存在不同的版本，使⽤ AB 测试验证哪个版本更好。
- 如果版本升级改动了 API，并且互相有依赖，那么我们还希望能⾃动地控制发布期间不同版本访问不同的地址。这些问题都需要智能的流量控制机制。
- 为了保证整个系统的安全性，每个应⽤都需要实现⼀套相似的认证、授权、HTTPS、限流等功能。

**Service Mesh就是为了解决以上问题才出现的。** 但是有人可能说了，像链路追踪我可以用`skywalking`来做，熔断限流我能用`sentinel` ，为啥要新搞个serviceMesh呢？  
从软件设计角度出发，我们一直在追求松耦合的架构，也希望做到领域专攻。例如业务开发人员希望我只要关心业务逻辑即可，不需要关心链路跟踪，熔断，服务注册发现等支撑工具的服务；而平台支撑开发人员，则希望我的代码中不要包含任何业务相关的内容。而Service Mesh的出现，让这种情况成为可能。

# 技术架构演进

首先可以看看[这篇文章](https://sliing.blog.csdn.net/article/details/121023742)。

## 发展历史时间轴

![在这里插入图片描述](https://img-blog.csdnimg.cn/8a8538c1ec2c45edbad46c33e8f078dd.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 单机小型机时代

这个就不多说了

## 垂直拆分

链接文章中有介绍

## 集群化负载均衡架构

链接文章中有介绍

## 服务化改造架构

虽然系统经过了垂直拆分，但是拆分之后发现在论坛和聊天室中有重复的功能，⽐如，⽤户注册、发邮件等等，⼀旦项⽬⼤了，集群部署多了，这些重复的功能⽆疑会造成资源浪费，所以会把重复功能抽取出来，名字叫"XX服务（Service）"。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e4fc5836dc344e92b6d5fccd2b7e2b91.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
为了解决服务跟服务如何相互调⽤，需要⼀个程序之间的通信协议，所以就有了远程过程调⽤（RPC），作⽤就是让服务之间的程序调⽤变得像本地调⽤⼀样的简单。在前⾯的架构之上解决了业务重⽤的问题。

## 服务治理

随着业务的增⼤，基础服务越来越多，调⽤⽹的关系由最初的⼏个增加到⼏⼗上百，造成了调⽤链路错综复杂,需要对服务进⾏治理。

服务治理要求：

1.  当我们服务节点数⼏⼗上百的时候，需要对服务有动态的感知，引⼊了注册中⼼。
2.  当服务链路调⽤很⻓的时候如何实现链路的监控。
3.  单个服务的异常，如何能避免整条链路的异常（雪崩），需要考虑熔断、降级、限流。
4.  服务⾼可⽤：负载均衡。

典型框架⽐如有：Dubbo，默认采⽤的是Zookeeper作为注册中⼼。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9f692cd8097b4df6be411daa6b7257b9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 微服务时代

微服务是在2012年提出的概念，微服务的希望的重点是⼀个服务只负责⼀个独⽴的功能。  
拆分原则，任何⼀个需求不会因为发布或者维护⽽影响到不相关的服务，⼀切可以做到独⽴部署运维。  
⽐如传统的“⽤户中⼼”服务，对于微服务来说，需要根据业务再次拆分，可能需要拆分成“买家服务”、“卖家服务”、“商家服务”等。

典型代表：Spring Cloud

![在这里插入图片描述](https://img-blog.csdnimg.cn/3031a9dd93854a44bbbc46e1194de905.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

Spring Cloud微服务架构存在的不⾜：

1.  Spring Cloud属于侵⼊式框架，在项⽬中需要添加spring cloud maven依赖，加上spring cloud组件注解，写配置，打成jar的时候还必须要把⾮业务的代码也要融合在⼀起
2.  微服务中的服务⽀持不同语⾔开发，也需要维护不同语⾔和⾮业务代码的成本；
3.  业务代码开发者应该把更多的精⼒投⼊到业务熟悉度上，⽽不应该是⾮业务上，Spring Cloud虽然能解决微服务领域的很多问题，但是学习成本还是较⼤的。
4.  互联⽹公司产品的版本升级是⾮常频繁的，为了维护各个版本的兼容性、权限、流量等，因为Spring Cloud是“代码侵⼊式的框架”，这时候版本的升级就注定要让⾮业务代码⼀起，⼀旦出现问题，再加上多语⾔之间的调⽤，⼯程师会⾮常痛苦。
5.  我们已经感觉到了，服务拆分的越细，只是感觉上轻量级解耦了，但是维护成本却越⾼了。

## 服务⽹格新时期 （Service Mesh）

Service Mesh主要解决的问题就希望开发⼈员对于业务的聚焦，服务发现、服务注册、负载均衡等对于开发⼈员透明，可以更加专注业务逻辑的实现。

如果将为微服务提供通信服务的这部分逻辑从应⽤程序进程中抽取出来，作为⼀个单独的进程进⾏部署，并将其作为服务间的通信代理，可以得到如下图所示的架构：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f7bfc9713d5547a4bd2a16e271cd4d20.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Sidecar，翻译成中⽂是边⻋，⾮常的形象。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d2e7b9db85da4a18b153c6a152f6f2c7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
当服务⼤量部署时，随着服务部署的Sidecar代理之间的连接形成了⼀个如下图所示的⽹格，该⽹格成为了微服务的通讯基础设施层，承载了微服务之间的所有流量，被称之为Service Mesh（服务⽹格）。

![在这里插入图片描述](https://img-blog.csdnimg.cn/6b3b4a6a1fc743628bf6c0483d51d9a9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)  
服务⽹格中有数量众多的Sidecar代理，如果对每个代理分别进⾏设置，⼯作量将⾮常巨⼤。为了更⽅便地对服务⽹格中的代理进⾏统⼀集中控制，在服务⽹格上增加了控制⾯组件。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/221ca2378ca14df5a27ada087deabc5f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)

# 什么是Service Mesh

服务⽹格⽤来描述组成这些应⽤程序的微服务⽹络以及它们之间的交互。随着服务⽹格的规模和复杂性不断的增⻓，它将会变得越来越难以理解和管理。它的需求包括服务发现、负载均衡、故障恢复、度量和监控等。服务⽹格通常还有更复杂的运维需求，⽐如 A/B 测试、⾦丝雀发布、速率限制、访问控制和端到端认证。

![在这里插入图片描述](https://img-blog.csdnimg.cn/df377902028d45e182a0ab4bccebe761.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# Service Mesh产品

## CNCF

![在这里插入图片描述](https://img-blog.csdnimg.cn/77a3d81796704fbabd131ae076d77342.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## Linkerd

![在这里插入图片描述](https://img-blog.csdnimg.cn/89cf7f8db8c0466daccc5949f3a27277.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## Envoy

![在这里插入图片描述](https://img-blog.csdnimg.cn/06a91ee6f5a143d9aac04e4fdde5c2a6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## Istio

![在这里插入图片描述](https://img-blog.csdnimg.cn/368ea76266364b50874dc87c10762ca3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## Conduit

![在这里插入图片描述](https://img-blog.csdnimg.cn/61e44ff47148443abbdcb4b11f8d69ad.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 国内产品

![在这里插入图片描述](https://img-blog.csdnimg.cn/3411d146c0274d638fc22261472a192c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)