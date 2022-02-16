---
title: Nginx的安装
date: 2020-10-11 00:03:12
tags: 
categories: Nginx
---

<!--more-->

### Nginx的安装

**1、准备工作**  
（1）打开虚拟机，使用远程连接工具连接 linux 操作系统  
（2）到 nginx 官网下载软件；[Nginx下载地址](http://nginx.org/)

**2、开始进行 nginx 安装**  
（1）安装 pcre 依赖  
第一步 联网下载 pcre 压缩文件依赖

```shell
wget http://downloads.sourceforge.net/project/pcre/pcre/8.37/pcre-8.37.tar.gz
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010235234318.png#pic_center)  
第二步 解压压缩文件  
使用命令

```shell
tar –zxvf pcre-8.37.tar.gz
```

第三步 进入解压缩目录执行

```shell
./configure 
```

完成后，执行

```shell
make && make install
如果这一步报错*** No targets specified and no makefile found. Stop. 

则先去安装gcc
```

可以查看版本来检查是否安装成功  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010235654840.png#pic_center)

（2）安装 openssl 、zlib 、 gcc 依赖

```shell
yum -y install make zlib zlib-devel gcc-c++ libtool openssl openssl-devel
```

（3）安装 nginx  
1、 解压缩 nginx-xx.tar.gz 包。  
2、 进入解压缩目录，执行./configure。  
3、 make \&\& make install

在/usr/local/nginx/sbin 目录下执行 ./nginx 来启动Nginx

---

如果能看到这个页面就是启动成功  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011000232565.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
在 windows 系统中访问 linux 中 nginx，默认不能访问的，因为防火墙问题  
（1）关闭防火墙  
（2）开放访问的端口号，80 端口

> 查看开放的端口号  
> firewall-cmd \--list-all  
> 设置开放的端口号  
> firewall-cmd \--add-service=http –permanent  
> firewall-cmd \--add-port=80/tcp \--permanent  
> 重启防火墙  
> firewall-cmd –reload