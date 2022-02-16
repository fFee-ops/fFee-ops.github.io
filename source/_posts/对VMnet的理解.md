---
title: 对VMnet的理解
date: 2020-12-05 11:45:11
tags: 计算机网络
categories: 杂
---

<!--more-->

一个vmnat就相当于一个网络

我们物理机的网卡也可以接到这个vmnat网络里面，访问物理机其实就相当于访问物理机的网卡地址。必须在同一个网络（vmnat）内，才可以通信。  
如果是桥接模式相当于直接把虚拟机和物理机插到同一个交换机上了

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020120511422357.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)