---
title: 嵌入式SQL语言之动态SQL
date: 2020-05-27 11:20:40
tags: 
categories: 数据库系统
---

<!--more-->

### 文章目录

- [动态SQL的概念](#SQL_2)
- [动态SQL的执行方式](#SQL_14)
- [数据字典与SQLDA](#SQLDA_28)
- - [数据字典的内容构成](#_38)
- [SQLDA](#SQLDA_41)
- [ODBC简介](#ODBC_54)
- - [JDBC](#JDBC_66)
- [嵌入式语言-ODBC-JDBC比较](#ODBCJDBC_73)

# 动态SQL的概念

**静态SQL特点**：SQL语句在程序中已经按要求写好，只需要把一些参数通过变量\(高级语言程序语句中不带冒号\) 传送给嵌入式SQL语句即可\(嵌入式SQL语句中带冒号\)

```sql
SpecName = ‘张三’;
exec sql select Sno, Sname, Sclass into :vSno, :vSname, :vSclass from
Student where Sname= :SpecName ;
```

**动态SQL特点**：SQL语句可以在程序中动态构造，形成一个字符串，然后再交给DBMS执行，交给DBMS执行时仍旧可以传递变量

# 动态SQL的执行方式

可见JDBC中的statement与preparedstatement

1、立即执行语句: 运行时编译并运行

```sql
EXEC SQL EXECUTE IMMEDIATE :host-variable;
```

2、Prepare-Execute-Using语句: PREPARE语句先编译，编译后的SQL语句允许动态参数，EXECUTE语句执行，用USING语句将动态参数值传送给编译好的SQL语句

```sql
EXEC SQL PREPARE sql_temp FROM :host-variable;
...
EXEC SQL EXECUTE sql_temp USING :cond-variable
```

# 数据字典与SQLDA

数据字典\(Data dictionary\)，又称为系统目录\(System Catalogs\)

是系统维护的一些表或视图的集合, 这些表或视图存储了数据库中各类对象的定义信息, 这些对象包括用Create语句定义的表、列、索引、视图、权限、约束等, 这些信息又称数据库的元数据–关于数据的数据

不同DBMS术语不一样: 数据字典\(Data Dictionary\(Oracle\)\)、目录表\(DB2 UDB\)、系统目录\(INFORMIX\)、系统视图\(X/Open\)

不同DBMS中系统目录存储方式可能是不同的, 但会有一些信息对DBA公开. 这些公开的信息, DBA可以使用一些特殊的SQL命令来检索

## 数据字典的内容构成

数据字典通常存储的是数据库和表的元数据, 即模式本身的信息

# SQLDA

SQL Descriptor Area, SQL描述符区域.

①SQLDA是一个内存数据结构，内可装载关系模式的定义信息，如列的数目，每一列的名字和类型等等.

②通过读取SQLDA信息可以进行更为复杂的动态SQL的处理

③不同DBMS提供的SQLDA格式并不是一致的

---

# ODBC简介

ODBC\(Open DataBase Connection\)是一种标准 – 不同语言的应用程序与不同数据库服务器之间通讯的标准

```
一组API(应用程序接口)，支持应用程序与数据库服务器的交互
应用程序通过调用ODBC API, 实现
								与数据服务器的连接
								向数据库发送SQL命令
一条一条的提取数据库检索结果的元组传递给应用程序的变量
ODBC可以配合很多高级语言来使用，如C,C++, C#, Visual Basic, PowerBuilder等...
```

## JDBC

JDBC是一组Java版的应用程序接口API，提供了Java应用程序与数据库服务器的连接和通讯能力.  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052711174218.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527111747867.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527111754805.png)

# 嵌入式语言-ODBC-JDBC比较

嵌入式SQL的思维模式  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527111923457.png)

ODBC的思维模式:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527111952241.png)

JDBC的思维模式:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200527112004980.png)

```
相同点: 都是建立数据库连接, 执行sql, 处理结果, 释放连接, 流程基本一致

不同点, 操作方式的不同:
		嵌入式SQL按照语句进行操作
		ODBC按照函数来进行操作
		JDBC按照对象来进行操作
```