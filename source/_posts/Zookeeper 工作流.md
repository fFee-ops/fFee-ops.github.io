---
title: Zookeeper 工作流
date: 2020-07-08 14:55:48
tags: 
categories: zookeeper
---

<!--more-->

### 文章目录

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708144138449.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

| 组件 | 描述 |
| --- | --- |
| 写入（write） | 写入过程由leader节点处理。leader将写入请求转发到所有znode，并等待znode的回复。如果一半的znode回复，则写入过程完成。 |
| 读取（read） | 读取由特定连接的znode在内部执行，因此不需要与集群进行交互。 |
| 复制数据库（replicated database） | 它用于在zookeeper中存储数据。每个znode都有自己的数据库，每个znode在一致性的帮助下每次都有相同的数据。 |
| Leader | Leader是负责处理写入请求的Znode。 |
| Follower | follower从客户端接收写入请求，并将它们转发到leader znode。 |
| 请求处理器（request processor） | 只存在于leader节点。它管理来自follower节点的写入请求。 |
| 原子广播（atomic broadcasts） | 负责广播从leader节点到follower节点的变化 |

---

一旦ZooKeeper集合启动，它将等待客户端连接。客户端将连接到ZooKeeper集合中的一个节点。它可以是leader或follower节点。一旦客户端被连接，节点将向特定客户端分配会话ID并向该客户端发送确认。如果客户端没有收到确认，它将尝试连接ZooKeeper集合中的另一个节点。 一旦连接到节点，客户端将以有规律的间隔向节点发送心跳，以确保连接不会丢失。

在zookeeper最好添加奇数个节点。