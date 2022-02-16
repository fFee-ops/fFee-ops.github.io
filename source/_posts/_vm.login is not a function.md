---
title: _vm.login is not a function
date: 2021-01-31 22:17:19
tags: 
categories: 踩坑
---

<!--more-->

今天写微信小程序前端的时候，我明明定义了`login()`，但是点击登录按钮却提示我 \_vm.login is not a function。

**原因：**  
我在该页面还写了一个跳转到注册页面的方法  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210131221229231.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
两个方法顺序不太对。

**解决：**  
把`login()`放到`toRegister()`的前面；