---
title: springCloud→Stream：源码剖析
date: 2021-11-28 23:44:21
tags: zookeeper 分布式 云原生
categories: SpringCloud
---

<!--more-->

### SpringCloud Stream源码剖析

- [1.1 \@EnableBinding注解解析](#11_EnableBinding_6)
- [1.2 Channel信道创建](#12_Channel_9)
- [1.3 消息发送](#13__14)
- [1.4 消息监听](#14__19)

前面我们已经学过，Spring Cloud Stream 是一个消息驱动微服务的框架。应用程序通过 **inputs** 或者 **outputs** 来与 Spring Cloud Stream 中**binder** 交互，通过我们配置来 binding ，而 Spring Cloud Stream 的 binder 负责与消息中间件交互。所以，我们只需要搞清楚如何与 Spring Cloud Stream 交互就可以方便使用消息驱动的方式。

为了更深层次的学习SpringCloud Stream，我们展开对它的源码学习。

# 1.1 \@EnableBinding注解解析

在Stream中，要想实现发消息，首先得注册绑定通信管道，注册绑定通信管道我们需要用到`BindingBeansRegistrar`类，例如我们写了`@EnableBinding(Source.class)`，此时该类就会解析这个注解，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2a68d6836e8d4e93bee43b8fe884ffa5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.2 Channel信道创建

上面调用的实例化通信管道并注册通信管道对象的方法是`registerBindingTargetBeanDefinitions()`，源码如下  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4bdc62632adc4637bc969e73147f7e1c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时运行时，我们可以发现消息发送绑定对象是`DirectWithAttributesChannel`。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6e675688cd4f42adafb130391918b41d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.3 消息发送

消息发送比较抽象，需要根据引入不同MQ中间件依赖包决定，但主题流程保持一致，其中消息检查和消息发送会和引入的包不同有差异，发送消息前会适配不同MQ的Binder，如果是RabbitMQ，Binder是`RabbitMessageChannelBinder`，消息发送的源码在`AbstractMessageChannel#send()`如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ddc0ca9b2dac44ec916182d0049e7955.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在执行消息发送的时候，获取消息发送对象前，会获取Binder，如果我们用的是RabbitMQ，此时通信信道是RabbitMQ的Binder,源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/54368c85ff9542e2bfecbe40899fa7f2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.4 消息监听

消息的监听在`StreamListenerAnnotationBeanPostProcessor`类中注册，每次监听到消息后，会调用mappedListenerMethods中指定队列的方法，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1712f8cb6c1b4c79b4748a45d00bbdcf.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们调试后，可以发现此时会注册对应的监听方法，测试效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/67b723a727e142229ef8cb121ebdcb0a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)