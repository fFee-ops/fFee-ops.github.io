---
title: 触发器（trigger）
date: 2020-05-21 18:07:04
tags: 
categories: MySQL
---

<!--more-->

### 触发器 Trigger

- [创建触发器](#_20)
- - [创建只有一个执行语句的触发器](#_58)
  - [创建有多个执行语句的触发器](#_69)
  - [NEW与OLD详解](#NEWOLD_110)
- [查看触发器](#_165)
- [三、删除触发器](#_186)

**什么是触发器？**  
　触发器是与表有关的数据库对象，在满足定义条件时触发，并执行触发器中定义的语句集合。  
　![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521172358366.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**触发器的特点：**  
　1、有begin end体，begin end;之间的语句可以写的简单或者复杂  
　2、什么条件会触发：Input、Delete、Update  
　3、什么时候触发：在增删改前或者后  
　4、触发频率：针对每一行执行  
　5、触发器定义在表上，附着在表上。

---

_**建议不用，或者少用触发器**_  
　假设触发器触发每次执行1s，insert table 500条数据，那么就需要触发500次触发器，光是触发器执行的时间就花费了500s，而insert 500条数据一共是1s，那么这个insert的效率就非常低了。

触发器尽量少的使用，因为不管如何，它还是很消耗资源，如果使用的话要谨慎的使用，确定它是非常高效的：**触发器是针对每一行的；对增删改非常频繁的表上切记不要使用触发器，因为它会非常消耗资源。**

# 创建触发器

```sql
CREATE TRIGGER trigger_name//触发器名称
trigger_time//{ BEFORE | AFTER }
trigger_event //{ INSERT | UPDATE | DELETE }
ON tbl_name//表名
FOR EACH ROW
[trigger_order]//{ FOLLOWS | PRECEDES }
 BEGIN
 ...//要触发的sql语句
 END;

```

·触发器名称 – 触发器名字，最多64个字符，其命令规则和MySQL中其他对象的命名方式类似

·\{ BEFORE | AFTER \} – 触发器执行时间：可以设置为事件发生前或后

·\{ INSERT | UPDATE | DELETE \} – 触发事件：可以设置为在执行INSERT、UPDATE、DELETE操作时触发

```
	tigger_event详解：
	①INSERT型触发器：插入某一行时激活触发器，可能通过INSERT
			　、LOAD DATA、REPLACE 语句触发(LOAD DAT语句用于将一个
			　文件装入到一个数据表中，相当与一系列的INSERT操作)；
			　
	②UPDATE型触发器：更改某一行时激活触发器，可能通过	UPDATE语句触发；
						
	③DELETE型触发器：删除某一行时激活触发器，可能通过DELETE、REPLACE
	语句触发。
```

·表名称 – 触发器所属表：触发器属于某一个表，当在这个表上执行INSERT、UPDATE、DELETE操作的时就会使触发器触发，一张表的同一个事件只能有一个触发器

·FOR EACH ROW – 触发器的执行间隔：FOR EACH ROW子句通知触发器，每行执行一次动作

· trigger\_order是MySQL5.7之后的一个功能，用于定义多个触发器，使用follows\(尾随\)或precedes\(在…之先\)来选择触发器执行的先后顺序。

## 创建只有一个执行语句的触发器

```
CREATE TRIGGER 触发器名 BEFORE|AFTER 触发事件 ON 表名 FOR EACH ROW 执行语句;
```

**例：创建了一个名为trig1的触发器，一旦在work表中有插入动作，就会自动往time表里插入当前时间**

```sql
 CREATE TRIGGER trig1 AFTER INSERT
 ON work FOR EACH ROW
 INSERT INTO time VALUES(NOW());
```

## 创建有多个执行语句的触发器

```
CREATE TRIGGER 触发器名 BEFORE|AFTER 触发事件

ON 表名 FOR EACH ROW

BEGIN

        执行语句列表

END;
```

**例：定义一个触发器，一旦有满足条件的删除操作，就会执行BEGIN和END中的语句**

```sql
mysql> DELIMITER ||    // //将SQL语句的结束符设置为 ||
mysql> CREATE TRIGGER trig2 BEFORE DELETE
    -> ON work FOR EACH ROW
    -> BEGIN
    -> 　　INSERT INTO time VALUES(NOW());
    -> 　　INSERT INTO time VALUES(NOW());
    -> END||
mysql> DELIMITER ;  //将SQL语句的结束符设重置为;以不影响后续使用
```

_DELIMITER详解:_

```
作用： 改变输入结束符。

默认情况下，delimiter是分号“;”。
在命令行客户端中，如果有一行命令以分号结束，
那么回车后，mysql将会执行该命令。
但有时候，不希望MySQL这么做。因为可能输入较多的语句，且语句中包含有分号。
默认情况下，不可能等到用户把这些语句全部输入完之后，再执行整段语句。
因为mysql一遇到分号，它就要自动执行。
这种情况下，就可以使用delimiter，把delimiter后面换成其它符号，如//或$$。
此时，delimiter作用就是对整个小段语句做一个简单的封装。

```

## NEW与OLD详解

MySQL 中定义了 NEW 和 OLD，用来表示触发器的所在表中，触发了触发器的那一行数据，来引用触发器中发生变化的记录内容，具体地：

①在INSERT型触发器中，NEW用来表示将要（BEFORE）或已经（AFTER）插入的新数据；

②在UPDATE型触发器中，OLD用来表示将要或已经被修改的原数据，NEW用来表示将要或已经修改为的新数据；

③在DELETE型触发器中，OLD用来表示将要或已经被删除的原数据；

**使用方法：**

NEW.columnName （columnName为相应数据表某一列名）

**注意**:OLD是只读的，而NEW则可以在触发器中使用 SET 赋值，这样不会再次触发触发器，造成循环调用（如每插入一个学生前，都在其学号前加“2013”）。

```sql
mysql> CREATE TABLE account (acct_num INT, amount DECIMAL(10,2));
mysql> INSERT INTO account VALUES(137,14.98),(141,1937.50),(97,-100.00);

mysql> delimiter $$
mysql> CREATE TRIGGER upd_check BEFORE UPDATE ON account
    -> FOR EACH ROW
    -> BEGIN
    -> 　　IF NEW.amount < 0 THEN
    -> 　　　　SET NEW.amount = 0;
    -> 　　ELSEIF NEW.amount > 100 THEN
    -> 　　　　SET NEW.amount = 100;
    -> 　　END IF;
    -> END$$
mysql> delimiter ;

mysql> update account set amount=-10 where acct_num=137;

mysql> select * from account;
+----------+---------+
| acct_num | amount  |
+----------+---------+
|      137 |    0.00 |
|      141 | 1937.50 |
|       97 | -100.00 |
+----------+---------+

mysql> update account set amount=200 where acct_num=137;

mysql> select * from account;
+----------+---------+
| acct_num | amount  |
+----------+---------+
|      137 |  100.00 |
|      141 | 1937.50 |
|       97 | -100.00 |
+----------+---------+
```

# 查看触发器

1、SHOW TRIGGERS语句查看触发器信息

```sql
mysql> SHOW TRIGGERS\G;
```

结果，显示所有触发器的基本信息；无法查询指定的触发器。

2、在information\_schema.triggers表中查看触发器信息

```sql
mysql> SELECT * FROM information_schema.triggers\G
```

**加了\\G可以更加详细的查看触发器信息**

结果，显示所有触发器的详细信息；同时，该方法可以查询制定触发器的详细信息。

```sql
mysql> select * from information_schema.triggers 
    -> where trigger_name='upd_check'\G;
```

_所有触发器信息都存储在information\_schema数据库下的triggers表中，可以使用SELECT语句查询，如果触发器信息过多，最好通过TRIGGER\_NAME字段指定查询。_

# 三、删除触发器

```sql
DROP TRIGGER [IF EXISTS] [schema_name.]trigger_name
```

删除触发器之后最好使用上面的方法查看一遍；同时，也可以使用database.trig来指定某个数据库中的触发器。

**如果不需要某个触发器时一定要将这个触发器删除，以免造成意外操作\!\!\!。**