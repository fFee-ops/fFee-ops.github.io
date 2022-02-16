---
title: SQL优化
date: 2020-07-10 12:02:39
tags: 
categories: MySQL
---

<!--more-->

### 文章目录

- [为什么要进行SQL优化](#SQL_2)
- [优化](#_6)
- - [Sql解析顺序](#Sqlhttpswwwcnblogscomannsshadowp5037667html_19)
  - [索引的优缺点](#_38)

# 为什么要进行SQL优化

原因：性能低、执行时间太长、等待时间太长、SQL语句欠佳（连接查询）、索引失效、服务器参数设置不合理（缓冲、线程数）

# 优化

**a.SQL ：**  
例如自己编写了一个SQL语句

```sql
select dinstinct  ..from  ..join ..on ..where ..group by ...having ..order by ..limit ..
```

数据库会按照一下顺序来解析：

```sql
from .. on.. join ..where ..group by ....having ...select dinstinct ..order by limit ...
```

## [Sql解析顺序](https://www.cnblogs.com/annsshadow/p/5037667.html)

**b.SQL优化， 主要就是 在优化索引：**

- 索引： 相当于书的目录
- 索引： index是帮助MYSQL高效获取数据的数据结构。索引是数据结构（树：B树\(默认\)、Hash树…）

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020071011572866.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

右边的B树就是索引，是有顺序的。比如我要查询age=33的ID：  
不加索引 从上往下需要查询5次。  
加了索引只需要查找3次  
第一次：找到50，33比50小，去50的左边寻找  
第二次：33比23大，去23的右边  
第三次：33=33即为结果

## 索引的优缺点

优点：  
1.提高查询效率（降低IO使用率）

2.降低CPU使用率 （…order by age desc,因为 B树索引 本身就是一个 好排序的结构，因此在排序时 可以直接使用）

缺点：  
1.索引本身很大， 可以存放在内存/硬盘（通常为 硬盘）  
2.索引不适用于以下情况： a.少量数据 b.频繁更新的字段 c.很少使用的字段  
3.索引会降低增删改的效率（增删改 查）