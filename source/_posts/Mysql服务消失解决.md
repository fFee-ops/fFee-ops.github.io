---
title: Mysql服务消失解决
date: 2020-05-26 10:22:21
tags: 
categories: MySQL
---

<!--more-->

1、 开始->运行->cmd,进到mysql安装的bin目录 （cmd以管理员身份运行）  
D:\\MySQL\\bin> mysqld \--install

2、运行  
D:\\MySQL\\bin>mysqld \-nt.exe \-install

3、启动服务  
D:\\MySQL\\bin>net start mysql