---
title: Sleuth+Zipkin链路追踪
date: 2021-11-27 14:44:19
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### Sleuth+Zipkin链路追踪

- - [Sleuth/Zipkin介绍](#SleuthZipkin_5)
  - [Zipkin安装](#Zipkin_23)
  - [Sleuth链路监控](#Sleuth_35)
  - [测试](#_62)

![请添加图片描述](https://img-blog.csdnimg.cn/5e7dfa09bcf942cb8175b0a15092bd00.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在微服务系统中，一个来自用户的请求，请求先达到前端A（如前端界面）然后通过远程调用，到达系统中间件B，C（负载均衡,网关等），最后达到后端服务D，E，后端经过一系列的业务逻辑计算最后将数据返回给用户，对于这样一个请求，经历了这么多个服务，怎么样将它的请求过程的数据记录下来呢？这就需要用到服务链路追踪。

## Sleuth/Zipkin介绍

**Zipkin：**

​ 是一个开放源代码**分布式的跟踪系统**，它可以帮助收集服务的时间数据，以解决微服务架构中的延迟问题，包括**数据的收集、存储、查找和展现**。每个服务向zipkin报告计时数据，zipkin会根据调用关系通过Zipkin UI生成依赖关系图，展示多少跟踪请求经过了哪些服务，该系统让开发者可通过一个web前端轻松地收集和分析数据，可非常方便的监测系统中存在的瓶颈。  
![请添加图片描述](https://img-blog.csdnimg.cn/d6d3a84c313d4f1d91d01875cb13d4df.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**Spring Cloud Sleuth：**

为服务之间的调用提供链路追踪，通过使用Sleuth可以让我们快速定位某个服务的问题。分布式服务追踪系统包括：**数据收集、数据存储、数据展示**。通过Sleuth产生的调用链监控信息，让我们可以得知微服务之间的调用链路，但是监控信息只输出到控制台不太方便查看。

​ Sleuth和Zipkin结合，将信息发送到Zipkin，利用Zipkin的存储来存储信息，利用Zipkin UI来展示信息。

一句话来说，Sleuth用来收集数据交给Zipkin进行展示

SpringCloudSleuth有4个特点：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/080b8b1f35f648e2928a52c506cf7b20.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## Zipkin安装

1\)下载  
下载地址：<http://dl.bintray.com/openzipkin/maven/io/zipkin/java/zipkin-server/>【现在好像被禁了。。。。我把jar上传到百度云了】  
![请添加图片描述](https://img-blog.csdnimg.cn/09df9dd6125045f48cd0d406a776b5ba.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

下载后的文件是一个可运行的jar：`zipkin-server-2.12.9-exec.jar`

2\)运行  
运行`zipkin-server-2.12.9-exec.jar`  
`java \-jar zipkin-server-2.12.9-exec.jar`回车即可运行，并访问`http://localhost:9411/zipkin/`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/33357071c29b4ea29ad51338c592588e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7b7d0d5342b94918836a79a7a32776ae.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## Sleuth链路监控

每个需要被进行监控的服务都要引入依赖和进行配置，这里为了方便只记录了订单服务这一个服务

1\)引入依赖  
引入`zipkin`，它自身已经依赖了`sleuth`,在`hailtaxi-order`中引入依赖包如下：

```xml
<!--zipkin-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-zipkin</artifactId>
    <version>2.2.2.RELEASE</version>
</dependency>
```

依赖关系如下图：  
![请添加图片描述](https://img-blog.csdnimg.cn/71e2afda0bdf4e26b0c7008a9a2c152d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
2\)配置服务地址  
修改`hailtaxi-order`的配置文件`applicatin.yml`添加如下配置：

```yml
spring:
  zipkin:
    #zipkin服务地址
    base-url: http://localhost:9411
  sleuth:
    sampler:
      probability: 1  #采样值，0~1之间，1表示全部信息都手机，值越大，效率越低
```

## 测试

我们执行一次下单调用`http://localhost:18082/order/add`，再看zipkin控制台：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9241ccbfd8a94399bc5e531224890f3b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们刚才调用的链路如下图：  
![请添加图片描述](https://img-blog.csdnimg.cn/16923eb3ba724a5ab4b8c6c2fca8f280.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
调用链路如下分析：

> 1:调用了hailtaxi-order的POST->order\(\)方法，该方法耗时333毫秒。  
> 2:该方法调用了hailtaxi-driver的put /driver/status/\{id\}/\{status\}方法，耗时11毫秒。

分布式服务追踪系统包括：数据收集、数据存储、数据展示

通过Sleuth产生的调用链监控信息，让我们可以得知微服务之间的调用链路，但是监控信息只输出到控制台不太方便查看

Sleuth和Zipkin结合，将信息发送到Zipkin，利用Zipkin的存储来存储信息，利用Zipkin UI来展示信息