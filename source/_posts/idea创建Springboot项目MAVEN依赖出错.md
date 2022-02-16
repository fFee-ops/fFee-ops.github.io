---
title: idea创建Springboot项目MAVEN依赖出错
date: 2020-07-20 11:50:38
tags: 
categories: 踩坑
---

<!--more-->

今天新建一个spring boot项目，其中的

```xml
<plugin>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

一直标红。  
**原因：** maven配置文件的问题。因为是新创建的项目，导致默认使用了idea自带的maven。

**解决办法：** 在设置里面切换成自己的maven  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200720114954328.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
然后maven—rimport一下就行了。