---
title: postman发送x-www-form-urlencoded格式的参数后端接收不到
date: 2022-03-19 12:49:26
tags:
password:
categories: 踩坑
---

# 问题
postman发送x-www-form-urlencoded格式的参数后端接收不到，后端controller层已经写了`@RequestParam` 来接收参数


# 原因
我调用请求是用的get方法

# 解决 
用post发起请求
![在这里插入图片描述](https://img-blog.csdnimg.cn/74d8f083a8fa4fb282d1c9b1891e0122.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)