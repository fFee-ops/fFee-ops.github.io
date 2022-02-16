---
title: 热点key
date: 2020-09-07 15:26:27
tags: 
categories: Redis
---

<!--more-->

### 热点key

- [简介](#_1)
- [解决办法](#_4)
- [案例](#_14)

# 简介

**某个key访问非常频繁**，当key失效的时候有大量线程来构建缓存，导致负载增加，系统崩溃。（可以理解为新浪微博头条）

# 解决办法

1 使用锁，单机用synchronized,lock等，分布式用分布式锁。

2 缓存过期时间不设置，而是设置在key对应的value里。如果检测到存的时间超过过期时间则异步更新缓存。

3在value设置一个比过期时间t0小的过期时间值t1，当t1过期的时候，延长t1并做更新缓存操作。

4设置标签缓存，标签缓存设置过期时间，标签缓存过期后，需异步地更新实际缓存

# 案例

假设并发有10000个请求，想达到第一次请求从数据库中获取，其他9999个请求从redis中获取这种效果  

**解决方案：**

```java
public synchronized User selectById(String id) :synchronized
```

使用互斥锁排队  
业界比价普遍的一种做法，即根据key获取value值为空时，锁上，从数据库中load数据后再释放锁。若其它线程获取锁失败，则等待一段时间后重试。这里要注意，分布式环境中要使用分布式锁，单机的话用普通的锁（synchronized、Lock）就够了。

**双重检测锁压测**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200907152349276.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
有1w人同时访问这个key，那么首先放行一个人，让他去数据库中查询到数据，并且放入redis缓存中。这样以后的9999人就不用排队了