---
title: SpringBoot项目启动后自动关闭：Process finished with exit code 0
date: 2021-12-16 00:49:02
tags: spring boot spring java
categories: 踩坑
---

<!--more-->

**原因：** 忘记添加web依赖了

**解决：** xml文件导入以下依赖

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
```