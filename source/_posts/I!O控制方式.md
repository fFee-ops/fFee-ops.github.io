---
title: I/O控制方式
date: 2020-11-23 09:01:41
tags: 
categories: 操作系统
---

<!--more-->

### I/O控制方式

- [程序直接控制](#_7)
- [中断驱动方式](#_27)
- [DMA方式](#DMA_37)
- - [DMA控制器](#DMA_63)
- [通道控制方式](#_68)
- [总结](#_87)

![知识总览](https://img-blog.csdnimg.cn/20201123084847776.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 程序直接控制

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123084922775.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123085006346.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
1.CPU干预的频率  
很频繁,I/O操作开始之前、完成之后需要CPU介入,并且在等待I/O完成的过程中CPU需要不断地轮询检查。

2.数据传送的单位  
每次读/写**一个字**

3.数据的流向  
读操作\(数据输入\):I/O设备→CPU（指的是CPU寄存器）→内存  
写操作\(数据输出\):内存→CPU（指的是CPU寄存器）→I/O设备  
每个字的读/写都需要CPU的帮助

4.主要缺点和主要优点  
**优点:** 实现简单。在读/写指令之后,加上实现循环检查的系列指令即可\(因此才称为“程序直接控制方式”\)

**缺点:** CPU和I/O设备只能串行工作,CPU需要一直轮询检查长期处于“忙等”状态,CPU利用率低。

# 中断驱动方式

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123085306707.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

引入中断机制。由于I/O设备速度很慢,因此在CPU发出读/写命令后,可将等待I/O的进程阻塞,先切换到别的进程执行。当I/O完成后,控制器会向CPU发出一个中断信号,CPU检测到中断信号后,会保存当前进程的运行环境信息,转去执行中断处理程序处理该中断。处理中断的过程中,CPU从I/O控制器读一个字的数据传送到CPU寄存器,再写入主存。接着,CPU恢复等待I/O的进程\(或其他进程\)的运行环境,然后继续执行。

①CPU会在每个指令周期的末尾检查中断  
②中断处理过程中需要保存、恢复进程的运行环境,这个过程是需要一定时间开销的。可见,如果中断发生的频率太高,也会降低系统性能。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123085427230.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# DMA方式

与“中断驱动方式”相比,DMA方式\( Direct Memory Access,直接存储器存取。主要用于块设备的I/O控制\)有这样几个改进:

①数据的传送单位是“块”。不再是一个字、一个字的传送;  
②数据的流向是从设备直接放入内存,或者从内存直接到设备。不再需要CPU作为“快递小哥  
③仅在传送一个或多个数据块的开始和结束时,才需要CPU干预。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020112308551644.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
1.CPU干预的频率  
仅在传送一个或多个数据块的开始和结束时,才需要CPU干预。

2.数据传送的单位  
每次读/写一个或多个块\(注意:每次读写的只能是**连续的多个块**且这些块读入内存后在**内存中也必须是连续**的\)

3.数据的流向\(**不再需要经过CPU**\)  
读操作\(数据输入\):I/O设备→内存  
写操作\(数据输出\):内存→I/O设备

4.主要缺点和主要优点  
**优点:** 数据传输以“块”为单位,CPU介入频率进一步降低。数据的传输不再需要先经过CPU再写入内存,数据传输效率进一步增加。CPU和I/O设备的并行性得到提升。

**缺点:** CPU每发出一条I/O指令,只能读/写一个或多个连续的数据块。  
如果要读/写多个离散存储的数据块,或者要将数据分别写到不同的内存区域时,CPU要分别发出多条I/O指令,进行多次中断处理才能完成。

## DMA控制器

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123085535635.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 通道控制方式

**通道:** 一种硬件,可以理解为是“弱鸡版的CPU（与CPU相比,通道可以执行的指令很单一,并且通道程序是放在主机内存中的,也就是说通道与CPU共享内存）”。通道可以识别并执行一系列通道指令  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123085921267.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123090002475.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
1.CPU干预的频率  
极低,通道会根据CPU的指示执行相应的通道程序,只有完成一组数据块的读/写后才需要发出中断信号,请求CPU干预。

2.数据传送的单位  
每次读/写一组数据块

3.数据的流向\(在通道的控制下进行\)  
读操作\(数据输入\):I/O设备→内存  
写操作\(数据输出\):内存→I/O设备

5.主要缺点和主要优点  
**缺点:** 实现复杂,需要专门的通道硬件支持  
**优点:** CPU、通道、I/O设备可并行工作,资源利用率很高。

# 总结

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123090107441.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)