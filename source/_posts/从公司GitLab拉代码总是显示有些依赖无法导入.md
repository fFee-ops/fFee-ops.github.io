---
title: 从公司GitLab拉代码总是显示有些依赖无法导入
date: 2021-06-11 15:47:12
tags: 
categories: 踩坑
---

<!--more-->

**解决：在终端输入以下命令后重新导入依赖**

`mvn clean package \-Dmaven.test.skip=true \-Dmaven.javadoc.skip=true`

也就是跳过单元测试和javadoc