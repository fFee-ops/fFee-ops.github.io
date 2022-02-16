---
title: springCloud→Stream： 消息分组
date: 2020-10-25 09:32:02
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### SpringCloud Stream消息分组

- [集群消费下的分组](#_4)
- - [1\)分组的意义](#1_5)
  - [2\)分组实战](#2_11)
  - [3\)测试](#3_19)
  - [数据持久化](#_27)

消息分组有2个好处，分别是集群**合理消费**、**数据持久化**。

# 集群消费下的分组

## 1\)分组的意义

分组在项目中是有非常重大的意义，通常应用于消息并发高、消息堆积的场景，这些场景服务消费方通常会做集群操作，一旦做集群操作，我们又需要项目中的消费者合理消费，比如用户打车支付完成后，我们需要增加用户积分同时修改订单状态，如果集群环境中有2台服务器都执行该消费操作，此时用户积分会增加两次，就会造成非幂等问题。  
![请添加图片描述](https://img-blog.csdnimg.cn/5ee2ef1d1b92413cb27fc171639eeaa6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时集群中相同服务应该属于同一个组，同一个组中只允许有一个主节点消费某一个信息，这样就可以避免非幂等问题的出现。

## 2\)分组实战

项目结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f165ed0e1f7045c29e35a30a4597ea2c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

我们将两个order服务都运行起来。此时运行起来，`18082`和`18182`节点会同时消费所有数据。

修改`hailtaxi-order`、`hailtaxi-order1`的核心配置文件`application.yml`，添加分组：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e1729c05ad844572ad04c44d3bb17a4f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3\)测试

启动pay,order,order1三个服务，调用pay的支付方法。会给mq中发送一条消息。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1b8bf1785acc44359f2f499f7d9b666d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们来访问`http://localhost:18083/pay/wxpay/1`。

我们发现只会有一个order节点去消费数据

## 数据持久化

我们把分组去掉，停掉`hailtaxi-order`服务，然后请求`http://localhost:18083/pay/wxpay/1`发送数据，发送完数据后，再启动`hailtaxi-order`服务，此时发现没有数据可以消费，这是因为数据没有持久化，是一种广播模式。

如果需要数据持久化，得给每个消费节点**添加group组**即可。这样的话，就算发送方发送消息时候接收方不在线，再等接收方上线的时候接收方依旧能接受到消息