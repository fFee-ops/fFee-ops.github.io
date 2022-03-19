---
title: Redis性能压测
date: 2022-03-12 19:23:26
tags:
password:
categories: Redis
---

Redis 的性能测试工具，目前主流使用的是 `redis-benchmark`

# 简介
Redis 官方提供 `redis-benchmark `的工具来模拟 N 个客户端同时发出 M 个请求,可以便捷对服务器进行读写性能压测。

# 语法
redis 性能测试的基本命令如下：
```shell
redis-benchmark [option] [option value]
```
redis 性能测试工具可选参数如下所示：
![在这里插入图片描述](https://img-blog.csdnimg.cn/c9e9fa133dfd40588db42277eeaa0611.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 测试

## 快速测试
```shell
redis-benchmark
```
在安装 Redis 的服务器上，直接执行，不带任何参数，即可进行测试。测试结果如下：
![在这里插入图片描述](https://img-blog.csdnimg.cn/8a42b54f789a4404a16aa6cc76f1778b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
基本可以看到，常用的 GET/SET/INCR 等命令，都在 8W+ QPS 以上

## 精简测试
```shell
redis-benchmark -t set,get,incr -n 1000000 -q
```
通过 -t 参数，设置仅仅测试 SET/GET/INCR 命令
通过 -n 参数，设置每个测试执行 1000000 次操作。
通过 -q 参数，设置精简输出结果。
![在这里插入图片描述](https://img-blog.csdnimg.cn/3817ff43d6f845539df025e523196913.png)

##  实战演练
①打开AOF，策略为always然后进行压测
![在这里插入图片描述](https://img-blog.csdnimg.cn/c7c08bbe771841209dace4130eb44110.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
②关闭AOF进行压测
![在这里插入图片描述](https://img-blog.csdnimg.cn/b1974d8c54af4ceea0e5ee414855745f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**结果分析**
1. 对各种读取操作来说，性能差别不大：get、spop、队列的range等
2. 对写操作影响极大，以set为例，有将近6倍的差距，mset则更大，将近7倍