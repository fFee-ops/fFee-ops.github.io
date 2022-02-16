---
title: 分页sql（不完善，有错误）
date: 2020-05-06 13:06:04
tags: 
categories: JavaWeb
---

<!--more-->

### 分页

- [MYSQL实现分页的sql：](#MYSQLsql_7)
- [oracle分页：](#oracle_38)
- [SQLServer分页： 3种分页sql](#SQLServer__3sql_78)

要实现分页，必须知道 某一页的 数据 从哪里开始 到哪里结束

页面大小：每页显示的数据量

# MYSQL实现分页的sql：

```
假设每页显示10条数据

mysql分页：
mysql:从0开始计数
0		0		9
1		10		19
2		20		29
n		n*10	      (n+1)*10-1

结论：
分页：
	第n页的数据：  第(n-1)*10+1条  -- 第n*10条
```

limit 开始,多少条  
第0页  
select \* from student limit 0,10 ;  
第1页  
select \* from student limit 10,10 ;  
第2页  
select \* from student limit 20,10 ;  
第n页  
select \* from student limit n\*10,10

mysql的分页语句：

select \* from student limit 页数\*页面大小,页面大小

# oracle分页：

sqlserver/oracle:从1开始计数  
第n页 开始 结束  
1 1 10  
2 11 20  
3 21 30  
n \(n-1\)_10+1 n_10

select \*from student where sno >=\(n-1\)_10+1 and sno \<=n_10 ; \--此种写法的前提：必须是Id连续 ，否则 无法满足每页显示10条数据

ORACLE\\sqlserver都是从1开始计数： \(n-1\)_10+1 — n_10  
oracle的分页查询语句：  
select _from  
\(  
select rownum r, t._ from  
\(select s.\* from student s order by sno asc\) t 10000  
\)  
where r>=\(n-1\)_10+1 and \<=n_10 ; 10

优化：

select _from  
\(  
select rownum r, t._ from  
\(select s.\* from student s order by sno asc\) t  
where rownum\<=n\*10  
\)  
where r>=\(n-1\)\*10+1 ;

select _from  
\(  
select rownum r, t._ from  
\(select s.\* from student s order by sno asc\) t  
where rownum\<=页数\*页面大小  
\)  
where r>=\(页数-1\)\*页面大小+1 ;

# SQLServer分页： 3种分页sql

```
row_number()	over(字段) ;

sqlserver2003:top  --此种分页SQL存在弊端（如果id值不连续，则不能保证每页数据量相等）
select top 页面大小 * from student where id not in 
( select top (页数-1)*页面大小 id from student  order by sno asc )



sqlserver2005之后支持：
select *from 
(
	select row_number()  over (sno order by sno asc) as r,* from student
			
	 where r<=n*10 
)
where r>=(n-1)*10+1 and  ;	

SQLServer此种分页sql与oralce分页sql的区别： 1.rownum  ，row_number()    2.oracle需要排序（为了排序，单独写了一个子查询），但是在sqlserver 中可以省略该排序的子查询  因为sqlserver中可以通过over直接排序


sqlserver2012之后支持：	
offset fetch next only


select * from student  oreder by sno 
offset (页数-1)*页面大小+1  rows fetch next 页面大小  rows only ;




(n-1)*10+1    ---  n*10 

mysql从0开始计数，Oracle/sqlserver 从1开始计数


1
2
3
4
6
8
9
10

11
12
...
20


21
22
..
31

分页实现：
5个变量（属性）			
1.数据总数	100	103					（查数据库,select count(*)..）									
2.页面大小（每页显示的数据条数）20				  (用户自定义)
3.总页数 							 （程序自动计算）
	总页数 = 100/20  =数据总数/页面大小
	总页数 = 103/20 = 数据总数/页面大小+1
	--->
	总页数 = 数据总数%页面大小==0? 数据总数/页面大小:数据总数/页面大小+1 ;

									
4.当前页（页码）							  （用户自定义）								
5.当前页的对象集合（实体类集合）：每页所显示的所有数据 （10个人信息）
List<Student>							   (查数据库,分页sql)	
		
```