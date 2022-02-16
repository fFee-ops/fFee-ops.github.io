---
title: springCloud→Stream：消息驱动概述
date: 2020-10-24 22:10:08
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### SpringCloud Stream消息驱动概述

- [是什么](#_3)
- [工作流程](#_15)
- [编码API和常用注解](#API_35)

# 是什么

**用一句话来说：屏蔽底层消息中间件的差异，统一消息的编程模型**  
![请添加图片描述](https://img-blog.csdnimg.cn/99f4e024021c442fa021a5910e625685.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
通过Stream可以很好的屏蔽各个中间件的API差异，它统一了API，生产者通过OUTPUT向消息中间件发送消息，此时并不需要关心消息中间件是Kafka还是RabbitMQ，不需要关注他们的API，只需要用到Stream的API，这样可以降低学习成本。消费方通过INPUT消费指定的消息，也不需要关注消息中间件的API，架构图如上图：  
我们对上图中的对象进行说明：

> Application Core:生产者/消费者  
> inputs:消费者  
> outputs:生产者  
> binder:绑定器，主要和消息中间件之间进行绑定操作  
> Middleware:消息中间件服务

# 工作流程

![请添加图片描述](https://img-blog.csdnimg.cn/6a0316ef7a774e20bc71f0c705016109.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

我们项目中真正用应用到Stream，只需要按照如上流程图操作即可。

```properties
生产者：
	1:使用Source绑定消息输出通道。
	2:通过MessageChannel输出消息。
	3:通过@EnableBinding开启Binder，将生产者绑定到指定MQ服务。

消费者：
	1:通过@EnableBinding绑定到指定MQ。
	2:通过Sink绑定输出数据通道。
	3:@StreamListener监听指定通道数据。
```

# 编码API和常用注解

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024221003475.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)