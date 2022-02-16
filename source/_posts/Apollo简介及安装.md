---
title: Apollo简介及安装
date: 2022-01-10 20:13:32
tags: java spring spring boot
categories: Apollo
---

<!--more-->

### Apollo简介及安装

- [简介](#_6)
- - [核心功能](#_14)
  - [谁在用它](#_58)
- [Apollo单机部署](#Apollo_62)
- - [快速安装](#_72)
  - [Docker容器安装](#Docker_116)

![在这里插入图片描述](https://img-blog.csdnimg.cn/baad43dd056f49f48601f03cb6005895.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 简介

Apollo（阿波罗）是携程框架部门研发的**分布式配置中心**，能够集中化管理应用不同环境、不同集群的配置，配置修改后能够实时推送到应用端，并且具备规范的权限、流程治理等特性，适用于微服务配置管理场景。

服务端基于Spring Boot和Spring Cloud开发，打包后可以直接运行，不需要额外安装Tomcat等应用容器。

Java客户端不依赖任何框架，能够运行于所有Java运行时环境，同时对Spring/Spring Boot环境也有较好的支持。

## 核心功能

**①统一管理不同环境、不同集群配置：**  
1:Apollo提供了一个统一界面集中式管理不同环境（environment）、不同集群（cluster）、不同命名空间（namespace）的配置。

2:同一份代码部署在不同的集群，可以有不同的配置，比如zk的地址等

3:通过命名空间（namespace）可以很方便的支持多个不同应用共享同一份配置，同时还允许应用对共享的配置进行覆盖

4:配置界面支持多语言（中文，English）

**②热发布:**  
用户在Apollo修改完配置并发布后，客户端能实时（1秒）接收到最新的配置，并通知到应用程序。

**③版本发布管理:**  
所有的配置发布都有版本概念，从而可以方便的支持配置的回滚。

**④灰度发布:**  
支持配置的灰度发布，比如点了发布后，只对部分应用实例生效，等观察一段时间没问题后再推给所有应用实例。

**⑤权限管理、发布审核、操作审计:**  
1:应用和配置的管理都有完善的权限管理机制，对配置的管理还分为了编辑和发布两个环节，从而减少人为的错误。

2:所有的操作都有审计日志，可以方便的追踪问题。

**⑥客户端配置信息监控:**  
可以方便的看到配置在被哪些实例使用

**⑦提供Java和.Net原生客户端:**  
1:提供了Java和.Net的原生客户端，方便应用集成

2:支持Spring Placeholder，Annotation和Spring Boot的ConfigurationProperties，方便应用使用（需要Spring 3.1.1+）

3:同时提供了Http接口，非Java和.Net应用也可以方便的使用

**⑧提供开放平台API**

**⑨部署简单:**  
1:配置中心作为基础服务，可用性要求非常高，这就要求Apollo对外部依赖尽可能地少

2:目前唯一的外部依赖是MySQL，所以部署非常简单，只要安装好Java和MySQL就可以让Apollo跑起来

3:Apollo还提供了打包脚本，一键就可以生成所有需要的安装包，并且支持自定义运行时参数

## 谁在用它

国内很多大厂都在用Apollo作为分布式配置中心，如果你们的网站也在用，在<https://github.com/ctripcorp/apollo/issues/451>可以进行登记。

# Apollo单机部署

接下来实现Apollo安装，安装前我们先介绍一下单机版装的架构，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ff75aae9527e4981ad2c30467f8110f8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上图展示了Apollo单机部署架构，我们对其中每个节点进行解释说明：

1.  **Apollo Config Service**:提供配置的读取、推送等功能，服务对象是 Apollo 客户端。
2.  **Apollo Admin Service**:提供配置的修改、发布等功能，服务对象是Apollo Portal。
3.  **Apollo Portal**:Apollo 的管理界面，进行不同项目的配置（项目配置、权限配置等），服务对象是开发者和开放平台API。

Apollo安装方式有多种，官方提供了快速安装模式和Docker安装模式，我们会把两种安装模式都实现一次，但如果是生产环境请使用[分布式部署方案](https://github.com/apolloconfig/apollo/wiki/%E5%88%86%E5%B8%83%E5%BC%8F%E9%83%A8%E7%BD%B2%E6%8C%87%E5%8D%97)

## 快速安装

**1、首先安装好jdk**  
同时要配置好JAVA\_HOME  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1cf299fc61904e8caba97198f7475438.png)  
**2、安装好MySQL**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/36bc248e64334ae39cfac1352dcaa19c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_14,color_FFFFFF,t_70,g_se,x_16)

**3、安装包下载**  
Apollo已经准备好了一个Quick Start安装包 apollo-quick-start.zip ，里面包含了可以自动启动的jar包、以及所有依赖jar包、数据库脚本、内置Tomcat容器等，安装包共63M，大家只需要下载到本地，就可以直接使用，免去了编译、打包过程。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bc681590fdee405c83cd59f70bd8a769.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

Github下载地址：<https://github.com/apolloconfig/apollo-build-scripts>

Quick Start只针对本地测试使用，所以一般用户不需要自己下载源码打包，只需要下载已经打好的包即可。不过也有部分用户希望在修改代码后重新打包，那么可以参考如下步骤：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/91857b985b2640b7933d472991bb7251.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**4、创建数据库**  
Apollo服务端共需要两个数据库： ApolloPortalDB 和 ApolloConfigDB ，我们把数据库、表的创建和样例数据都分别准备了sql文件，只需要导入下载压缩包中的sql脚本到数据库即可。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/55d4f9212334449c89b8fba71be2bd61.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/647b35edd1174b8a8184d690ac392c01.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**5、配置数据库连接**  
我们的数据库地址不是固定的，Apollo服务端需要知道如何连接到你前面创建的数据库，因此需要修改数据库连接地址，在下载的安装包里有一个启动脚本 `demo.sh` ，我们修改其中的ApolloPortalDB和ApolloConfigDB相关的数据库连接串信息：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3ce267d071094a2ba63d3e196cfe9661.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

如果第一次启动失败还得修改一下`demo.sh`中的最大启动时间  
![在这里插入图片描述](https://img-blog.csdnimg.cn/82cafc0e5df84cf3b5d06e23aebba12c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**6、启动服务**  
Quick Start脚本会在本地启动3个服务，分别使用8070, 8080, 8090端口，请确保这3个端口当前没有被使用,如果端口没有被使用，我们可以直接启动程序，启动程序执行 demo.sh 脚本即可，启动过程比较慢。

但是我们一般不推荐在Windows系统上运行，所以我们只需要把解压了的Quick Start文件全拷贝到linux去，然后再运行就行。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d7cafd0d0f9c4c07aed4ae7ac59d4b14.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4e086fba015a407cac019ed2207490f3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

```shell
./demo.sh start
```

当看到如下输出后，就说明启动成功了！![在这里插入图片描述](https://img-blog.csdnimg.cn/18e842ebb4574e28ac860f6c33f367c9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

启动完成后访问<http://192.168.211.145:8070/>，可以看到Apollo配置界面，账号：apollo，密码：admin  
![在这里插入图片描述](https://img-blog.csdnimg.cn/64065ba5d47b4edba725e4248b00ae3d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## Docker容器安装

如果对Docker非常熟悉，可以使用Docker的方式快速部署Apollo，从而快速的了解Apollo。确保docker-quick-start文件夹已经在本地存在，如果本地已经clone过Apollo的代码，则可以跳过此步骤。

在docker-quick-start目录下执行 docker-compose up ，第一次执行会触发下载镜像等操作，需要耐心等待一些时间。

搜索所有 `apollo-quick-start`开头的日志，看到以下日志说明启动成功：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ece97c36fc6a48f18126ad13e9d77cd5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
不过基于Docker安装需要注意一些问题：

1.  数据库的端口映射为13306，所以如果希望在宿主机上访问数据库，可以通过localhost:13306，用户名是root，密码留空。
2.  如要查看更多服务的日志，可以通过`docker exec -it apollo-quick-start bash`登录， 然后到`/apollo-quick-start/service和/apollo-quick-start/portal`下查看日志信息。
3.  安装完成后访问http://192.168.211.145:8070/，可以看到Apollo配置界面