---
title: hexo部署到github不能用账号密码
date: 2022-01-21 19:55:29
tags:
categories: 踩坑
---

github新规规定再从hexo提交代码只能用token。

**解决：**
1. 去`Seqttings->Developer settings->Personal access tokens->Personal access tokens `生成一个新的令牌：
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/3dddefbc75d047ac803bdcc75060e6d5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
2. `hexo -d`执行完后会有一个对话框提示你输入账号密码。**注意，这里要输入的不是你的账号和密码而是**
  （输入完成后可能还会要求你再次输入一遍，输入内容依然是下面这个。）
```shell
账号：oauth2
密码:你刚刚生成的token
```