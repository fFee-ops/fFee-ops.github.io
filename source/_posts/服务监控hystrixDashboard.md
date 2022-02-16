---
title: 服务监控hystrixDashboard
date: 2020-10-21 12:55:40
tags: 
categories: Hystrix
---

<!--more-->

### 服务监控hystrixDashboard

- [概述](#_1)
- [仪表盘9001](#9001_4)
- [断路器被监控演示](#_66)

# 概述

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020102112373876.png#pic_center)

# 仪表盘9001

1、新建cloud-consumer-hystrix-dashboard9001  
2、改pom

```xml
  <dependencies>
        <!--新增hystrix dashboard-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix-dashboard</artifactId>
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

3、写yml

```yml
server:
  port: 9001
```

4、主启动类

```java
@SpringBootApplication
@EnableHystrixDashboard
public class HystrixDashboardMain9001 {
    public static void main(String[] args) {
        SpringApplication.run(HystrixDashboardMain9001.class,args);
    }
}

```

5、所有Provider微服务提供类（8001/8002/8003）都需要监控依赖配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency> 
```

6、启动：http://localhost:9001/hystrix

# 断路器被监控演示

1、修改cloud-provider-hystrix-payment8001  
**注意：新版本Hystrix需要在主启动类MainAppHystrix8001中指定监控路径**,否则会报错Unable to connect to Command Metric Stream

```java
@SpringBootApplication
@EnableEurekaClient
@EnableCircuitBreaker
public class PaymentHystrixMain8001 {
    public static void main(String[] args) {
        SpringApplication.run(PaymentHystrixMain8001.class,args);
    }

    /**
     * 个人情况：要先触发fallback后，dashboard才会显示数据，否则为loading！！！！！
     * @return
     */
    @Bean
    public ServletRegistrationBean getServlet(){
        HystrixMetricsStreamServlet streamServlet = new HystrixMetricsStreamServlet();
        ServletRegistrationBean registrationBean = new ServletRegistrationBean(streamServlet);
        registrationBean.setLoadOnStartup(1);
        registrationBean.addUrlMappings("/hystrix.stream");
        registrationBean.setName("HystrixMetricsStreamServlet");
        return registrationBean;
    }


}
```

2、监控测试  
①启动1个eureka或者3个eureka集群均可  
②观察监控窗口

> 1、9001监控8001  
> ①填写监控地址:http://localhost:8001/hystrix.stream  
> ②![在这里插入图片描述](https://img-blog.csdnimg.cn/20201021124515736.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
> 2、测试地址\(我这里有点BUG，要先执行会抛出异常的方法②，监控面板才会有反应\)  
> ①http://localhost:8001/payment/circuit/31  
> ②http://localhost:8001/payment/circuit/-31  
> ③先访问正确地址，再访问错误地址，再正确地址，会发现图示断路器都是慢慢放开的  
> **监控结果，成功**  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201021124751402.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
> **监控结果，失败**  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201021124811445.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

3、如何看  
**7色**

**1圈**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201021125248331.png#pic_center)  
**1线**  
曲线:用来记录2分钟内流量的相对变化,可以通过它来观察到流量的上升和下降趋势。

---

**整图说明**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201021125454211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
**整图说明2**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201021125523768.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)