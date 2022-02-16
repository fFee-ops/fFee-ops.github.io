---
title: JVM简介
date: 2020-09-10 09:59:12
tags: 
categories: JVM底层原理
---

<!--more-->

### JVM简介

- [java跨平台的语言](#java_2)
- - [Java代码执行流程](#Java_5)
- [JVM跨语言的平台](#JVM_9)
- - [字节码](#_15)
- [虚拟机与java虚拟机](#java_25)
- - [虚拟机](#_26)
  - [java虚拟机](#java_31)
- [JVM的位置](#JVM_49)
- [JVM的整体结构](#JVM_54)
- [JVM架构模型](#JVM_57)
- [JVM的生命周期](#JVM_71)

# java跨平台的语言

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200910093256804.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## Java代码执行流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200910094731530.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# JVM跨语言的平台

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200910093321384.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
Java虚拟机根本不关心运行在其内部的程序到底是使用何种编程语言编写的,它只关心 **“字节码”** 文件。  
也就是说Java虚拟机拥有语言无关性,并不会单纯地与Java语言“终身绑定”,只要其他编程语言的编译结果满足并包含Java虚拟机的内部指令集、符号表以及其他的辅助信息,它就是一个有效的字节码文件,就能够被虚拟机所识别并装载运行。

## 字节码

我们平时说的java字节码,指的是用java语言编译成的字节码。准确的说任何能在JVM平台上执行的字节码格式都是一样的。所以应该统称为:**JVM字节码**  
不同的编译器,可以编译出相同的字节码文件,字节码文件也可以在不同的JVM上运行。  
Java虚拟机与Java语言并没有必然的联系,它只与特定的二进制文  
件格式—Class文件格式所关联,Class文件中包含了Java虚拟机指  
令集\(或者称为字节码、 Bytecodes\)和符号表,还有一些其他辅助信息。

# 虚拟机与java虚拟机

## 虚拟机

所谓虚拟机\( Virtual machine\),就是一台虚拟的计算机它是**一款软  
件,** 用来执行一系列虚拟计算机指令。大体上,虚拟机可以分为系统虚拟机和程序虚拟机。

- 大名鼎鼎的 Vi sual Box, VMware就属于**系统虚拟机**,它们完全是对物理计算机的仿真,提供了一个可运行完整操作系统的软件平台。
- 程序虚拟机的典型代表就是Java虚拟机,它专门为执行单个计算机程序而设计,在Java虚拟机中执行的指令我们称为Java字节码指令。无论是系统虚拟机还是程序虚拟机,在上面运行的软件都被限制于虚拟机提供的资源中。

## java虚拟机

- Java虚拟机是一台执行Java字节码的虚拟计算机,它拥有独立的运行机制,其运行的Java字节码也未必由Java语言编译而成。

- JM平台的各种语言可以共享Java虚拟机带来的跨平台性、优秀的垃圾回器,以及可靠的即时编译器

- **Java技术的核心就是Java虚拟机**\(JVM：Java virtual machine\)  
  因为所有的Java程序都运行在Java虚拟机内部。

**作用：**  
**Java虚拟机就是二进制字节码的运行环境**,负责装载字节码到其内部,解释/编译为对应平台上的机器指令执行。每一条Java指令，Java虚拟机规范中都有详细定义,如怎么取操作数,怎么处理操作数,处理结果放在哪里

**特点：**  
一次编译,到处运行  
自动内存管理  
自动垃圾回收功能

# JVM的位置

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200910094516624.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# JVM的整体结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200910094643611.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# JVM架构模型

Java编译器输入的指令流基本上是一种基于栈的指令集架构,另外一种指令集架构则是基于寄存器的指令集架构。

**区别**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200910095035369.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200910095243413.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**总结:**  
由于跨平台性的设计,Java的指令都是根据**栈**来设计的。不同平台CPU架构不同,所以不能设计为基于寄存器的。优点是跨平台,指令集小,编译器容易实现,缺点是性能下降,实现同样的功能需要更多的指令。

# JVM的生命周期

**虚拟机的启动**  
Java虚拟机的启动是通过引导类加载器\( bootstrap class loader\)创建  
个初始类\( initial class\)来完成的,这个类是由虚拟机的具体实现指定的。

**虚拟机的执行**

- 一个运行中的Java虚拟机有着一个清晰的任务:执行Java程序。
- 程序开始执行时他才运行,程序结束时他就停止。
- 执行一个所谓的Java程序的时候,真真正正在执行的是一个叫做Java虚拟机的进程。

**虚拟机的退出**  
有如下的几种情况:

- 程序正常执行结束
- 程序在执行过程中遇到了异常或错误而异常终止
- 由于操作系统出现错误而导致Java虚拟机进程终止
- 某线程调用 Runtime类或 System类的exit方法,或 Runtime类的halt方法,并且Java安全管理器也允许这次exit或halt操作。
- 除此之外,JNI\( Java Native Interface\)规范描述了用JNI  
  Invocation ApI来加载或卸载Java虚拟机时,Java虚拟机的退出情况。