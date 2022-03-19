---
title: Lombok的@Builder.Default失效
date: 2022-03-19 12:49:52
tags:
password:
categories: 踩坑
---

# 问题
今天有一个类，有两个字段用了`@Builder.Default` 来修饰。
![在这里插入图片描述](https://img-blog.csdnimg.cn/414c503119424fbb83de1dec3b8e8bf2.png)
但是当我往数据库插入时候发现这两个数据是null，但是我已经指定了默认值啊

# 原因
我创建这个对象的时候用的是`new` ，没走Lombok

# 解决
创建对象用`xx.builder().build();` 