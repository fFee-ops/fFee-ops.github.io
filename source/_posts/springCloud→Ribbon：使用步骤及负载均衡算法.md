---
title: springCloud→Ribbon：使用步骤及负载均衡算法
date: 2020-10-19 13:49:24
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### Ribbon使用步骤及负载均衡算法

- [使用步骤](#_8)
- - [1\)业务分析](#1_9)
  - [2\)调用测试](#2_13)
- [算法](#_18)

什么是Ribbon？

Ribbon是Netflix发布的负载均衡器，有助于控制HTTP客户端行为。为Ribbon配置服务提供者地址列表后，Ribbon就可基于负载均衡算法，自动帮助服务消费者请求。

Ribbon默认提供的负载均衡算法：**轮询，随机,重试法,加权**。当然，我们可用自己定义负载均衡算法

# 使用步骤

## 1\)业务分析

![请添加图片描述](https://img-blog.csdnimg.cn/10d3d433fbb640e49568998c7b8b126c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如上图，当用户下单调用`hailtaxi-order`服务的时候，该服务会调用`hailtaxi-driver`，此时如果是抢单过程，查询压力也会很大，我们可以为`hailtaxi-driver`做集群，做集群只需要把工程复制多分即可，多个工程如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bf6cfea80b594cd7ac6d817103a4e90c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2\)调用测试

此时我们用postman执行`http://localhost:18082/order/add`会发现可以发现已经实现负载均衡了，`18081`和`18084`服务会轮询着调用。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5fca1d2182fa48998b67a583f984355b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a2723fc85a9e453aa329d01108a58183.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 算法

我们上面没做任何相关操作，只是把服务换成了多个就实现了负载均衡，这是因为OpenFeign默认使用了Ribbon的轮询算法,如下图依赖包，引入OpenFeign的时候会传递依赖Ribbon包：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a7d875e6693d4a9fa1dca6f7f9337d3b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们如果想改变相关算法，可以直接在消费方，也就是order服务的`application.yml`中配置算法即可。

```yml
#修改负载均衡算法，默认是轮询，配置之后变随机
ribbon:
  #轮询
  NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RoundRobinRule
  #随机算法
  #NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule
  #重试算法,该算法先按照轮询的策略获取服务,如果获取服务失败则在指定的时间内会进行重试，获取可用的服务
  #NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RetryRule
  #加权法,会根据平均响应时间计算所有服务的权重，响应时间越快服务权重越大被选中的概率越大。刚启动时如果同统计信息不足，则使用轮询的策略，等统计信息足够会切换到自身规则。
  #NFLoadBalancerRuleClassName: com.netflix.loadbalancer.ZoneAvoidanceRule
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/57c9b6845de845829abe4244189f9b79.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)