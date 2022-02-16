---
title: SpringMVC第一个程序及环境搭建
date: 2020-04-26 11:14:58
tags: 
categories: SpringMVC
---

<!--more-->

### Title

- [环境搭建](#_2)
- [第一个程序（jsp ->Servlet \(Springmvc\)->Jsp）](#jsp_Servlet_SpringmvcJsp_14)

# 环境搭建

1.jar  
spring-aop.jar  
spring-bean.jar  
spring-context.jar  
spring-core.jar  
spring-web.jar

spring-webmvc.jar  
commons-logging.jar

**如果报错NoClassDefFoundError：缺少jar**

# 第一个程序（jsp ->Servlet \(Springmvc\)->Jsp）

项目结构：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200426110638666.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
springmvc配置文件 springmvc.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:aop="http://www.springframework.org/schema/aop"
	xmlns:context="http://www.springframework.org/schema/context"
	xmlns:mvc="http://www.springframework.org/schema/mvc"
	xmlns:c="http://www.springframework.org/schema/c"
	xsi:schemaLocation="http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.3.xsd
		http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd
		http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-4.3.xsd">


<context:component-scan base-package="org.cduck"></context:component-scan>
<!-- 配置视图解析器 :给Controller中的return“successe”加上前缀和后缀-->
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
	<property name="prefix" value="/view/"></property>
	<property name="suffix" value=".jsp"></property>

</bean>
</beans>

```

Controller：

```java
package org.cduck.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MvcController {
	
	@RequestMapping("welcome")
	public String welcome() {
		
		return "successe";
	}
}
```

web.xml:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" id="WebApp_ID" version="2.5">
  <display-name>SpringMVC-Project</display-name>
  <welcome-file-list>
    <welcome-file>index.html</welcome-file>
    <welcome-file>index.htm</welcome-file>
    <welcome-file>index.jsp</welcome-file>
    <welcome-file>default.html</welcome-file>
    <welcome-file>default.htm</welcome-file>
    <welcome-file>default.jsp</welcome-file>
  </welcome-file-list>
  
  
  	
	<servlet>
		<servlet-name>springDispatcherServlet</servlet-name>
		<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
		<init-param>
		<!-- 加载springmvc配置文件的位置，如果要省略，必须放到 默认路径：
/WEB-INF/springDispatcherServlet-servlet.xml -->
			<param-name>contextConfigLocation</param-name>
			<param-value>classpath:springmvc.xml</param-value>
		</init-param>
		<!-- 在启动tomcat时让该配置自动加载 -->
		<load-on-startup>1</load-on-startup>
	</servlet>

  
  
  <servlet-mapping>
  	<servlet-name>springDispatcherServlet</servlet-name>
  	<url-pattern>/</url-pattern>
  
  </servlet-mapping>
</web-app>
```

通过以下配置，拦截所有请求，交给SpringMVC处理而不是交给 普通的servlet处理：

```xml
  <servlet>
  	<servlet-name>springDispatcherServlet</servlet-name>
  	<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  	<init-param>
  			<param-name>contextConfigLocation</param-name>
  			<param-value>classpath:springmvc.xml</param-value>
  	</init-param>
  	<load-on-startup>1</load-on-startup>
  </servlet>
  
  <servlet-mapping>
  	<servlet-name>springDispatcherServlet</servlet-name>
  	<url-pattern>/</url-pattern>
  </servlet-mapping>
```

其中：

```xml
<url-pattern>.action</url-pattern>
```

/:一切请求 ，注意不是 /\*  
/user:拦截以 /user开头的请求  
/user/abc.do :只拦截该请求  
.action:只拦截 .action结尾的请求

---

JSP页面:

```html
index:
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
<div align="center">
<a href="welcome"> 欢迎点击 </a>
</div>
</body>
</html>
----------------------------------------------------------------
successe:
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>


<h1 align="center">测试成功hahhaha(u1s1这个穿透工具真好用)</h1>
</body>
</html>

```