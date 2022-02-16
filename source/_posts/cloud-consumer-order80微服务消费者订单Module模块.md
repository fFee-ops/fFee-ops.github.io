---
title: cloud-consumer-order80微服务消费者订单Module模块
date: 2020-10-16 17:34:42
tags: 
categories: 被引用
---

<!--more-->

### cloud-consumer-order80微服务消费者订单Module模块

- [注意：不要忘记\@RequestBody注解](#RequestBody_129)
- [测试](#_132)

1、建cloud-consumer-order80

2、改POM

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

    <artifactId>cloud-consumer-order80</artifactId>
    <dependencies>
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
            <optional>true</optional>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>


</project>
```

3、写YML

```yml
server:
  port: 80

```

4、主启动

```java
package com.sl.springcloud;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OrderMain80 {
    public static void main(String[] args) {
        SpringApplication.run(OrderMain80.class,args);
    }
}

```

5、业务类  
①创建entities\(将cloud-provider-payment8001工程下的entities包下的两个实体类复制过来\)

②config配置类

```java
//RestTemplate的配置文件
@Configuration
public class ApplicationContextConfig {

    @Bean
    public RestTemplate getRestTemplate() {//放一个RestTemplate对象到bean容器里面，便于以后操作
        return new RestTemplate();
    }
}

```

③创建controller

```java
@Slf4j
@RestController

public class OrderController {
    public static final  String PAYMENT_URL="http://localhost:8001";//生产者的地址

    @Resource
    private RestTemplate restTemplate;//利用restTemplate去调用8001服务

    @GetMapping("/consumer/payment/create")
    public CommonResult   create(payment payment){
        return restTemplate.postForObject(PAYMENT_URL+"/payment/create",payment,CommonResult.class);  //写操作
    }

    @GetMapping(value = "/consumer/payment/get/{id}")
    public CommonResult getPayment(@PathVariable("id") Long id){

        return  restTemplate.getForObject(PAYMENT_URL+"/payment/get/"+id,CommonResult.class);//读操作
    }


}

```

# 注意：不要忘记\@RequestBody注解

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016173121439.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 测试

先启动cloud-provider-payment8001  
再启动cloud-consumer-order80

访问http://localhost/consumer/payment/get/32  
http://localhost/consumer/payment/create\?serial=“你好啊？？”