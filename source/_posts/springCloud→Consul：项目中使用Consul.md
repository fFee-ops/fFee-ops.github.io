---
title: springCloud→Consul：项目中使用Consul
date: 2020-10-19 09:04:08
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### 项目中使用Consul

- [实例](#_4)
- - [1\)添加依赖](#1_8)
  - [2\)添加\`\@EnableDiscoveryClient\`注解](#2EnableDiscoveryClient_25)
  - [3\)配置Consul服务信息](#3Consul_28)
  - [4\)验证](#4_31)

项目中要想使用Consul作为服务注册中心，只需要引入如下依赖包，在启动类上添加`@EnableDiscoveryClient`注解，并在application.yml中添加Consul服务地址即可：

# 实例

**项目结构图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/04b0dfc0676341cea186c6b63fb4f96a.png)

## 1\)添加依赖

在项目`hailtaxi-gateway`添加依赖包：

```xml
<!--consul-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-consul-discovery</artifactId>
    <version>2.2.1.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
    <version>2.2.10.RELEASE</version>
</dependency>
```

## 2\)添加`@EnableDiscoveryClient`注解

在`hailtaxi-gateway`启动类`GatewayApplication`上添加`@EnableDiscoveryClient`注解：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f87141d3ad064d2c91b33f29b3dc6027.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3\)配置Consul服务信息

在`application.yml`中添加Consul服务信息：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7a38c2115c9943bc9296ed981845515d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4\)验证

此时启动对应项目，并提前启动consul。可以看到gateway已经注册进来了

![在这里插入图片描述](https://img-blog.csdnimg.cn/d5ff95c269e24d9c9b328b9f330c3a14.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)