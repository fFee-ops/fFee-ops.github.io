---
title: Springcloud-Config客户端之动态刷新
date: 2020-10-24 10:45:15
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### Config客户端之动态刷新

- [环境搭建及测试](#_2)
- [随之而来的问题](#_71)

# 环境搭建及测试

为了避免每次更新配置都要重启客户端微服务3355。

**修改3355模块：**

1、POM引入actuator监控

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

2、修改YML，暴露监控端口

```yml
server:
  port: 3355

spring:
  application:
    name: config-client
  cloud:
    config:
      label: master  # 分支名称
      name: config   # 配置文件名称
      profile: dev   # 配置文件后缀  综合 上面三个就是，master分支上的config-dev文件被读取，即http://localhost:3344/master/config-dev
      uri: http://localhost:3344  # 配置中心地址

eureka:
  client:
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka

#  暴露监控端口
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

3、\@RefreshScope业务类Controller修改

```java
@RefreshScope
@RestController
public class ConfigClientController {

    @Value("${config.info}")
    private String configInfo;

    @GetMapping("/configInfo")
    public String getConfigInfo(){
        return configInfo;
    }
}
```

4、测试  
①修改Github上的yml  
②刷新发现3344变了，3355还是没变

③**需要运维人员发送Post请求刷新3355**

④curl \-X POST “http://localhost:3355/actuator/refresh” （必须是POST请求）

⑤再次刷新3355，成功实现了客户端3355刷新到最新配置内容，避免了服务的重启

# 随之而来的问题

假如有多个微服务客户端3355/3366/3377。。。。每一个都要手动去刷新岂不是很麻烦？？可否广播，一次通知，处处生效？