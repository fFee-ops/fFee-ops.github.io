---
title: Skywalking概述
date: 2021-12-01 19:05:51
tags: zookeeper 分布式 java
categories: Skywalking
---

<!--more-->

### Skywalking概述

- [1.1 微服务系统监控三要素](#11__12)
- [1.2 什么是链路追踪](#12__18)
- - [1.2.1 链路追踪](#121__24)
  - [1.2.2 OpenTracing](#122_OpenTracing_30)
- [1.3 常见APM系统](#13_APM_80)
- [1.4 Skywalking介绍](#14_Skywalking_85)

![在这里插入图片描述](https://img-blog.csdnimg.cn/f551a69704e34581a94f2cd7ff51c380.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
随着互联网架构的扩张，分布式系统变得日趋复杂，越来越多的组件开始走向分布式化，如微服务、消息收发、分布式数据库、分布式缓存、分布式对象存储、跨域调用，这些组件共同构成了繁杂的分布式网络。  
我们思考下这些问题：

> 1:一个请求经过了这些服务后其中出现了一个调用失败的问题，如何定位问题发生的地方？  
> 2:如何计算每个节点访问流量？  
> 3:流量波动的时候，增加哪些节点集群服务？

这些问题要想得到解决，一定是有数据支撑，绝不是靠开发人员或者运维人员的直觉。为了解决分布式应用、微服务系统面临的这些挑战，APM系统（Application Performance Management，即应用性能管理，简单来说就是应用监控）营运而生。

# 1.1 微服务系统监控三要素

![在这里插入图片描述](https://img-blog.csdnimg.cn/9eccd855218540a9a91df2d9a86472c9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- **Logging** ： 就是记录系统行为的离散事件，例如，服务在处理某个请求时打印的错误日志，我们可以将这些日志信息记录到 ElasticSearch 或是其他存储中，然后通过 Kibana 或是其他工具来分析这些日志了解服务的行为和状态。大多数情况下，日志记录的数据很分散，并且相互独立，比如错误日志、请求处理过程中关键步骤的日志等等
- **Metrics** ：是系统在一段时间内某一方面的某个度量，例如，电商系统在一分钟内的请求次数。我们常见的监控系统中记录的数据都属于这个范畴，例如 Promethus、Open-Falcon 等，这些监控系统最终给运维人员展示的是一张张二维的折线图。Metrics 是可以聚合的，例如，为电商系统中每个 HTTP 接口添加一个计数器，计算每个接口的 QPS，之后我们就可以通过简单的加和计算得到系统的总负载情况。
- **Tracing** ：即我们常说的分布式链路追踪。在微服务架构系统中一个请求会经过很多服务处理，调用链路会非常长，要确定中间哪个服务出现异常是非常麻烦的一件事。通过分布式链路追踪，运维人员就可以构建一个请求的视图，这个视图上展示了一个请求从进入系统开始到返回响应的整个流程。这样，就可以从中了解到所有服务的异常情况、网络调用，以及系统的性能瓶颈等。

# 1.2 什么是链路追踪

谷歌在 2010 年 4 月发表了一篇论文《Dapper, a Large-Scale Distributed Systems TracingInfrastructure》介绍了分布式追踪的概念，之后很多互联网公司都开始根据这篇论文打造自己的分布式链路追踪系统。前面提到的 APM 系统的核心技术就是分布式链路追踪。

OpenTracing提供了一个标准的、与供应商无关的框架，这意味着如果开发者想要尝试一种不同的分布式追踪系统，开发者只需要简单地修改Tracer配置即可，而不需要替换整个分布式追踪系统。

OpenTracing API目前支持的语言众多：![在这里插入图片描述](https://img-blog.csdnimg.cn/d8770b57c8054a18b7fccf3b1f8c98f7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2.1 链路追踪

下面通过官方的一个示例简单介绍说明什么是 Tracing,把Tracing学完后，更有助于运用SkywalkingUI进行数据分析。在一个分布式系统中，追踪一个事务或者调用流程，可以用下图方式描绘出来。这类流程图可以看清各组件的组合关系，但它并不能看出一次调用触发了哪个组件调用、什么时间调用、是串行调用还是并行调用。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d65a8b6340924d37bb05367d64b4e451.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
一种更有效的展现方式就是下图这样，这是一个典型的 trace 视图，这种展现方式增加显示了执行时间的上下文，相关服务间的层次关系，进程或者任务的串行或并行调用关系。这样的视图有助于发现系统调用的关键路径。例如下图中，我们可以看到请求串行的调用了授权服务、订单服务以及资源服  
务，在资源服务中又并行的执行了三个子任务。我们还可以看到，在这整个请求的生命周期中，资源服务耗时是最长的。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/aed5ec85d5ff434193b0a894131983de.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2.2 OpenTracing

学好OpenTracing，更有助于我们运用Skywalking UI进行数据分析。

**Trace**  
一个 Trace 代表一个事务、**请求**或是流程在分布式系统中的**执行过程**。OpenTracing 中的一条 Trace 被认为是一个由多个 Span 组成的有向无环图（ DAG 图），一个 Span 代表系统中具有开始时间和执行时长的逻辑单元，Span 一般会有一个名称，一条 Trace 中 Span 是首尾连接的。

**Span**  
Span 代表系统中具有开始时间和执行时长的逻辑单元，Span 之间通过嵌套或者顺序排列建立逻辑因果关系。  
每个 Span 中可以包含以下的信息：

- 操作名称：例如访问的具体 RPC 服务，访问的 URL 地址等；
- 起始时间；2021-1-25 22:00:00
- 结束时间；2021-1-30 22:00:00
- Span Tag：一组键值对构成的Span标签集合，其中键必须为字符串类型，值可以是字符串、bool值或者数字；
- Span Log：一组 Span 的日志集合；
- SpanContext：Trace 的全局上下文信息；
- References：Span 之间的引用关系，下面详细说明 Span 之间的引用关系；  
  在一个 Trace 中，一个 Span 可以和一个或者多个 Span 间存在因果关系。目前，OpenTracing 定义`了ChildOf`和`FollowsFrom` 两种 Span 之间的引用关系。这两种引用类型代表了子节点和父节点间的直接因果关系。

> **ChildOf 关系**：一个 Span 可能是一个父级 Span 的孩子，即为 ChildOf 关系。下面这些情况会构成 ChildOf 关系：  
> ①一个 HTTP 请求之中，被调用的服务端产生的 Span，与发起调用的客户端产生的 Span，就构成了 ChildOf 关系；  
> ②一个 SQL Insert 操作的 Span，和 ORM 的 save 方法的 Span 构成 ChildOf 关系。  
> 很明显，上述 ChildOf 关系中的父级 Span 都要等待子 Span 的返回，子 Span 的执行时间影响了其所在父级 Span 的执行时间，父级 Span 依赖子 Span 的执行结果。除了串行的任务之外，我们的逻辑中还有很多并行的任务，它们对应的 Span 也是并行的，这种情况下一个父级 Span 可以合并所有子 Span的执行结果并等待所有并行子 Span 结束。

> **FollowsFrom 关系**：在分布式系统中，一些上游系统（父节点）不以任何方式依赖下游系统（子节点）的执行结果，例如，上游系统通过消息队列向下游系统发送消息。这种情况下，下游系统对应的子Span 和上游系统对应的父级 Span 之间是 FollowsFrom 关系。

**Logs**  
每个 Span 可以进行多次 Logs 操作，每一次 Logs 操作，都需要带一个时间戳，以及一个可选的附加信息。

**Tags**  
每个 Span 可以有多个键值对形式的 Tags，Tags 是没有时间戳的，只是为 Span 添加一些简单解释和补充信息。

**SpanContext 和 Baggage**  
SpanContext 表示进程边界，在跨进程调用时需要将一些全局信息，例如，TraceId、当前 SpanId 等信息封装到 Baggage 中传递到另一个进程（下游系统）中。

Baggage 是存储在 SpanContext 中的一个键值对集合。它会在一条 Trace中全局传输，该 Trace 中的所有 Span 都可以获取到其中的信息。

需要注意的是，由于 Baggage 需要跨进程全局传输，就会涉及相关数据的序列化和反序列化操作，如果在 Baggage 中存放过多的数据，就会导致序列化和反序列化操作耗时变长，使整个系统的 RPC 的延迟增加、吞吐量下降。

虽然 Baggage 与 Span Tags 一样，都是键值对集合，但两者最大区别在于 Span Tags 中的信息不会跨进程传输，而 Baggage 需要全局传输。因此，OpenTracing 要求实现提供 Inject 和 Extract 两种操作，SpanContext 可以通过 Inject 操作向 Baggage 中添加键值对数据，通过 Extract 从 Baggage 中获取键值对数据。

**核心接口语义**  
OpenTracing 希望各个实现平台能够根据上述的核心概念来建模实现，不仅如此，OpenTracing 还提供了核心接口的描述，帮助开发人员更好的实现 OpenTracing 规范。

- Span 接口  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/810c5b37818a4160bb8db6e9ea316b4c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- SpanContext 接口  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/aad428e986d0408786ee896fbe772a0d.png)

- Tracer 接口  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/776b61f499a542deb666c934398d7aa5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.3 常见APM系统

我们前面提到了APM系统，APM 系统（Application Performance Management，即应用性能管理）是对企业的应用系统进行实时监控，实现对应用性能管理和故障定位的系统化解决方案，在运维中常用。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8ca352e4b202416caf59ab5755fc95d9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我将学习Skywalking，Skywalking有很多优秀特性。SkyWalking 对业务代码无侵入，性能表现优秀，SkyWalking 增长势头强劲，社区活跃，中文文档齐全，支持多语言探针， SkyWalking 支持Dubbo、gRPC、SOFARPC 等很多框架。

# 1.4 Skywalking介绍

kywalking是一个可观测性分析平台和应用性能管理系统，它也是基于OpenTracing规范、开源的AMP系统。Skywalking提供分布式跟踪、服务网格遥测分析、度量聚合和可视化一体化解决方案。支持Java， .Net Core, PHP, NodeJS, Golang, LUA, c++代理。支持Istio +特使服务网格

我们在学习Skywalking之前，可以先访问官方提供的控制台演示演示地址：<http://demo.skywalking.apache.org/> 账号：skywalking 密码：skywalking

**SkyWalking 核心功能：**

- 服务、服务实例、端点指标分析。
- 服务拓扑图分析
- 服务、服务实例和端点（Endpoint）SLA 分析
- 慢查询检测
- 告警

**SkyWalking 特点：**

- 多语言自动探针，支持 Java、.NET Code 等多种语言。
- 为多种开源项目提供了插件，为 Tomcat、 HttpClient、Spring、RabbitMQ、MySQL 等常见基础设施和组件提供了自动探针。
- 微内核 + 插件的架构，存储、集群管理、使用插件集合都可以进行自由选择。
- 支持告警。
- 优秀的可视化效果。

**Skywalking架构图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4b6370f8376045949fc63cd9cea83d97.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
SkyWalking 分为三个核心部分：

- **Agent（探针）**：Agent 运行在各个服务实例中，负责采集服务实例的 Trace 、Metrics 等数据，然后通过 gRPC 方式上报给 SkyWalking 后端。
- **OAP**：SkyWalking 的后端服务，其主要责任有两个。
  - 一个是负责接收 Agent 上报上来的 Trace、Metrics 等数据，交给 Analysis Core （涉及SkyWalking OAP 中的多个模块）进行流式分析，最终将分析得到的结果写入持久化存储中。SkyWalking 可以使用 ElasticSearch、H2、MySQL 等作为其持久化存储，一般线上使用ElasticSearch 集群作为其后端存储。
  - 另一个是负责响应 SkyWalking UI 界面发送来的查询请求，将前面持久化的数据查询出来，组成正确的响应结果返回给 UI 界面进行展示。
- **UI 界面**：SkyWalking 前后端进行分离，该 UI 界面负责将用户的查询操作封装为 GraphQL 请求提交给 OAP 后端触发后续的查询操作，待拿到查询结果之后会在前端负责展示。