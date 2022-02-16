---
title: >-
  启动RocketMQ生产者报错:rocketmq.remoting.exception.RemotingTooMuchRequestException:sendDefaultImpl
  call timeout
date: 2022-01-31 21:57:22
tags:
password:
categories: 踩坑
---

##  问题复现
学习完rocketmq之后想测试一下生产与消费。刚启动生产者就报错：
`rocketmq.remoting.exception.RemotingTooMuchRequestException: sendDefaultImpl call timeout`

## 原因
看一下`producer.send(msg);`的源码，
![在这里插入图片描述](https://img-blog.csdnimg.cn/787817687a00445a9f736ae50fbf74bd.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/959c85c577a144d7af08b32ae571d4c3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
可以发现是`timeout`值小了，断点调试一下可以看到默认值为`3000`

## 解决
生产者中调大timeout
```java
producer.setSendMsgTimeout(60000);
```