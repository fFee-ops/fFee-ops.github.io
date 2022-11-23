---
title: TiDB与MySQL兼容性对比
date: 2022-11-06 15:35:59
tags: TIDB
categories: TIDB
---

<!--more-->

- TiDB支持MySQL传输协议及其绝大多数的语法。这意味着您现有的MySQL连接器和客户端都可以继续使用。 大多数情况下您现有的应用都可以迁移至 TiDB，无需任何代码修改。
- 当前TiDB服务器官方支持的版本为MySQL 5.7。大部分MySQL运维工具（如PHPMyAdmin,Navicat, MySQL Workbench等），以及备份恢复工具（如 mysqldump, Mydumper/myloader）等都可以直接使用。
- 不过一些特性由于在分布式环境下没法很好的实现，目前暂时不支持或者是表现与MySQL有差异
- 一些MySQL语法在TiDB中可以解析通过，但是不会做任何后续的处理，例如Create Table语句中Engine，是解析并忽略。

# 1 TiDB不支持的MySql特性

- 存储过程与函数
- 触发器
- 事件
- 自定义函数
- 外键约束
- 临时表
- 全文/空间函数与索引
- 非 ascii / latin1 / binary / utf8 / utf8mb4 的字符集
- SYS schema
- MySQL 追踪优化器
- XML 函数
- X-Protocol
- Savepoints
- 列级权限
- XA 语法（TiDB 内部使用两阶段提交，但并没有通过 SQL 接口公开）
- CREATE TABLE tblName AS SELECT stmt 语法
- CHECK TABLE 语法
- CHECKSUM TABLE 语法
- GET\_LOCK 和 RELEASE\_LOCK 函数

# 2 自增ID

TiDB 的自增列仅保证唯一，也能保证在单个 TiDB server 中自增，但不保证多个 TiDB server 中自增，不保证自动分配的值的连续性，建议不要将缺省值和自定义值混用，若混用可能会收 DuplicatedError 的错误信息。

TiDB 可通过 `tidb_allow_remove_auto_inc` 系统变量开启或者关闭允许移除列的  
AUTO\_INCREMENT 属性。删除列属性的语法是： alter table modify 或 alter table change 。

TiDB 不支持添加列的 AUTO\_INCREMENT 属性，移除该属性后不可恢复。

# 3 SELECT 的限制

- 不支持 SELECT … INTO \@变量 语法。
- 不支持 SELECT … GROUP BY … WITH ROLLUP 语法。
- TiDB 中的 SELECT … GROUP BY expr 的返回结果与 MySQL 5.7 并不一致。MySQL 5.7 的结果等价于 `GROUP BY expr ORDER BY expr` 。而 TiDB 中该语法所返回的结果并不承诺任何顺序，与MySQL 8.0 的行为一致。

# 4 视图

目前TiDB不支持对视图进行UPDATE、INSERT、DELETE等写入操作。

# 5 默认设置差异

## 5.1 字符集

TiDB 默认： utf8mb4 。  
MySQL 5.7 默认： latin1 。  
MySQL 8.0 默认： utf8mb4 。

## 5.2 排序规则

TiDB 中 utf8mb4 字符集默认： utf8mb4\_bin 。  
MySQL 5.7 中 utf8mb4 字符集默认： utf8mb4\_general\_ci 。  
MySQL 8.0 中 utf8mb4 字符集默认： utf8mb4\_0900\_ai\_ci 。

## 5.3 大小写敏感

关于 lower\_case\_table\_names 的配置  
TiDB 默认： 2 ，且仅支持设置该值为 2 。  
MySQL 默认如下：  
Linux 系统中该值为 0  
Windows 系统中该值为 1  
macOS 系统中该值为 2

> 参数解释  
> lower\_case\_table\_names=0 表名存储为给定的大小和比较是区分大小写的  
> lower\_case\_table\_names = 1 表名存储在磁盘是小写的，但是比较的时候是不区分大小写  
> lower\_case\_table\_names=2 表名存储为给定的大小写但是比较的时候是小写的

## 5.4 timestamp类型字段更新

默认情况下，timestamp类型字段所在数据行被更新时，该字段会自动更新为当前时间，而参数`explicit_defaults_for_timestamp`控制这一种行为。

TiDB 默认： ON ，且仅支持设置该值为 ON 。  
MySQL 5.7 默认： OFF 。  
MySQL 8.0 默认： ON 。

> explicit\_defaults\_for\_timestamp=off，数据行更新时，timestamp类型字段更新为当前时间  
> explicit\_defaults\_for\_timestamp=on，数据行更新时，timestamp类型字段不更新为当前时间。

## 5.5 外键支持

TiDB 默认： OFF ，且仅支持设置该值为 OFF 。  
MySQL 5.7 默认： ON 。