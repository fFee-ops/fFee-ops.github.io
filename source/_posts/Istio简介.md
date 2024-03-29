---
title: Istio简介
date: 2022-01-18 14:34:23
tags: kubernetes java 容器
categories: ServiceMesh
---

<!--more-->

### Istio简介

- [istio架构](#istio_2)
- [为什么使⽤ Istio？](#_Istio_17)
- [核心特性](#_28)
- - [流量管理](#_31)
  - [安全](#_38)
  - [可观察性](#_45)
- [平台⽀持](#_55)

# istio架构

![在这里插入图片描述](https://img-blog.csdnimg.cn/78572ce48d444c96a83397d51c69d356.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
实际上Istio 就是 Service Mesh 架构的**⼀种实现**，服务之间的通信（⽐如这⾥的 Service A 访问 ServiceB）会通过代理（默认是 Envoy）来进⾏。

⽽且中间的⽹络协议⽀持 HTTP/1.1，HTTP/2，gRPC 或者 TCP，可以说覆盖了主流的通信协议。代理这⼀层，称之为数据平⾯。

控制平⾯做了进⼀步的细分，分成了 Pilot、Citadel 和 Galley，它们的各⾃功能如下：

- **Pilot**：为 Envoy 提供了服务发现，流量管理和智能路由（AB 测试、⾦丝雀发布等），以及错误处理（超时、重试、熔断）功能。
- **Citadel**：为服务之间提供认证和证书管理，可以让服务⾃动升级成 TLS 协议。
- **Galley**：Galley 是 Istio 的配置验证、提取、处理和分发组件。它负责将其余的 Istio 组件与从底层平台（例如 Kubernetes）获取⽤户配置的细节隔离开来。

数据平⾯会和控制平⾯通信，⼀⽅⾯可以获取需要的服务之间的信息，另⼀⽅⾯也可以汇报服务调⽤的Metrics 数据。

# 为什么使⽤ Istio？

通过负载均衡、服务间的身份验证、监控等⽅法，Istio 可以轻松地创建⼀个已经部署了服务的⽹络，⽽服务的代码只需很少更改甚⾄⽆需更改。通过在整个环境中部署⼀个特殊的 sidecar 代理为服务添加Istio 的⽀持，⽽代理会拦截微服务之间的所有⽹络通信，然后使⽤其控制平⾯的功能来配置和管理  
Istio，这包括：

- 为 HTTP、gRPC、WebSocket 和 TCP 流量⾃动负载均衡。
- 通过丰富的路由规则、重试、故障转移和故障注⼊对流量⾏为进⾏细粒度控制。
- 可插拔的策略层和配置 API，⽀持访问控制、速率限制和配额。
- 集群内（包括集群的⼊⼝和出⼝）所有流量的⾃动化度量、⽇志记录和追踪。
- 在具有强⼤的基于身份验证和授权的集群中实现安全的服务间通信。

Istio 为可扩展性⽽设计，可以满⾜不同的部署需求。

# 核心特性

Istio 以统⼀的⽅式提供了许多跨服务⽹络的关键功能。

## 流量管理

Istio 简单的规则配置和流量路由允许您控制服务之间的流量和 API 调⽤过程。

Istio 简化了服务级属性（如熔断器、超时和重试）的配置，并且让它轻⽽易举的执⾏重要的任务（如A/B 测试、⾦丝雀发布和按流量百分⽐划分的分阶段发布）。

有了更好的对流量的可视性和开箱即⽤的故障恢复特性，就可以在问题产⽣之前捕获它们，⽆论⾯对什么情况都可以使调⽤更可靠，⽹络更健壮。

## 安全

Istio 的安全特性解放了开发⼈员，使其只需要专注于应⽤程序级别的安全。

Istio 提供了底层的安全通信通道，并为⼤规模的服务通信管理认证、授权和加密。有了 Istio，服务通信在默认情况下就是受保护的，可以让您在跨不同协议和运⾏时的情况下实施⼀致的策略——⽽所有这些都只需要很少甚⾄不需要修改应⽤程序。

Istio 是独⽴于平台的，可以与 Kubernetes（或基础设施）的⽹络策略⼀起使⽤。但它更强⼤，能够在⽹络和应⽤层⾯保护pod到 pod 或者服务到服务之间的通信。

## 可观察性

Istio 健壮的追踪、监控和⽇志特性让您能够深⼊的了解服务⽹格部署。

通过 Istio 的监控能⼒，可以真正的了解到服务的性能是如何影响上游和下游的；⽽它的定制Dashboard 提供了对所有服务性能的可视化能⼒，并让您看到它如何影响其他进程。

Istio 的 Mixer 组件负责策略控制和遥测数据收集。它提供了后端抽象和中介，将⼀部分 Istio 与后端的基础设施实现细节隔离开来，并为运维⼈员提供了对⽹格与后端基础实施之间交互的细粒度控制。

所有这些特性都使您能够更有效地设置、监控和加强服务的 SLO。当然，底线是您可以快速有效地检测到并修复出现的问题。

# 平台⽀持

Istio 独⽴于平台，被设计为可以在各种环境中运⾏，包括跨云、内部环境、Kubernetes、Mesos 等等。您可以在 Kubernetes 或是装有 Consul 的 Nomad 环境上部署 Istio。Istio ⽬前⽀持：

- Kubernetes 上的服务部署
- 基于 Consul 的服务注册
- 服务运⾏在独⽴的虚拟机上