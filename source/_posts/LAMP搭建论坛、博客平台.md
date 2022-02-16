---
title: LAMP搭建论坛、博客平台
date: 2020-06-13 13:19:10
tags: 
categories: Linux
---

<!--more-->

### 文章目录

- [什么是LAMP](#LAMP_2)
- [搭建论坛](#_6)
- [搭建博客](#_124)

# 什么是LAMP

LAMP 是指Linux（操作系统）+ Apache （HTTP 服务器）+ MySQL/MariaDB（数据库）和 PHP（网络编程语言），一般用来建立 web 应用平台。

# 搭建论坛

1、首先确保你的linux能连上外网

```shell
ping www.qq.com
```

2、安装http服务软件，并启动服务

```shell
 yum install  httpd  httpd-devel  httpd-tools  -y

开机自启：systemctl  enable  httpd

启动服务： systemctl  start  httpd

```

3、安装MariaDB以及启动服务

```shell
yum install  mariadb mariadb-devel  mariadb-server  -y

开机自启：systemctl  enable  mariadb 

启动服务： systemctl  start  mariadb 
```

4、安装php支持

```shell
yum install php  php-mysql  php-devel  -y
```

5、由于是测试环境 所以直接关闭防火墙和selLinux

```shell
停止firewall：systemctl stop firewalld.service
禁止firewall开机启动：systemctl disable firewalld.service 


关闭SELinux：
①临时关闭：
##设置SELinux 成为permissive模式
##setenforce 1 设置SELinux 成为enforcing模式
setenforce 0

②永久关闭：
vi /etc/selinux/config
将SELINUX=enforcing改为SELINUX=disabled
设置后需要重启才能生效
```

6、创建数据库及用户权限

```sql
[root@dhcp ~]# mysql  -uroot -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 2
Server version: 5.5.60-MariaDB MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| auth               |
| mysql              |
| performance_schema |
| test               |
| zabbix             |
+--------------------+
6 rows in set (0.02 sec)

MariaDB [(none)]> create  database  bbs charset=utf8;
Query OK, 1 row affected (0.00 sec)

MariaDB [(none)]> grant  all   on  bbs.*   to   bbs@'localhost'   identified by  'bbs123';
Query OK, 0 rows affected (0.02 sec)

MariaDB [(none)]>


```

7、测试apache网站目录位置

```shell
vi  /var/www/html/test.php



<?php
phpinfo();
?>

=======
systemctl   restart  httpd
```

客户端IE打开测试网页http://ip/test.php  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200613131014656.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

8、将WIN的Discuz\_X3.2\_SC\_UTF8.zip传输到Linux，并且解压移动到/var/www/html/bbs

```shell
[root@dhcp ~]# unzip  Discuz_X3.2_SC_UTF8.zip   -d  /tmp
解决目录移至/var/www/html/bbs
[root@dhcp ~]# mv  /tmp/upload      /var/www/html/bbs
[root@dhcp ~]# cd  /var/www/html/bbs
[root@dhcp bbs]# ls  -l   
设置目录访问的权限
 [root@dhcp bbs]# chmod -R  757 {config/,data/,uc_client/,uc_server/}

```

9、进入到安装页面，完成安装<http://ip/bbs>

# 搭建博客

1、服务上面已经准备好了

2、将压缩包传到LINUX/tmp并且解压缩到/var/www/html/blog

```shell

[在/tmp下执行]
tar xf   wordpress-4.9.4-zh_CN.tar.gz   -C   /usr/src

mv    /usr/src/wordpress     /var/www/html/blog
```

3、 创建一个数据库用来搭建blog，并且将该数据库权限赋予给用户blog  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200613131706399.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
4、进入安装页面<http://ip/blog>

5、 因为系统存在了一个空的wp-config.php，导致安装系统不能创建该文件，所以先删除该文件然后再进入到安装页面将里面的内容复制到新的wp-config.php中，即可开始安装。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200613131825680.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200613131825665.png)

6、完成  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200613131900114.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)