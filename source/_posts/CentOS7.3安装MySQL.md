---
title: CentOS7.3安装MySQL
date: 2020-12-28 19:59:12
tags: zk zookeeper 分布式
categories: Linux
---

<!--more-->

### CentOS7.3安装MySQL

```shell
# 查看系统中是否已安装 MySQL 服务：
rpm -qa | grep mysql
或
yum list installed | grep mysql

# 如果已安装则删除 MySQL 及其依赖的包：
yum -y remove mysql-libs.x86_64

# 查找mysql相关目录，并rm -rf 它们
find / -name mysql

# 删除/etc/my.cnf
rm -rf /etc/my.cnf

# 删除/var/log/mysqld.log（如果不删除这个文件，会导致新安装的mysql无法生存新密码，导致无法登陆）
rm -rf /var/log/mysqld.log
============================================

# 下载 mysql57-community-release-el7-8.noarch.rpm 的 YUM 源：
wget http://repo.mysql.com/mysql57-community-release-el7-8.noarch.rpm

# 安装 mysql57-community-release-el7-8.noarch.rpm：
rpm -ivh mysql57-community-release-el7-8.noarch.rpm

# 安装 MySQL：
yum install mysql-server
```

安装完毕后，执行`service mysqld start`启动数据库服务，会在 `/var/log/mysqld.log` 文件中会自动生成一个随机的密码，我们需要先取得这个随机密码，以用于登录 MySQL 服务端：  
`grep "password" /var/log/mysqld.log`

会看到`2017-08-18T06:30:41.434227Z 1 [Note] A temporary password is generated for root@localhost: Gthf*eSBW8uH`这样的信息，其中`Gthf*eSBW8uH`就是初始的密码，复制一下。

`mysql \-u root \-p刚刚得到的密码`

进入mysql命令行模式。

```shell
# 更新 MySQL 的用户 root的密码：
set password = password('新密码'); 

# 设置用户 root 可以在任意 IP 下被访问：
grant all privileges on *.* to root@"%" identified by "新密码";
或者
# 设置用户 root 可以在本地被访问：
grant all privileges on *.* to root@"localhost" identified by "新密码";

# 刷新权限使之生效：
flush privileges;

```

如果更改密码失败，就要降低密码强度：在Mysql命令行下执行`set global validate_password_policy=0;`  
✔然后，应该就可以用了。