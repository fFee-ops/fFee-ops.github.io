---
title: SpringCloud Bus动态刷新全局广播
date: 2020-10-24 11:19:39
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### SpringCloud Bus动态刷新全局广播

- [环境搭建](#_3)
- [设计思想](#_115)
- [开始添加BUS总线支持](#BUS_130)
- [测试](#_271)

类似于RabbitMQ的fanout模型

# 环境搭建

1、先在Linux上安装好RabbitMQ环境，并且将RabbitMQ启动

2、演示**广播**效果，增加复杂度，再以3355为模板再制作一个3366

3、cloud-config-client-3366  
①POM

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
        <groupId>com.sl.springcloud</groupId>
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

②YML

```yml
server:
  port: 3366

spring:
  application:
    name: config-client
  cloud:
    config:
      label: master
      name: config
      profile: dev
      uri: http://localhost:3344
eureka:
  client:
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
management:
  endpoints:
    web:
      exposure:
        include: "*"
 

```

③主启动

```java
@EnableEurekaClient
@SpringBootApplication
public class ConfigClientMain3366 {
    public static void main(String[] args) {
            SpringApplication.run( ConfigClientMain3366.class,args);
        }
}
```

④业务类\(Controller\)

```java
@RestController
@RefreshScope
public class ConfigClientController {

    @Value("${server.port}")
    private String serverPort;

    @Value("${config.info}")
    private String configInfo;


    @GetMapping("/configInfo")
    public String getConfigInfo(){
        return "serverPort:"+serverPort+"\t\n\n configInfo: "+configInfo;
    }


}
```

# 设计思想

**第一种：利用消息总线触发一个客户端/bus/refresh,而刷新所有客户端的配置**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024111148554.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**第二种：利用消息总线触发一个服务端ConfigServer的/bus/refresh端点,而刷新所有客户端的配置（更加推荐）**

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020102411121789.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

> 图二的架构显然更加合适，图一不适合的原因如下  
> 1、打破了微服务的职责单一性，因为微服务本身是业务模块，它本不应该承担配置刷新职责  
> 2、破坏了微服务各节点的对等性  
> 3、有一定的局限性。例如，微服务在迁移时，它的网络地址常常会发生变化，此时如果想要做到自动刷新，那就会增加更多的修改

# 开始添加BUS总线支持

1、给cloud-config-center-3344配置中心服务端添加消息总线支持  
**pom**

```xml
<dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

**yml**

```yml
server:
  port: 3344
spring:
  application:
    name: cloud-config-center
  cloud:
    config:
      server:
        git:
          uri: git@github.com:fFee-ops/springcloud-config.git  #填写你自己的github存放配置文件仓库的路径
          #  搜索路径
          search-paths:
            - springcloud-config
      #  读取分支
      label: master


  rabbitmq:
    host: 192.168.80.33
    port: 5672
    username: guest
    password: guest

eureka:
  client:
    service-url:
      defaultZone:  http://localhost:7001/eureka

management:
  endpoints:
    web:
      exposure:
        include: 'bus-refresh'


```

2、给cloud-config-center-3355客户端添加消息总线支持  
**pom**

```xml
<dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

**yml**

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

  rabbitmq:
    host: 192.168.80.33
    port: 5672
    username: guest
    password: guest


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

3、给cloud-config-center-3366客户端添加消息总线支持  
**pom**

```xml
<dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

**yml**

```yml
server:
  port: 3366

spring:
  application:
    name: config-client
  cloud:
    config:
      label: master
      name: config
      profile: dev
      uri: http://localhost:3344

  rabbitmq:
    host: 192.168.80.33
    port: 5672
    username: guest
    password: guest


eureka:
  client:
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
management:
  endpoints:
    web:
      exposure:
        include: "*"


```

# 测试

1、修改Github上配置文件增加版本号  
2、发送Post请求

> curl \-X POST “http://localhost:3344/actuator/bus-refresh”  
> **一次发送，处处生效**

3、配置中心：http://config-3344.com/config-dev.yml

4、客户端  
①http://localhost:3355/configInfo  
②http://localhost:3366/configInfo  
③**获取配置信息，发现都已经刷新了，达到了一次修改，广播通知，处处生效**