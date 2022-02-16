---
title: ＜button＞中onclick失效
date: 2020-09-13 14:48:37
tags: 
categories: 踩坑
---

<!--more-->

写了个按钮 ，其中的οnclick="close\(\)"函数一直无效。  
经过排查问题为函数名是与系统库名冲突

  

**解决：**

更换函数名