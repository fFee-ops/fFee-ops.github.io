---
title: IDEA单元测试巨恶心的坑
date: 2020-07-21 20:54:19
tags: 
categories: 踩坑
---

<!--more-->

今天用idea单元测试，一直卡在resolving dependencies。  
网上各种办法查询都无效。

最后解决的办法如下：  
1、我最开始没有在springboot启动选项里面选择junit模块。  
于是在pom文件中添加如下依赖

```xml
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>
```

添加如下后依然报错Cannot resolve junit:junit:4.13

2、我无意中点到了  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200721204937223.png)

最后发现。。居然通过了test测试。

---

![在这里插入图片描述](https://img-blog.csdnimg.cn/202007212052515.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

有一些版本的idea好像默认是勾选的  
这个开启这,就是开启了离线模式,开了离线模式，就不能远程从中央仓库下载jar了…切记不要勾选！！！