---
title: 在linux运行jar包提示QRTZ_LOCKS表不存在
date: 2021-03-07 18:16:03
tags: 
categories: 踩坑
---

<!--more-->

今天运行jar包，报错如下，但是我明明有这张表。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210307181230488.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

进入mysql执行

```sql
show global variables like '%lower_case%';
```

发现

```
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_file_system | OFF    |
| lower_case_table_names | 0     |
+------------------------+-------+
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210307181422500.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
所以就是数据库大小写敏感的问题。

**解决：**

编辑`/etc/my.cnf`在`[mysqld]`下添加如下：（我的mysql是通过yum安装的）

```sql
lower_case_table_names=1
```

然后重启服务，可以发现就ok了。