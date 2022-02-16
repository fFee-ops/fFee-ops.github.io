---
title: JDBC
date: 2020-05-05 12:09:35
tags: 
categories: java
---

<!--more-->

# JDBC：

```java
1、	导入驱动，加载具体的驱动类
Class.forName("com.mysql.cj.jdbc.Driver");
2、	与数据库建立连接
conn=DriverManager.getConnection( "jdbc:mysql://localhost:3306/testjdbc?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone = GMT"
, "root", "密码");
3、	发送SQL语句，执行
PreparedStatement prstmt=null;(要建立一个PreparedStatement或Statement对象用来调用其方法执行SQL语句）
prstmt =conn.prepareStatement("insert into t_user (username,pwd,regTime) values(?,?)");

prstmt.setObject(1, "老肥");
prstmt.setObject(2, "123456");
4、	处理结果集（查询）
ResultSet rs=null;
While(rs.next()){

Int 	sname=rs.getString(“name”);
Systyme.out.println(sname);

}

5、	记得要关闭！先打开的后关闭
```

| 数据库驱动 | 驱动jar | 具体驱动类 | 连接字符串 |
| --- | --- | --- | --- |
| Oracle | ojdbc-x.jar | oracle.jdbc.OracleDriver | jdbc:oracle:thin:\@localhost:1521:ORCL |
| MySQL | mysql-connector-java-x.jar | com.mysql.cj.jdbc.Driver | jdbc:mysql://localhost:3306/数据库实例名 |
| SqlServer | sqljdbc-x.jar | com.microsoft.sqlserver.jdbc.SQLServerDriver | jdbc:microsoft:sqlserver:localhost:1433;databasename=数据库实例名 |