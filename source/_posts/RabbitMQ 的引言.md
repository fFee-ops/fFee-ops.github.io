---
title: RabbitMQ 的引言
date: 2020-10-13 10:10:52
tags: rabbitmq kafka java
categories: RabbitMQ
---

<!--more-->

### RabbitMQ 的引言

- [Mq引言](#Mq_1)
- [RabbitMQ 的引言](#RabbitMQ__24)
- - [RabbitMQ](#RabbitMQ_25)
  - [AMQP协议](#AMQP_32)
  - [RabbitMQ 的安装](#RabbitMQ__36)

# Mq引言

**1、什么是MQ？**

- MQ\(Message Queue\) : 翻译为 **消息队列**,通过典型的 生产者和消费者模型,生产者不断向消息队列中生产消息，消费者不断的从队列中获取消息。
- 因为消息的生产和消费都是**异步**的，而且只关心消息的发送和接收，没有业务逻辑的侵入,轻松的实现系统间解耦。
- 别名为 **消息中间件** 通过利用高效可靠的消息传递机制进行平台无关的数据交流，并基于数据通信来进行分布式系统的集成。

**2、MQ有哪些**  
当今市面上有很多主流的消息中间件，如老牌的ActiveMQ、RabbitMQ，炙手可热的Kafka，阿里巴巴自主开发RocketMQ等。

**3、不同MQ特点**

> **1.ActiveMQ**  
> ActiveMQ 是Apache出品，最流行的，能力强劲的开源消息总线。它是一个完全支持JMS规范的的消息中间件。丰富的API,多种集群架构模式让ActiveMQ在业界成为老牌的消息中间件,在中小型企业颇受欢迎\!  
>   
> **2.Kafka**  
> Kafka是LinkedIn开源的分布式发布-订阅消息系统，目前归属于Apache顶级项目。Kafka主要特点是基于Pull的模式来处理消息消费， 追求高吞吐量，一开始的目的就是用于日志收集和传输。0.8版本开始支持复制，不支持事务，对消息的重复、丢失、错误没有严格要求，  
> 适合产生大量数据的互联网服务的数据收集业务。  
>   
> **3.RocketMQ**  
> RocketMQ是阿里开源的消息中间件，它是纯Java开发，具有高吞吐量、高可用性、适合大规模分布式系统应用的特点。RocketMQ思路起源于Kafka，但并不是Kafka的一个Copy，它对消息的可靠传输及事务性做了优化，目前在阿里集团被广泛应用于交易、充值、流计算、消息推送、日志流式处理、binglog分发等场景。  
>   
> **4.RabbitMQ**  
> RabbitMQ是使用Erlang语言开发的开源消息队列系统，基于AMQP协议来实现。AMQP的主要特征是面向消息、队列、路由（包括点对点和发布/订阅）、可靠性、安全。AMQP协议更多用在企业系统内对数据一致性、稳定性和可靠性要求很高的场景，对性能和吞吐量的要求还在。  
> 其次,**RabbitMQ比Kafka可靠，Kafka更适合IO高吞吐的处理，一般应用在大数据日志处理或对实时性（少量延迟），可靠性（少量丢数据）要求稍低的场景使用，比如ELK日志收集。**

![在这里插入图片描述](https://img-blog.csdnimg.cn/0341c0e267a44099b90420a17d1ec323.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# RabbitMQ 的引言

## RabbitMQ

> 基于AMQP协议，erlang语言开发，是部署最广泛的开源消息中间件,是最受欢迎的开源消息中间件之一。

[官方网站](https://www.rabbitmq.com/)  
[官方教程](https://www.rabbitmq.com/#getstarted)

## AMQP协议

AMQP（advanced message queuing protocol），在2003年时被提出，最早用于解决金融领不同平台之间的消息传递交互问题。顾名思义，AMQP是一种协议，更准确的说是一种binary wire-level protocol（链接协议）。这是其和JMS的本质差别，AMQP不从API层进行限定，而是直接定义网络交换的数据格式。这使得实现了AMQP的provider天然性就是跨平台的。  
以下是AMQP协议模型:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013100028251.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## RabbitMQ 的安装

**1、下载：[官方下载地址](https://www.rabbitmq.com/download.html)**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013100147573.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**2、 下载的安装包**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013100212858.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013100356428.png#pic_center)

**3、安装步骤**

> **1.将rabbitmq安装包上传到linux系统中**  
> erlang-22.0.7-1.el7.x86\_64.rpm  
> rabbitmq-server-3.7.18-1.el7.noarch.rpm  
> socat-1.7.3.2-2.el7.x86\_64.rpm  
>   
> **2.安装Erlang、socat依赖包**  
> rpm \-ivh erlang-22.0.7-1.el7.x86\_64.rpm  
> rpm \-ivh socat-1.7.3.2-2.el7.x86\_64.rpm  
>   
> **3.安装RabbitMQ安装包\(需要联网\)**  
> yum install \-y rabbitmq-server-3.7.18-1.el7.noarch.rpm  
> **注意:** 默认安装完成后配置文件模板在:/usr/share/doc/rabbitmq-server-3.7.18/rabbitmq.config.example目录中,需要 将配置文件复制到/etc/rabbitmq/目录中,并修改名称为rabbitmq.config  
>   
> **4.复制配置文件**  
> cp /usr/share/doc/rabbitmq-server-3.7.18/rabbitmq.config.example /etc/rabbitmq/rabbitmq.config  
>   
> **5.查看配置文件位置**  
> ls /etc/rabbitmq/rabbitmq.config  
>   
> **6.修改配置文件\(参见下图:\)**  
> vim /etc/rabbitmq/rabbitmq.config  
> ![开启Web界面来宾登录模式](https://img-blog.csdnimg.cn/2020101310063557.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
>   
> **7.执行如下命令,启动rabbitmq中的插件管理**  
> rabbitmq-plugins enable rabbitmq\_management  
> 出现以下图片情况说明启动成功  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013100819645.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
> **8.启动RabbitMQ的服务**  
> systemctl start rabbitmq-server  
> systemctl restart rabbitmq-server  
> systemctl stop rabbitmq-server  
>   
>   
> **9.访问web管理界面**  
> http://192.168.80.33:15672/  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013100930151.png#pic_center)  
>   
> **10.登录管理界面**  
> username: guest  
> password: guest