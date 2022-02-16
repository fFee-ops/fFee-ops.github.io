---
title: 嵌入式SQL语言之基本技巧
date: 2020-05-25 19:53:31
tags: 
categories: 数据库系统
---

<!--more-->

### 文章目录

- [一、交互式SQL的局限性（引入嵌入式SQL）](#SQLSQL_2)
- [二、 嵌入式SQL语言的形式\(假设宿主语言为C语言\)](#_SQLC_8)
- [三、连接/断开数据库](#_41)
- [四、SQL语句执行的提交/撤消](#SQL_69)
- [五、事务](#_89)
- [六、游标\(读取多行数据\)](#_92)
- [七、状态捕获及错误处理机制](#_153)

# 一、交互式SQL的局限性（引入嵌入式SQL）

专业人员\(如DBA\)可以熟练地运用交互式SQL语言，但普通用户却不是那么容易上手，所以需要通过数据库应用程序来使用数据库。编写一个可以与数据库交互的数据库应用程序，仅仅靠交互式SQL语言是无法完成的，还需要高级语言的加持。为了能让SQL语句能和高级语言交互，我们提出了嵌入式SQL语言这一概念。

从SQL语句本身的角度来看，交互式SQL语言存在以下局限性：特别复杂的检索结果难以用一条交互式SQL语句完成。此时需要结合高级语言中的流程控制语句\(即联合多条SQL语句\)来帮助处理，这也是嵌入式SQL语言所具备的一个特性。

# 二、 嵌入式SQL语言的形式\(假设宿主语言为C语言\)

**1\. 示例：交互式SQL语句 \& 嵌入式SQL语句**

```sql
select Sname, Sage from Student where Sname = '张三';
exec sql select Sname, Sage into :vSname, :vSage from Student where Sname = '张三';
```

```
①exec sql：引导词，使得C编译器知道该条语句是嵌入式SQL语句

②增加into子句：指出用于接收SQL语句检索结果的程序变量

③为了区分属性和程序变量，应在程序变量前加上冒号
```

**2\. 嵌入式SQL语言中变量的声明与使用**

①在嵌入式SQL语句中可以出现宿主语言中所用的变量：

```sql
exec sql select Sname, Sage into :vSname, :vSage from Student where Sname = :specName;
```

②这些变量的声明方式：

```sql
    exec sql begin declare section;

        char vSname[10], specName[10] = "张三";

        int vSage;

    exec sql end declare section;
```

注意1：宿主语言的字符串变量需多存储’\\0’  
注意2：宿主语言的变量类型与数据库的字段类型之间是有差异的，有些DBMS可支持自动转换，有些则不能

# 三、连接/断开数据库

1.  在嵌入式SQL程序执行之前，首先要与数据库进行连接

①SQL标准中建议的连接数据库语法形式：

```sql
exec sql connect to target-server as connect-name user user-name;
或exec sql connect to default;
```

②不同的DBMS拥有不同的连接语法形式：

```sql
Oracle：exec sql connect :user_name identified by :user_pwd;
DB2：exec sql connect to mydb user :user_name using :user_pwd;
```

2.  在嵌入式SQL程序执行之后，需要与数据库断开连接

①SQL标准中建议的断开数据库语法形式：

```sql
exec sql disconnect conect-name;
或exec sql disconnect current;
```

②不同的DBMS拥有不同的断开语法形式：

```sql
Oracle：exec sql commit release;
DB2：exec sql connect reset;
```

# 四、SQL语句执行的提交/撤消

必须通过提交或撤消来确认此次SQL语句的执行是否有效

1.  SQL执行的提交：exec sql commit work;

2.  SQL执行的撤消：exec sql rollback work;

  3.  在断开数据库之前确保是否提交/撤消

    ①为了确保在断开数据库之前使用户确认提交或撤消先前的工作，许多DBMS都设计了将提交/撤消与断开连接捆绑在一起的语句

```sql
Oracle：exec sql commit release;
Oracle：exec sql rollback release;
```

# 五、事务

[事务](https://blog.csdn.net/qq_21040559/article/details/105330253)

# 六、游标\(读取多行数据\)

1.  游标的概念

    ①游标是一个指向某检索记录集的指针

    ②作用：通过该指针的移动，可依次处理记录集中的每一个记录

2.  读取一行数据是通过使用fetch…into语句实现的

    ①首次fetch时，游标是指向记录集的第一条记录，每一次fetch，都是先向下移动游标，然后再读取

    ②记录集有结束标识EOF，用来标记后面已没有记录了\(即已读完了\)

3.  游标的使用

①需要先定义一个游标，再打开\(执行\)，然后开始逐行处理，最后关闭：

```sql
        exec sql declare cur_student cursor for select Sno, Sname, Sclass from Student where Sclass = '035101';

        exec sql open cur_student;

        exec sql fetch cur_student into :vSno, :vSname, :vSclass;

        ...

        exec sql close cur_student;
```

②游标可以定义一次，多次打开\(执行\)，多次关闭。

③标准的游标始终是自开始向结束方向移动的，每fetch一次，向结束方向移动一次，这样一条记录只能被访问一次，再次访问该记录只能关闭该游标后重新打开。

4.  可滚动游标

①可滚动游标不同于标准的游标，它可在记录集之间灵活移动，从而可使每条记录被反复访问

②定义方式：

```sql
  exec sql declare 游标名 [INSENSITIVE] [SCROLL] cursor for ...
```

③使用方式：

```sql
exec sql fecth [NEXT | PRIOR | FIRST | LAST | [ABSOLUTE | RELATIVE] value_spec] from 游标名 into ...

NEXT：向结束方向移动一条
PRIOR：向开始方向移动一条
FIRST：移动到第一条
LAST：移动到最后一条
ABSOLUTE value_spec：定向检索指定位置的行，value_spec取值范围为1~当前记录集最大值
RELATIVE value_spec：相对当前记录向前或向后移动
value_spec：为正数则向结束方向移动，为负数则向开始方向移动
```

④可滚动游标在移动前需判断是否到结束位置EOF，或到开始位置BOF

# 七、状态捕获及错误处理机制

**1\. 状态的概念**

```
①状态：嵌入式SQL语句的执行状态，尤其指一些出错状态。

②有时程序需要知道这些状态，并对这些状态进行处理。
```

**2\. 状态捕获及处理由三部分组成**

①设置SQL通信区：一般在嵌入式SQL程序的开始处设置

```sql
exec sql include sqlca;
```

②设置状态捕获语句：在任何位置都可设置，可多次设置，有其作用域

```sql
exec sql whenever sqlerror goto report_error;
```

③状态处理语句：一段程序，用于处理SQL操作的某种状态

```sql
report_error: exec sql rollback;
```

**3\. SQL通信区\(SQLCA\)**

SQLCA是一个已被声明过的具C语言的结构形式的内存信息区，其中的成员变量用来记录SQL语句执行的状态，便于宿主程序读取与处理

**4\. 状态捕获语句：exec sql whenever condition action**

①whenever语句设置一个“条件陷阱”，其会对作用域内的exec sql语句自动检查是否满足条件\(由conditon指出\)  
sqlerror：检测是否有sql语句出错  
not found：执行某一sql语句后，没有相应的结果记录出现  
sqlwarning：不是错误，但应引起注意

②如果满足condition，则要采取一些动作\(由action指出\)  
continue：忽略条件或错误，继续执行  
goto 标号：转移到标号所指示的语句，去进行相应的处理  
stop：终止程序的执行、撤消当前的工作、断开数据库  
do函数或call函数：调用宿主程序的函数进行处理，函数返回后从引发该condition的exec sql语句后继续执行

③状态捕获语句whenever的作用域是其后所有的exec sql语句，一直到程序中出现另一相同条件的whenever语句为止

**5\. 记录状态信息的三种方法**

```
①sqlcode：DBMS提供一个sqlcode变量来记录SQL语句执行的状态信息

②sqlca.sqlcode：类似于sqlcode，但其属于sqlca

③sqlstate：有些DBMS提供该变量来记录SQL语句执行的状态信息

④使用这些变量，我们可以明确错误类型，从而进行显式状态处理
```