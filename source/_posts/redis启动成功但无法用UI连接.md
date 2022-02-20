---
title: redis启动成功但无法用UI连接
date: 2022-02-19 18:41:05
tags:
password:
categories: 踩坑
---

**问题描述：**
系统为CentOS7.9，已经启动了redis，并且用命令行能够成功进入到客户端。
但是无法使用图形化界面进行远程链接。
一直报错
![在这里插入图片描述](https://img-blog.csdnimg.cn/4a9fcbfb3bae4a50840b4e395d891750.png)
**问题排查**

1. 防火墙是不是没打开
2. 有没有注释掉redis.conf的`bind 127.0.0.1`
3. 启动时候有没有指定配置文件
4. 需要关闭保护模式，即修改redis.conf中的`protected-mode no `（这就是我本次的问题，我配置文件中是yes）

解决后成功连接
![在这里插入图片描述](https://img-blog.csdnimg.cn/39255e67b3bb48dda62c86ff28fa1b81.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)