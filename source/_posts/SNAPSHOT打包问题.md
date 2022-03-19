---
title: SNAPSHOT打包问题
date: 2022-03-12 19:26:04
tags:
password:
categories: 踩坑
---

# 问题描述
今天在公司打一个SNAPSHOT包，但是发现最后deploy到release仓库里面去了，并没有到达snapshot的仓库

# 原因
我的version格式有误，以下为我原来的version格式
```xml
<version>2.2.6-SNAPSHOT-xx</version>
```

# 解决
必须要以SNAPSHOT结尾
```xml
<version>2.2.6-xx-SNAPSHOT</version>
```
然后再重新打包即可