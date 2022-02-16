---
title: idea的参数显示问题
date: 2020-10-12 14:50:37
tags: 
categories: 踩坑
---

<!--more-->

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201012144810927.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

别人的方法形参提示都是形参名，我的就是String，boolean等类型，这是因为该方法的源码中\(**未下载版本**\)的形参就是String，boolean，你需要打开该源码 在IDEA中下载 就好了。

左Ctrl+鼠标左键打开该方法的源码，如果没下载IDEA会自动提示你下载的