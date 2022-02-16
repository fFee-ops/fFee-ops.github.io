---
title: Method threw ‘java.lang.NullPointerException‘ exception. Cannot evaluate com.sun.proxy.xxx
date: 2021-07-07 10:26:48
tags: 
categories: 踩坑
---

<!--more-->

我在debug的时候发现会出现 `Method threw 'java.lang.NullPointerException' exception. Cannot evaluate com.sun.proxy.$Proxy0.toString()`但是不影响程序的正常运行，应该是由于动态代理的时候生成的对象可能并没有toString\(\)方法，而debug模式下是通过toString来打印信息的。所以也解释了为什么在invoke方法中可以返回真实的代理对象