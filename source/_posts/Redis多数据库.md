---
title: Redis多数据库
date: 2020-09-06 09:32:39
tags: 
categories: Redis
---

<!--more-->

### Redis多数据库

Redis下，数据库是由一个整数索引标识，而不是由一个数据库名称。默认情况下，一个客户端连接到数据库0。

**redis配置文件中下面的参数来控制数据库总数：** database 16 //\(从0开始 1 2 3 …15\)

**select 数据库：** 数据库的切换

**移动数据（将当前key移动另个库\)：**

```sql
move key名称 数据库
```

**数据库清空：**

```sql
flushdb :清除当前数据库的所有key
flushall :清除整个Redis的数据库所有key
```