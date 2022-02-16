---
title: 记LINUX无法ping通WIN，但Win可ping通Linux
date: 2020-06-16 11:25:36
tags: 
categories: Linux
---

<!--more-->

### 文章目录

  
今天做LVS负载均衡的时候发现LINUX无法ping通win  
，但相反WIN可ping通LINUX，且Linux可ping通外网。

一番排查后不是网段的问题，也不是防火墙的问题。

原因是：**默认情况下，Windows防火墙和网络设置是禁止文件和打印机共享的，同时不响应其他计算机的ping，只有打开文件和打印机共享后才会响应ping。** 反过来，linux系统默认情况下并不启用防火墙功能，所以对其他计算机的ping是会有响应的。

---

解决：

**启用文件和打印机共享即可。**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200616112435809.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200616112455676.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)