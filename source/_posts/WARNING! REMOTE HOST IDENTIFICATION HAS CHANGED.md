---
title: WARNING:REMOTE HOST IDENTIFICATION HAS CHANGED!
date: 2022-07-29 15:55:36
tags: 服务器 ssh linux
categories: 踩坑
---

<!--more-->

# 问题描述

今天重置云服务器后，再在终端用ssh去登陆这台机器报错

```
$ ssh root@108.61.163.242
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the ECDSA key sent by the remote host is
SHA256:HDjXJvu0VYXWF+SKMZjSGn4FQmg/+w6eV9ljJvIXpx0.
Please contact your system administrator.
Add correct host key in /Users/wangdong/.ssh/known_hosts to get rid of this message.
Offending ECDSA key in /Users/wangdong/.ssh/known_hosts:46
ECDSA host key for 108.61.163.242 has changed and you have requested strict checking.
Host key verification failed.

```

# 原因

一般这个问题，是你重置过你的服务器后。你再次想访问会出现这个问题。

# 解决

在终端输入

```shell
ssh-keygen -R 你要访问的IP地址
```