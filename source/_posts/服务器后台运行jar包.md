---
title: 服务器后台运行jar包
date: 2020-12-29 23:26:00
tags: 
categories: Linux
---

<!--more-->

### 服务器后台运行jar包

- [启动](#_4)
- [结束](#_8)

直接用`java \-jar xxx.jar`这样的话一断开连接，这个jar也不会运行了。

# 启动

我们只要使用`nohup java \-jar xxx.jar &`在后台运行jar包。  
输入了`nohup java \-jar xxx.jar &` 然后再输入exit断开连接，这样就可以在后台运行了。

# 结束

要结束的话就用`ps \-ef|grep xxx.jar`找到进程号，再用`kill \-9 进程号`来杀掉这个进程就好了。