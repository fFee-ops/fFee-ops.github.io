---
title: SpringBoot 与JDBC
date: 2020-05-09 14:02:51
tags: 
categories: SpringBoot
---

<!--more-->

### \-

  
pom.xml

```xml
<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-jdbc</artifactId>
		</dependency>
		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
			<scope>runtime</scope>
		</dependency>
```

配置文件：

```yaml
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql://192.168.15.22:3306/jdbc
    driver-class-name: com.mysql.cj.jdbc.Driver
```

**DataSourceInitializer：ApplicationListener；**

```
作用：

	1）、runSchemaScripts();运行建表语句；

	2）、runDataScripts();运行插入数据的sql语句；
```

默认只需要将文件命名为：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200509135856550.png)  
操作数据库：自动配置了JdbcTemplate操作数据库