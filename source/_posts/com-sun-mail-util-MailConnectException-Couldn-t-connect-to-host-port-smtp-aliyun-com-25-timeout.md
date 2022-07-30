---
title: >-
  com.sun.mail.util.MailConnectException:Couldn't connect to host,
  port:smtp.aliyun.com, 25; timeout
date: 2022-03-20 20:45:40
tags:
password:
categories: 踩坑
---

# 问题描述
SpringBoot项目部署到阿里服务器，发送邮箱报错`com.sun.mail.util.MailConnectException:Couldn't connect to host, port:smtp.aliyun.com, 25; timeout` ，在本地没问题


# 原因
阿里云禁用了25端口号

# 解决
在yml文件中 将25端口改为465端口，并启用smtps协议
```yml
mail:
        host: smtp.163.com
        username: ******@163.com
        password: ******
        default-encoding: UTF-8
        port: 465
        protocol: smtps

```