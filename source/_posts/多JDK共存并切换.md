---
title: 多JDK共存并切换
date: 2020-05-21 10:31:23
tags: 
categories: java
---

<!--more-->

### 多JDK共存切换

- [首先安装JDK1.80](#JDK180_2)
- - [存在问题](#_10)
  - [解决方法](#_15)
- [切换JDK版本](#JDK_22)

# 首先安装JDK1.80

1、直接去官网下载jdk，选择所需的jdk版本下载， https://www.oracle.com/technetwork/java/javase/downloads/index.html

**下载速度过慢可以选择去[华为JDK镜像](https://mirrors.huaweicloud.com/java/jdk/)下载**

2、安装  
3、以前配置过就没必要再重新配置环境变量了。

## 存在问题

1、想要查看JDK是否安装配置成功，需要再dos窗口中输入 java \-version。在安装JDK1.8之后，还没有在环境中配置JDK1.8的信息。但是执行 java \-version会看到JDK1.8的信息。注意我以前的JDK版本是12  
**原因**  
1、在安装JDK1.8之后，会自动将java.exe、javaw.exe、javaws.exe三个可执行文件复制到系统目录。由于这个目录在WINDOWS环境变量中的优先级高于path设置的环境变量优先级。

## 解决方法

1、将C:\\Program Files \(x86\)\\Common Files\\Oracle\\Java\\javapath目录下的三个可执行文件删除。这个目录是根据环境变量里的PATH来看的。

2、然后把cmd窗口关闭，将环境变量path中的\%JAVA\_HOME\%\\bin;\%JAVA\_HOME\%\\jre\\bin;放到最前面。

3、重新打开cmd窗口，输入 java \-version 就可以看到1.80的jdk版本

# 切换JDK版本

1、手动改变JAVA\_HOME中的路径为JDK版本的路径  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052113273543.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**注意，将环境变量path中的\%JAVA\_HOME\%\\bin;\%JAVA\_HOME\%\\jre\\bin;放到最前面**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521132759257.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

打开cmd输入,java \-version就可以看到版本已经切换了