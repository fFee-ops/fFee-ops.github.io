---
title: SpringCloudAlibaba→Nacos：简介
date: 2020-10-26 11:13:02
tags: spring cloud 微服务 java
categories: SpringCloudAlibaba
---

<!--more-->

### Nacos简介

- [1、Nacos是什么](#1Nacos_4)
- [2、一些功能特性](#2_9)
- [3、Nacos的一些图](#3Nacos_35)
- [4、各个注册中心的比较](#4_64)

前四个字母分别为Naming和Configuration的前两个字母，最后的s为Service，合起来就是nacos

# 1、Nacos是什么

[官方文档](https://nacos.io/zh-cn/index.html)  
1、一个更易于构建云原生应用的动态服务发现，配置管理和服务管理中心  
2、简单来说Nacos就是注册中心+配置中心的组合，等价于`Nacos = Eureka+Config+Bus`

# 2、一些功能特性

**Nacos特性**  
服务发现和服务健康监测：

1.  Nacos 支持基于 DNS 和基于 RPC 的服务发现。服务提供者使用 原生SDK、OpenAPI、或一个独立的Agent TODO注册 Service 后，服务消费者可以使用DNS TODO 或HTTP\&API查找和发现服务。
2.  Nacos 提供对服务的实时的健康检查，阻止向不健康的主机或服务实例发送请求。Nacos 支持传输层\(PING 或 TCP\)和应用层 \(如 HTTP、MySQL、用户自定义）的健康检查。 对于复杂的云环境和网络拓扑环境中（如 VPC、边缘网络等）服务的健康检查，Nacos 提供了 agent 上报模式和服务端主动检测2种健康检查模式。Nacos 还提供了统一的健康检查仪表盘，帮助您根据健康状态管理服务的可用性及流量。

**动态配置服务：**

1.  动态配置服务可以让您以中心化、外部化和动态化的方式管理所有环境的应用配置和服务配置。
2.  动态配置消除了配置变更时重新部署应用和服务的需要，让配置管理变得更加高效和敏捷。
3.  配置中心化管理让实现无状态服务变得更简单，让服务按需弹性扩展变得更容易
4.  Nacos 提供了一个简洁易用的UI \(控制台样例 Demo\) 帮助您管理所有的服务和应用的配置。Nacos 还  
    提供包括配置版本跟踪、金丝雀发布、一键回滚配置以及客户端配置更新状态跟踪在内的一系列开箱即用的  
    配置管理特性，帮助您更安全地在生产环境中管理配置变更和降低配置变更带来的风险。

**动态 DNS 服务：**

1.  动态 DNS 服务支持权重路由，让您更容易地实现中间层负载均衡、更灵活的路由策略、流量控制以及数据中心内网的简单DNS解析服务。动态DNS服务还能让您更容易地实现以 DNS 协议为基础的服务发现，以帮助您消除耦合到厂商私有服务发现 API 上的风险。
2.  Nacos 提供了一些简单的 DNS APIs TODO 帮助您管理服务的关联域名和可用的 `IP:PORT` 列表.

**服务及其元数据管理：**  
元数据可以简单的理解为自定义的一些数据，比如我可以自定义个`version=1.0`  
Nacos 能让您从微服务平台建设的视角管理数据中心的所有服务及元数据，包括管理服务的描述、生命周期、服务的静态依赖分析、服务的健康状态、服务的流量管理、路由及安全策略、服务的 SLA 以及最首要的 metrics 统计数据。

# 3、Nacos的一些图

**Nacos版图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/906e9ffd2b75419293cc8bccd3b415fa.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- 特性大图：要从功能特性，非功能特性，全面介绍我们要解的问题域的特性诉求
- 架构大图：通过清晰架构，让您快速进入 Nacos 世界
- 业务大图：利用当前特性可以支持的业务场景，及其最佳实践
- 生态大图：系统梳理 Nacos 和主流技术生态的关系
- 优势大图：展示 Nacos 核心竞争力
- 战略大图：要从战略到战术层面讲 Nacos 的宏观优势

**Nacos 生态图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/94f6fadd93284618850e9a465ea17a13.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Nacos 无缝支持一些主流的开源生态：

> 1:Spring Cloud  
> 2:Apache Dubbo and Dubbo Mesh  
> 3:Kubernetes and CNCF

使用 Nacos 简化服务发现、配置管理、服务治理及管理的解决方案，让微服务的发现、管理、共享、组合更加容易。

# 4、各个注册中心的比较

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201026111245862.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201026112230102.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201026112235190.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)