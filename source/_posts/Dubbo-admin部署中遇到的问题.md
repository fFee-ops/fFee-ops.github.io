---
title: Dubbo-admin部署中遇到的问题
date: 2020-05-21 13:21:15
tags: linux 运维 服务器
categories: 踩坑
---

<!--more-->

**1、用mvn package 打包失败**

windows使用的JDK版本过高，换成JDK8即可以打包成功

**2、zookeeper连接失败**  
关闭centos防火墙

**3、linux的tomcat页面可以访问，但是dubbo-admin 404**

解决办法：  
1、关闭LINUX防护墙  
2、修改dubbo-admin文件夹下的WEB-INF文件夹下的dubbo.properties  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521131948381.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

3、先启动zookeeper再启动tomcat！！！

4、Linux的jdk版本过高（我就是这个原因），将linux的JDK版本也换成JDK8后即可访问成功！

---

还要注意不同JDK对应不同的dubbo-admin版本

我用的是JDK8 和dubbo-dubbo-2.6.0  
（zookeeper部署在LINUX上）