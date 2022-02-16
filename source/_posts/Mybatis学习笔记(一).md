---
title: Mybatis学习笔记(一)
date: 2020-03-27 12:34:16
tags: mybatis
categories: Mybatis
---

<!--more-->

### Mybatis的基础CRUD

- [三个步骤](#_2)
- [一些约定](#_6)
- [注意事项：](#_18)

# 三个步骤

```
	1.conf.xml (数据库配置信息、映射文件)
	2.表-类：映射文件  mapper.xml
	3.测试
```

# 一些约定

```
输入参数parameterType 和 输出参数resultType ，在形式上都只能有一个


如果输入参数 ：是简单类型（8个基本类型+String） 是可以使用任何占位符,#{xxxx}
	       如果是对象类型，则必须是对象的属性 #{属性名}

输出参数：  如果返回值类型是一个 对象（如Student），则无论返回一个、还是多个，
		再resultType都写成org.lanqiao.entity.Student
		即 resultType="org.lanqiao.entity.Student"
```

# 注意事项：

```
如果使用的 事务方式为 jdbc,则需要 手工commit提交，即session.commit();
			JDBC：为手动，需要手动commit  close等等  
				  MANAGED:将事务交给其他组件去托管。
 dataSource:数据源类型
			POOLED:使用连接池
			UNPOOLED：使用传统的JDBC模式（每次访问数据库，都需要打开关闭数据库等操作，比较耗费性能）
			JNDI：从tomcat中获取一个内置的数据库连接池

<  ！DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
	该段的作用是可以给xml开启提示功能，但是需要联网，如果网络差 则无法实现提示功能
	可以http://mybatis.org/dtd/mybatis-3-mapper.dtd下载下来，然后去XML里面添加就可实现提示功能
```