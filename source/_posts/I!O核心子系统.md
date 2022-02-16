---
title: I/O核心子系统
date: 2020-11-23 09:22:33
tags: 
categories: 操作系统
---

<!--more-->

### I/O核心子系统

- [I/O调度](#IO_12)
- [设备保护](#_19)
- [假脱机技术\( SPOOling技术\)](#_SPOOling_23)
- - [什么是脱机技术](#_27)
  - [原理](#_30)
  - - [输入井和输出井](#_31)
  - [共享打印机原理分析](#_37)
  - [总结](#_44)

![知识总览](https://img-blog.csdnimg.cn/20201123091348491.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123091500213.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

注:假脱机技术\( SPOOLing技术\)需要请求“磁盘设备”的设备独立性软件的服务,因此一般来说假脱机技术是在用户层软件实现的。

# I/O调度

I/O调度:用某种算法确定一个好的顺序来处理各个I/O请求。

如:磁盘调度\(先来先服务算法、最短寻道优先算法、SCAN算法、C-SCAN算法、LOOK算法、C-LOOK算法\)。当多个磁盘I/O请求到来时,用某种调度算法确定满足I/O请求的顺序。  
冋理,打卬机等设备也可以用先来先服务算法、优先级算法、短作业优先等算法来确定I/O调度顺序。

# 设备保护

操作系统需要实现文件保护功能,不同的用户对各个文件有不同的访问权限\(如:只读、读和写等在UNIX系统中,设备被看做是一种特殊的文件,每个设备也会有对应的FCB。当用户请求访问某个设备时,系统根据FCB中记录的信息来判断该用户是否有相应的访问权限,以此实现“设备保护”的功能。\(参考“文件保护”小节\)

# 假脱机技术\( SPOOling技术\)

![知识总览](https://img-blog.csdnimg.cn/20201123091750633.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 什么是脱机技术

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123091821906.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 原理

### 输入井和输出井

“假脱机技术”,又称“ SPOOLing技术”是用软件的方式模拟脱机技术。 SPOOLing系统的组成如下:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123092034549.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123092055170.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 共享打印机原理分析

独占式设备一一只允许各个进程串行使用的设备。一段时间内只能满足一个进程的请求  
共享设备一一允许多个进程“同时”使用的设备\(宏观上同时使用,微观上可能是交替使用\)。可以同时满足多个进程的使用请求。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123092146116.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123092148777.png#pic_center)

## 总结

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123092200247.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)