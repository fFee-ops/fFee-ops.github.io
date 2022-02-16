---
title: springCloud→OpenFeign：使用步骤
date: 2020-10-20 13:49:21
tags: zookeeper 分布式 java
categories: SpringCloud
---

<!--more-->

### OpenFeign使用步骤

- - [1\)导入依赖](#1_12)
  - [2\)创建Feign客户端接口](#2Feign_22)
  - [3\)Controller调用](#3Controller_39)
  - [4\)启用OpenFeign](#4OpenFeign_46)
  - [5\)测试](#5_51)

使用OpenFeign实现服务之间调用，可以按照如下步骤实现：

> 1:导入feign依赖  
> 2:编写Feign客户端接口：将请求地址写到该接口上\(**在接口处编写**\)  
> 3:消费者启动引导类开启Feign功能注解  
> 4:访问接口测试  
> **注意：Feign自带负载均衡配置项**

项目结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/70a2c7d15cdf45dfb05e2e6a11c8130d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_11,color_FFFFFF,t_70,g_se,x_16)  
**本次测试背景为`hailtaxi-order`服务调用`hailtaxi-driver`服务，即打车下单后更改司机状态。**

## 1\)导入依赖

在`hailtaxi-api`中导入如下依赖：

```xml
<!--配置feign-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
    <version>2.2.1.RELEASE</version>
</dependency>
```

## 2\)创建Feign客户端接口

![在这里插入图片描述](https://img-blog.csdnimg.cn/1457b2f902cc4367a104500488f595d2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_12,color_FFFFFF,t_70,g_se,x_16)

修改`hailtaxi-api`创建`com.itheima.driver.feign.DriverFeign`接口，代码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/7f2a1251c08e463991321bb0e0dfe4a5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

> **需要注意的点：**
> 
> 1.  FeignClient的value写的是这个接口的方法具体实现类所在的服务名
> 2.  我们写接口的方法的时候直接把实现类处的方法拷贝过来，删除方法体就行

> **参数说明：**
> 
> 1.  Feign会通过动态代理，帮我们生成实现类。
> 2.  注解\@FeignClient声明Feign的客户端，注解的值：value指明服务名称
> 3.  接口定义的方法，采用SpringMVC的注解。Feign会根据注解帮我们生成URL地址
> 4.  注解\@RequestMapping中的/driver，不要忘记。因为Feign需要拼接可访问地址

## 3\)Controller调用

![在这里插入图片描述](https://img-blog.csdnimg.cn/c247e7e4735241adadf1e5383fabe5c4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_13,color_FFFFFF,t_70,g_se,x_16)

修改`hailtaix-order`的下单方法，在下单方法中调用`DriverFeign`修改司机状态，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3b08cb9561a74cd6a977a142e13cd501.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4\)启用OpenFeign

上面所有业务逻辑写完了，但OpenFeign还并未生效，我们需要在`hailtaxi-order`中开启`OpenFeign`，只需要在`OrderApplication`启动类上添加`@EnableFeignClients(basePackages = "com.itheima.driver.feign")`即可。

![在这里插入图片描述](https://img-blog.csdnimg.cn/46948e4085bc4707b1b3f3dd98423ea5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 5\)测试

现在是下单在order服务，改变司机状态在driver服务。  
即我访问order方法，要在order方法中用openFeign去调用driver服务的改变状态的方法。

我们打开postman访问  
![在这里插入图片描述](https://img-blog.csdnimg.cn/27bab77888094b53a7a529dab4a9460a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

后台输出如下：

> 司机状态变更：Driver\(id=1, name=张司机, star=5.0, car=null, status=2\)