---
title: yum安装下载慢
date: 2020-11-06 14:53:26
tags: 
categories: 踩坑
---

<!--more-->

第一步，清除 缓存

```shell
yum clean all
yum makecache
```

第二步，更新yum

```
yum update
```