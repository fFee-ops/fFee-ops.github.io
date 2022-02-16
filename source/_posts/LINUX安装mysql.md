---
title: LINUX安装mysql
date: 2020-07-09 22:39:17
tags: 
categories: MySQL
---

<!--more-->

### 文章目录

- [MySQL的版本](#MySQL_2)
- [安装步骤](#_8)
- [服务启动关闭](#_29)
- [存放目录与配置文件详解](#_57)
- [字符编码设置](#_84)

# MySQL的版本

5.x:  
5.0-5.1:早期产品的延续，升级维护  
5.4 \- 5.x : MySQL整合了三方公司的新存储引擎 （推荐5.5）

# 安装步骤

1、先把Mysql客户端服务端传到LINUX

2、

```
安装：rpm -ivh rpm软件名
```

- 如果安装时 与某个软件 xxx冲突，则需要将冲突的软件卸载掉：  
  yun \-y remove xxx

- 安装时 有日志提示我们可以修改密码：/usr/bin/mysqladmin \-u root password ‘new-password’

**注意：**  
如果提示“GPG keys…”安装失败，解决方案：  
rpm \-ivh rpm软件名 \--force \--nodoeps

3、验证是否安装成功  
mysqladmin \--version

# 服务启动关闭

启动：

```shell
 service mysql start
```

关闭：

```shell
 service mysql stop
```

重启：

```shell
service mysql restart
```

在计算机reboot后 登陆MySQL : mysql  
可能会报错： “/var/lib/mysql/mysql.sock不存在”

**原因**：是Mysql服务没有启动  
**解决** ：  
启动服务：  
1.每次使用前 手动启动服务 /etc/init.d/mysql start  
2.开机自启 chkconfig mysql on  
开机不自启 chkconfig mysql off  
检查开机是否自动启动： ntsysv

给mysql 的超级管理员root 增加密码：/usr/bin/mysqladmin \-u root password root

# 存放目录与配置文件详解

```shell
ps -ef|grep mysql  
```

可以看到：

```
数据库目录：     datadir=/var/lib/mysql 
pid文件目录： --pid-file=/var/lib/mysql/bigdata01.pid


MySQL核心目录：
			/var/lib/mysql :mysql 安装目录
			/usr/share/mysql:  配置文件
			/usr/bin：命令目录（mysqladmin、mysqldump等）
			/etc/init.d/mysql启停脚本

 MySQL配置文件
			 my-huge.cnf	高端服务器  1-2G内存
			 my-large.cnf   中等规模
			 my-medium.cnf  一般
			 my-small.cnf   较小
			但是，以上配置文件mysql默认不能识别，默认只能识别 /etc/my.cnf
			采用 my-huge.cnf ：
			cp /usr/share/mysql/my-huge.cnf /etc/my.cnf
			注意：mysql5.5默认配置文件/etc/my.cnf；Mysql5.6 默认配置文件/etc/mysql-default.cnf

```

# 字符编码设置

查看编码：

```sql
show variables like '%char%' ;
```

可以发现部分编码是 latin,需要统一设置为utf-8

```shell
vi /etc/my.cnf:

[mysql]
		default-character-set=utf8
		[client]
		default-character-set=utf8
		
		[mysqld]
		character_set_server=utf8
		character_set_client=utf8
		collation_server=utf8_general_ci

```

**注意：修改编码 只对“之后”创建的数据库生效，因此建议 在mysql安装完毕后，第一时间 统一编码。**