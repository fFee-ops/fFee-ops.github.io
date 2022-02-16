---
title: 对基础module高并发测试
date: 2020-10-21 11:32:22
tags: 
categories: Hystrix
---

<!--more-->

### 对基础module高并发测试

- - [Jmeter压测测试](#Jmeter_2)
  - [Jmeter压测结论](#Jmeter_14)
  - [80新建加入](#80_20)

## Jmeter压测测试

①开启Jmeter，来20000个并发压死8001，20000个请求都去访问paymentInfo\_TimeOut服务。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201021103227542.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201021103242236.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
②再来一个访问

> http://localhost:8001/payment/hystrix/ok/31  
> http://localhost:8001/payment/hystrix/timeout/31

③会发现本来ok是不应该转圈圈的，可是当我们去访问ok的时候也在转圈，这是因为**tomcat的默认的工作线程数被打满了，没有多余的线程来分解压力和处理。**

---

## Jmeter压测结论

上面还是服务提供者8001自己测试，假如此时外部的消费者80也来访问，那消费者只能干等，最终导致消费端80不满意，服务端8001直接被拖死

## 80新建加入

1、新建cloud-consumer-feign-hystrix-order80  
2、改pom

```xml
 <dependencies>
        <!--新增hystrix-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
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

3、写yml

```yml
server:
  port: 8001


spring:
  application:
    name: cloud-provider-hystrix-payment


eureka:
  client:
    register-with-eureka: true    #表识向注册中心注册自己
    fetch-registry: true
    service-url:
      # defaultZone: http://eureka7002.com:7002/eureka/  这里为了方便不用集群版本
      defaultZone: http://eureka7001.com:7001/eureka/


```

4、主启动类

```java
@SpringBootApplication
@EnableFeignClients
public class OrderHystrixMain80 {
    public static void main(String[] args) {
        SpringApplication.run(OrderHystrixMain80.class,args);
    }
}

```

5、业务类  
**PaymentHystrixService**

```java

@Component
@FeignClient(value = "CLOUD-PROVIDER-HYSTRIX-PAYMENT")
public interface PaymentHystrixService {
    @GetMapping("/payment/hystrix/ok/{id}")
    public String paymentInfo_OK(@PathVariable("id") Integer id);

    @GetMapping("/payment/hystrix/timeout/{id}")
    public String paymentInfo_TimeOut(@PathVariable("id") Integer id);
}
 
```

**OrderHystrixController**

```java
@RestController
@Slf4j
public class OrderHystrixController {

    @Resource
    private PaymentHystrixService paymentHystrixService;

    @Value("${server.port}")
    private String serverPort;

    @GetMapping("/consumer/payment/hystrix/ok/{id}")
    public String paymentInfo_OK(@PathVariable("id") Integer id){
        String result = paymentHystrixService.paymentInfo_OK(id);
        log.info("*******result:"+result);
        return result;
    }
    @GetMapping("/consumer/payment/hystrix/timeout/{id}")
    public String paymentInfo_TimeOut(@PathVariable("id") Integer id){
        String result = paymentHystrixService.paymentInfo_TimeOut(id);
        log.info("*******result:"+result);
        return result;
    }

}
```

6、正常测试

> http://localhost/consumer/payment/hystrix/ok/31

7、高并发测试  
1、2W个线程压8001的timeout方法  
2、消费端80微服务再去访问正常的OK微服务8001地址  
3、80要么转圈圈等待，要么消费端报超时错误