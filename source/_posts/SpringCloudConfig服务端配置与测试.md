---
title: SpringCloudConfig服务端配置与测试
date: 2020-10-24 10:25:59
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### SpringCloudConfig服务端配置与测试

- [基本环境搭建](#_2)
- [配置读取规则](#_114)

# 基本环境搭建

1、用你自己的Github账号在github上建立一个名为**springcloud-config**的仓库。

2、往仓库上上传三个yml文件\(文件名要求和图中保持一致\)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024101647934.png#pic_center)  
**prod.yml：**（其余的只要修改环境名）

```yml
config:
  info: "master branch,springcloud-config/config-prod.yml  version=1"
```

3、新建Module模块cloud-config-center-3344作为配置中心（cloudConfig Center）

4、pom

```xml
  <dependencies>


        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-config-server</artifactId>
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

5、yml

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

eureka:
  client:
    service-url:
      defaultZone:  http://localhost:7001/eureka


```

6、启动类

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigCenterMain3344 {
    public static void main(String[] args) {
            SpringApplication.run(ConfigCenterMain3344 .class,args);
        }
}
 
 
```

7、windows下修改hosts文件，增加映射

> 127.0.0.1   config-3344.com

8、测试通过Config微服务是否可以从Github上获取配置内容  
①启动微服务7001  
②启动微服务3344  
③http://config-3344.com:3344/master/config-dev.yml

# 配置读取规则

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024102536813.png#pic_center)

> 1、/\{label\}/\{application\}-\{profile\}.yml（最推荐使用这种方式）  
> 例如：![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024102400324.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

> 2、/\{application\}-\{profile\}.yml  
> 例如：![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024102439476.png#pic_center)

> 3、/\{application\}-\{profile\}\[/\{label\}  
> 例如：![在这里插入图片描述](https://img-blog.csdnimg.cn/20201024102453546.png#pic_center)

---