---
title: I/O软件层次结构
date: 2020-11-23 09:11:42
tags: 
categories: 操作系统
---

<!--more-->

### I/O软件层次结构

- [用户层软件](#_6)
- [设备独立性软件](#_9)
- [设备驱动程序](#_38)
- [中断处理程序](#_49)
- [总结](#_59)

![知识总览](https://img-blog.csdnimg.cn/20201123090219910.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 用户层软件

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123090316670.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 设备独立性软件

设备独立性软件,又称**设备无关性软件**。与设备的硬件特性无关的功能几乎都在这一层实现。

**主要实现的功能:**  
①向上层提供统一的调用接口\(如read/ write系统调用\)

②设备的保护

> 原理类似与文件保护。设备被看做是一种特殊的文件,不同用户对各个文件的访问权限是不一样的,同理,对设备的访问权限也不一样。

③差错处理

> 设备独立性软件需要对一些设备的错误进行处理

④设备的分配与回收

⑤数据缓冲区管理

> 可以通过缓冲技术屏蔽设备之间数据交换单位大小和传输速度的差异

⑥建立逻辑设备名到物理设备名的映射关系;根据设备类  
型选择调用相应的驱动程序

> 用户或用户层软件发出o操作相关系统调用的系统调用时,需要指明此次要操作的/o设备的逻辑设备名  
> \(eg:去学校打印店打印时,需要选择打印机1/打印机2/打印机3,其实这些都是逻辑设备名\)  
> 设备独立性软件需要通过“逻辑设备表\(LUT, Logical Unit Table\)”来确定逻辑设备对应的物理设备,并找到该设备对应的设备驱动程序  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123090632782.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)操作系统系统可以采用两种方式管理逻辑设备表\(LUT\)  
> 第一种方式,**整个系统只设置一张LUT**,这就意味着所有用户不能使用相同的逻辑设备名,因此这种方式只适用于单用户操作系统。  
> 第二种方式,为**每个用户设置一张LUT**,各个用户使用的逻辑设备名可以重复,适用于多用户操作系统。系统会在用户登录时为其建立一个用户管理进程,而LUT就存放在用户管理进程的PCB中。

# 设备驱动程序

**为什么要设备驱动程序**  
不同设备的内部硬件特性也不同,这些特性只有厂家才知道,因此厂家须提供与设备相对应的驱动程序,CPU执行驱动程序的指令序列,来完成设置设备寄存器,检查设备状态等工作。

主要负责对硬件设备的具体控制,将上层发出的一系列命令\(如read/ write\)转化成特定设备“能听得懂”的一系列操作。包括设置设备寄存器;检查设备状态等  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123090902821.png#pic_center)  
**注:驱动程序一般会以一个独立进程的方式存在。**

# 中断处理程序

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123091022329.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
用户通过调用用户层软件提供的库函数发出的/请求  
→用户层软件通过“系统调用”请求设备独立性软件层的服务  
→设备独立性软件层根据LUT调用设备对应的驱动程序  
→驱动程序向JO控制器发出具体命令  
→等待Jo完成的进程应该被阻塞,因此需要进程切换,而进  
程切换必然需要中断处理

# 总结

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123091112701.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)