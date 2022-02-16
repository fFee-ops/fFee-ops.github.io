---
title: springboot项目启动成功但没有端口无法访问
date: 2022-01-23 14:17:42
tags:
password:
categories: 踩坑
---

记录一下很笨比的错误。

**原因：**
忘记引入`web`依赖了。。。


**解决：**
在pom.xml中添加如下依赖
```xml
		<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
```