---
title: zookeeper源码阅读前置步骤
date: 2021-11-03 14:18:29
tags: zk
categories: zookeeper
---

<!--more-->

### zookeeper源码阅读前置步骤

- [源码导入](#_2)
- [zookeeper分析工具](#zookeeper_11)

# 源码导入

要阅读源码就需要把源码下载下来，如果用maven的方式就不能写注释。  
下载过程比较复杂，而且会有很多bug，所以我直接下载好了放在了[github](https://github.com/fFee-ops/zkSourceCode)。用的是3.7版本的zk。

导入好的工程文件就是下面的样子：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5340512f38c14001875127869921c49b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# zookeeper分析工具

Zookeeper安装比较方便，在安装一个集群以后，查看数据却比较麻烦，下面介绍Zookeeper的数据查看工具——ZooInspector。

下载地址：<https://issues.apache.org/jira/secure/attachment/12436620/ZooInspector.zip>

下载好后解压缩那个压缩包，在`build`目录下有一个`zookeeper-dev-ZooInspector.jar`，我们去运行它就行了。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7987f40479ae46889dc03a653c152db9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
输入连接信息，就可以连接Zookeeper了，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/67d47a65a570493691a9db239fbe5fef.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
连接后，Zookeeper信息如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5c9311085e4440e69954234c9dfb6f29.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)