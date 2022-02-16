---
title: 单机Eureka构建步骤
date: 2020-10-17 11:23:41
tags: 
categories: Eureka
---

<!--more-->

### 单机Eureka构建步骤

- [IDEA生成 EurekaServer端服务注册中心，类似物业公司](#IDEA_EurekaServer_2)
- [Eurekaclient端 cloud- provider-payment8001将注册进 Eurekaserver成为服务提供者 provider,类似学校对外提供授课服务](#Eurekaclient_cloud_providerpayment8001_Eurekaserver_provider_115)
- [EurekaClient端 cloud- consumer-order.80将注册进 EurekaServer成为服务消费者 consumer类似来上课消费的同学](#EurekaClient_cloud_consumerorder80_EurekaServer_consumer_165)

# IDEA生成 EurekaServer端服务注册中心，类似物业公司

1、建Moudle  
**cloud-eureka-server7001**

2、改pom

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>springcloud2020</artifactId>
        <groupId>com.sl.springcloud</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>cloud-eureka-server7001</artifactId>


    <dependencies>
        <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-eureka-server -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>

        <dependency>
            <groupId>com.sl.springcloud</groupId>
            <artifactId>cloud-api-commons</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web  -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-devtools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
        </dependency>

    </dependencies>


</project>
```

3、写yml

```yml

server:
  port: 7001

eureka:
  instance:
    hostname: localhost    #eureka服务端的实例名字
  client:
    register-with-eureka: false   #表识不向注册中心注册自己
    fetch-registry: false       #表示自己就是注册中心，职责是维护服务实例，并不需要去检索服务
    service-url:
      #设置与eureka server交互的地址查询服务和注册服务都需要依赖这个地址
      defaultZone:  http://${eureka.instance.hostname}:${server.port}/eureka/


```

4、主启动类

```java
@EnableEurekaServer
@SpringBootApplication
public class EurekaMain7001 {
    public static void main(String[] args) {
        SpringApplication.run(EurekaMain7001.class,args);
    }
}
```

5、测试  
http://localhost:7001  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201017111245697.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# Eurekaclient端 cloud- provider-payment8001将注册进 Eurekaserver成为服务提供者 provider,类似学校对外提供授课服务

1、改pom

```xml
  <!--声明自己是eureka的客户端        -->
        <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-eureka-server -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
```

2、写yml

```yml
server:
eureka:
  client:
    register-with-eureka: true
    fetchRegistry: true
    service-url:
      defaultZone: http://localhost:7001/eureka
```

3、主启动

```java
@EnableEurekaClient
@SpringBootApplication
public class PayMentMain8001 {
    public static void main(String[] args) {
    SpringApplication.run(PayMentMain8001.class,args);
    }
}

```

4、测试  
先启动EurekaServer7001  
然后启动8001  
然后访问 http://localhost:7001/  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201017111928486.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

**微服务注册名配置说明**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201017112001996.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# EurekaClient端 cloud- consumer-order.80将注册进 EurekaServer成为服务消费者 consumer类似来上课消费的同学

1、改pom

```xml
 <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-eureka-server -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
```

2、写yml

```yml
server:
  port: 80
spring:
  application:
    name: cloud-order-service

eureka:
  client:
    register-with-eureka: true
    fetchRegistry: true
    service-url:
      defaultZone: http://localhost:7001/eureka
```

3、给主启动加上\@EnableEurekaClient

4、测试  
先启动7001，再启动8001，再启动80

①然后访问http://localhost:7001  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201017112254376.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
②http://localhost/consumer/payment/get/2 同样可以拿到结果