---
title: com.mysql.cj.jdbc.exceptions.CommunicationsException:Communications link failure
date: 2022-01-10 20:11:55
tags: 数据库 sql
categories: 踩坑
---

<!--more-->

解决：在连接末尾加上`&useSSL=false`