---
title: SpringCloudAlibaba→Nacos：负载均衡
date: 2021-12-12 14:31:51
tags: spring cloud 负载均衡 java
categories: SpringCloudAlibaba
---

<!--more-->

### Nacos负载均衡

- - [1\)初始化负载均衡算法](#1_14)
  - [2\)权重配置](#2_29)
  - [3\)测试](#3_36)
  - [4\)注意的点](#4_44)

整个项目的架构图还是：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8777501119274bc9b799cbcda387d136.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/deab099982a244c5a7253fc2dda92401.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如上图，如果此时用户打车成功，会调用订单服务，订单服务会修改司机状态，此时会调用 `hailtaxi-driver` ，如果是生产环境，每个节点一定是集群状态，比如有2个 `hailtaxi-driver` 节点，此时如何实现负载均衡？  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1b52385bd1f7484c9fdfca4959ddf4e2.png)

我们可以发现服务注册到Nacos中，有一个权重属性，这个权重属性就是Nacos的负载均衡机制，此时需要用到`Nacos`的负载均衡策略 NacosRule ，我们可以在程序中先初始化负载均衡算法，再到bootstrap.yml中配置权重。

## 1\)初始化负载均衡算法

在`hailtaxi-order`的主启动类中初始化负载均衡算法：

```java
    /***
     * 负载均衡算法
     */
    @Scope(value = "prototype")
    @Bean
    public IRule nacosRule() {
        return new NacosRule();
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/094ac00d88da431c8a1ef92a0c8b912a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2\)权重配置

为了演示集群效果，我们把 hailtaxi-driver 复制2份，端口分别为18081、18083  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4ba80da703d44bf6b8d572275c2acc60.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

在上图我们配置了18083的权重，再来`bootstrap.yml`中配置18081的权重：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a87133bc073449c6af4678e58a40f876.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3\)测试

为了方便查看调用了哪个节点，我们把每个节点的端口号输出。然后启动三个项目，再请求打车测试发现服务切换以1:2的调用比例执行。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2ba55d32057a4a4bb40f5087aca54d5a.png)

---

![在这里插入图片描述](https://img-blog.csdnimg.cn/5c0e81fdf5a1476e8de36c4e04600abf.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fedf36e784cb406babd5cba75d9bf9b0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4\)注意的点

如果我们把算法`NacosRule()`注释，默认就是和 Ribbon 集成，和 Ribbon 默认开启，可以通过如下配置实现关闭或开启：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e7ec6c644e434d58a22e38aa5fc6231c.png)