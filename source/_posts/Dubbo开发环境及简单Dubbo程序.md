---
title: Dubbo开发环境及简单Dubbo程序
date: 2020-05-17 15:44:01
tags: zookeeper 分布式
categories: Dubbo
---

<!--more-->

### Dubbo开发环境及简单Dubbo程序

- [开发dubbo程序](#dubbo_4)
- - [1.准备环境](#1_7)
  - [2.写代码](#2_31)
- [举例：student-server与student-client](#studentserverstudentclient_32)
- - [student-server](#studentserver_35)
  - [student-client](#studentclient_241)
  - - [将Controller中的内容 直接打印到 浏览器中](#Controller___455)


**软件架构经历：**

# 开发dubbo程序

## 1.准备环境

1、在LINUX安装JDK  
2、安装zookeeper

```
	1）下载zookeeper，传到Linux，并且解压
	2） 重命名zookeeper的配置文件：zoo_sample.cfg改名为zoo.cfg
	3）	在zoo.cfg中：可以发现 zookeeper的端口号是 clientPort=2181
	4）在zookeeper文件夹下新建data文件夹，将zoo.cfg中的dataDir=
	xxxx更改为dataDir=/apps/zookeeper-3.4.14/data
```

3、启动zookeeper

注意不要在bin目录中启动，而是要退到bin目录的上级目录去启动

启动：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200517154308672.png)  
停止:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200517154322464.png)  
查看状态：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200517154349822.png)

## 2.写代码

# 举例：student-server与student-client

首先建立一个maven项目，然后再在webapp下建立WEB-INF 然后建立web.xml  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200518213939144.png)

## student-server

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200518214041390.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**pom.xml：**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>org.dubbo</groupId>
  <artifactId>student-server</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <packaging>war</packaging>
   <!-- 统一版本号  -->
  <properties>
  	<spring.version>4.3.17.RELEASE</spring.version>
  </properties>
  
  <dependencies>
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-context</artifactId>
	    <version>${spring.version}</version>
	</dependency>

	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-beans</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-webmvc</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-aspects</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-jms</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	  <dependency>
	    <groupId>commons-logging</groupId>
	    <artifactId>commons-logging</artifactId>
	    <version>1.1.1</version>
	</dependency>
	
	
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-context-support</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<!-- dubbo组件 -->
	<dependency>
	    <groupId>com.alibaba</groupId>
	    <artifactId>dubbo</artifactId>
	    <version>2.5.10</version>
	</dependency>
	
	<!-- zookeeper -->
	<dependency>
	    <groupId>org.apache.zookeeper</groupId>
	    <artifactId>zookeeper</artifactId>
	    <version>3.4.12</version>
	</dependency>
	
	<!-- zookeeper客户端 -->
	<dependency>
	    <groupId>com.github.sgroschupf</groupId>
	    <artifactId>zkclient</artifactId>
	    <version>0.1</version>
	</dependency>
	
	
	<dependency>
	    <groupId>org.javassist</groupId>
	    <artifactId>javassist</artifactId>
	    <version>3.21.0-GA</version>
	</dependency>
	  
  </dependencies>
  
      
 <build>
  <plugins>
	    <plugin>
	        <groupId>org.apache.maven.plugins</groupId>
	        <artifactId>maven-compiler-plugin</artifactId>
	        <version>3.7.0</version>
	        <configuration>
	            <source>1.8</source>
	            <target>1.8</target>
	            <encoding>UTF8</encoding>
	        </configuration>
	    </plugin>
	 	
	 	<!-- 给maven项目 内置一个tomcat，之后 可以直接运行 -->
	    <plugin>
	    <groupId>org.apache.tomcat.maven</groupId>
	    <artifactId>tomcat7-maven-plugin</artifactId>
	    <configuration>
	        <port>8881</port>
	        <path>/</path>          
	     </configuration>
	</plugin> 
	</plugins>
	</build>
  
</project>
```

**注意：为了模拟在不同电脑上所以服务端和客户端的端口号不能相同。**

**web.xml:**

```xml
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" id="WebApp_ID" version="2.5">
<!-- 指定spring配置文件的位置-->
 <context-param>
  	<param-name>contextConfigLocation</param-name>
  	<param-value>classpath:applicationContext.xml</param-value>
  </context-param>
  
  	<!-- 配置spring-web.jar提供的监听器，此监听器 可以在服务器启动时 初始化Ioc容器。
  		初始化Ioc容器（applicationContext.xml） ，
  			1.告诉监听器 此容器的位置：context-param
  			2.默认约定的位置	:WEB-INF/applicationContext.xml
  	 -->
  <listener>
  	<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>
</web-app>
```

**applicationContext.xml：**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:context="http://www.springframework.org/schema/context"
	xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd
		http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
		
		
	<!-- 配置dubbo的应用名称 -->
	<dubbo:application name="students-server" />
	<!-- 配置注册中心地址 -->
	<dubbo:registry protocol="zookeeper" address="zookeeper://192.168.80.27:2181"  />
	
	<!-- 配置dubbo扫描包  ：将@Service所在包 放入 dubbo扫描中，供后续 dubbo在rpc时使用-->
	<dubbo:annotation package="org.student.server.impl" />

	<!-- 将@Service所在包 放入springIOC容器中，供后续 依赖注入时使用 -->
	<context:component-scan base-package="org.student.server.impl"></context:component-scan>

</beans>


```

**注意：\@Service所在的包要放两次，一次放入IOC容器，一次放入dubbo扫描**

**studentServer:**

```java
package org.student.server;

public interface studentServer {
	
	public String server(String name);
}
```

**studentServerImpl:**

```java
package org.student.server.impl;

import org.student.server.studentServer;

import com.alibaba.dubbo.config.annotation.Service;

@Service//是Alibaba的@service
public class studentServerImpl implements studentServer{

	public String server(String name) {
		
		return "server进行了对应工作："+name;
	}

}

```

**注意：\@Service是Alibaba的\@service不要导错包**

---

## student-client

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200518215201177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**pom.xml:**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>org.dubbo</groupId>
  <artifactId>student-client</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <packaging>war</packaging>
  
  <!-- 统一版本号  -->
  <properties>
  	<spring.version>4.3.17.RELEASE</spring.version>
  </properties>
  
  <dependencies>
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-context</artifactId>
	    <version>${spring.version}</version>
	</dependency>

	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-beans</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-webmvc</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-aspects</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-jms</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	  <dependency>
	    <groupId>commons-logging</groupId>
	    <artifactId>commons-logging</artifactId>
	    <version>1.1.1</version>
	</dependency>
	
	
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-context-support</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<!-- dubbo组件 -->
	<dependency>
	    <groupId>com.alibaba</groupId>
	    <artifactId>dubbo</artifactId>
	    <version>2.5.10</version>
	</dependency>
	
	<!-- zookeeper -->
	<dependency>
	    <groupId>org.apache.zookeeper</groupId>
	    <artifactId>zookeeper</artifactId>
	    <version>3.4.12</version>
	</dependency>
	
	<!-- zookeeper客户端 -->
	<dependency>
	    <groupId>com.github.sgroschupf</groupId>
	    <artifactId>zkclient</artifactId>
	    <version>0.1</version>
	</dependency>
	
	
	<dependency>
	    <groupId>org.javassist</groupId>
	    <artifactId>javassist</artifactId>
	    <version>3.21.0-GA</version>
	</dependency>
	  
  </dependencies>
  
      
 <build>
  <plugins>
	    <plugin>
	        <groupId>org.apache.maven.plugins</groupId>
	        <artifactId>maven-compiler-plugin</artifactId>
	        <version>3.7.0</version>
	        <configuration>
	            <source>1.8</source>
	            <target>1.8</target>
	            <encoding>UTF8</encoding>
	        </configuration>
	    </plugin>
	 	
	 	<!-- 给maven项目 内置一个tomcat，之后 可以直接运行 -->
	    <plugin>
	    <groupId>org.apache.tomcat.maven</groupId>
	    <artifactId>tomcat7-maven-plugin</artifactId>
	    <configuration>
	        <port>8882</port>
	        <path>/</path>          
	     </configuration>
	</plugin> 
	</plugins>
	</build>
  
</project>
```

**与服务端的web.xml相同，唯一不同的就是端口号。**

**web.xml:**

```xml
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" id="WebApp_ID" version="2.5">
 
  <!-- 解决post乱码   -->
  <filter>
  	<filter-name>CharacterEncodingfilter</filter-name>
  	<filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
  	<init-param>
  		<param-name>encoding</param-name>
  		<param-value>UTF-8</param-value>
  	</init-param>
  		<init-param>
  		<param-name>foreEncoding</param-name>
  		<param-value>UTF-8</param-value>
  	</init-param>
  </filter>
  
  <filter-mapping>
  	<filter-name>CharacterEncodingfilter</filter-name>
	<url-pattern>/*</url-pattern>
  </filter-mapping>

<!-- -->
  <servlet>
  	<servlet-name>dispatcherServlet</servlet-name>
  	<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
  	<init-param>
  		<param-name>contextConfigLocation</param-name>
		<param-value>classpath:springmvc.xml</param-value>  		
  	</init-param>
  </servlet>
  
  <servlet-mapping>
  	<servlet-name>dispatcherServlet</servlet-name>
  	<url-pattern>*.action</url-pattern> <!-- 只把请求为.action结尾 的交给springMVC处理-->
  </servlet-mapping>
</web-app>
```

**注意：访问时要加上 .atction 才会被springMVC接管**

**springmvc.xml：**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:mvc="http://www.springframework.org/schema/mvc"
	xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc-4.3.xsd
		http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.2.xsd
		http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
	<mvc:annotation-driven>
		<!-- 此配置的目的：将Controller中的内容 直接打印到 浏览器中 -->
		<mvc:message-converters register-defaults="false">
			<bean class="org.springframework.http.converter.StringHttpMessageConverter">
					<constructor-arg value="UTF-8"/>
				</bean>
		</mvc:message-converters>
	</mvc:annotation-driven>
	
	
	
	
	
	

	<!-- 配置dubbo的应用名称 -->
	<dubbo:application name="students-consumer"/>
	<!-- 配置注册中心地址 -->
	<dubbo:registry address="zookeeper://192.168.80.27:2181" />
	
	
	
	
	<!-- 配置dubbo扫描包 -->
	<dubbo:annotation  package="org.controller"/>
	<!-- 将控制器@Controller所在包 加入IOC容器 -->
	<context:component-scan base-package="org.controller"></context:component-scan>
		
</beans>

```

### 将Controller中的内容 直接打印到 浏览器中

```xml
<mvc:annotation-driven>
		<!-- 此配置的目的：将Controller中的内容 直接打印到 浏览器中 -->
		<mvc:message-converters register-defaults="false">
			<bean class="org.springframework.http.converter.StringHttpMessageConverter">
					<constructor-arg value="UTF-8"/>
				</bean>
		</mvc:message-converters>
	</mvc:annotation-driven>
```

**studentServer:**

```
	就是服务端的studentServer接口，复制了一份而已
```

**StudentController：**

```java
package org.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.student.server.studentServer;

import com.alibaba.dubbo.config.annotation.Reference;

@RestController
@RequestMapping("/controller")
public class StudentController {

	@Reference//远程注入
private	studentServer server;
	
	@RequestMapping("/test")
	public String rpcServer() {
		String result = server.server("zhangsan");
		return result;
	}
}

```

**注意：\@Reference （远程注入）  
这里不再使用\@Autowire：（是从本项目中自动注入）**

---

然后在Linux中启动zookeeper。  
再由客户端进行访问：http://localhost:8882/controller/test.action