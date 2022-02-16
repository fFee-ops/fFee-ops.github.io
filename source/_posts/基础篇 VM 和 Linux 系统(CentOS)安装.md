---
title: 基础篇 VM 和 Linux 系统(CentOS)安装
date: 2020-04-09 11:25:34
tags: 
categories: Linux
---

<!--more-->

### 基础篇 VM 和 Linux 系统（CentOS）安装

- [安装 vm 和 Centos](#_vm__Centos_1)
- [CentOS 安装的步骤](#CentOS__8)
- [vmtools 的安装和使用](#vmtools__14)

# 安装 vm 和 Centos

学习 Linux 需要一个环境，我们需要创建一个虚拟机，然后在虚拟机上安装一个 Centos 系统来学  
习。  
1\)先安装 virtual machine ,vm12  
2\)再安装 Linux \(CentOS 6.8\)  
3\)原理示意图，这里我们画图说明一下 VM 和 CentOS 的关系。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409110637559.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# CentOS 安装的步骤

1、创建虚拟机\(空间\)  
这里在配置网络连接时，有三种形式，需要大家伙注意 ：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409110842811.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
2、开始安装系统（去网上看教程）

# vmtools 的安装和使用

_**安装 vmtools 的步骤说明**_：  
1.启动虚拟机  
2.中虚拟机——>右键选择“安装VMware Tools”  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409111820186.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
3.centos 会出现一个 vm 的安装包  
4.点击右键解压, 得到一个安装文件  
5.进入该 vm 解压的目录 ，该文件在 /root/桌面/vmware-tools-distrib/下  
6.安装 ./vmware-install.pl  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409111947301.png)  
7.全部使用默认设置即可  
8.需要 reboot 重新启动即可生效

_**使用 vmtools 来设置 windows 和 linux 的共享文件夹：**_  
1、先关了centOS系统，然后在windows上新建一个文件夹，然后在里面新建一个文件。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020040911215339.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
2、然后在vm上设置

虚拟机设置–>选项–>共享文件夹–>总是启用–>添加

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020040911243471.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
3、然后指定主机路径（也就是刚刚新建的文件夹的路径）![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409112448114.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
4、下一步，默认就可以了  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409112500970.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
5、这样就成功了！  
文件系统–>mnt–>hgfs–>share  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200409112525692.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)