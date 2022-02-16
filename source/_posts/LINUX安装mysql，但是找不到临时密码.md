---
title: LINUX安装mysql，但是找不到临时密码
date: 2020-10-25 21:50:12
tags: 
categories: 踩坑
---

<!--more-->

今天Centos7上安装了Mysql5.7，但是/var/log/mysqld.log 中找不到临时密码。这是个空文件。

**原因：之前安装过mysql，没卸载干净**

**解决：将系统中mysql卸载干净，重新安装一次**