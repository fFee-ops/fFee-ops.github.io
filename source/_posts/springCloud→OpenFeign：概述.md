---
title: springCloud→OpenFeign：概述
date: 2020-10-20 13:30:53
tags: zookeeper 分布式 java
categories: SpringCloud
---

<!--more-->

### OpenFeign概述

- [是什么](#_2)
- [能干嘛](#_7)
- [Feign和OpenFeign两者区别](#FeignOpenFeign_20)

# 是什么

Feign \[feɪn\] 译文 伪装。**Feign是一个轻量级的Http封装工具对象,大大简化了Http请求**,它的使用方法是定义一个接口，然后在上面添加注解。不需要拼接URL、参数等操作。  
项目主页：<https://github.com/OpenFeign/feign>

# 能干嘛

- 集成Ribbon的负载均衡功能
- 集成了Hystrix的熔断器功能
- 支持请求压缩
- 大大简化了远程调用的代码，同时功能还增强啦
- OpenFeign以更加优雅的方式编写远程调用代码，并简化重复代码

**例子：**

![请添加图片描述](https://img-blog.csdnimg.cn/c62872e16c7945ff926d8176b3de91ad.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如上图，我们现在要实现打车用户打车下单，打车下单的时候需要匹配指定司机并更改司机状态，由之前空闲状态改成接单状态。这时候就涉及到`hailtaxi-order`服务调用`hailtaxi-driver`服务了，此时如果使用HttpClient工具，操作起来非常麻烦，我们可以使用`SpringCloud OpenFeign`实现调用。

# Feign和OpenFeign两者区别

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201020133035157.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)