---
title: string类型
date: 2022-02-19 18:48:20
tags:
password:
categories: Redis
---

# Redis的Key的设计
1. 用:分割
2. 把表名转换为key前缀, 比如: `user:`
3. 第二段放置主键值
4. 第三段放置列名

# string字符串类型
## 介绍
string 数据结构是简单的 key-value 类型。虽然 Redis 是用 C 语言写的，但是 Redis 并没有使用 C 的字符串表示，而是自己构建了一种 简单动态字符串（simple dynamic string，SDS）。相比于 C 的原生字符串，Redis 的 SDS 不光可以保存文本数据还可以保存二进制数据，并且获取字符串长度复杂度为 O(1)（C 字符串为 O(N)）,除此之外,Redis 的 SDS API 是安全的，不会
造成缓冲区溢出。


## 常用命令
set,get,strlen,exists,decr,incr,setex 等等。


## 应用场景
一般常用在需要计数的场景，比如用户的访问次数、热点文章的点赞转发数量等等。

**1)单值缓存**
```shell
SET key value
GET key
```

**2)对象缓存**
假设现在有张表：
![在这里插入图片描述](https://img-blog.csdnimg.cn/0d9965a0fa394a4283e64fca55679c08.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_10,color_FFFFFF,t_70,g_se,x_16)
我们要将这个表中的一条数据作为一个对象存储起来，在redis中有下列两种选择：
![在这里插入图片描述](https://img-blog.csdnimg.cn/75edc249f0504561a517a6500a7e3c24.png)
第一种方式有一个缺点，假如我现在只想修改name，那么我需要把整个json拿出来反序列化成对象，修改后又序列化成json。对性能损耗比较大。所以主要用第二种。
```shell
MSET user:1:name zimu user:1:balance 1888
MGET user:1:name user:1:balance
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/434e1e327fae45698a645a3174557935.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/539ecb7c34c444dcaf84cc93193977aa.png)

**3)分布式锁（「SET if Not eXists」）**
```shell
SETNX product:10001 true // 返回1代表获取锁成功
SETNX product:10001 false // 返回0代表获取锁失败
.......执行业务操作
DEL product:10001 // 执行完业务 释放锁
SET product:10001 true ex 10 nx // 防止程序意外终止导致死锁
```

**4)计数器**
![在这里插入图片描述](https://img-blog.csdnimg.cn/c16a4d7888fd48f8bfbeee5c6d50db70.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)