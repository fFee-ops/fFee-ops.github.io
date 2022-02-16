---
title: java.lang.String cannot be cast to java.lang.Integer
date: 2020-07-23 21:25:39
tags: 
categories: 踩坑
---

<!--more-->

今天在将string 转为int类型时候报错：java.lang.String cannot be cast to java.lang.Integer

**原因：**  
在将String类型强制转换成Integer时语法没错，但是在编译的时候会报java.lang.String cannot be cast to java.lang.Integer

**解决：**  
使用Valueof\(\)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200723212529752.png)