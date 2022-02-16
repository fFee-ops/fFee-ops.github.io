---
title: Redis写入数据但是可视化工具看不到
date: 2021-01-12 16:44:50
tags: 
categories: 踩坑
---

<!--more-->

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210112164358829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
今天redis在客户端写入数据，但是可视化工具看不到，用可视化工具写入数据，客户端读取不到。

**解决：把redis版本换成5.0.0**