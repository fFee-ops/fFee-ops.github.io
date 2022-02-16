---
title: Linux 磁盘分区、挂载
date: 2020-04-17 13:13:00
tags: 
categories: Linux
---

<!--more-->

### Linux 磁盘分区、挂载

- [分区基础知识](#_2)
- - [分区的方式](#_3)
  - [windows 下的磁盘分区](#windows__13)
- [Linux分区](#Linux_15)
- - [原理介绍](#_16)
  - [硬盘说明](#_21)
- [挂载经典案例](#_35)
- - [如何增加一块硬盘](#_37)
  - - [具体步骤](#_47)
- [磁盘情况查询](#_74)
- - [查询系统整体磁盘使用情况](#_75)
  - [查询指定目录的磁盘占用情况](#_82)
- [磁盘情况-工作实用指令](#_95)

# 分区基础知识

## 分区的方式

1.  mbr 分区:  
    1.最多支持四个主分区  
    2.系统只能安装在主分区  
    3.扩展分区要占一个主分区  
    4.MBR 最大只支持 2TB，但拥有最好的兼容性
2.  gtp 分区:  
    1.支持无限多个主分区（但操作系统可能限制，比如 windows 下最多 128 个分区）  
    2.最大支持 18EB 的大容量（1EB=1024 PB，1PB=1024 TB ）  
    3.windows7 64 位以后支持 gtp

## windows 下的磁盘分区

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417125253762.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# Linux分区

## 原理介绍

1.  Linux 来说无论有几个分区，分给哪一目录使用，它归根结底就只有一个根目录，一个独立且唯一的文件结构 , Linux 中每个分区都是用来组成整个文件系统的一部分。
2.  Linux 采用了一种叫“载入”的处理方法，它的整个文件系统中包含了一整套的文件和目录， 且将一个分区和一个目录联系起来。这时要载入的一个分区将使它的存储空间在一个目录下获得。  
    3\)示意图  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/2020041712535123.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 硬盘说明

```
1)	Linux 硬盘分 IDE 硬盘和 SCSI 硬盘，目前基本上是 SCSI 硬盘

2)对于 IDE 硬盘，驱动器标识符为“hdx~”,其中“hd”表明分区所在设备的类
型，这里是指 IDE 硬盘了。“x”为盘号（a 为基本盘，b 为基本从属盘，c 为辅
助主盘，d 为辅助从属盘）,“~”代表分区，前四个分区用数字 1 到 4 表示，它
们是主分区或扩展分区，从 5 开始就是逻辑分区。例，hda3 表示为第一个 IDE
硬盘上的第三个主分区或扩展分区,hdb2 表示为第二个 IDE 硬盘上的第二个主分
区或扩展分区。

3)对于 SCSI 硬盘则标识为“sdx~”，SCSI 硬盘是用“sd”来表示分区所在设备的
类型的，其余则和 IDE 硬盘的表示方法一样。
```

# 挂载经典案例

需求是给我们的 Linux 系统增加一个新的硬盘，并且挂载到/home/newdisk![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417125922130.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 如何增加一块硬盘

```
1)虚拟机添加硬盘
2)分区	fdisk                 /dev/sdb
3)格式化	mkfs	-t ext4	/dev/sdb1
4)挂载	先创建一个  /home/newdisk, 挂 载  mount	/dev/sdb1	/home/newdisk
5)设置可以自动挂载(永久挂载，当你重启系统，仍然可以挂载到 /home/newdisk) 。
vim	/etc/fstab
/dev/sdb1	/home/newdisk	ext4	defaults	0 0
```

### 具体步骤

1、在【虚拟机】菜单中，选择【设置】，然后设备列表里添加硬盘，然后一路【下一步】，中间只有选择磁盘大小的地方需要修改，至到完成。然后重启系统（才能识别）！![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417130143722.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
2、

```
分区命令	fdisk	/dev/sdb
开始对/sdb 分区
•	m	显示命令列表
•	p	显示磁盘分区 同 fdisk	–l
•	n	新增分区
•	d	删除分区
•	w	写入并退出
```

说明： 开始分区后输入 n，新增分区，然后选择 p ，分区类型为主分区。两次回车默认剩余全部空间。最后输入 w 写入分区并退出，若不保存退出输入 q。![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417130335854.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
3、  
格式化磁盘  
分区命令:mkfs \-t ext4 /dev/sdb1  
其中 ext4 是分区类型  
4、

```
挂载: 将一个分区与一个目录联系起来，
•	mount	设备名称	挂载目录
•	例如：  mount	/dev/sdb1	/newdisk
•	umount	设备名称  或者	挂载目录
•	例如：	umount	/dev/sdb1 或 者  umount	/newdisk
```

5、  
永久挂载: 通过修改/etc/fstab 实现挂载添加完成后 执行 mount –a 即刻生效![在这里插入图片描述](https://img-blog.csdnimg.cn/202004171304558.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 磁盘情况查询

## 查询系统整体磁盘使用情况

基本语法  
df \-h  
应用实例  
查询系统整体磁盘使用情况

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417130655707.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 查询指定目录的磁盘占用情况

• 基本语法  
du \-h /目录  
查询指定目录的磁盘占用情况，默认为当前目录  
\-s 指定目录占用大小汇总  
\-h 带计量单位  
\-a 含文件  
–max-depth=1 子目录深度

\-c 列出明细的同时，增加汇总值  
• 应用实例  
查询 /opt 目录的磁盘占用情况，深度为 1  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020041713080229.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 磁盘情况-工作实用指令

```
统计某文件夹下文件的个数
ls -l |grep "^-"|wc -l

统计某文件夹下目录的个数
ls -l |grep "^ｄ"|wc -l

统计文件夹下文件的个数，包括子文件夹里的
ls -lR|grep "^-"|wc -l

如统计/home/han目录(包含子目录)下的所有js文件则：
ls -lR /home/han|grep js|wc -l 或 ls -l "/home/han"|grep "js"|wc -l

统计文件夹下目录的个数，包括子文件夹里的
ls -lR|grep "^d"|wc -l
说明：
ls -lR
长列表输出该目录下文件信息(R代表子目录注意这里的文件，不同于一般的文件，可能是目录、链接、设备文件等)

grep "^-"
这里将长列表输出信息过滤一部分，只保留一般文件，如果只保留目录就是 ^d

wc -l
统计输出信息的行数，因为已经过滤得只剩一般文件了，所以统计结果就是一般文件信息的行数，又由于一行信息对应一个文件，所以也就是文件的个数。
```

---

**如果只查看文件夹  
ls \-d 只能显示一个.  
find \-type d 可以看到子文件夹  
ls \-lF |grep / 或 ls \-l |grep ‘\^d’ 只看当前目录下的文件夹，不包括往下的文件夹**