---
title: 前端传的json数据未乱码，但是插入到数据库就是问号
date: 2021-01-14 12:26:07
tags: 
categories: 踩坑
---

<!--more-->

今天前端给往数据库插入数据，从前端拿到的json编码是好的。但是插入到数据库中一看就是`??`。

**解决：给数据库的连接加上`?useUnicode=true&characterEncoding=UTF-8`**