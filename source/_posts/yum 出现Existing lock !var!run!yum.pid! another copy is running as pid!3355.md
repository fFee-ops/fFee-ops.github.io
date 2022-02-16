---
title: yum 出现Existing lock /var/run/yum.pid:another copy is running as pid:3355
date: 2020-11-06 14:48:08
tags: 
categories: 踩坑
---

<!--more-->

**原因：yum在自动更新**

**解决：**

```shell
输入  rm -f    /var/run/yum.pid

或 /etc/init.d/yum-updatesd stop
```