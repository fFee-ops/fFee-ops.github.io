---
title: 'kafka创建主题出错:zookeeper is not a recognized option'
date: 2022-02-05 15:23:12
tags:
password:
categories: kafka
---

# 原因
选项zookeeper已弃用

# 解决
把选项zookeeper替换为`--bootstrap-server`来使用