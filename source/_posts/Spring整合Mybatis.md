---
title: Spring整合Mybatis
date: 2020-04-15 21:09:56
tags: 
categories: Spring
---

<!--more-->

### Spring整合Mybatis

- [Spring - MyBatis](#Spring__MyBatis_2)

# Spring - MyBatis

项目结构：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200415210914413.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
思路：  
SqlSessionFactory \-> SqlSession \->StudentMapper \->CRUD  
可以发现 ，MyBatis最终是通过SqlSessionFactory来操作数据库，  
Spring整合MyBatis 其实就是 将MyBatis的SqlSessionFactory 交给Spring

SM整合步骤：  
1.jar  
mybatis-spring.jar spring-tx.jar spring-jdbc.jar spring-expression.jar  
spring-context-support.jar spring-core.jar spring-context.jar  
spring-beans.jar spring-aop.jar spring-web.jar commons-logging.jar  
commons-dbcp.jar ojdbc.jar mybatis.jar log4j.jar commons-pool.jar

2.类-表

3.MyBatis配置文件conf.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
	
		<!-- 加载映射文件 -->
	<mappers>
	<mapper  resource="org/cduck/mapper/StudentMapper.xml"/>
	</mappers>
</configuration>
```

4.通过mapper.xml将 类、表建立映射关系

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- <!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
	该段的作用是可以给xml开启提示功能，但是需要联网，如果网络差 则无法实现提示功能
	可以http://mybatis.org/dtd/mybatis-3-mapper.dtd下载下来，然后去XML里面添加就可实现提示功能
 -->
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!-- 映射文件 -->
<mapper namespace="org.cduck.mapper.StudentMapper">

	<insert id="addStudent" parameterType="org.cduck.entity.Student">
			insert into student(stuNo,stuName,stuAge) values(#{stuNo},#{stuName},#{stuAge}) 
	</insert>
	
</mapper>
```

5.之前使用MyBatis: conf.xml \->SqlSessionFacotry

现在整合的时候，需要通过Spring管理SqlSessionFacotry ，因此 产生qlSessionFacotry 所需要的数据库信息 不在放入conf.xml 而需要放入spring配置文件中

配置Spring配置文件（applicationContext.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

<!-- 加载db.properties文件 -->
<bean id="config" class="org.springframework.beans.factory.config.PreferencesPlaceholderConfigurer">
	<property name="locations">
		<array>
			<value>classpath:db.properties</value>		
		</array>
	
	</property>
</bean>


<!-- 配置数据库信息，（代替mybatis的配置文件config.xml） -->
<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
	<property name="url" value="${url}"></property>
	<property name="driverClassName" value="${driver}"></property>
	<property name="username" value="${username}"></property>
	<property name="password" value="${password}"></property>
</bean>

<!-- 在IOC容器中创建mybatis核心类SqlSessionFactory -->
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
	<property name="dataSource" ref="dataSource"></property>
	<!-- 加载mybatis配置文件 -->
	<property name="configLocation" value="classpath:config.xml"></property>
		
</bean>

<bean id="studentService" class="org.cduck.service.impl.StudentServiceImpl">
	<property name="studentmapper" ref="studentMapper"></property>
</bean>

<bean id="studentMapper" class="org.cduck.dao.impl.StudentDaoImpl">
<!-- DAO层中并没有属性，但是它继承的父类有属性，实现该属性才能将SPRING配置的
	sqlSessionFactory交给DAO层 -->
<property name="sqlSessionFactory" ref="sqlSessionFactory"></property>
</bean>
</beans>
```

_**注意**_  
这里的StudentMapper.java其实应该看成三层架构里的Dao接口IStudentDao，但是为了整合mybatis所以更名为Mapper

6.使用Spring-MyBatis整合产物开发程序  
目标：通过spring产生mybatis最终操作需要的 动态mapper对象\(StudentMapper对象\)  
Spring产生 动态mapper对象 有3种方法：  
a.第一种方式\(就是上面实现的步骤\)  
DAO层实现类 继承 SqlSessionDaoSupport类

```
	 SqlSessionDaoSupport类提供了一个属性 SqlSession
```

b.第二种方式  
就是省略掉 第一种方式的 实现类  
直接用MyBatis提供的 Mapper实现类：org.mybatis.spring.mapper.MapperFactoryBean  
缺点：每个mapper都需要一个配置一次

```xml
	 <!-- 第二种方式生成mapper对象  ,相较于第一种方式，可以不写dao的实现类因为
	 org.mybatis.spring.mapper.MapperFactoryBean的类已经帮你写好了，你只需要告诉它接口的位置	-->
	 <bean id="studentMapper" class="org.mybatis.spring.mapper.MapperFactoryBean">
	 	<property name="mapperInterface" value="org.cduck.mapper.StudentMapper"></property>
	 	<property name="sqlSessionFactory" ref="sqlSessionFactory"></property>
	 </bean>

```

c.第三种方式  
批量配置 实现类

```xml
<!-- 第三种方式生成mapper对象(批量产生多个mapper)
	 	批量产生Mapper对在SpringIOC中的 id值 默认就是  首字母小写接口名 (首字母小写的接口名=id值)
	 	  -->
	 <bean id="mappers" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
	 	<property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"></property>
	 	 	 <!--指定批量产生 哪个包中的mapper对象
	 	 	 	  -->
	 	 	<property name="basePackage" value="org.cduck.mapper"></property>
	 </bean>
	 
<bean id="studentService" class="org.cduck.service.impl.StudentServiceImpl">
	<property name="studentmapper" ref="studentMapper"></property>
</bean>

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200416142805280.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)