---
title: 注解@RequestBody
date: 2020-10-16 22:21:28
tags: 
categories: SpringMVC
---

<!--more-->

### @RequestBody

- [基础知识](#_1)

# 基础知识

①\@RequestBody主要用来接收前端传递给后端的json字符串中的数据的\(请求体中的数据的\)；  
②GET方式无请求体，所以使用\@RequestBody接收数据时，前端不能使用GET方式提交数据，而是用POST方式进行提交。  
③在后端的同一个接收方法里，\@RequestBody与\@RequestParam\(\)可以同时使用，\@RequestBody最多只能有一个，而\@RequestParam\(\)可以有多个。即：一个请求，只有一个RequestBody；一个请求，可以有多个RequestParam。

④\@RequestBody 与\@RequestParam\(\)同时使用时，RequestBody 接收的是**请求体**里面的数据；而RequestParam接收的是**key-value** 里面的参数。

> **请求体：** request如果是post才有请求体，get则没有请求体，直接跟在？后面，用\&隔开。

⑤如果参数时放在请求体中，传入后台的话，那么后台要用\@RequestBody才能接收到；如果不是放在请求体中的话，那么后台接收前台传过来的参数时，要用\@RequestParam来接收，或则形参前 什么也不写也能接收。