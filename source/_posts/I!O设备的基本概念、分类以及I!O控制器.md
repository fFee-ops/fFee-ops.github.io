---
title: I/O设备的基本概念、分类以及I/O控制器
date: 2020-11-23 08:48:12
tags: 
categories: 操作系统
---

<!--more-->

### I/O设备的基本概念、分类以及I/O控制器

- [I/O设备的基本概念、分类](#IO_6)
- - [什么是I/O设备](#IO_7)
  - [I/O设备的分类](#IO_16)
  - - [按使用特性](#_17)
    - [按传输速率](#_21)
    - [按信息交换单位](#_24)
  - [总结](#_27)
- [I/O控制器](#IO_30)
- - [机械部件](#_33)
  - [设备的电子部件\(I/O控制器\)](#IO_41)
  - [I/O控制器的组成](#IO_47)
  - - [内存映像I/O和寄存器独立编址](#IO_54)
  - [总结](#_58)

![知识总览](https://img-blog.csdnimg.cn/20201123082912731.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# I/O设备的基本概念、分类

## 什么是I/O设备

“I/O”就是“输入/输出”\( Input/ Output\)。  
I/O设备就是可以将数据输入到计算机,或者可以接收计算机输出数据的外部设备,属于计算机中的硬件部件。

UNIX系统将外部设备抽象为一种特殊的文件,用户可以使用与文件操作相同的方式对外部设备进行操作。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123083146661.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## I/O设备的分类

### 按使用特性

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123083214386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123083226826.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

### 按传输速率

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123083250219.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

### 按信息交换单位

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020112308330584.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 总结

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123083320344.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# I/O控制器

![知识总览](https://img-blog.csdnimg.cn/20201123083407877.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 机械部件

I/O设备的**机械部件**主要用来执行具体 I/O操作。  
如我们看得见摸得着的鼠标/键盘的按钮:显示器的LED屏;移动硬盘的磁臂、磁盘盘面。

I/O设备的**电子部件**通常是一块插入主板扩充槽的印刷电路板。

## 设备的电子部件\(I/O控制器\)

CPU无法直接控制I/O设备的机械部件,因此I/O设备还要有一个电子部件作为CPU和I/O设备机械部件之间的“中介”,用于实现CPU对设备的控制。  
这个电子部件就是I/O控制器,又称设备控制器。CPU可控制I/O控制器,由I/O控制器来控制设备的机械部件

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123084321825.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## I/O控制器的组成

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123084359689.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
值得注意的小细节:  
①一个I/O控制器可能会对应多个设备;  
②数据寄存器、控制寄存器、状态寄存器可能有多个\(如:每个控制/状态寄存器对应一个具体的设备\),且这些寄存器都要有相应的地址,才能方便CPU操作。有的计算机会让这些寄存器占用内存地址的一部分,称为**内存映像I/O**;另一些计算机则采用I/O专用地址,即**寄存器独立编址**。

### 内存映像I/O和寄存器独立编址

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020112308453841.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 总结

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123084721925.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)