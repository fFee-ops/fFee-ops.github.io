---
title: linux的Mysql重置密码
date: 2021-12-07 22:44:05
tags: mysql linux 数据库
categories: MySQL
---

<!--more-->

### linux的Mysql重置密码

（1）先修改配置文件`/etc/my.cnf`令MySQL跳过登录时的权限检验，在`[mysqld]`下加入一行：

```shell
skip-grant-tables
```

（2）重启MySQL

```shell
systemctl restart mysqld
```

（3）免密码登录MySQL

```shell
skip-grant-tables
```

（4）mysql客户端执行如下命令，修改root密码

```shell
mysql>  use mysql;
MySQL> update mysql.user set authentication_string=password('新密码') where user='root';
MySQL> flush privileges;
MySQL> exit
```

（5）修改配置文件/etc/my.cnf删除此前新增那一行skip-grant-tables，并重启MySQL\(这一步非常重要，不执行可能导致严重的安全问题\)