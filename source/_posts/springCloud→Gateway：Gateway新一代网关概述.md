---
title: springCloud→Gateway：Gateway新一代网关概述
date: 2020-10-22 10:06:10
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### Gateway新一代网关概述

- [官网](#_2)
- [gateway是什么](#gateway_6)
- - [概述](#_10)
  - [源码架构](#_21)
- [gateway能干嘛](#gateway_25)
- [微服务架构中网关的位置](#_34)
- [有了Zuul了怎么又出来了gateway](#Zuulgateway_38)
- - [为什么选择Gatway](#Gatway_40)
  - [Zuul1.x模型](#Zuul1x_66)
  - [GateWay模型](#GateWay_71)

# 官网

[上一代zuul 1.X](https://github.com/Netflix/zuul/wiki)  
[当前gateway](https://cloud.spring.io/spring-cloud-static/spring-cloud-gateway/2.2.1.RELEASE/reference/html/)

# gateway是什么

Cloud全家桶中有个很重要的组件就是网关,在1.x版本中都是采用的zuu网关;  
但在2x版本中,zu的升级一直跳票, Spring Cloud最后自己研发了一个网关替代zuul那就是 Spring Cloud Gateway，一句话: **gateway是原zuu1.×版的替代**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201022094646680.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 概述

- Gateway是在 Spring生态系统之上构建的API网关服务,基于 Spring5, Spring Boot2和 Project Reactor等技术。  
  Gateway旨在提供种简单而有效的方式来对API进行路由,以及提供些强大的过滤器功能,例如:熔断、限流、重试等

- Spring Cloud Gateway作为 Spring Cloud生态系统中的网关,目标是替代zuul,在 Spring Cloud2.0以上版本中,没有对新版本的zu2.0以上最新高性能版本进行集成,仍然还是使用的zuul1.×非 Reactor模式的老版本。而为了提升网关的性能, Spring Cloud Gateway是基于 Web flux框架实现的,而 Webflux框架底层则使用了**高性能的 Reactor模式通信框架Neety**

- Spring Cloud Gateway的目标：提供统一的路由方式且基于 Filter链的方式提供了网关基本的功能,例如:安全,监控/指标,和限流。

一句话：**Spring Cloud Gateway 使用的Webflux中的reactor-netty响应式编程组件，底层使用了Netty通讯框架**

## 源码架构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201022095150745.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# gateway能干嘛

1、反向代理  
2、鉴权  
3、流量控制  
4、熔断  
5、日志监控  
6、。。。。。。

# 微服务架构中网关的位置

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201022095305289.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 有了Zuul了怎么又出来了gateway

## 为什么选择Gatway

1.neflix不太靠谱，zuul2.0一直跳票,迟迟不发布

> 一方面因为zul1.0已经进入了维护阶段,而且 Gateway是 Spring Cloud团队研发的,是亲儿子产品,值得信赖。  
> 而且很多功能zuu都没有，用起来也非常的简单便捷。  
> Gateway是基于**异步非阻塞模型**上迸行开发的,性能方面不需要担心。虽然 Netflix早就发布了最新的zul2.x,  
> 但 Spring Cloud貌似没有整合计划。而目 Netflix相关组件都宣布进入维护期;不知前景如何\?  
> 多方面综合考虑 Gateway是很理想的网关选择。

2.SpringCloud Gateway具有如下特性

> SpringCloud Gateway具有如下特性:  
> **基于 Spring Framework5, Project Relacto和 Spring Boot2.0进行构建;**  
> 动态路由:能够匹配任何请求属性;  
> 可以对路由指定 Predicate\(断言\)和 Filter\(过滤器\)  
> 集成 Hystrix的断路器功能;  
> 集成 Spring cloud服务发现功能;  
> 易于编写的 Predicate\(断言\)和 Filter\(过滤器\)  
> 请求限流功能;  
> 支持路径重写。

3.SpringCloud Gateway与Zuul的区别

> **Spring Cloud Gateway与Zuul的区别**  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201022095710961.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## Zuul1.x模型

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201022095934441.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201022100007481.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## GateWay模型

传统的Web框架，比如说：struts2，springmvc等都是基于Servlet API与Servlet容器之上运行的。 但是在Servlet3.1之后有了异步非阻塞的支持。而WebFlux是一个典型的非阻塞异步框架，它的核心是基于Reactor的相关API实现的。相对于传统的web框架来说，它可以运行在诸如Netty，Undertow及支持Servlet3.1的容器上。非阻塞+函数式编程（Spring5必须使用java8）。

Spring WebFlux是Spring 5.0引入的新的响应式框架，区别于SpringMVC，它不需要依赖Servlet API，它是完全异步非阻塞的，并且基于Reactor来实现响应式流规范。