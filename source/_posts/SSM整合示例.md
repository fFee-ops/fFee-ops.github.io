---
title: SSM整合示例
date: 2020-05-03 13:50:18
tags: 
categories: SpringMVC
---

<!--more-->

### 没有标题

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200503134537434.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
controller:

```java
package org.cduck.controller;

import java.util.Map;

import org.cduck.entity.Student;
import org.cduck.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("stu")
@Controller
public class StuController {

	@Autowired
	StudentService stuService;
	@RequestMapping("query/{stuno}")
	public String queryStu(@PathVariable("stuno") int stuno,Map map) {
		Student student=stuService.queryStu(stuno);
		map.put("student", student);
		return "result";
		
	}
	
	@RequestMapping(value = "add")
	public String addStudent(Student student) {
		stuService.addStudent(student);
		return "result";
	}
	
}

```

student:

```java
package org.cduck.controller;

import java.util.Map;

import org.cduck.entity.Student;
import org.cduck.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("stu")
@Controller
public class StuController {

	@Autowired
	StudentService stuService;
	@RequestMapping("query/{stuno}")
	public String queryStu(@PathVariable("stuno") int stuno,Map map) {
		Student student=stuService.queryStu(stuno);
		map.put("student", student);
		return "result";
		
	}
	
	@RequestMapping(value = "add")
	public String addStudent(Student student) {
		stuService.addStudent(student);
		return "result";
	}
	
}
```

mapper.java:

```java
package org.cduck.mapper;

import org.cduck.entity.Student;

public interface StudentMapper {
	public void addStudent(Student student);
	Student queryStu(int stuno);
}
```

mapper.xml

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
	
	<select id="queryStu" resultType="org.cduck.entity.Student" parameterType="int">
			select * from student
	</select>
</mapper>
```

Service:  
接口：

```java
package org.cduck.service;

import org.cduck.entity.Student;
import org.springframework.stereotype.Service;

public interface StudentService {
	public void addStudent(Student student);
	Student queryStu(int stuno);
}
```

实现类：

```java
package org.cduck.service;

import org.cduck.entity.Student;
import org.cduck.mapper.StudentMapper;
import org.springframework.beans.factory.annotation.Autowired;

public class StudentServiceImpl implements StudentService {
	
	//service依赖于Dao
	StudentMapper studentmapper;

	public void setStudentmapper(StudentMapper studentmapper) {
		this.studentmapper = studentmapper;
	}

	@Override
	public Student queryStu(int stuno) {
		Student student=studentmapper.queryStu(stuno);
		return student;
		
	}

	@Override
	public void addStudent(Student student) {
		studentmapper.addStudent(student);
	}

}

```

spring配置文件：  
applicationContext.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd">

<!-- 配置数据源、mapper.xml -->


<!-- 加载db.properties文件 -->
<bean id="config" class="org.springframework.beans.factory.config.PreferencesPlaceholderConfigurer">
	<property name="locations">
		<array>
			<value>classpath:db.properties</value>		
		</array>
	</property>
</bean>
<!-- 配置数据库信息， -->
<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
	<property name="url" value="${url}"></property>
	<property name="driverClassName" value="${driver}"></property>
	<property name="username" value="${username}"></property>
	<property name="password" value="${password}"></property>
</bean>




<!-- mapper.xml -->
<!-- 配置mybatis核心类SqlSessionFactory -->
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
	<property name="dataSource" ref="dataSource"></property>
	
	<!-- 加载Mapper.xml文件 -->
	<property name="mapperLocations" value="classpath:org/cduck/mapper/*.xml"></property>
</bean>

<!-- Spring整合mybatis -->
 <bean id="mappers" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
 <!-- 将mybatis的sqlSessionFactory交给Spring去管理 -->
	 	<property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"></property>
	 	 	 <!--name="basePackage"的属性的作用：将org.cduck.mapper包中所有的接口
	 	 	 产生与之对应的动态代理对象（对象名就是首字母小写的接口名）。以便于操作mybatis	
	 	 	 	  -->
	 	 	<property name="basePackage" value="org.cduck.mapper"></property>
	 </bean>


<!-- =============================分割线============================= -->




<bean id="studentService" class="org.cduck.service.StudentServiceImpl">
	<property name="studentmapper" ref="studentMapper"></property>
	<!-- 注意：！！ 这里的studentMapper在上面的<property name="basePackage" value="org.cduck.mapper"></property>
		已经将其放入了IOC容器，所以直接注入就行。
		但是studentmapper一直报错：因为这种方法是SET注入法，我的studentmapper没有写set方法所以报错
	 -->
</bean>


</beans>
```

springMVC配置：  
springMVC.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:mvc="http://www.springframework.org/schema/mvc"
	xmlns:aop="http://www.springframework.org/schema/aop"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.3.xsd
		http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd
		http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-4.3.xsd">
<!-- 配置视图解析器 -->
<bean id="id" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
	<property name="prefix" value="/views/"></property>
	<property name="suffix" value=".jsp"></property>
</bean>

<!-- springMVC 基础配置、标配 -->
<mvc:annotation-driven></mvc:annotation-driven>

<!-- 将控制器所在包纳入IOC容器 -->
<context:component-scan base-package="org.cduck.controller"></context:component-scan>
</beans>
```

前端：  
result.jsp

```html
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
${requestScope.student.stuNo}<br>
${requestScope.student.stuName}<br>
${requestScope.student.stuAge}<br>
</body>
</html>
```

index.jsp

```html
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
<a href="stu/query/1">查询一号学生</a>

<form action="stu/add" method="post">
<input name="stuNo" >
<input name="stuName" >
<input name="stuAge" >
<input type="submit" value="Add">
</form>
</body>
</html>
```

---

web.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" id="WebApp_ID" version="2.5">
  <display-name>SSMProject</display-name>
  <welcome-file-list>
    <welcome-file>index.html</welcome-file>
    <welcome-file>index.htm</welcome-file>
    <welcome-file>index.jsp</welcome-file>
    <welcome-file>default.html</welcome-file>
    <welcome-file>default.htm</welcome-file>
    <welcome-file>default.jsp</welcome-file>
  </welcome-file-list>
  <context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>classpath:applicationContext.xml</param-value>
  </context-param>
  <listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>
  
  <servlet>
    <servlet-name>springDispatcherServlet</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
      <param-name>contextConfigLocation</param-name>
      <param-value>classpath:springMVC.xml</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
  </servlet>
  <servlet-mapping>
    <servlet-name>springDispatcherServlet</servlet-name>
    <url-pattern>/</url-pattern>
  </servlet-mapping>
</web-app>
```