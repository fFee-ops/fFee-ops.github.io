---
title: Charles抓https显示unknown解决方法
date: 2021-05-11 14:50:39
tags: 
categories: 踩坑
---

<!--more-->

今天尝试抓个https的请求，发现显示全是unknown  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210511145003403.png)  
我也已经设置过了电脑上的证书 也信任了手机里也安装了Charles的证书，最后解决方案  
不知道从什么时候开始 iOS多了个信任的操作 原来这块貌似是默认是信任吧  
在设置–>通用–>关于本机–>证书信任设置  
把里面的那个Charles的证书设置为信任就可以了

---

另外设置Charles的SSL Proxying Settings，添加所有的域名，这一步一定要有，否则就算信任了证书也全都是unknown

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210511145316567.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)