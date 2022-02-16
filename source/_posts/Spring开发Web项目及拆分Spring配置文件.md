---
title: Spring开发Web项目及拆分Spring配置文件
date: 2020-04-13 20:19:21
tags: 
categories: Spring
---

<!--more-->

### Spring开发Web项目及拆分Spring配置文件

- [Spring开发Web项目](#SpringWeb_1)
- [拆分Spring配置文件](#Spring_27)

# Spring开发Web项目

Web项目如何初始化SpringIOC容器 ：  
思路：当服务启动时（tomcat），通过监听器将SpringIOC容器初始化一次（该监听器 spring-web.jar已经提供）  
因此用spring开发web项目 至少需要7个jar： spring-java的6个jar + spring-web.jar，注意：web项目的jar包 是存入到WEB-INF/lib中  
web项目启动时 ，会自动加载web.xml，因此需要在web.xml中加载 监听器（ioc容器初始化）。

Web项目启动时，启动实例化Ioc容器：

```xml
 <!-- 指定 Ioc容器（applicationContext.xml）的位置-->
  <context-param>
  		<!--  监听器的父类ContextLoader中有一个属性contextConfigLocation，该属性值 保存着 容器配置文件applicationContext.xml的位置 -->
  		<param-name>contextConfigLocation</param-name>
  		<param-value>classpath:applicationContext.xml</param-value>
  </context-param>  
  <listener>
  	<!-- 配置spring-web.jar提供的监听器，此监听器 可以在服务器启动时 初始化Ioc容器。
  		初始化Ioc容器（applicationContext.xml） ，
  			1.告诉监听器 此容器的位置：context-param
  			2.默认约定的位置	:WEB-INF/applicationContext.xml
  	 -->
  	<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>
```

# 拆分Spring配置文件

Web项目：  
根据什么拆分？  
i.三层结构  
UI\(html/css/jsp 、Servlet\) applicationController.xml  
Service :applicationService.xml  
Dao:applicationDao.xml  
公共 数据库:applicationDB.xml

ii.功能结构  
学生相关配置 applicationContextStudent.xml \< bean id="" class=“X…Student”>  
班级相关配置 applicationContextClass.xml

合并：如何将多个配置文件 加载  
（1）

```xml
		  <context-param>
  		<!--  监听器的父类ContextLoader中有一个属性contextConfigLocation，该属性值 保存着 容器配置文件applicationContext.xml的位置 -->
  <param-name>contextConfigLocation</param-name>
  		<param-value>
  			classpath:applicationContext.xml,
  			classpath:applicationContext-Dao.xml,
  			classpath:applicationContext-Service.xml,
  			classpath:applicationContext-Controller.xml
  		</param-value>
  </context-param>
```

（2）推荐

```xml
<context-param>
		<!--  监听器的父类ContextLoader中有一个属性contextConfigLocation，该属性值 保存着 容器配置文件applicationContext.xml的位置 -->
		<param-name>contextConfigLocation</param-name>
		<param-value>
			classpath:applicationContext.xml,
			classpath:applicationContext-*.xml
		</param-value>
</context-param>
```

（3）只在web.xml中加载主配置文件，

```xml
		<param-value>
  			classpath:applicationContext.xml
  		
  		</param-value>
		然后在主配置文件中，加载其他配置文件
			<import resource="applicationContext-*.xml"/>
```

项目结构：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200414201235279.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**注意**

```java
package org.cduck.servlet;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.cduck.service.IStudentService;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;


public class QueryStudentServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private IStudentService studentService;
  
	/*
	Servlet初始化方法：在初始化时，获取SpringIoc容器中的bean对象
	如果不写该方法那么得到的值是在IOC容器中，但是我们拿值是从WEB容器中拿
	的，所以不写该方法拿到的就是null
	*/
	@Override
	public void init() throws ServletException {
		ApplicationContext context=WebApplicationContextUtils.getWebApplicationContext(this.getServletContext());
		//当前是在servlet容器中，通过getBean获取	IOC容器中的Bean
		 studentService = (IStudentService) context.getBean("StudentService");
	
	}
	
	
		
    private ApplicationContext WebApplicationContext(String string) {
		// TODO Auto-generated method stub
		return null;
	}

	public QueryStudentServlet() {
    	 super();
    }
    public void setStudentService(IStudentService studentService) {
		this.studentService = studentService;
		System.out.println(studentService);
	}
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String name = studentService.queryStudent(); 
		request.setAttribute("name", name);
		request.getRequestDispatcher("result.jsp").forward(request, response);
		
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
```