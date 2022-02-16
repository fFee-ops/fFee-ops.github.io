---
title: springboot测试类Error creating bean with name
date: 2021-01-10 15:19:39
tags: 
categories: 踩坑
---

<!--more-->

今天用测试类的时候报错：  
font color=red>Error creating bean with name xxx

**原因：** 我把`@Service`加在了接口上，其实应该加在实现类上。

> \@Service注解是标注在实现类上的，因为\@Service是把spring容器中的bean进行实例化，也就是等同于new操作，只有实现类是可以进行new实例化的，而接口则不能，所以是加在实现类上的。

另外要记得引入，否则会报Failed to load ApplicationContext

```xml
        <!-- Junit依赖 -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>
```