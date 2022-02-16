---
title: maven已经导入了模块坐标，但是依然无法使用
date: 2021-07-04 16:23:09
tags: 
categories: 踩坑
---

<!--more-->

现象：  
已经在pom.xml中引入了gav坐标，但是另一个项目的文件依然无法import

**解决：**  
原来的项目没有包，加一个包就好了