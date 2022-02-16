---
title: 阿里云部署tomcat的错误
date: 2020-12-16 10:26:11
tags: 
categories: 踩坑
---

<!--more-->

### 阿里云部署tomcat的错误

  
1、用./startup.sh启动，显示启动成功。看日志也启动成功了，但是怎么也从win10访问不到。阿里云策略组改了，防火墙也关了。

2、一运行shutdowon.sh就会报connection refused。

搞到了大半夜 ，终于在第二天早上发现了解决方案。

**原因** jdk的伪随机数设置导致

**解决方法**  
1、找到jdk的安装目录下的 jre/lib/security/java.security 文件  
2、修改java.security  
3、找到securerandom.source这个设置将其该为：`securerandom.source=file:/dev/./urandom`

（在 vim 中进行文本搜索：输入”/”，再输入关键词，回车，按“n”向下查找匹配词，按“N”向上查找匹配词）