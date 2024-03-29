---
title: kafka简介
date: 2022-02-04 12:15:26
tags:
password:
categories: kafka
---

# 1. 	应用场景
## 1.1 kafka场景
Kafka最初是由LinkedIn公司采用Scala语言开发，基于ZooKeeper，现在已经捐献给了Apache基金会。目前Kafka已经定位为一个分布式流式处理平台，它以 高吞吐、可持久化、可水平扩展、支持流处理等多种特性而被广泛应用。

Apache Kafka能够支撑海量数据的数据传递。在离线和实时的消息处理业务系统中，Kafka都有广泛的应用。

（1）日志收集：收集各种服务的log，通过kafka以统一接口服务的方式开放 给各种consumer，例如Hadoop、Hbase、Solr等；

（2）消息系统：解耦和生产者和消费者、缓存消息等；

（3）用户活动跟踪：Kafka经常被用来记录web用户或者app用户的各种活动，如浏览网页、搜索、点击等活动，这些活动信息被各个服务器发布到kafka的topic中，然后订阅者通过订阅这些topic来做实时的监控分析，或者装载到Hadoop、数据仓库中做离线分析和挖掘；

（4）运营指标：Kafka也经常用来记录运营监控数据。包括收集各种分布式应用的数据，生产各种操作的集中反馈，比如报警和报告；

（5）流式处理：比如spark streaming和storm；


## 1.2 kafka特性
kafka以高吞吐量著称，主要有以下特性：
（1）高吞吐量、低延迟：kafka每秒可以处理几十万条消息，它的延迟最低只有几毫秒；

（2）可扩展性：kafka集群支持热扩展；

（3）持久性、可靠性：消息被持久化到本地磁盘，并且支持数据备份防止数据丢失；

（4）容错性：允许集群中节点失败（若副本数量为n,则允许n-1个节点失败）；

（5）高并发：支持数千个客户端同时读写；

## 1.3 消息对比
- 如果普通的业务消息解耦，消息传输，rabbitMq是首选，它足够简单，管理方便，性能够用。
- 如果在上述，日志、消息收集、访问记录等高吞吐，实时性场景下，推荐kafka，它基于分布式，扩容便捷
- 如果很重的业务，要做到极高的可靠性，考虑rocketMq，但是它太重。需要你有足够的了解
## 1.4 大厂应用
1.4 大厂应用
京东通过kafka搭建数据平台，用于用户购买、浏览等行为的分析。成功抗住6.18的流量洪峰
阿里借鉴kafka的理念，推出自己的rocketmq。在设计上参考了kafka的架构体系