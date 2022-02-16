---
title: 慢SQL排查
date: 2020-07-16 14:31:09
tags: 
categories: MySQL
---

<!--more-->

### 文章目录

- [慢查询日志](#_2)
- [慢查询阀值：](#_32)
- [查询超过阀值的SQL](#SQL_55)

# 慢查询日志

慢查询日志:MySQL提供的一种日志记录，用于记录MySQL种响应时间超过阀值的SQL语句 （long\_query\_time，默认10秒）

慢查询日志默认是关闭的；  
建议：开发调优时 打开，而 最终部署时关闭。

**检查是否开启了 慢查询日志 ：**

```sql
show variables like '%slow_query_log%' ;
```

①临时开启：

```sql
set global slow_query_log = 1 ;  --在内存种开启
	
在mysql服务重新启动后会关闭	
```

②永久开启：

```shell
/etc/my.cnf 中追加配置：
		vi /etc/my.cnf 
		
		[mysqld]
		slow_query_log=1
		slow_query_log_file=/var/lib/mysql/localhost-slow.log

重启服务后生效！
```

# 慢查询阀值：

```sql
show variables like '%long_query_time%' ;
查询阀值是多少,默认是10s
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200716140515642.png)

①临时设置阀值：

```sql
set global long_query_time = 5 ; 
--设置完毕后，重新登陆后起效 （不需要重启服务）
```

②永久设置阀值：

```shell
		/etc/my.cnf 中追加配置：
		vi /etc/my.cnf 
		
		[mysqld]
		long_query_time=3
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200716140653765.png)

# 查询超过阀值的SQL

```sql
show global status like '%slow_queries%' ;

假如有以下几个SQL
	select sleep(4);
	select sleep(5);
	select sleep(3);
	select sleep(3);
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200716140830421.png)  
可以看到上面的四个语句都超过了我们设置的阀值。

1、慢查询的sql被记录在了日志中，因此可以通过日志 查看具体的慢SQL。

```shell
	cat /var/lib/mysql/localhost-slow.log
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200716141012721.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

2、通过mysqldumpslow工具查看慢SQL,可以通过一些过滤条件 快速查找出需要定位的慢SQL

```shell
mysqldumpslow --help --注意这条命令是在LINUX下执行，不是在MYSQL执行
	s：排序方式
	r:逆序
	l:锁定时间
	g:正则匹配模式	
```

**语法：**

```shell
语法：
		mysqldumpslow 各种参数  慢查询日志的文件
```

下面举一些列子

```shell
--获取返回记录最多的3个SQL
mysqldumpslow -s r -t 3  /var/lib/mysql/localhost-slow.log

--获取访问次数最多的3个SQL
mysqldumpslow -s c -t 3 /var/lib/mysql/localhost-slow.log

--按照时间排序，前10条包含left join查询语句的SQL
mysqldumpslow -s t -t 10 -g "left join"  
/var/lib/mysql/localhost-slow.log

```