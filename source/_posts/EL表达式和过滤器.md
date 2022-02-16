---
title: EL表达式和过滤器
date: 2020-05-06 14:56:54
tags: 
categories: JavaWeb
---

<!--more-->

### EL表达式和过滤器

- [EL](#EL_1)

# EL

目的：EL ：为了消除jsp中的Java代码

**语法：**  
\$\{EL表达式\}  
👇  
\$\{范围.对象.属性.属性的属性 \}

a.EL不需要导包  
b.在el中调用属性，其实是调用的getXxx\(\)方法

操作符：  
操作属性，不是对象。  
**.** ： 使用方便  
**\[ \]** : 如果是常量属性，需要使用双引号/单引号 引起来;比点操作符更加强大  
👇

```
[ ]强大之处：
a.可以容纳一些 特殊符号 （.  ?   -）
b.[]可以容纳 变量属性 （可以动态赋值）
String x = "a";
${requestScope.a}等价于${requestScope["a"]}等价于${${requestScope[x]}

c.可以处理数组
${requestScope.arr[0] }

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020050614520840.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)