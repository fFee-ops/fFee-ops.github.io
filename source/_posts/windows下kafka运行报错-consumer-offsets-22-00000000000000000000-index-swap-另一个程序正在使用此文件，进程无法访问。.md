---
title: "windows下kafka运行报错:consumer_offsets-22:00000000000000000000.index.swap:另一个程序正在使用此文件，进程无法访问。"
date: 2022-02-06 15:15:08
tags:
password:
categories: 踩坑
---

# 原因
windows上的kafka不太稳定用一段时间后会出现这个问题。

# 解决
删除下列文件夹下的内容，但是文件夹别删除
![在这里插入图片描述](https://img-blog.csdnimg.cn/5a16ecbd4b0841caaa12740abf23c806.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)