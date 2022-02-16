---
title: mybatis报错 Parameter index out of range (1 ＞ number of parameters, which is 0)
date: 2020-09-09 22:13:57
tags: 
categories: 踩坑
---

<!--more-->

在Mybatis的Mapper文件中的sql涉及 like语句：

在Mybatis中Mapper.xml文件中，如果有sql涉及的模糊查询，中间包含like语句时，**只能使用\$,不能使用#。**

例如：

```sql
select title from article where article like '%${KeyWords}%'
```

但是使用\$时，相当于直接传递字符串，存在sql注入的风险。