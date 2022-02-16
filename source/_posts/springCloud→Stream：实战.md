---
title: springCloud→Stream：实战
date: 2020-10-24 22:26:59
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### SpringCloud Stream实战

- [生产者（支付服务）](#_8)
- - [1\)引入依赖](#1_10)
  - [2\)配置MQ服务](#2MQ_20)
  - [3\)消息输出管道绑定](#3_76)
  - [4\)消息发送](#4_108)
- [消费者（订单服务）](#_133)
- - [1\)修改配置](#1_135)
  - [2\)消息监听](#2_157)
- [测试](#_180)

![请添加图片描述](https://img-blog.csdnimg.cn/89dd415c9cc543f8b0eb66cd1de003ca.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如上图，当用户行程结束，用户需进入支付操作，当用户支付完成时，我们需要更新订单状态，此时我们可以让支付系统将支付状态发送到MQ中，订单系统订阅MQ消息，根据MQ消息修改订单状态。我们将使用`SpringCloud Stream`实现该功能。  
项目结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/71b7987ee3fe4347923d8772a4d82871.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)

> 注：本次实战默认已经安装好了rabbitMQ

# 生产者（支付服务）

## 1\)引入依赖

在`hailtaxi-pay`中引入依赖：

```xml
<!--stream-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-stream-rabbit</artifactId>
</dependency>
```

## 2\)配置MQ服务

修改`hailtaxi-pay`的`application.yml`添加如下配置：

```yml
    #Stream
    stream:
      binders: # 在此处配置要绑定的rabbitmq的服务信息；
        defaultRabbit: # 表示定义的名称，用于于binding整合
          type: rabbit # 消息组件类型
          environment: # 设置rabbitmq的相关的环境配置
            spring:
              rabbitmq:
                host: 192.168.211.145
                port: 5672
                username: guest
                password: guest
      bindings: # 服务的整合处理
        output: # 这个名字是一个通道的名称
          destination: payExchange # 表示要使用的Exchange名称定义
          content-type: application/json # 设置消息类型，本次为json，文本则设置“text/plain”
          binder: defaultRabbit  # 设置要绑定的消息服务的具体设置
```

完整配置如下：

```yml
server:
  port: 18083
spring:
  application:
    name: hailtaxi-pay
  cloud:
    #Consul配置
    consul:
      host: localhost
      port: 8500
      discovery:
        #注册到Consul中的服务名字
        service-name: ${spring.application.name}
    #Stream
    stream:
      binders: # 在此处配置要绑定的rabbitmq的服务信息；
        defaultRabbit: # 表示定义的名称，用于于binding整合
          type: rabbit # 消息组件类型
          environment: # 设置rabbitmq的相关的环境配置
            spring:
              rabbitmq:
                host: 192.168.211.145
                port: 5672
                username: guest
                password: guest
      bindings: # 服务的整合处理
        output: # 这个名字是一个通道的名称
          destination: payExchange # 表示要使用的Exchange名称定义
          content-type: application/json # 设置消息类型，本次为json，文本则设置“text/plain”
          binder: defaultRabbit  # 设置要绑定的消息服务的具体设置
```

## 3\)消息输出管道绑定

创建`com.itheima.pay.mq.MessageSender`代码如下：

```java
package com.itheima.pay.mq;

/***
 * 负责向MQ发送消息
 */
@EnableBinding(Source.class)
public class MessageSender {

    @Resource
    private MessageChannel output;//消息发送管道

    /***
     * 发送消息
     * @param message
     * @return
     */
    public Boolean send(Object message) {
        //消息发送
        boolean bo = output.send(MessageBuilder.withPayload(message).build());
        System.out.println("*******send message: "+message);
        return bo;
    }
}
```

参数说明：

> **Source.class:** 绑定一个输出消息通道Channel。  
> **MessageChannel:** 消息发送对象，默认是DirectWithAttributesChannel，发消息在AbstractMessageChannel中完成。  
> **MessageBuilder.withPayload:** 构建消息。

## 4\)消息发送

在`com.itheima.pay.controller.TaxiPayController`中创建支付方法用于发送消息，代码如下：

```java
@RestController
@RequestMapping(value = "/pay")
public class TaxiPayController {

    @Autowired
    private MessageSender messageSender;

    /***
     * 支付  http://localhost:18083/pay/wxpay/1
     * @return
     */
    @GetMapping(value = "/wxpay/{id}")
    public TaxiPay pay(@PathVariable(value = "id")String id){
        //支付操作
        TaxiPay taxiPay = new TaxiPay(id,310,3);
        //发送消息
        messageSender.send(taxiPay);
        return taxiPay;
    }
}
```

# 消费者（订单服务）

## 1\)修改配置

修改`hailtaxi-order`的核心配置文件`application.yml`，在文件中配置要监听的MQ信息：

```yml
    #Stream
    stream:
      binders: # 在此处配置要绑定的rabbitmq的服务信息；
        defaultRabbit: # 表示定义的名称，用于于binding整合
          type: rabbit # 消息组件类型
          environment: # 设置rabbitmq的相关的环境配置
            spring:
              rabbitmq:
                host: 192.168.211.145
                port: 5672
                username: guest
                password: guest
      bindings: # 服务的整合处理
        input: # 这个名字是一个通道的名称
          destination: payExchange # 表示要使用的Exchange名称定义
          content-type: application/json # 设置消息类型，本次为json，文本则设置“text/plain”
          binder: defaultRabbit  # 设置要绑定的消息服务的具体设置
```

## 2\)消息监听

在`hailtaxi-order`中创建消息监听对象`com.itheima.order.mq.MessageReceiver`，代码如下：

```java
@EnableBinding(Sink.class)
public class MessageReceiver {

    @Value("${server.port}")
    private String port;

    /****
     * 消息监听
     * @param message
     */
    @StreamListener(Sink.INPUT)
    public void receive(String message) {
        System.out.println("消息监听(增加用户积分、修改订单状态)-->" + message+"-->port:"+port);
    }
}
```

参数说明：

> **Sink.class:** 绑定消费者管道信息。  
> **\@StreamListener\(Sink.INPUT\):** 监听消息配置，指定了消息为application中的input。

# 测试

我们请求`http://localhost:18083/pay/wxpay/1`测试效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b31115f4683c45df93ecd57120996890.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5031dfac6cf94e58a03e4f9e6be20e8c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)