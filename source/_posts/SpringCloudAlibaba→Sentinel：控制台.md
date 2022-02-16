---
title: SpringCloudAlibaba→Sentinel：控制台
date: 2021-12-23 20:56:31
tags: java 分布式 spring boot
categories: SpringCloudAlibaba
---

<!--more-->

### Sentinel控制台的使用与安装

- [1、Sentinel控制台安装](#1Sentinel_3)
- [2、接入控制台](#2_14)
- [3、可视化管理](#3_40)
- - [3.1 实时监控](#31__41)
  - [3.2 流控规则](#32__48)
  - [3.3 降级规则](#33__59)
  - [3.4 热点数据](#34__64)

  
之前记录的都是sentinel在程序中的操作，在生产环境中不是特别方便，所以这里来记录一下sentinel控制台的使用，可以理解为一个可视化界面。

# 1、Sentinel控制台安装

Sentinel 控制台包含如下功能:

- 查看机器列表以及健康情况：收集 Sentinel 客户端发送的心跳包，用于判断机器是否在线。
- 监控 \(单机和集群聚合\)：通过 Sentinel 客户端暴露的监控 API，定期拉取并且聚合应用监控信息，最终可以实现秒级的实时监控。
- 规则管理和推送：统一管理推送规则。
- 鉴权：生产环境中鉴权非常重要。这里每个开发者需要根据自己的实际情况进行定制。

①我们去它的官网<https://github.com/alibaba/Sentinel/releases>先下载对应的jar包。（注意要保持版本一致。本次我是使用的`v1.8.2`）

②使用`java \-jar`命令运行即可。（默认登录账号密码都是`sentinel`）。如果要修改启动端口啥的，就用`-D`命令来指定就行。

# 2、接入控制台

假设 让`driver`服务来接入控制台。

①`driver`服务需要引入:

```xml
        <!--sentinel-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
            <version>2.2.5.RELEASE</version>
        </dependency>
```

②在核心配置文件中配置Sentinel服务地址  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c64065b122524dc881acc4c4748e8cf0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

> 这里的 `spring.cloud.sentinel.transport.port` 端口配置会在应用对应的机器上启动一个 HttpServer，该 Server 会与 Sentinel 控制台做交互，比如限流规则拉取。

③此时我们出发一些请求操作，再看Sentinel控制台会多一个服务监控：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/16f7af174125474db4d43599d179aba9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

④刚启动微服务 控制台是看不到东西的，必须要先访问一个请求。因为sentinel用的是懒加载

# 3、可视化管理

## 3.1 实时监控

同一个服务下的所有机器的簇点信息会被汇总，并且秒级地展示在"实时监控"下。

注意: 实时监控仅存储 5 分钟以内的数据，如果需要持久化，需要通过调用[实时监控接口](https://github.com/alibaba/Sentinel/wiki/%E5%AE%9E%E6%97%B6%E7%9B%91%E6%8E%A7)来定制。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c0be0b337e064101a518207081461bcc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如果要获取监控数据，直接调用 `http://localhost:8719/clusterNode` 即可获取，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/41c45b3cce124ceda5f2cd215d0d8486.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.2 流控规则

我们可以在【流控规则】页面中新增，点击【流控规则】进入页面新增页面，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bb78452912fa41fbaab84ec017e87b88.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
资源名：其实可以和请求路径保持一致，这里的流控模式为QPS，触发流控执行阈值为1，流控模式为让当前请求的资源快速失败。

我们测试效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bd55f5ffc4904ab6b58f74eceeba6f5e.png)  
这里的参数和我们程序中的参数其实是一样的，如下说明：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/057613f8c8a64de8b872d8159a8ec9df.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
流控效果和程序中也是一样的：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/45031796712248fb9d6e601a4e5ba707.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.3 降级规则

我们可以选择 `降级规则>新增降级规则` ，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/925a13300548462db1f36910c0d51b2d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
降级规则的熔断策略有3种，分别是慢调用比例、异常比例、异常数，和程序中是一样的。

## 3.4 热点数据

热点即经常访问的数据。很多时候我们希望统计某个热点数据中访问频次最高的 Top K 数据，并对其访问进行限制。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/965011057fb143efad7d5e5da9e16b4f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)