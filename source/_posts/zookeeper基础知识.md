---
title: zookeeper基础知识
date: 2020-07-08 14:00:56
tags: zookeeper
categories: zookeeper
---

<!--more-->

### 文章目录

- [什么是Apache ZooKeeper](#Apache_ZooKeeper_2)
- [zookeeper提供的常见服务](#zookeeper_10)
- [zk的特点](#zk_24)
- [zookeeper架构](#zookeeper_34)
- [zookeeper的数据结构](#zookeeper_45)
- [zookeeper Sessions（会话）](#zookeeper_Sessions_82)
- [Watches（监视）](#Watches_90)

# 什么是Apache ZooKeeper

Zookeeper 是一个开源的分布式的，为分布式框架提供协调服务的 Apache 项目。

Zookeeper从设计模式角度来理解：是一个基于**观察者模式**设计的分布式服务管理框架，它负责**存储和管理**大家都关心的数据，然 后接受观察者的注 册，一旦这些数据的状态发生变化，Zookeeper就 将负责通知已经在Zookeeper上注册的那些观察者做出相应的反应。有点类似于Nacos

通过将分布式应用配置为在更多系统上运行，可以进一步减少完成任务的时间。分布式应用正在运行的一组系统称为 **集群**，而在集群中运行的每台机器被称为 **节点**。

# zookeeper提供的常见服务

- **命名服务** \- 按名称标识集群中的节点。它类似于DNS，但仅对于节点。

- **配置管理** \- 加入节点的最近的和最新的系统配置信息。

- **集群管理** \- 实时地在集群和节点状态中加入/离开节点。

- **选举算法** \- 选举一个节点作为协调目的的leader。

- **锁定和同步服务** \- 在修改数据的同时锁定数据。此机制可帮助你在连接其他分布式应用程序（如Apache HBase）时进行自动故障恢复。

- **高度可靠的数据注册表** \- 即使在一个或几个节点关闭时也可以获得数据。

# zk的特点

![在这里插入图片描述](https://img-blog.csdnimg.cn/8df33a3880c9493781ceb2395c63471e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

1）Zookeeper：一个领导者（Leader），多个跟随者（Follower）组成的集群。  
2）集群中只要有半数以上节点存活，Zookeeper集群就能正常服务。所 以Zookeeper适合安装奇数台服务器。  
3）全局数据一致：每个Server保存一份相同的数据副本，Client无论连接到哪个Server，数据都是一致的。  
4）更新请求顺序执行，来自同一个Client的更新请求按其发送顺序依次执行。  
5）数据更新原子性，一次数据更新要么成功，要么失败。  
6）实时性，在一定时间范围内，Client能读到最新数据。

# zookeeper架构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708134445252.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
架构说明：

| 部分 | 描述 |
| --- | --- |
| Client（客户端） | 客户端：分布式应用集群中的一个节点，从服务器访问信息。对于特定的时间间隔，每个客户端向服务器发送消息以使服务器知道客户端是活跃的 \<**心跳**\>。类似地，当客户端连接时，服务器发送确认码。如果连接的服务器没有响应，客户端会自动将消息重定向到另一个服务器。 |
| Server（服务器 | 服务器，ooKeeper总体中的一个节点，为客户端提供所有的服务。向客户端发送确认码以告知服务器是活跃的。 |
| Ensemble | ZooKeeper服务器组。形成ensemble所需的最小节点数为3。 |
| Leader | 服务器节点，如果任何连接的节点失败，则执行自动恢复。Leader在服务启动时被选举。 |
| Follower | 跟随leader指令的服务器节点。 |

# zookeeper的数据结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020070813532463.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
上图描述了用于内存表示的ZooKeeper文件系统的树结构。  
ZooKeeper节点称为 **znode** 。每个znode由一个名称标识，并用路径\(/\)序列分隔。

- 有一个由“/”分隔的znode。在根目录下，有两个逻辑命名空间 config 和 workers 。
- config 命名空间用于集中式配置管理，workers 命名空间用于命名。
- **在 config 命名空间下，每个znode最多可存储1MB的数据**。这种结构的主要目的是存储同步数据并描述znode的元数据。此结构称为ZooKeeper数据模型。

---

ZooKeeper数据模型中的每个znode都维护着一个 **stat** 结构。一个stat仅提供一个znode的元数据。它由版本号，操作控制列表\(ACL\)，时间戳和数据长度组成。

- **版本号** \- 每个znode都有版本号，这意味着每当与znode相关联的数据发生变化时，其对应的版本号也会增加。当多个zookeeper客户端尝试在同一znode上执行操作时，版本号的使用就很重要。

- **操作控制列表\(ACL\)** \- ACL基本上是访问znode的认证机制。它管理所有znode读取和写入操作。

- **时间戳** \- 时间戳表示创建和修改znode所经过的时间。它通常以毫秒为单位。ZooKeeper从“事务ID"\(zxid\)标识znode的每个更改。Zxid 是唯一的，并且为每个事务保留时间，以便你可以轻松地确定从一个请求到另一个请求所经过的时间。

- **数据长度** \- 存储在znode中的数据总量是数据长度。最多可以存储1MB的数据。

---

**Znode的类型**  
Znode被分为持久（persistent）节点，顺序（sequential）节点和临时（ephemeral）节点。

- **持久节点** \- 即使在创建该特定znode的客户端断开连接后，持久节点仍然存在。默认情况下，除非另有说明，否则所有znode都是持久的。

- **临时节点** \- 客户端活跃时，临时节点就是有效的。当客户端与ZooKeeper集合断开连接时，临时节点会自动删除。因此，只有临时节点不允许有子节点。如果临时节点被删除，则下一个合适的节点将填充其位置。

- **顺序节点** \- 顺序节点可以是持久的或临时的。当一个新的znode被创建为一个顺序节点时，ZooKeeper通过将1**0位的序列号**附加到原始名称来设置znode的路径。  
  例如，如果将具有路径 /myapp 的znode创建为顺序节点，则ZooKeeper会将路径更改为 /myapp0000000001 ，并将下一个序列号设置为0000000002。如果两个顺序节点是同时创建的，那么ZooKeeper不会对每个znode使用相同的数字。顺序节点在锁定和同步中起重要作用。

# zookeeper Sessions（会话）

会话对于ZooKeeper的操作非常重要。会话中的请求按FIFO\(先进先出算法\)顺序执行。一旦客户端连接到服务器，将建立会话并向客户端分配会话ID 。

客户端以特定的时间间隔发送心跳以保持会话有效。如果ZooKeeper集合在超过服务器开启时指定的期间（会话超时）都没有从客户端接收到心跳，则它会判定客户端死机。

会话超时通常以毫秒为单位。当会话由于任何原因结束时，在该会话期间创建的临时节点也会被删除。

# Watches（监视）

监视是一种简单的机制，使客户端收到关于ZooKeeper集合中的更改的通知。客户端可以在读取特定znode时设置Watches。Watches会向注册的客户端发送任何znode（客户端注册表）更改的通知。

Znode更改是与znode相关的数据的修改或znode的子项中的更改。只触发一次watches。如果客户端想要再次通知，则必须通过另一个读取操作来完成。当连接会话过期时，客户端将与服务器断开连接，相关的watches也将被删除。