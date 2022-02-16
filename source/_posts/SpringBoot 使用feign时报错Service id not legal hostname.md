---
title: SpringBoot 使用feign时报错Service id not legal hostname
date: 2020-11-08 21:30:38
tags: 
categories: 踩坑
---

<!--more-->

**原因：** 原因是feign不支持下划线"\_"。

**解决：** 将命名修改为-，比如原来是xx\_xx，现在改成xx-xx