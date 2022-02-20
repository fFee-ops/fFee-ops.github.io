---
title: bitmap类型
date: 2022-02-19 20:23:34
tags:
password:
categories: Redis
---

## 介绍
bitmap 存储的是连续的二进制数字（0 和 1），通过 bitmap, 只需要一个 bit 位来表示某个元素对应的值或者状态，key 就是对应元素本身 。我们知道 8 个 bit 可以组成一个 Byte，所以bitmap 本身会极大的节省储存空间。
bitmap最大为2的32次方个bit
![在这里插入图片描述](https://img-blog.csdnimg.cn/8ec4fbb046c64c51b63ec084ae2e75ad.png)


## 常用命令
 setbit 、 getbit 、 bitcount 、 bitop

## 应用场景
适合需要保存状态信息（比如是否签到、是否登录...）并需要进一步对这些信息进行分析的场景。比如用户签到情况、活跃用户情况、用户行为统计（比如是否点赞过某个视频）。
```shell
# SETBIT 会返回之前位的值（默认是 0）这里会生成 7 个位
127.0.0.1:6379> setbit mykey 7 1
# 返回的是对应下标处原来的值
(integer) 0
127.0.0.1:6379> setbit mykey 7 0
(integer) 1
127.0.0.1:6379> getbit mykey 7
(integer) 0
127.0.0.1:6379> setbit mykey 6 1
(integer) 0
127.0.0.1:6379> setbit mykey 8 1
(integer) 0
# 通过 bitcount 统计被被设置为 1 的位的数量。
127.0.0.1:6379> bitcount mykey
(integer) 2
```
针对上面提到的一些场景，这里进行进一步说明。

**使用场景一：用户行为分析** 
很多网站为了分析你的喜好，需要研究你点赞过的内容。
```shell
# 记录你喜欢过 001 号小姐姐
127.0.0.1:6379> setbit beauty_girl_001 {uid} 1
```

**使用场景二：统计活跃用户**
现在系统有亿级的活跃用户，为了增强用户粘性，该如何实现签到、日活统计？
答：使用时间作为 key，然后用户 ID 为 offset，如果当日活跃过就设置为 1。

那么我该如果计算某几天/月/年的活跃用户呢(暂且约定，统计时间内只要有一天在线就称为活跃)
```shell
# 对一个或多个保存二进制位的字符串 key 进行位元操作，并将结果保存到 一个新的key：destkey 上。
# BITOP 命令operation支持 AND（与） 、 OR（或） 、 NOT（非） 、 XOR（异或） 这四种操作中的任意一种参数
# 假如就2个key，就相当于把key1 key2 两个bitmap的每一位进行对应的操作，再把数据放到一个新bitmap中去
BITOP [operation] destkey key [key ...]
```
例如：
初始化数据
```shell
127.0.0.1:6379> setbit 20210308 1 1
(integer) 0
127.0.0.1:6379> setbit 20210308 2 1
(integer) 0
127.0.0.1:6379> setbit 20210309 1 1
(integer) 0
```
统计 20210308~20210309 在线活跃用户数: 
```shell
127.0.0.1:6379> bitop or desk1 20210308 20210309
(integer) 1
127.0.0.1:6379> bitcount desk1
(integer) 2
```