---
title: Dubbo架构体系
date: 2021-11-18 10:47:21
tags: zk zookeeper 分布式
categories: Dubbo
---

<!--more-->

### Dubbo架构体系

- [框架介绍](#_4)
- - [概述](#_5)
  - [运行架构](#_11)
  - [整体设计](#_23)
- [环境搭建](#_44)

**软件架构经历**![在这里插入图片描述](https://img-blog.csdnimg.cn/20200517154517609.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 框架介绍

## 概述

Dubbo是阿里巴巴公司开源的一个高性能优秀的服务框架，使得应用可通过高性能的 RPC 实现服务的输出和输入功能，可以和 Spring框架无缝集成。

Dubbo是一款高性能、轻量级的开源Java RPC框架，它提供了三大核心能力：面向接口的远程方法调用，智能容错和负载均衡，以及服务自动注册和发现。

## 运行架构

![在这里插入图片描述](https://img-blog.csdnimg.cn/643dc6c876634f0189c391ca3aa7d9be.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
节点角色说明：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/816d4d273f0046a18cd7cb32e2b9a4fb.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**调用关系说明：**

1.  服务容器负责启动，加载，运行服务提供者。
2.  服务提供者在启动时，向注册中心注册自己提供的服务。
3.  服务消费者在启动时，向注册中心订阅自己所需的服务。
4.  注册中心返回服务提供者地址列表给消费者，如果有变更，注册中心将基于长连接推送变更数据给消费者。
5.  服务消费者，从提供者地址列表中，基于软负载均衡算法，选一台提供者进行调用，如果调用失败，再选另一台调用。
6.  服务消费者和提供者，在内存中累计调用次数和调用时间，定时每分钟发送一次统计数据到监控中心。

## 整体设计

![请添加图片描述](https://img-blog.csdnimg.cn/09874745f84e4f46adccf84cc044b942.jpg?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**图例说明：**

1.  图中左边淡蓝背景的为服务**消费方**使用的接口，右边淡绿色背景的为服务**提供**方使用的接口，位于中轴线上的为双方都用到的**接口**。

2.  图中从下至上分为十层，各层均为单向依赖，右边的黑色箭头代表层之间的依赖关系，每一层都可以剥离上层被复用，其中，Service 和 Config 层为 API，其它各层均为 SPI。

3.  图中绿色小块的为扩展接口，蓝色小块为实现类，图中只显示用于关联各层的实现类。

4.  图中蓝色虚线为初始化过程，即启动时组装链，红色实线为方法调用过程，即运行时调时链，紫色三角箭头为继承，可以把子类看作父类的同一个节点，线上的文字为调用的方法。

**各层说明:**

- **config 配置层**：对外配置接口，以 ServiceConfig , ReferenceConfig 为中心，可以直接初始化配置类，也可以通过 spring 解析配置生成配置类
- **proxy 服务代理层**：服务接口透明代理，生成服务的客户端 Stub 和服务器端 Skeleton, 以ServiceProxy 为中心，扩展接口为 ProxyFactory
- **registry 注册中心层**：封装服务地址的注册与发现，以服务 URL 为中心，扩展接口为RegistryFactory , Registry , RegistryService
- **cluster 路由层**：封装多个提供者的路由及负载均衡，并桥接注册中心，以 Invoker 为中心，扩展接口为 Cluster , Directory , Router , LoadBalance
- **monitor 监控层**：RPC 调用次数和调用时间监控，以 Statistics 为中心，扩展接口为MonitorFactory , Monitor , MonitorService
- **protocol 远程调用层**：封装 RPC 调用，以 Invocation , Result 为中心，扩展接口为Protocol , Invoker , Exporter
- **exchange 信息交换层**：封装请求响应模式，同步转异步，以 Request , Response 为中心，扩展接口为 Exchanger , ExchangeChannel , ExchangeClient , ExchangeServer
- **transport 网络传输层**：抽象 mina 和 netty 为统一接口，以 Message 为中心，扩展接口为Channel , Transporter , Client , Server , Codec
- **serialize 数据序列化层**：可复用的一些工具，扩展接口为 Serialization , ObjectInput ,ObjectOutput , ThreadPool

# 环境搭建

Dubbo 社区目前主力维护的有 2.6.x 和 2.7.x 两大版本，其中，

- 2.6.x 主要以 bugfix 和少量 enhancements 为主，因此能完全保证稳定性
- 2.7.x 作为社区的主要开发版本，得到持续更新并增加了大量新 feature 和优化，同时也带来了一些稳定性挑战

本次使用2.7.x版本  
**①源码拉取：**  
去到<https://github.com/apache/dubbo>把项目clone下来。

**②源码结构：**  
Dubbo被拆分成很多的Maven项目，通过如下图形可以大致的了解到，dubbo源码各个模块的相关作用：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4153b203e82d4d91b2f70b8f482b97e4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**模块说明：**

- **dubbo-common 公共逻辑模块**：包括 Util 类和通用模型。
- **dubbo-remoting 远程通讯模块**：相当于 Dubbo 协议的实现，如果RPC 用 RMI协议则不需要使用此包。
- **dubbo-rpc 远程调用模块**：抽象各种协议，以及动态代理，只包含一对一的调用，不关心集群的管理。
- **dubbo-cluster 集群模块**：将多个服务提供方伪装为一个提供方，包括：负载均衡, 容错，路由等，集群的地址列表可以是静态配置的，也可以是由注册中心下发。
- **dubbo-registry 注册中心模块**：基于注册中心下发地址的集群方式，以及对各种注册中心的抽象。
- **dubbo-monitor 监控模块**：统计服务调用次数，调用时间的，调用链跟踪的服务。
- **dubbo-config 配置模块**：是 Dubbo 对外的 API，用户通过 Config 使用Dubbo，隐藏 Dubbo 所有细节。
- **dubbo-container 容器模块**：是一个 Standlone 的容器，以简单的 Main 加载 Spring 启动，因为服务通常不需要 Tomcat/JBoss 等 Web 容器的特性，没必要用 Web 容器去加载服务。

**③环境导入：**  
因为之后要对源码进行剖析。所以需要把dubbo源码导入进idea。  
并且需要搭建好`zk`，`dubbo-admin`（[dubbo-admin的搭建](https://sliing.blog.csdn.net/article/details/106255613)）