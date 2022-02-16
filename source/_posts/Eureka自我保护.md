---
title: Eureka自我保护
date: 2020-10-18 13:04:17
tags: 
categories: Eureka
---

<!--more-->

### Eureka自我保护

- [故障现象](#_2)
- [导致原因](#_5)
- [怎么禁止自我保护（一般生产环境中不会禁止自我保护）](#_15)
- [测试](#_45)

# 故障现象

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201018125643620.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 导致原因

**为什么会产生 Eureka自我保护机制\?**  
为了防止以下情况： Eurekaclienti可以正常运行,但是与 Eurekaserver网络不通情况下, Eurekaserver立刻将 EurekaClient服务剔除。如果进入了自我保护模式就不会立刻删除服务。

**什么是自我保护模式\?**

- 默认情况下,如果 EurekaServer在一定时间内没有接收到某个微服务实例的心跳,EurekaServer’将会注销该实例\(默认90秒\)。
- 但是当网络分区故障发生时、卡顿、拥挤\)时,微服务与 Eureka Server,之间无法正常通信,以上行为可能变得非常危险了——因为微服务本身其实是健康的,此时本不应该注销这个微服务。
- Eureka通过“自我保护模式”来解决这个问题——当 EurekaServer节点在短时间内丢失过多客户端时\(可能发生了网络分区故障\),那么这个节点就会进入自我保护模式。

# 怎么禁止自我保护（一般生产环境中不会禁止自我保护）

这里只修改7001和8001、7002和8002是同理的

**注册中心eureakeServer端7001：**

出厂默认，自我保护机制是开启的

```yml
eureka.server.enable-self-preservation = true
```

```yml
使用eureka.server.enable-self-preservation = false可以禁用自我保护模式

server:
  enable-self-preservation: false
  eviction-interval-timer-in-ms: 2000
```

---

**生产者客户端eureakeClient端8001**

> eureka.instance.lease-renewal-interval-in-seconds=30单位为秒（默认是30秒）  
>   
> eureka.instance.lease-expiration-duration-in-seconds=90单位为秒（默认是90秒）

修改yml

```yml
instance:
    lease-renewal-interval-in-seconds:  1
   lease-expiration-duration-in-seconds:  2
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020101813031517.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 测试

1、7001和8001都配置完成  
2、先启动7001再启动8001  
3、先关闭8001  
会发现8001马上被删除了。