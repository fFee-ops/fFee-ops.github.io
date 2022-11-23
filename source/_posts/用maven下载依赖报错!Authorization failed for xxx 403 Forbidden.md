---
title: 用maven下载依赖报错:Authorization failed for xxx 403 Forbidden
date: 2022-07-10 15:12:49
tags: maven java 开发语言
categories: 踩坑
---

<!--more-->

# 问题描述

今天在新电脑上自己创建了一个新项目想运行一下，但是maven依赖一直拉不下来，就连最简单的springboot的依赖都拉不下来。

# 原因

我的maven用的是公司的配置文件，公司代理会阻止从 maven Central 等下载依赖

# 解决

第一种：不要使用公司的setting文件

第二种：直接下载公司的项目，不要练手了。。。