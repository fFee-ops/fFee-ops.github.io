---
title: 使用charles 抓不到chrome浏览器的包
date: 2021-12-15 11:20:37
tags: chrome 前端 http
categories: 踩坑
---

<!--more-->

### 使用charles 抓不到chrome浏览器的包

今天使用charles抓包，配置都没问题，但是一直抓不到chrome的数据包。

**原因：** chrome使用了代理插件，所以抓包时候没有走Charles设置的端口

**解决方案：**

1.  抓包的时候，暂时关闭代理插件
2.  将代理插件设置charles默认端口8888