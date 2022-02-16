---
title: Unknown column ‘EntryTime‘ in ‘field list‘
date: 2020-07-11 22:24:01
tags: 
categories: 踩坑
---

<!--more-->

今天在写一个Demo时候，一直往数据库插入不进去数据。  
持续报错

Unknown column ‘EntryTime’ in ‘field list’

经过检查，是数据库EntryTime字段前面多了个空格。  
应该是建表的时候不小心加上了…