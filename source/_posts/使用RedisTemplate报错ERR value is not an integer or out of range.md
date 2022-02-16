---
title: 使用RedisTemplate报错ERR value is not an integer or out of range
date: 2020-07-23 21:36:11
tags: 
categories: 踩坑
---

<!--more-->

在用RedisTemplate时候报错ERR value is not an integer or out of range,经过排查发现是RedisTemplate操作自增时侯报错。

```java
redisTemplate.opsForValue().increment(keyLoginFail,1);
```

**原因有二：**  
**一：序列化的问题：**  
只有使用StringRedisSerializer序列化器才能使用incrment方法

解决：  
在redis配置中加入以下代码

```java
// 在使用注解@Bean返回RedisTemplate的时候，同时配置hashKey与hashValue的序列化方式。
// key采用String的序列化方式
        template.setKeySerializer(stringRedisSerializer);
// value序列化方式采用jackson
        template.setValueSerializer(jackson2JsonRedisSerializer);
// hash的key也采用String的序列化方式
        template.setHashKeySerializer(stringRedisSerializer);
// hash的value序列化方式采用jackson
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
```

**二：检查是否使用了正确的格式，如 RedisTemplate\<String, String> redisTemplate;\(本次我的问题所在\)**

我之前写的是

```java
  private RedisTemplate<String,Object> redisTemplate;
```

解决：  
改成

```java
  private RedisTemplate<String,String> redisTemplate;
```