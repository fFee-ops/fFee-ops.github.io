---
title: Redis发布订阅
date: 2020-09-06 09:27:59
tags: 
categories: Redis
---

<!--more-->

### Redis发布订阅

- [简介](#_2)
- [常用命令](#_18)
- [应用场景](#_33)

# 简介

Redis 发布订阅\(pub/sub\)是一种消息通信模式：发送者\(pub\)发送消息，订阅者\(sub\)接收消息。 Redis 客户端可以订阅任意数量的频道。

---

下图展示了频道 channel1 ， 以及订阅这个频道的三个客户端 —— client2 、 client5 和 client1 之间的关系  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020090609185115.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

  
  
  
  
当有新消息通过 PUBLISH 命令发送给频道 channel1 时， 这个消息就会被发送给订阅它的三个客户端：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906091955264.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

# 常用命令

```sql
订阅频道：
SUBSCRIBE channel [channel ...] :订阅给定的一个或多个频道的信息
PSUBSCRIBE pattern [pattern ...] :订阅一个或多个符合给定模式的频道。

发布频道：
PUBLISH channel message :将信息发送到指定的频道。

退订频道：
UNSUBSCRIBE [channel [channel ...]] :指退订给定的频道。
PUNSUBSCRIBE [pattern [pattern ...]]:退订所有给定模式的频道。
```

# 应用场景

微博，每个用户的粉丝都是该用户的订阅者，当用户发完微博，所有粉丝都将收到他的动态；

新闻，资讯站点通常有多个频道，每个频道就是一个主题，用户可以通过主题来做订阅\(如RSS\)，这样当新闻发布时，订阅者可以获得更新