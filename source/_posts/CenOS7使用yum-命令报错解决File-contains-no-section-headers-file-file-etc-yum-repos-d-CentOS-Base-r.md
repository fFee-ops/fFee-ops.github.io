---
title: >-
  CenOS7使用yum 命令报错解决File contains no section headers.
  file:file:///etc/yum.repos.d/CentOS-Base.r
date: 2022-02-15 13:36:23
tags:
password:
categories: 踩坑
---

解决：
①删除yum.repos.d目录下所有文件

```shell
rm -f /etc/yum.repos.d/*
```

②从阿里的库重新下载这个文件
```shell
wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
```
③清理缓存
```shell
yum clean all
```