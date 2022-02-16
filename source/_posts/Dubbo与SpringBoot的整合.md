---
title: Dubbo与SpringBoot的整合
date: 2021-11-18 11:17:29
tags: zk zookeeper 分布式
categories: Dubbo
---

<!--more-->

### Dubbo与SpringBoot的整合

- [1、父工程](#1_8)
- [2、公用RPC接口工程](#2RPC_117)
- [3、服务端工程](#3_139)
- [4、消费端工程](#4_262)
- [工程调用验证](#_379)

基于Zookeeper实现Dubbo与Spring Boot的集成整合。

> zk已经在服务器部署并且运行起来了

**项目结构：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1ab51539c5b54c27b8d807d221aaabef.png)

# 1、父工程

父工程我们只需要创建一个maven项目。并且保留pom.xml即可。  
以下是它的xml文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.itheima</groupId>
    <artifactId>dubbo-spring</artifactId>
    <version>1.0-SNAPSHOT</version>
    <modules>
        <module>spring-dubbo-interface</module>
        <module>spring-dubbo-provider</module>
        <module>spring-dubbo-consumer</module>
    </modules>
    <packaging>pom</packaging>
    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <dubbo-version>2.7.8</dubbo-version>
        <spring-boot.version>2.3.0.RELEASE</spring-boot.version>
    </properties>
    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Apache Dubbo  -->
            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-dependencies-bom</artifactId>
                <version>${dubbo-version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo</artifactId>
                <version>${dubbo-version}</version>
                <exclusions>
                    <exclusion>
                        <groupId>org.springframework</groupId>
                        <artifactId>spring</artifactId>
                    </exclusion>
                    <exclusion>
                        <groupId>javax.servlet</groupId>
                        <artifactId>servlet-api</artifactId>
                    </exclusion>
                    <exclusion>
                        <groupId>log4j</groupId>
                        <artifactId>log4j</artifactId>
                    </exclusion>
                </exclusions>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- Dubbo Spring Boot Starter -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
            <version>${dubbo-version}</version>
        </dependency>
        <!-- Dubbo核心组件 -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
        </dependency>
        <!--Spring Boot 依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>${spring-boot.version}</version>
        </dependency>
        <!-- Zookeeper客户端框架 -->
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-framework</artifactId>
            <version>4.0.1</version>
        </dependency>
        <!-- Zookeeper dependencies -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-zookeeper</artifactId>
            <version>${dubbo-version}</version>
            <type>pom</type>
            <exclusions>
                <exclusion>
                    <groupId>org.slf4j</groupId>
                    <artifactId>slf4j-log4j12</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>

</project>
```

# 2、公用RPC接口工程

为便于客户端与服务端的RPC接口引用， 这里对RPC接口做统一封装。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/02459d88d98e41b6b864d4efefaec422.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)

> 定义了一个订单服务接口， 用于测试验证

该项目只需要创建一个maven工程，并且创建一个接口：  
**OrderService：**

```java
package com.itheima.dubbo.spring.api;

public interface OrderService {

    /**
     * 获取订单详情
     * @param orderId
     * @return
     */
    String getOrder(Long orderId);
}
```

# 3、服务端工程

首先来看一下工程结构：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0b8407bafeb44089b67c62f0ec8a0a6c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)  
我们只需要创建一个springBoot项目，然后修改以下几点：

**①POM依赖：**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>dubbo-spring</artifactId>
        <groupId>com.itheima</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>spring-dubbo-provider</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Dubbo Spring Boot Starter -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
            <version>${dubbo-version}</version>
        </dependency>
        <!-- Dubbo 核心依赖 -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
        </dependency>
        <!-- 公用RPC接口依赖 -->
        <dependency>
            <groupId>com.itheima</groupId>
            <artifactId>spring-dubbo-interface</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>
</project>
```

**②实现RPC服务接口：**  
OrderServiceImpl:

```java
package com.itheima.dubbo.spring.provider.service;

import com.itheima.dubbo.spring.api.OrderService;
import org.apache.dubbo.config.annotation.DubboService;
import org.apache.dubbo.config.annotation.Method;
import org.springframework.beans.factory.annotation.Value;

import java.util.concurrent.TimeUnit;


//通过DubboService注解， 声明为RPC服务，version可以标识具体的版本号， 消费端需匹配保持一致。
@DubboService(version = "${dubbo.spring.provider.version}")
public class OrderServiceImpl implements OrderService {

    /**
     * 服务端口
     */
    @Value("${server.port}")
    private String serverPort;

    /**
     * 获取订单详情
     * @param orderId
     * @return
     */
    public String getOrder(Long orderId) {

        return "Get Order Detail, Id: " + orderId + ", serverPort: " + serverPort;
    }
}
```

**③配置文件：**  
application.properties：

```yml
# 服务端口
server.port=18081
# 应用程序名称
spring.application.name=spring-dubbo-provider
# Dubbo服务扫描路径
dubbo.scan.base-packages=com.itheima

# Dubbo 通讯协议
dubbo.protocol.name=dubbo
# Dubbo服务提供的端口， 配置为-1，代表为随机端口
dubbo.protocol.port=-1
#dubbo.protocol.port=28801

## Dubbo 注册器配置信息
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.registry.file = ${user.home}/dubbo-cache/${spring.application.name}/dubbo.cache
dubbo.spring.provider.version = 1.0.0

#配置连接时间
dubbo.registry.timeout=20000
```

**④启动类：**

```java
@SpringBootApplication
@ComponentScan(basePackages = {"com.itheima"})
public class DubboSpringProviderApplication {

    public static void main(String[] args) {
        SpringApplication.run(DubboSpringProviderApplication.class, args);
    }
}
```

# 4、消费端工程

工程结构：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/26b3c3217560468bb7c62bb703f1391c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)  
我们也只需要创建一个spring Boot项目即可。需要修改以下几处：

**①pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>dubbo-spring</artifactId>
        <groupId>com.itheima</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>spring-dubbo-consumer</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Dubbo Spring Boot Starter -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
            <version>${dubbo-version}</version>
        </dependency>
        <!-- 公用RPC接口依赖 -->
        <dependency>
            <groupId>com.itheima</groupId>
            <artifactId>spring-dubbo-interface</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>

</project>
```

**②消费端调用：**  
OrderController

```java
package com.itheima.dubbo.spring.consumer.controller;

import com.itheima.dubbo.spring.api.OrderService;
import org.apache.dubbo.config.annotation.DubboReference;
import org.apache.dubbo.config.annotation.Method;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
public class OrderController {

    private final Logger logger = LoggerFactory.getLogger(getClass());


    /**
     * 订单服务接口
     */
    @DubboReference(version = "${dubbo.spring.provider.version}")
    private OrderService orderService;

    /**
     * 获取订单详情接口
     * @param orderId
     * @return
     */
    @RequestMapping("/getOrder")
    @ResponseBody
    public String getOrder(Long orderId) {
        String result = orderService.getOrder(orderId);
        return result;
    }

}
```

**③配置文件：**  
application.properties

```yml
# 服务端口
server.port=18082
#服务名称
spring.application.name=spring-dubbo-consumer
#服务版本号
dubbo.spring.provider.version = 1.0.0
#消费端注册器配置信息
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.registry.file = ${user.home}/dubbo-cache/${spring.application.name}/dubbo.cache

#配置连接时间
dubbo.registry.timeout=20000
```

**④主启动类：**

```java
@SpringBootApplication
@ComponentScan(basePackages = {"com.itheima"})
public class DubboSpringConsumerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DubboSpringConsumerApplication.class, args);
    }
}
```

# 工程调用验证

1.  启动zk
2.  启动服务端， 运行DubboSpringProviderApplication
3.  启动消费端， 运行DubboSpringConsumerApplication
4.  访问`http://127.0.0.1:18082/getOrder?orderId=1001` ，出现以下图片证明调用成功。  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/b9faf556fe7e437e85019f3d8d801b12.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)