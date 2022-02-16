---
title: Integer用==比较的坑
date: 2021-03-05 10:21:44
tags: 
categories: 踩坑
---

<!--more-->

Integer在用==的时候是比较地址，但是如果你的Integer的值在`[-128,127]`之间，Integer会直接引用这个缓存变量，只有超过这个区间才会new 一个Integer对象