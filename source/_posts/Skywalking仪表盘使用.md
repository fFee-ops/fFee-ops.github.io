---
title: Skywalking仪表盘使用
date: 2021-12-02 16:17:01
tags: zk zookeeper 分布式
categories: Skywalking
---

<!--more-->

### Skywalking仪表盘使用

- [1 Rocketbot-仪表盘](#1_Rocketbot_2)
- - [1.1 APM](#11_APM_9)
  - - [1.1.1 Global全局维度](#111_Global_12)
    - [1.1.2 Service服务维度](#112_Service_17)
    - [1.1.3 Instance实例维度](#113_Instance_26)
    - [1.1.4 Endpoint端点（API）维度](#114_EndpointAPI_33)
  - [1.2 DataSource展示栏](#12_DataSource_38)
  - [1.3、1.4、1.5：Istio、SelfObservability、Web Browser](#131415IstioSelfObservabilityWeb_Browser_43)
- [2 拓扑图](#2__47)
- [3 追踪](#3__50)
- [4 性能剖析](#4__56)
- [5 告警](#5__62)

# 1 Rocketbot-仪表盘

作用：查看被监控服务的运行状态。  
**监控面板：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e4ed2173d673402bb2757166e75ae124.png)

## 1.1 APM

**APM：** 应用性能管理，通过各种探针采集数据，收集关键指标，同时搭配数据呈现以实现对应用程序性能管理和故障管理的系统化解决方案。

### 1.1.1 Global全局维度

![在这里插入图片描述](https://img-blog.csdnimg.cn/d82a984ecad941f18cbf4170c2cff806.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
板块描述：  
![>](https://img-blog.csdnimg.cn/4d156ea39b6447e8a5141daaae173c2c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.1.2 Service服务维度

![在这里插入图片描述](https://img-blog.csdnimg.cn/95a20914697b4c59a0bce7ade3801a3a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

属性描述：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6e0e52ba5b72469b8dc0de82240555f0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.1.3 Instance实例维度

![在这里插入图片描述](https://img-blog.csdnimg.cn/59c6f2e1d85f4fb5954cd6370c9c9658.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

属性描述：

![在这里插入图片描述](https://img-blog.csdnimg.cn/91250ba1fd4540b3a24049598668695a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.1.4 Endpoint端点（API）维度

![在这里插入图片描述](https://img-blog.csdnimg.cn/b7e8976f11a147f48551f8c9a64c3124.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
属性描述:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8e2c8b56e2e14db18e070b0607ff47f2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2 DataSource展示栏

![在这里插入图片描述](https://img-blog.csdnimg.cn/84a803a9632a40b4b0af7e8463c65f40.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
属性描述:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/23466a12b7b549d988134e3ecc4bd57b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.3、1.4、1.5：Istio、SelfObservability、Web Browser

这三个不是重点，大概了解一下就可以  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ba48b22108a74aa0bd6a752fb2f7f074.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2 拓扑图

![在这里插入图片描述](https://img-blog.csdnimg.cn/2843814f4a934c43b183bf387b87d014.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3 追踪

![在这里插入图片描述](https://img-blog.csdnimg.cn/a37f3bd65f7441ae8d43b30899029bd3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
属性描述:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ba515ac943d34bd281f32dab7ce7636a.png)  
操作详情：可以看到底层执行语句  
![在这里插入图片描述](https://img-blog.csdnimg.cn/db574498685d49bf8199ddcfa3091cd7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 4 性能剖析

![在这里插入图片描述](https://img-blog.csdnimg.cn/b664a1ee238b4ec9a1254a66f7e95b27.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
创建性能剖析采集清单:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6bb73ed7ad614df6bf80989e283db92f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
新建性能剖析属性描述:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6d4a116af1b4401c8972b3876369ce87.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 5 告警

![在这里插入图片描述](https://img-blog.csdnimg.cn/82e96d4ae13c45b8a0c930310b47baa6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
不同维度告警列表，可分为服务、端点和实例。日志收集只在8.4以上版本支持。