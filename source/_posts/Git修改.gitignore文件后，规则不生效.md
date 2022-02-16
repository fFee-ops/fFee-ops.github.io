---
title: Git修改.gitignore文件后，规则不生效
date: 2021-12-02 23:07:50
tags: git
categories: 踩坑
---

<!--more-->

**原因：**  
.gitignore文件只能忽略那些原来没有被track的文件，如果某些文件已经被纳入了版本管理中，修改.gitignore是无效的。  
**解决：**  
先把本地缓存删除，改变成未track状态，然后再提交。 如下：

```shell
git rm -r --cached .
git add .
git commit -m 'update .gitignore'
```