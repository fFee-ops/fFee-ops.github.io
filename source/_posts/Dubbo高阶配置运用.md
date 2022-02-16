---
title: Dubbo高阶配置运用
date: 2021-11-19 21:59:31
tags: zk zookeeper 分布式
categories: Dubbo
---

<!--more-->

### Dubbo高阶配置运用

- [不同配置覆盖关系](#_2)
- [属性配置优先级](#_78)
- [重试与容错处理机制](#_85)
- [多版本控制](#_110)
- [本地存根调用](#_118)
- [负载均衡机制](#_169)
- [服务降级运用](#_186)
- [并发与连接控制](#_200)
- - [并发数控制](#_202)
  - [连接数控制](#_222)

# 不同配置覆盖关系

**1\. 覆盖规则：**  
![请添加图片描述](https://img-blog.csdnimg.cn/d92ca1151da248d1827c08727ce548fc.jpg?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
配置规则：

- 方法级优先，接口级次之，全局配置再次之。
- 如果级别一样，则消费方优先，提供方次之。

**例如： 服务端超时例子**

①服务端增加配置类：

```java
package com.itheima.dubbo.spring.provider.config;

import org.apache.dubbo.config.ProviderConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class DubboConfig {

    /***
     * 服务端全局配置
     */
    @Bean
    public ProviderConfig registryConfig(){
        ProviderConfig config = new ProviderConfig();
        //全局超时时间 1s
        config.setTimeout(1000);
        //config.setWeight(100);  //权重设置，不建议
        //config.setLoadbalance("random");
        //全局并发数量
        //config.setExecutes(100);
        return config;
    }
}

```

修改服务端接口实现：设定模拟睡眠时间

```java
/**
* 获取订单详情
* @param orderId
* @return
*/
public String getOrder(Long orderId) {
try {
// 休眠1.5秒
Thread.sleep(1500L);
} catch (InterruptedException e) {
e.printStackTrace();
}
return "Get Order Detail, Id: " + orderId + ", serverPort: " +
serverPort;
}
```

②验证：  
服务端全局超时设为2秒（不触发超时）， **消费端**方法级别设定超时时间为1秒（触发超时）。  
修改调用代码：

```java
/**
* 订单服务接口
*/
    @DubboReference(version = "${dubbo.spring.provider.version}",
    methods = {
            //设置方法级别的超时时间
            @Method(name = "getOrder",timeout = 1000)
    })
private OrderService orderService;
```

调用结果， 触发超时，**表明消费端配置优先。**

# 属性配置优先级

![请添加图片描述](https://img-blog.csdnimg.cn/defee6c77cf240d0a058e7515ebc2244.jpg?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_13,color_FFFFFF,t_70,g_se,x_16)  
优先级从高到低：

- JVM -D 参数；
- XML配置（xml,application.properties）；
- dubbo.properties默认配置，仅仅作用于以上两者没有配置时。

# 重试与容错处理机制

1.  容错机制：

- Failfast Cluster  
  快速失败，只发起一次调用，失败立即报错。通常用于非幂等性的写操作，比如新增记录。
- Failsafe Cluster  
  失败安全，出现异常时，直接忽略。通常用于写入审计日志等操作。
- Failback Cluster  
  失败自动恢复，后台记录失败请求，定时重发。通常用于消息通知操作。
- Forking Cluster  
  并行调用多个服务器，只要一个成功即返回。通常用于实时性要求较高的读操作，但需要浪费更多服务资源。可通过 forks=“2” 来设置最大并行数。
- Broadcast Cluster  
  广播调用所有提供者，逐个调用，任意一台报错则报错。通常用于通知所有提供者更新缓存或日志等本地资源信息。

 2.     调整客户端重试次数：

```java
/**
* 订单服务接口
*/
@DubboReference(version = "${dubbo.spring.provider.version}",retries =
3)
private OrderService orderService;

```

# 多版本控制

也就是时候应用会有不同的版本，我们指定用户只能访问哪个版本。

优先级：  
\-D参数>application.properties>dubbo.properties

![在这里插入图片描述](https://img-blog.csdnimg.cn/b7e88259787e44f38f3261ac7fa34c95.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 本地存根调用

本地存根可以理解为一个校验；比如我现在要调用远端服务，但是明明参数格式就有错误，如果还让你成功的去调用远程的服务，那不是浪费资源了，所以在调用远程服务前先调用一次本地服务。

1.  **实现流程**  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/7e80c6f3815c45a8bf4d80ca0f01fac2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
    把 Stub 暴露给用户，Stub 可以决定要不要去调 Proxy。

  2.  **客户端存根实现：**  
    客户端增加service接口：

```java
package com.itheima.dubbo.spring.stub;

import com.itheima.dubbo.spring.api.OrderService;

/**
 * 本地存根，类似于校验
 */
public class OrderServiceStub implements OrderService {

    //代理对象->Proxy->Remote（$Proxy）
    private final OrderService orderService;

    public OrderServiceStub(OrderService orderService) {
        this.orderService = orderService;
    }

    /***
     * 订单查询
     * @param orderId
     * @return
     */
    @Override
    public String getOrder(Long orderId) {
        if(orderId!=null){
            //远程调用
            return orderService.getOrder(orderId);
        }
        return "本地校验不合法....";
    }
}

```

3.  **修改客户端调用配置\(让配置的本地存根生效\)**
    ```java
    @DubboReference(version = "${dubbo.spring.provider.version}",
    stub = "com.itheima.dubbo.spring.stub.OrderServiceStub")
    //stub的值就是存根类的全类名
    private OrderService orderService;
    ```

# 负载均衡机制

1.  **默认负载策略**  
    Dubbo默认采用的是随机负载策略。

2.  **Dubbo 支持的负载均衡策略**

    1.  Random LoadBalance

    > 随机，按权重设置随机概率。 在一个截面上碰撞的概率高，但调用量越大分布越均匀，而且按概率使用权重后也比较均匀，有利于动态调整提供者权重。

    2.RoundRobin LoadBalance

    > 轮询，按公约后的权重设置轮询比率。 存在慢的提供者累积请求的问题，比如：第二台机器很慢，但没挂，当请求调到第二台时就卡在那，久而久之，所有请求都卡在调到第二台上。

    3.  LeastActive LoadBalance

    > 最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差。 使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大。

    4.  ConsistentHash LoadBalance

    > 一致性 Hash，相同参数的请求总是发到同一提供者。 当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起剧烈变动。

# 服务降级运用

1.  **服务动态禁用**  
    启动单个服务节点，进入Dubbo Admin， 创建动态配置规则：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/81563d8292084bcab36c526bf5c52014.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

    ![在这里插入图片描述](https://img-blog.csdnimg.cn/e9f5629b5beb439695cd0ec447cce7a5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_17,color_FFFFFF,t_70,g_se,x_16)  
    将disabled属性设为true， 服务禁用， 可以错误提示：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/8c34b83ac3f945e881fff81bafd085c6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
    将disabled属性改为false，恢复正常访问

2.  **服务降级**  
    在dubboAdmin进行配置即可

# 并发与连接控制

实际运用， 会碰到高并发与峰值场景， Dubbo是可以做到并发与连接数控制。

## 并发数控制

**服务端控制**  
① 服务级别：在提供服务的接口实现类上配置  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c2f6954c527243fc9b488646a4a54e3c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
代表服务器端并发执行（或占用线程池线程数）不能超过 10 个。

②方法级别

![在这里插入图片描述](https://img-blog.csdnimg.cn/9fdfebe3e1744462b91b376779f5868b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

限制具体的方法，服务器端并发执行（或占用线程池线程数）不能超过 10 个。

**客户端控制：**  
①调用的服务控制：在远程调用的Controller中配置：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2d39f3916d4e4478b8613e9d5a4fb1c8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
代表每客户端并发执行（或占用连接的请求数）不能超过 10 个。

②调用的服务方法控制  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fa9020ebc3d449a38329fa2642ee5b24.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 连接数控制

**服务端连接控制：** 在提供服务的接口实现类处配置  
新增一个配置类

```java
@Configuration
public class DubboConfig {

    /***
     * 服务端全局配置
     */
    @Bean
    public ProviderConfig registryConfig(){
        ProviderConfig config = new ProviderConfig();
        //全局超时时间 1s
        config.setTimeout(1000);
        //config.setWeight(100);  //权重设置，不建议
        //config.setLoadbalance("random");
        //全局并发数量
        //config.setExecutes(100);
        //全局连接数量
        config.setAccepts(10);
        return config;
    }
}
```

表示限制服务器端接受的连接不能超过 10 个。

**客户端连接控制：**  
新增一个配置类：

```java
@Configuration
public class DubboConfig {


    /***
     * 客户端全局配置
     */
    @Bean
    public ConsumerConfig config(){
        ConsumerConfig config = new ConsumerConfig();
        config.setTimeout(4000);

        //负载均衡
        //config.setLoadbalance("roundrobin");   //轮询
        //config.setLoadbalance("random");   //随机
        //config.setLoadbalance("consistenthash");   //Hash
        //config.setLoadbalance("leastactive");   //平均处理效率最高的节点优先
        config.setConnections(2);//最大连接数
        return config;
    }
}
```

限制客户端服务使用连接不能超过 10 个