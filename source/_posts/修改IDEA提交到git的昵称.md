---
title: 修改IDEA提交到git的昵称
date: 2022-02-17 21:14:04
tags:
password:
categories: Git
---

1、在idea的terminal输入

```shell
 git config user.name 
```
获取当前用户昵称。

2、输入以下命令来修改昵称
```shell
git config --global user.name "用户名" 
```
