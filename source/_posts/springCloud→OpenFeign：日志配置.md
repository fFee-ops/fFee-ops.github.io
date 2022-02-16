---
title: springCloud→OpenFeign：日志配置
date: 2020-10-20 14:21:50
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### OpenFeign日志配置

- - [普通日志等级配置](#_9)
  - [Feign日志等级配置](#Feign_18)

通过`loggin.level.xx=debug`来设置日志级别。然而这个对Feign客户端不会产生效果。因为\@FeignClient注解修饰的客户端在被代理时，都会创建一个新的Feign.Logger实例。我们需要额外通过配置类的方式指定这个日志的级别才可以。  
**实现步骤：**

1.  在application.yml配置文件中开启日志级别配置
2.  编写配置类，定义日志级别bean。
3.  在接口的\@FeignClient中指定配置类
4.  重启项目，测试访问

## 普通日志等级配置

在`hailtaxi-order`（也就是消费方）的配置文件中设置com.itheima包下的日志级别都为debug：

```yml
# com.itheima 包下的日志级别都为Debug
logging:
  level:
    com.itheima: debug
```

## Feign日志等级配置

在`hailtaxi-order`启动类`OrderApplication`中创建`Logger.Level`,定义日志级别：

```java
    /***
     * 日志级别
     * @return
     */
    @Bean
    public Logger.Level feignLoggerLevel(){
        return Logger.Level.FULL;
    }
```

日志级别说明：

> **Feign支持4种级别：**  
> NONE：不记录任何日志，默认值  
> BASIC：仅记录请求的方法，URL以及响应状态码和执行时间  
> HEADERS：在BASIC基础上，额外记录了请求和响应的头信息  
> FULL：记录所有请求和响应的明细，包括头信息、请求体、元数据

重启项目，即可看到每次访问的日志：  
![请添加图片描述](https://img-blog.csdnimg.cn/b82983b6d08f42a4b6f0dad2b853e545.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)