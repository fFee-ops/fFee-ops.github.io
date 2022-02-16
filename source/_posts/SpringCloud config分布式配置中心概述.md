---
title: SpringCloud config分布式配置中心概述
date: 2020-10-24 10:10:56
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### SpringCloud config分布式配置中心概述

- [目前分布式系统面临的配置问题](#_5)
- [是什么](#_10)
- [能干嘛](#_22)

**[官网](https://cloud.spring.io/spring-cloud-static/spring-cloud-config/2.2.1.RELEASE/reference/html/)**

由于SpringCloud Config默认使用Git来存储配置文件（也有其它方式，比如支持svn和本地文件，但最推荐的还是Git，而且使用的是http/https访问的形式）

# 目前分布式系统面临的配置问题

- 微服务意味着要将单体应用中的业务拆分成一个个子服务,每个服务的粒度相对较小,因此系统中会出现大量的服务。由于每个服务都需要必要的配置信息才能运行,我们每个微服务自己带着一个 application. yml,上百个配置文件的管理是很困难的，所以一套集中式的、动态的配置管理设施是必不可少的。
- Spring cloud提供了 Config Server来解决这个问题。

# 是什么

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024095723894.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

Spring Cloud Config为微服务架构中的微服务提供集中化的**外部配置**支持,配置服务器为各个不同微服务应用的所有环境提供了—个中  
心化的外部配置

- SpringcloudConfig分为**客户端** 、**服务端**。

- **服务端也称为分布式配置中心**,它是个独立的微服务应用,用来连接配置服务器（例如GITHUB）并为客户端提供获取配置信息,加密/解密信息等访问接口。

- **客户端则**是通过指定的配置中心来管理应用资源,以及与业务相关的配置内容,并在启动的时候从配置中心获取和加载配置信息，配置服务器默认釆用Git来存储配置信息,这样就有助于对环境配置进行版本管理,并且可以通过gjt客户端工具来方便的管理和访冋配置内容

# 能干嘛

> 1、集中管理配置文件  
>   
> 2、不同环境不同配置，动态化的配置更新，分环境部署比如dev/test/prod/beta/release  
>   
> 3、运行期间动态调整配置，不再需要在每个服务部署的机器上编写配置文件，服务会向配置中心统一拉取配置自己的信息  
>   
> 4、当配置发生变动时，服务不需要重启即可感知到配置的变化并应用新的配置  
>   
> 5、将配置信息以REST接口的形式暴露\(post、curl访问刷新均可…\)