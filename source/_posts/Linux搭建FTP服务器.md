---
title: Linux搭建FTP服务器
date: 2020-05-27 21:02:13
tags: 
categories: Linux
---

<!--more-->

### 文章目录

- [什么是FTP](#FTP_2)
- [Linux中的FTP服务](#LinuxFTP_11)
- - [安装FTP](#FTP_27)
  - [文件配置](#_33)
  - [配置允许匿名用户上传的FTP服务](#FTP_51)
  - [解决普通的FTP无法登入问题](#FTP_57)
  - [匿名用户登录示例](#_67)
  - [普通用户登录示例](#_70)
  - [FTP访问常用命令](#FTP_73)

# 什么是FTP

文件传输协议（File Transfer Protocol，FTP）是用于在网络上进行文件传输的一套标准协议，它工作在 OSI 模型的第七层， TCP 模型的第四层， 即应用层， 使用 TCP 传输而不是 UDP。

---

FTP允许用户以文件操作的方式（如文件的增、删、改、查、传送等）与另一主机相互通信。然而， 用户并不真正登录到自己想要存取的计算机上面而成为完全用户， 可用FTP程序访问远程资源， 实现用户往返传输文件、目录管理以及访问电子邮件等等， 即使双方计算机可能配有不同的操作系统和文件存储方式

---

# Linux中的FTP服务

**首先要保证Linux和Win能Ping通**  
如果ping不通见：[解决方案](https://blog.csdn.net/qq_21040559/article/details/105962099)

---

在linux中使用的FTP是vsftp

```
FTP可以有三种登入方式分别是：
	匿名登录方式：不需要用户密码
	本地用户登入：使用本地用户和密码登入
	虚拟用户方式：也是使用用户和密码登入，但是该用户不是linux中创建的用户
```

## 安装FTP

使用yum安装

```shell
yum  install vsftpd -y
```

## 文件配置

安装完之后在/etc/vsftpd/路径下会存在三个配置文件。

```shell
ftpusers: 指定哪些用户不能访问FTP服务器,这里的用户包括root在内的一些
重要用户。

vsftpd.conf: 主配置文件

user_list: 指定的用户是否可以访问ftp服务器，通过vsftpd.conf文件
中的userlist_deny的配置来决定配置中的用户是否可以访问，
userlist_enable=YES ，
userlist_deny=YES ，
userlist_file=/etc/vsftpd/user_list 
这三个配置允许文件中的用户访问FTP。
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527205002586.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

## 配置允许匿名用户上传的FTP服务

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527205141741.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527205257783.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

## 解决普通的FTP无法登入问题

linux默认是带安全机制，使用普通的ftp 21端口无法连接到ftp服务器，使用sftp就可以。这个时候需要关闭selinux，修改配置文件需要重启服务器。

```shell
vim /etc/sysconfig/selinux
```

改成selinux=disabled

---

## 匿名用户登录示例

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052720553599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 普通用户登录示例

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527205615337.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## FTP访问常用命令

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527205634461.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)