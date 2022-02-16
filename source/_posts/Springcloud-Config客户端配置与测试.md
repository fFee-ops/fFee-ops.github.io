---
title: Springcloud-Config客户端配置与测试
date: 2020-10-24 10:37:42
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### Config客户端配置与测试

- [环境搭建](#_2)
- [问题随时而来，分布式配置的动态刷新](#_122)

# 环境搭建

1、新建cloud-config-client-3355

2、pom

```xml
  <dependencies>

        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-config</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>com.atguigu.springcloud</groupId>
            <artifactId>cloud-api-commons</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

```

---

3、**bootstrap.yml**  
①是什么？  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024103000972.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
记住，客户端的yml文件一定要是bootstrap.yml，因为自己的bootstrap.yml和从配置中心拉取得application,yml和起来才是该微服务完整的配置文件，如果你本地也是application.yml则会和从配置中心拉取的冲突，导致启动失败等。

②内容

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
```

---

4、主启动类

```java

@SpringBootApplication
public class ConfigClientMain3355 {
    public static void main(String[] args) {
            SpringApplication.run( ConfigClientMain3355.class,args);
        }
}
 
 
```

5、业务类

```java
@RestController
public class ConfigClientController {

    @Value("${config.info}") //相当于从配置中心读取了application.yml,然后从其中读取config.info
    private String configInfo;

    @GetMapping("/configInfo")
    public String getConfigInfo(){
        return configInfo;
    }
}


```

6、测试  
①、启动Config配置中心3344微服务并自测  
http://config-3344.com:3344/master/config-dev.yml  
http://config-3344.com:3344/master/config-test.yml

②启动3355作为Client准备访问：http://localhost:3355/configInfo

# 问题随时而来，分布式配置的动态刷新

上面成功实现了客户端3355访问SpringCloud Config3344通过GitHub获取配置信息。  
**但是现在发现了一个问题**

> Linux运维修改GitHub上的配置文件内容做调整，刷新3344，发现ConfigServer配置中心立刻响应，刷新3355，发现ConfigServer客户端没有任何响应，3355没有变化除非自己重启或者重新加载**难道每次运维修改配置文件，客户端都需要重启？？**