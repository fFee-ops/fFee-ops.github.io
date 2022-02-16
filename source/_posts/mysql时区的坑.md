---
title: mysql时区的坑
date: 2021-02-05 13:57:53
tags: 
categories: 踩坑
---

<!--more-->

今天在查询一条数据的时候用到了

```sql
ck.date = CURRENT_DATE
```

结果发现数据一直为空。但是明明表中有数据，经过排查，我发现系统时间是  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021020513433071.png)  
，但是！我执行`SELECT CURRENT_DATE`看到的时间是：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210205134358605.png)  
。

---

**原因:**

先查看一下时区，`SHOW VARIABLES LIKE '%zone%'`。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210205134816135.png)

`PST`是我LINUX服务器的时区

---

```sql
SELECT TIMEDIFF(NOW(), UTC_TIMESTAMP); 
```

如果是中国标准时间, 会输出08:00，但是我输出的是-8.00.

**至此发现了问题，时区不对。**

---

**解决：**

```sql
set global time_zone = '+8:00';  ##修改mysql全局时区为北京时间，即我们所在的东8区
set time_zone = '+8:00';  ##修改当前会话时区
flush privileges;  #立即生效
```

再运行`SELECT CURRENT_DATE`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210205135326513.png)

---

为了根治，我们修改my.cnf配置文件来修改时区

```sql
# vim /etc/my.cnf  ##在[mysqld]区域中加上
default-time_zone = '+8:00'
 
# /etc/init.d/mysqld restart  ##重启mysql使新时区生效
```