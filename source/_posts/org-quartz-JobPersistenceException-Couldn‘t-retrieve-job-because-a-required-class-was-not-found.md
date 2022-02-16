---
title: >-
  org.quartz.JobPersistenceException:Couldn‘t retrieve job because a required
  class was not found
date: 2022-01-24 20:13:50
tags:
password:
categories: 踩坑
---

# 问题描述
springboot 使用定时任务quartz，我修改了包名路径。调整了位置导致报错。结果quartz就不认识了，启动就报错。
我排查后工程不可能有问题，因为相关的名字都改了，那就只可能是数据库的问题了。

#  原因
因为quartz在job_details中进行了进行了持久化。所以更名之前的名字就保留在数据库中了

#  解决
清空`QRTZ`开头表中的数据即可 