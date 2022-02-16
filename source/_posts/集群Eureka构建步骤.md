---
title: 集群Eureka构建步骤
date: 2020-10-18 12:30:56
tags: 
categories: Eureka
---

<!--more-->

### 集群Eureka构建步骤

- [Eureka集群原理说明](#Eureka_2)
- [EurekaServer集群环境构建步骤](#EurekaServer_9)
- [将支付服务8001微服务发布到上面2台Eureka集群配置中](#80012Eureka_60)
- [将订单服务80微服务发布到上面2台Eureka集群配置中](#802Eureka_68)
- [测试01](#01_75)
- [支付服务提供者8001集群环境构建](#8001_82)
- [负载均衡](#_95)
- - [BUG](#BUG_96)
  - [使用\@LoadBalanced注解赋予RestTemplate负载均衡的能力](#LoadBalancedRestTemplate_105)
- [测试02](#02_121)

# Eureka集群原理说明

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201018120029125.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
问题:微服务RPC远程服务调用最核心的是什么？  
答：高可用，如果你的注册中心只有一个那么它除了故障你的系统就会崩溃，所以要搭建Eureka注册中心集群，实现负载均衡+故障容错。

# EurekaServer集群环境构建步骤

1、按照cloud-eureka-server7001新建一个项目cloud-eureka-server7002。

2、改POM:和7001的pom文件相同

3、修改映射配置  
①找到C:\\Windows\\System32\\drivers\\etc路径下的hosts文件  
②修改映射配置添加进hosts文件

```
127.0.0.1  eureka7001.com
127.0.0.1  eureka7002.com
```

3、写yml\(以前是单机，现在要变成集群配置\)  
**7001:**

```yml
server:
  port: 7001

eureka:
  instance:
    hostname: eureka7001.com    #eureka服务端的实例名字
  client:
    register-with-eureka: false    #表识不向注册中心注册自己
    fetch-registry: false   #表示自己就是注册中心，职责是维护服务实例，并不需要去检索服务
    service-url:
      defaultZone: http://eureka7002.com:7002/eureka/    #设置与eureka server交互的地址查询服务和注册服务都需要依赖这个地址 

```

**7002**

```yml
server:
  port: 7002

eureka:
  instance:
    hostname: eureka7002.com #eureka服务端的实例名字
  client:
    register-with-eureka: false    #表识不向注册中心注册自己
    fetch-registry: false   #表示自己就是注册中心，职责是维护服务实例，并不需要去检索服务
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka/     #设置与eureka server交互的地址查询服务和注册服务都需要依赖这个地址
```

即7001和7002相互注册 互相守望

---

4、主启动\(复制cloud-eureka-server7001的主启动类到7002即可\)

# 将支付服务8001微服务发布到上面2台Eureka集群配置中

修改yml的一项配置即可

```yml
service-url:
  defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka  #集群版
```

# 将订单服务80微服务发布到上面2台Eureka集群配置中

修改yml

```yml
service-url:
  defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka  #集群版
```

# 测试01

1、先要启动EurekaServer，7001/7002服务  
2、再要启动服务提供者provider，8001服务  
3、再要启动消费者，80  
4、http://localhost/consumer/payment/get/31

# 支付服务提供者8001集群环境构建

同样在工作中不可能只有一个Provider，也很容易发生单点故障，所以Provider也要进行集群配置。

1、参考cloud-provider-payment8001新建cloud-provider-payment8002

2、改POM：复制8001的

3、写yml：复制8001的，只要改个端口为8002

4、主启动类

4、修改8001/8002的Controller（添加红框框内的东西）  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201018122325205.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 负载均衡

## BUG

在上面的8001、8002都注册进了Eureka后，用  
http://localhost/consumer/payment/get/2  
去访问的话，会报错500，因为之前的系统订单服务访问地址是写死了的。  
要改为

```java
public static final String PAYMENT_URL = "http://CLOUD-PAYMENT-SERVICE";//根据服务名找生产者的地址
```

## 使用\@LoadBalanced注解赋予RestTemplate负载均衡的能力

加在80服务的ApplicationContextConfig下。

```java
//RestTemplate的配置文件 

@Configuration
public class ApplicationContextConfig {
    @LoadBalanced//开启负载均衡
    @Bean
    public RestTemplate getRestTemplate() {//放一个RestTemplate对象到bean容器里面，便于以后操作
        return new RestTemplate();
    }
}
```

# 测试02

1、先要启动EurekaServer，7001/7002服务  
2、再要启动服务提供者provider，8001/8002服务  
3、http://localhost/consumer/payment/get/31  
4、会发现8001/8002端口交替出现