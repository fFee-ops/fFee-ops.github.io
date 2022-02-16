---
title: yum安装的mysql出现问题的排查过程
date: 2021-11-24 13:45:50
tags: zk zookeeper 分布式
categories: 踩坑
---

<!--more-->

### yum安装的mysql出现问题的排查过程

- - [解决过程](#_11)

今天运行mysql出现错误  
`Job for mysqld.service failed because the control process exited with error code. See "systemctl status mysqld.service" and "journalctl \-xe" for details.`

根据提示运行命令查看错误：

```sql
systemctl status mysqld.service 
```

输出信息，没半点用。

## 解决过程

问题定位的关键需要查看msyql日志，所以问题转化为找到mysql的日志位置。

**①运行以下命令查看mysql配置文件位置**

```sql
mysql --help | grep my.cnf
```

发现配置文件在/etc/my.cnf

**②查看配置文件，发现错误日志输出在/var/log/mysqld.log**

**③查看错误日志：**

```sql
tail -n 300 /var/log/mysqld.log
```