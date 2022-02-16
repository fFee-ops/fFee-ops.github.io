---
title: Error dropping database (can‘t rmdir “emos“ errno:39)
date: 2021-12-05 21:59:17
tags: docker
categories: 踩坑
---

<!--more-->

**问题描述**  
今天想卸载一个数据库的时候报错如上。

**解决：**

```shell
cd /var/lib/mysql
```

然后找到对应数据库的文件夹，删除该文件夹即可