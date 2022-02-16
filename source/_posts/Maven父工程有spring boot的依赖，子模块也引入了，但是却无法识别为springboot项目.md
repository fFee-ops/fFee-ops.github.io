---
title: Maven父工程有spring boot的依赖，子模块也引入了，但是却无法识别为springboot项目
date: 2020-10-15 17:02:42
tags: 
categories: 踩坑
---

<!--more-->

今天在搭建微服务的时候，首先创建了一个maven父工程，里面定义了

```xml
   <!--spring boot 2.2.2-->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>2.2.2.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
```

然后子项目也引入了

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
```

---

但是十分奇怪，子项目创建的的yml文件没有变成小绿叶，也无法使用\@Springboot 注解。经过一系列的排查，认定原因是maven项目没有成功引入springboot依赖。

**结论：** 经过一番排查后，发现，是父工程的pom文件没有执行install到本地仓库去，子工程就没有东西去继承，故而导致这个错误。

**解决：**  
父工程创建完成执行mvn:install将父工程发布到仓库方便子工程继承

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201015170137376.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

此时可以看到yml有小绿叶了。