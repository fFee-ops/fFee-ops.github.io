---
title: SpringCloud Sleuth分布式请求链路追踪
date: 2020-10-25 09:31:46
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### SpringCloud Sleuth分布式请求链路追踪概述

- [概述](#_2)
- - [为什么会出现这个技术？需要解决哪些问题？](#_3)
  - [是什么](#_6)
- [搭建链路监控步骤](#_10)
- [测试](#_93)

# 概述

## 为什么会出现这个技术？需要解决哪些问题？

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024225144364.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 是什么

1、Spring Cloud Sleuth提供了一套完整的服务跟踪的解决方案  
2、在分布式系统中提供追踪解决方案并且兼容支持了zipkin

# 搭建链路监控步骤

**1.zipkin**  
SpringCloud从F版起已不需要自己构建Zipkin server了，只需要调用jar包即可

①下载zipkin-server-2.12.9.exec.jar  
②运行jar  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024225344304.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
③运行控制台：http://localhost:9411/zipkin/

> **术语：**  
> 完整的调用链路  
> ![](https://img-blog.csdnimg.cn/20201024225500249.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
> Trace:类似于树结构的Span集合，表示一条调用链路，存在唯一标识  
> span:表示调用链路来源，通俗的理解span就是一次请求信息

---

**2.服务提供者**  
①改造cloud-provider-payment8001  
②pom

```xml
<!--包含了sleuth+zipkin-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zipkin</artifactId>
        </dependency>
```

③yml

```yml
spring:
  application:
    name: cloud-payment-service
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
    probability: 1
```

③业务类PaymentController

```java
@GetMapping("/payment/zipkin")
    public String paymentZipkin()
    {
        return "hi ,i'am paymentzipkin server fall back，welcome to atguigu，O(∩_∩)O哈哈~";
    }

```

**3.服务消费者（调用方）**  
①改造cloud-consumer-order80  
②pom

```xml
 <!--包含了sleuth+zipkin-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zipkin</artifactId>
        </dependency>
```

③yml

```yml
spring:
    application:
        name: cloud-order-service
    zipkin:
      base-url: http://localhost:9411
    sleuth:
      sampler:
        probability: 1
```

③业务类PaymentController

```java
 // ====================> zipkin+sleuth
    @GetMapping("/consumer/payment/zipkin")
    public String paymentZipkin()
    {
        String result = restTemplate.getForObject("http://localhost:8001"+"/payment/zipkin/", String.class);
        return result;
    } 
```

# 测试

1、依次启动eureka7001/8001/80  
2、80调用8001几次测试下  
3、打开浏览器访问:http:localhost:9411  
4、会出现以下界面  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024230019885.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)