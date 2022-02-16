---
title: SQL语言与数据库完整性和安全性
date: 2020-05-22 22:15:52
tags: 
categories: 数据库系统
---

<!--more-->

### SQL语言与数据库完整性和安全性

- [数据库完整性的概念及分类](#_3)
- - [\(1\)什么是数据库完整性\?](#1_12)
  - [\(2\)为什么会产生完整性问题\?](#2_41)
  - [\(3\)怎样保证数据库完整性\?](#3_51)
  - [\(4\)数据库完整性的分类](#4_65)
- [利用SQL语言实现数据库的静态完整性](#SQL_97)
- - [\(1\)SQL语言支持的约束类别](#1SQL_99)
  - [\(2\)SQL语言实现约束的方法-Create Table](#2SQLCreate_Table_108)
  - [\(3\)SQL语言实现约束的方法-断言](#3SQL_175)
- [利用SQL语言实现数据库的动态完整性](#SQL_190)
- [数据库安全性的概念及分类](#_195)
- - [\(1\)数据库安全性的概念](#1_196)
  - [\(2\)数据库安全性的分类](#2_207)
  - - [DBMS的安全机制](#DBMS_208)
  - [\(3\)数据库管理员的责任和义务](#3_224)
- [数据库自主安全性机制](#_238)
- - [\(1\)数据库自主安全性](#1_239)
  - [\(2\)DBMS怎样实现数据库自主安全性](#2DBMS_251)
  - [\(3\)数据库自主安全性访问规则](#3_258)
  - [\(4\)自主安全性的实现方式](#4_277)
  - - [第1种：存储矩阵](#1_278)
    - [第2种：视图](#2_281)
- [\============================](#_285)
- [利用SQL语言实现数据库自主安全性](#SQL_286)
- - [\(1\)SQL语言的用户与权利](#1SQL_288)
  - [\(2\)SQL-DCL的命令及其应用](#2SQLDCL_313)
- [安全性控制的其他简介](#_344)
- - [\(1\)自主安全性的授权过程及其问题](#1_345)
  - [\(2\)强制安全性](#2_378)

这章内容是有点多。。差点写吐了🤮

# 数据库完整性的概念及分类

**数据的完整性**  
防止数据库中存在不符合语义的数据，也就是防止数据库中存在不正确的数据  
防范对象：不合语义的、不正确的数据  
**数据的安全性**  
保护数据库 防止恶意的破坏和非法的存取  
防范对象：非法用户和非法操作

---

## \(1\)什么是数据库完整性\?

数据库完整性\(DB Integrity\)是指DBMS应保证的DB的一种特性–在任何情  
况下的正确性、有效性和一致性  
广义完整性：语义完整性、并发控制、安全控制、DB故障恢复等  
狭义完整性：专指语义完整性，DBMS通常有专门的完整性管理机制与程  
序来处理语义完整性问题。\(本讲专指语义完整性\)

**关系模型中有完整性要求**

```
 实体完整性
实体完整性是对关系中的记录唯一性，也就是主键的约束。准确地说，实体完整性
是指关系中的主属性值不能为Null且不能有相同值。定义表中的所有行能唯一的标
识,一般用主键,唯一索引 unique关键字,及identity属性比如说我们的身份证号
码,可以唯一标识一个人。

 参照完整性
参照完整性是对关系数据库中建立关联关系的数据表间数据参照引用的约束，也就是
对外键的约束。准确地说，参照完整性是指关系中的外键必须是另一个关系的主键有
效值，或者是NULL。参考完整性维护表间数据的有效性,完整性,通常通过建立外部
键联系另一表的主键实现,还可以用触发器来维护参考完整性

 用户自定义完整性
用户定义完整性（User-defined Integrity）是对数据表中字段属性的约束，
用户定义完整性规则（User-defined integrity）也称域完整性规则。包括字段
的值域、字段的类型和字段的有效规则（如小数位数）等约束，是由确定关系结构时
所定义的字段的属性决定的。如，百分制成绩的取值范围在0~100之间等。

```

## \(2\)为什么会产生完整性问题\?

不正当的数据库操作，如输入错误、操作失误、程序处理失误等

**数据库完整性管理的作用:**  
 防止和避免数据库中不合理数据的出现  
 DBMS应尽可能地自动防止DB中语义不合理现象  
 如DBMS不能自动防止，则需要应用程序员和用户在进行数据库操作时处处加以小心，每写一条SQL语句都要考虑是否符合语义完整性，这种工作负担是非常沉重的，因此应尽可能多地让DBMS来承担。

## \(3\)怎样保证数据库完整性\?

 DBMS允许用户定义一些完整性约束规则\(用SQL-DDL来定义\)  
 当有DB更新操作时，DBMS自动按照完整性约束条件进行检查，以确保更  
新操作符合语义完整性  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522214610819.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**完整性约束条件\(或称完整性约束规则\)的一般形式**  
Integrity Constraint ::= \( O，P，A，R\)  
√ O：数据集合：约束的对象？  
列、多列\(元组\)、元组集合  
√ P：谓词条件：什么样的约束？  
√A：触发条件：什么时候检查？  
√ R：响应动作：不满足时怎么办？

## \(4\)数据库完整性的分类

**按约束对象分类**  
域完整性约束条件：  
施加于某一列上，对给定列上所要更新的某一候选值是否可以接受进行  
约束条件判断，这是孤立进行的

关系完整性约束条件：  
施加于关系/table上，对给定table上所要更新的某一候选元组是否可  
以接受进行约束条件判断，或是对一个关系中的若干元组和另一个关系  
中的若干元组间的联系是否可以接受进行约束条件判断

**按约束来源分类**  
结构约束：  
来自于模型的约束，例如函数依赖约束、主键约束\(实体完整性\)、外键  
约束\(参照完整性\)，只关心数值相等与否、是否允许空值等；

内容约束：  
来自于用户的约束，如用户自定义完整性，关心元组或属性的取值范  
围。例如Student表的Sage属性值在15岁至40岁之间等。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522215145517.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**按约束状态分类**  
静态约束：  
要求DB在任一时候均应满足的约束；例如Sage在任何时候都应满足大  
于0而小于150\(假定人活最大年龄是150\)。

动态约束：  
要求DB从一状态变为另一状态时应满足的约束；例如工资只能升，不  
能降：工资可以是800元，也可以是1000元；可以从800元更改为1000  
元，但不能从1000元更改为800元。

# 利用SQL语言实现数据库的静态完整性

## \(1\)SQL语言支持的约束类别

_静态约束：_  
列完整性—域完整性约束  
表完整性–关系完整性约束

_动态约束：_  
触发器  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522215355468.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## \(2\)SQL语言实现约束的方法-Create Table

CreateTable有三种功能：定义关系模式、定义完整性约束和定义物理存储特性

```
 定义完整性约束条件：
	列完整性
	表完整性
```

```sql
   USE 数据库名 CREATE TABLE 表名 (列名 类型(大小) DEFAULT'默认值' CONSTRAINT 约束名 约束定义,

                                                         列名 类型(大小) DEFAULT'默认值' CONSTRAINT 约束名 约束定义,  

                                                         列名 类型(大小) DEFAULT'默认值' CONSTRAINT 约束名 约束定义,

                                                         ... ...);
```

---

**Col\_constr列约束**

一种域约束类型，对单一列的值进行约束

```sql
{ NOT NULL | //列值非空
[ CONSTRAINT constraintname ] //为约束命名，便于以后撤消
{ UNIQUE //列值是唯一
| PRIMARY KEY //列为主键
| CHECK (search_cond) //列值满足条件,条件只能使用列当前值
| REFERENCES tablename [(colname) ]
[ON DELETE { CASCADE | SET NULL } ] } }
//引用另一表tablename的列colname的值，如有ON DELETE CASCADE 或ON DELETE SET
NULL语句，则删除被引用表的某列值v 时，要将本表该列值为v 的记录删除或列值更新为
null；缺省为无操作 。
```

**Col\_constr列约束：只能应用在单一列上，其后面的约束如UNIQUE,  
PRIMARY KEY及search\_cond只能是单一列唯一、单一列为主键、和单一列相关**

**示例:**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522221147570.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522221226364.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**table\_constr表约束：**  
一种关系约束类型，对多列或元组的值进行约束

是应用在关系上，即对关系的多列或元组进行约束，列约束是其特例  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523065334573.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**示例：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523065522332.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

check中的条件可以是Select-From-Where内任何Where后的语句，包含  
子查询。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523065732489.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

Create Table中定义的表约束或列约束可以在以后根据需要进行撤消或追  
加。撤消或追加约束的语句是 Alter Table\(不同系统可能有差异\)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052306583713.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052307001814.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## \(3\)SQL语言实现约束的方法-断言

一个断言就是一个谓词表达式，它表达了希望数据库总能满足的条件

1.表约束和列约束就是一些特殊的断言

2.SQL还提供了复杂条件表达的断言。其语法形式为：

```sql
CREATE ASSERTION <assertion-name> CHECK <predicate>
```

3.当一个断言创建后，系统将检测其有效性，并在每一次更新中测试更新是  
否违反该断言。

4.断言测试增加了数据库维护的负担，要小心使用复杂的断言  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523071404950.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 利用SQL语言实现数据库的动态完整性

触发器：[Mysql–触发器](https://blog.csdn.net/qq_21040559/article/details/106262630)

# 数据库安全性的概念及分类

## \(1\)数据库安全性的概念

数据库安全性是指DBMS应该保证的数据库的一种特性\(机制或手段\)：免受  
非法、非授权用户的使用、泄漏、更改或破坏

**数据的安全级别: 绝密\(Top Secret\), 机密\(Secret\),可信\(Confidential\)  
和无分类\(Unclassified\)**

数据库系统DBS的安全级别：物理控制、网络控制、操作系统控制、  
DBMS控制

## \(2\)数据库安全性的分类

### DBMS的安全机制

**自主安全性机制：存取控制\(AccessControl\)**  
通过权限在用户之间的传递，使用户自主管理数据库安全性

**强制安全性机制：**  
通过对数据和用户强制分类，使得不同类别用户能够访问不同类  
别的数据

**推断控制机制：\(可参阅相关文献\)**  
① 防止通过历史信息，推断出不该被其知道的信息；  
② 防止通过公开信息\(通常是一些聚集信息\)推断出私密信息\(个体信  
息\)，通常在一些由个体数据构成的公共数据库中此问题尤为重要

**数据加密存储机制：\(可参阅相关文献\)**  
通过加密、解密保护数据，密钥、加密/解密方法与传输

## \(3\)数据库管理员的责任和义务

**DBA的责任和义务**  
 熟悉相关的法规、政策，协助组织的决策者制定好相关的安全策略

 规划好安全控制保障措施，例如，系统安全级别、不同级别上的安全控制  
措施，对安全遭破坏的响应，

 划分好数据的安全级别以及用户的安全级别

 实施安全性控制：DBMS专门提供一个DBA账户，该账户是一个超级用户  
或称系统用户。DBA利用该账户的特权可以进行用户账户的创建以及权限授  
予和撤消、安全级别控制调整等

# 数据库自主安全性机制

## \(1\)数据库自主安全性

**自主安全性机制：**  
①通常情况下，自主安全性是通过授权机制来实现的。

②用户在使用数据库前必须由DBA处获得一个账户，并由DBA授予该账户一  
定的权限，该账户的用户依据其所拥有的权限对数据库进行操作; 同时，该帐  
户用户也可将其所拥有的权利转授给其他的用户\(账户\)，由此实现权限在用户  
之间的传播和控制。

 授权者：决定用户权利的人  
 授权：授予用户访问的权利

## \(2\)DBMS怎样实现数据库自主安全性

①DBMS允许用户定义一些安全性控制规则\(用SQL-DCL来定义\)

② 当有DB访问操作时，DBMS自动按照安全性控制规则进行检查，检查通过  
则允许访问，不通过则不允许访问  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523085458785.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## \(3\)数据库自主安全性访问规则

DBMS将权利和用户\(账户\)结合在一起，形成一个访问规则表，依据该规则  
表可以实现对数据库的安全性控制

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523085708412.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

 \{ AccessRule｝通常存放在数据字典或称系统目录中，构成了所有用  
户对DB的访问权利;  
 用户多时，可以按用户组建立访问规则  
 访问对象可大可小\(目标粒度Object granularity\):属性/字段、记录/元  
组、关系、数据库  
 权利：包括创建、增、删、改、查等  
 谓词：拥有权利需满足的条件

---

**示例：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052308590237.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## \(4\)自主安全性的实现方式

### 第1种：存储矩阵

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523091310208.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### 第2种：视图

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523091354747.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# \============================

# 利用SQL语言实现数据库自主安全性

## \(1\)SQL语言的用户与权利

数据库安全性控制是属于DCL范畴

---

授权机制—自主安全性；视图的运用

**关系级别\(普通用户\) \<-- 账户级别\(程序员用户\) \<-- 超级用户\(DBA\)**

```
 (级别1)Select : 读(读DB, Table, Record, Attribute, … )

 (级别2)Modify : 更新
	 Insert : 插入(插入新元组, … )
	 Update : 更新(更新元组中的某些值, …)
	 Delete : 删除(删除元组, …)
 
 (级别3)Create : 创建(创建表空间、模式、表、索引、视图等)
 	  Create : 创建
	  Alter : 更新
	  Drop : 删除
```

**级别高的权利自动包含级别低的权利。如某人拥有更新的权利，它也自动  
拥有读的权利。在有些DBMS中，将级别3的权利称为账户级别的权利，而将  
级别1和2称为关系级别的权利。**

## \(2\)SQL-DCL的命令及其应用

**授权命令:**

```sql
2.授权
grant privileges on dbname.tablename to 'username'@'host' identified by 'password' [with grant option]
 
-- privileges:用户的操作权限,如SELECT , INSERT , UPDATE 等（具体详见下表）,如果要授予所的权限,则使用all
-- dbname:数据库名，tablename:表名，如果是所有表的话，则dbname.*
-- with grant option:命令中不带这个，则，该用户username不能将权限授予其他人，反之，则可以
 
/* 
举个例子：
grant selelct on test.* to 'lzh'@'localhost' identified by '123456';
grant all on  *.* to 'lzh'@'%' with grant option;
*/
```

**示例：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523093017210.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

**收回授权命令**

```sql
4.撤销用户权限
 revoke privilege on dbname.tablename from 'username'@'host'
 
-- privilege:同授权部分

# 示例：revoke select on employee from UserB;
```

# 安全性控制的其他简介

## \(1\)自主安全性的授权过程及其问题

**授权过程:**

```
第一步：DBA创建DB, 并为每一个用户创建一个账户
<假定建立了五个用户：UserA, UserB, UserC, UserD, UserE>

第二步：DBA授予某用户账户级别的权利
<假定授予UserA>

第三步：具有账户级别的用户可以创建基本表或视图, 他也自动成为该表或
该视图的属主账户，拥有该表或该视图的所有访问 权利
<假定UserA创建了Employee, 则UserA就是Employee表的属主账户>

第四步：拥有属主账户的用户可以将其中的一部分权利授予另外的用户，该
用户也可将权利进一步授权给其他的用户…
<假定UserA将读权限授予UserB, 而userB又将其拥有的权限授予UserC,
如此将权利不断传递下去。>

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052309392822.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**注意授权的传播范围:**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052309395543.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523094347806.png)  
① 当一个用户的权利被收回时，通过其传播给其他用户的权利也将被收回

②如果一个用户从多个用户处获得了授权，则当其中某一个用户收回授权时  
，该用户可能仍保有权利。例如UserC从UserB和UserE处获得了授权，当  
UserB收回时，其还将保持UserE赋予其的权利。

## \(2\)强制安全性

①强制安全性通过对数据对象进行安全性分级  
绝密\(Top Secret\), 机密\(Secret\),可信\(Confidential\)和无分类\(Unclassified\)  
② 同时对用户也进行上述的安全性分级  
③从而强制实现不同级别用户访问不同级别数据的一种机制

**强制安全性机制的实现**

```
DBMS引入强制安全性机制, 可以通过扩展关系模式来实现
	 关系模式: R(A1: D1, A2: D2, …, An:Dn)
	 对属性和元组引入安全性分级特性或称分类特性
	R(A1: D1, C1, A2: D2, C2…, An:Dn, Cn, TC
	)
		其中 C1,C2,…,Cn分别为属性D1,D2,…,Dn的安全分类特性; TC为元
		组的分类特性
```

这样, 关系中的每个元组, 都将扩展为带有安全分级的元组, 例如  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200523094746203.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)