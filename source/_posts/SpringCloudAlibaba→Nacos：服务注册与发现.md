---
title: SpringCloudAlibaba→Nacos：服务注册与发现
date: 2020-10-26 11:21:59
tags: spring cloud spring boot spring
categories: SpringCloudAlibaba
---

<!--more-->

### Nacos服务注册与发现

- [前置工作](#_2)
- [测试](#_37)

# 前置工作

项目结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0eb0ddb230e347fa92e6afd7a34db320.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如上图，我们以打车项目为例，当用户打车成功的时候，会调用 `hailtaxi-order`，`hailtaxi-order会下订单，同时修改司机状态，修改状态需要调用 hailtaxi-driver`，我们把 `hailtaxi-order`服务和 `hailtaxi-driver`服务都注册到Nacos中，并实现服务调用，如果整个调用都没有问题，就说明服务注册发现没问题。（默认配置好了open-fegin）

关于SpringCloud Alibaba和SpringBoot的版本，我们可以通过<https://start.spring.io/actuator/info>查看。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/de273cdecdc942f4b44e7f272e11d593.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
项目中如果使用Nacos，需要使用 `bootstrap.yml`，因为bootstrap.yml 先于 application.yml 加载。因此我们需要将项目中的 application.yml 换成bootstrap.yml 。

①修改两个项目的pom文件，引入nacos注册依赖

```xml
        <!--nacos-discovery-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
            <version>2.2.5.RELEASE</version>
        </dependency>
```

②我们修改`hailtaxi-driver`的 application.yml 改名为 bootstrap.yml 并且添加如下配置：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/237c4f14b6854b0eb782cbfc91a8674a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
完整配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/18b57f27afea43e7a20b59173806f86c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

③修改`hailtaxi-order`的 application.yml 改名为 bootstrap.yml 并且添加如下配置：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d89d88a2c5f34d79b68efb54be3b5603.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

完整配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/59decda188e34a81b8316199454c77e0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

④**然后再在两个项目的主启动类上加上注解`@EnableDiscoveryClient`**

# 测试

此时我们运行2个项目，可以发现在Nacos中已经注册了相关服务，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3e807d3c6bbd4f4b899b58526a20418c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时用Postman访问打车下单，效果如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/a87b7f36c01f4c1c865dbeb809f8cd6c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

此时服务调用没有任何问题，说明服务注册和服务发现正常。