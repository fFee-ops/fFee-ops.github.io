---
title: springCloud→Cosul：Consul简介
date: 2020-10-18 22:12:02
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### Consul简介

- [是什么](#_4)
- [Consul 角色](#Consul__19)
- [Consul 工作原理](#Consul__27)
- [对比](#_35)

[**下载地址**](https://www.consul.io/downloads.html)

# 是什么

Consul 是 HashiCorp 公司推出的开源工具，用于实现分布式系统的`服务发现与配置`。与其它分布式服务注册与发现的方案，Consul 的方案更“一站式”，内置了**服务注册与发现框架、分布一致性协议实现、健康检查、Key/Value 存储、多数据中心方案**，不再需要依赖其它工具（比如 ZooKeeper 等）。使用起来也较 为简单。Consul 使用 Go 语言编写，因此具有天然可移植性\(支持Linux、windows和Mac OS X\)；安装包仅包含一个可执行文件，方便部署，与 Docker 等轻量级容器可无缝配合。

**它的主要功能**  
①服务发现：提供HTTP和DNS两种发现方式

②健康监测：支持多种协议，HTTP、TCP、Docker、Shell脚本定制化

③KV存储：key , Value的存储方式

④多数据中心：Consul支持多数据中心

并且Consul有可视化WEB界面。

# Consul 角色

- client: 客户端, 无状态, 将 HTTP 和 DNS 接口请求转发给局域网内的服务端集群。
- server: 服务端, 保存配置信息, 高可用集群, 在局域网内与本地客户端通讯, 通过广域网与其它数据中心通讯。 每个数据中心的 server 数量推荐为 3 个或是 5 个。

Consul 客户端、服务端还支持夸中心的使用，更加提高了它的高可用性。

# Consul 工作原理

![在这里插入图片描述](https://img-blog.csdnimg.cn/c0a9e5de805948cfbef8267c8ec7df19.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Consul在项目中发挥服务注册与发现的功能，我们讲解下它的工作原理：

1.  当Producer启动的时候，会向Consul发送一个post请求，并向Consul传输自己的IP和Port。
2.  Consul 接收到Producer的注册后，每隔10s（默认）会向Producer发送一个健康检查的请求，检验Producer是否健康。
3.  当Consumer以Http的方式向Producer发起请求，会先从Consul中拿到一个存储服务IP和Port的临时表，从表中拿到Producer的IP和Port后再发送请求。
4.  该临时表每隔10s会更新，只包含有通过了健康检查的Producer。

# 对比

我们来对比下当前服务注册与发现的主流技术：

| 对比项 | euerka | Consul | zookeeper | etcd |
| :-- | :-- | :-- | :-- | :-- |
| 服务健康检查 | 可配支持 | 服务状态，内存，硬盘等 | \(弱\)长连接，keepalive | 连接心跳 |
| 多数据中心 | — | 支持 | — | — |
| kv 存储服务 | — | 支持 | 支持 | 支持 |
| 一致性 | — | raft | paxos | raft |
| cap | ap | ca | cp | cp |
| 使用接口\(多语言能力\) | http（sidecar） | 支持 http 和 dns | 客户端 | http/grpc |
| watch 支持 | 支持 long polling/大部分增量 | 全量/支持long polling | 支持 | 支持 long polling |
| 自身监控 | metrics | metrics | — | metrics |
| 安全 | — | acl /https | acl | https 支持（弱） |
| spring cloud 集成 | 已支持 | 已支持 | 已支持 | 已支持 |