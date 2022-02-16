---
title: Linux 的目录结构
date: 2020-04-09 11:34:23
tags: 
categories: Linux
---

<!--more-->

### Linux 的目录结构

- [基本介绍](#_2)
- [目录结构的具体介绍](#_8)
- [Linux 目录总结](#Linux__14)

# 基本介绍

linux 的文件系统是采用级层式的树状目录结构，在此结构中的最上层是根目录“/”，然后在此目录下再创建其他的目录。  
深刻理解 linux 树状文件目录是非常重要的，这里我给大家说明一下。

记住一句经典的话：在 Linux 世界里，一切皆文件。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409112819587.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 目录结构的具体介绍

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409112902398.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409112917522.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409112938464.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

# Linux 目录总结

1.  linux 的目录中有且只要一个根目录 /
2.  linux 的各个目录存放的内容是规划好，不用乱放文件。
3.  linux 是以文件的形式管理我们的设备，因此 linux 系统，一切皆为文件。
4.  linux 的各个文件目录下存放什么内容，必须有一个认识。
5.  学习后，脑海中应该有一颗 linux 目录树