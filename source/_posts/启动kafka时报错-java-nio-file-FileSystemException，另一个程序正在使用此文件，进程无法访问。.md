---
title: '启动kafka时报错:java.nio.file.FileSystemException，另一个程序正在使用此文件，进程无法访问。'
date: 2022-01-27 15:16:33
tags:
password:
categories: 踩坑
---

# 解决
删除红框中文件夹下的所有内容再重新启动kafka。但是不要删除掉红框这个文件夹。
![在这里插入图片描述](https://img-blog.csdnimg.cn/e8c9e4831a414e838eab702edb55256d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)