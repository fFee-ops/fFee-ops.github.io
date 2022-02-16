---
title: SSM-Dubbo
date: 2020-05-19 15:13:27
tags: 
categories: Dubbo
---

<!--more-->

### SSM-Dubbo

- [父工程](#_4)
- [实体类](#_150)
- [公共接口](#_203)
- [dao](#dao_222)
- [service](#service_314)
- [stu-web](#stuweb_447)
- [\===========运行：](#_611)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200519150212353.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 父工程

![在这里插入图片描述](https://img-blog.csdnimg.cn/202005191503047.png)  
就是一个简单的Maven工程\(存放了各种共同依赖\)，但是注意，不能选jar/war包，需要选择pom（因为是父工程）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200519150408652.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**pom.xml:**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>org.dubbo</groupId>
  <artifactId>Stu-Parent</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <packaging>pom</packaging>
  
  
   <!-- 统一版本号  -->
  <properties>
  	<spring.version>4.3.17.RELEASE</spring.version>
  </properties>
  
  <dependencies>
  <!-- 父工程依赖StuPOJO -->
  <dependency> 
  <groupId>org.dubbo</groupId>
  <artifactId>Stu-pojo</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  </dependency> 
  
  
	   <dependency>  
        <groupId>com.mysql</groupId>  
        <artifactId>jdbc</artifactId>  
        <version>10.2.0.5.0</version>  
    </dependency>  
  
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-context</artifactId>
	    <version>${spring.version}</version>
	</dependency>

	<!-- https://mvnrepository.com/artifact/org.springframework/spring-beans -->
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-beans</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<!-- https://mvnrepository.com/artifact/org.springframework/spring-webmvc -->
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-webmvc</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<!-- https://mvnrepository.com/artifact/org.springframework/spring-jdbc -->
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-jdbc</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	
	
	<!-- https://mvnrepository.com/artifact/org.springframework/spring-aspects -->
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-aspects</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	
	<!-- https://mvnrepository.com/artifact/org.springframework/spring-jms -->
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-jms</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	
	  <dependency>
	    <groupId>commons-dbcp</groupId>
	    <artifactId>commons-dbcp</artifactId>
	    <version>1.4</version>
	 </dependency>
	  <dependency>
	    <groupId>commons-logging</groupId>
	    <artifactId>commons-logging</artifactId>
	    <version>1.1.1</version>
	</dependency>
	
	<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.4.6</version>
</dependency>

<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>1.3.1</version>
</dependency>
	
	<!-- https://mvnrepository.com/artifact/org.springframework/spring-context-support -->
	<dependency>
	    <groupId>org.springframework</groupId>
	    <artifactId>spring-context-support</artifactId>
	    <version>${spring.version}</version>
	</dependency>
	
	<dependency>
	    <groupId>com.alibaba</groupId>
	    <artifactId>dubbo</artifactId>
	    <version>2.5.10</version>
	</dependency>
	
	<dependency>
	    <groupId>org.apache.zookeeper</groupId>
	    <artifactId>zookeeper</artifactId>
	    <version>3.4.12</version>
	</dependency>
	
	
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
  
</project>
```

---

# 实体类

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200519151152650.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
也是一个普通Maven工程，就存放了一个student实体类  
**student:**

```java
package org.student.entity;

import java.io.Serializable;
//如果一个对象需要从内存到硬盘，或者进行网络传输，就需要序列化、反序列化
public class Student implements Serializable{

	private int stuNo;
	public Student() {
		
	}
	public Student(int stuNo, int stuAge, String stuName) {
		super();
		this.stuNo = stuNo;
		this.stuAge = stuAge;
		this.stuName = stuName;
	}
	public int getStuNo() {
		return stuNo;
	}
	public void setStuNo(int stuNo) {
		this.stuNo = stuNo;
	}
	public int getStuAge() {
		return stuAge;
	}
	public void setStuAge(int stuAge) {
		this.stuAge = stuAge;
	}
	public String getStuName() {
		return stuName;
	}
	public void setStuName(String stuName) {
		this.stuName = stuName;
	}
	private int stuAge;
	private String stuName;
}

```

然后在父工程中添加该依赖

```xml
 <dependency> 
  <groupId>org.dubbo</groupId>
  <artifactId>Stu-pojo</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  </dependency> 
```

# 公共接口

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521142336310.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

```java
package org.student.service;

import org.student.entity.Student;

public interface StudentService {

	void addStudent(Student student);
	Student queryStuByNo(int stuNo);
}

```

pom文件中需要依赖实体类

# dao

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521142426824.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521142517788.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
需要依赖父工程，实体类

**mapper**

```java
package org.student.mapper;

import org.student.entity.Student;

public interface StudentMapper {

	
	Student	queryStudentByStuno(int stuNo);
 	void addStudent(Student student);
}

```

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!-- namespace:该mapper.xml映射文件的 唯一标识 -->
<mapper namespace="org.student.mapper.StudentMapper">
	
	<select id="queryStudentByStuno" 	parameterType="int"  	resultType="org.student.entity.Student"  >
		select * from student where stuNo = #{stuNo}
	</select>
	
	<insert id="addStudent" parameterType="org.student.entity.Student" >
		insert into student(stuno,stuname,stuage) values(#{stuNo},#{stuName},#{stuAge})
	</insert>
	
</mapper>
```

**applicationContext-dao.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd
		http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

<!-- 加载db.properties文件 -->
	<bean  id="config" class="org.springframework.beans.factory.config.PreferencesPlaceholderConfigurer">
		<property name="locations">
			<array>
				<value>classpath:db.properties</value>
			</array>
		</property>
	</bean>
	<!-- 配置配置数据库信息（替代mybatis的配置文件conf.xml） -->
	<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
			<property name="driverClassName" value="${driver}"></property>
			<property name="url" value="${url}"></property>
			<property name="username" value="${username}"></property>
			<property name="password" value="${password}"></property>
	</bean>
	
	<!-- conf.xml :  数据源,mapper.xml -->
	<!-- 配置MyBatis需要的核心类：SqlSessionFactory -->
	<!-- 在SpringIoc容器中 创建MyBatis的核心类 SqlSesionFactory -->
	<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
		<property name="dataSource" ref="dataSource"></property>
		<!-- 加载mapper.xml路径 -->
		<property name="mapperLocations" value="classpath:org/student/mapper/*.xml"></property>
		
	</bean>

	<!-- 将MyBatis的SqlSessionFactory 交给Spring -->
	<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
	 	<property name="sqlSessionFactoryBeanName" value="sqlSessionFactory"></property>
	 	<property name="basePackage" value="org.student.mapper"></property>
	 	<!--上面basePackage所在的property的作用：
	 	将org.student.mapper包中，所有的接口   产生与之对应的 动态代理对象
	 	（对象名 就是 首字母小写的接口名） ：studentMapper.querystudentBYNO();
	 	  -->
	 </bean>
</beans>

```

# service

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521142658477.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**项目要选war**

**pom.xml:**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.dubbo</groupId>
    <artifactId>Stu-Parent</artifactId>
    <version>0.0.1-SNAPSHOT</version>
  </parent>
  <artifactId>Stu-Service</artifactId>
  <packaging>war</packaging>
  
  <!-- 依赖Stu-Dao -->
  <dependencies>
  	<dependency>
  		<groupId>org.dubbo</groupId>
  		<artifactId>Stu-Dao</artifactId>
  		<version>0.0.1-SNAPSHOT</version>
  	</dependency>
  	<!-- 依赖Stu公共interface -->
  	<dependency>
  		<groupId>org.dubbo</groupId>
  		<artifactId>Stu-common-interface</artifactId>
  		<version>0.0.1-SNAPSHOT</version>
  	</dependency>
  </dependencies>
  
  <!-- 引入内置tomcat -->
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

**web.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" id="WebApp_ID" version="2.5">
  
  <context-param>
  	<param-name>contextConfigLocation</param-name>
  	<param-value>classpath:applicationContext*.xml</param-value>
  </context-param>
  
  
  <listener>
  	<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
  </listener>
  
</web-app>
```

**service.impl:**

```java
package org.student.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.student.entity.Student;
import org.student.mapper.StudentMapper;

import com.alibaba.dubbo.config.annotation.Service;


@Service
public class StudentService implements org.student.service.StudentService {

	@Autowired
	private StudentMapper mapper;
	@Override
	public void addStudent(Student student) {
		
		mapper.addStudent(student);
	}

	@Override
	public Student queryStuByNo(int stuNo) {
		
		return mapper.queryStudentByStuno(stuNo);
	}

}
```

**applicationContext-service.xml:**

```xml

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.3.xsd
		http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
		
	<import resource="classpath:applicationContext-dao.xml"/>
		
	<!-- 配置dubbo的应用名称 -->
	<dubbo:application name="students-service" />
	<!-- 配置注册中心地址 -->
	<dubbo:registry protocol="zookeeper" address="zookeeper://192.168.80.27:2181"  />
	<!-- 配置dubbo扫描包 -->
	<dubbo:annotation package="org.student.service.impl" />
	<context:component-scan base-package="org.student.service.impl"></context:component-scan>
	

</beans>
```

# stu-web

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521143039384.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**pom.xml:**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.dubbo</groupId>
    <artifactId>Stu-Parent</artifactId>
    <version>0.0.1-SNAPSHOT</version>
  </parent>
  <artifactId>Stu-web</artifactId>
  <packaging>war</packaging>
  
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
<!-- 引入内置tomcat-->	 
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
   <dependencies>
   	<dependency>
   		<groupId>org.dubbo</groupId>
   		<artifactId>Stu-common-interface</artifactId>
   		<version>0.0.1-SNAPSHOT</version>
   	</dependency>
   </dependencies>
</project>
```

**web.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://java.sun.com/xml/ns/javaee" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd" id="WebApp_ID" version="2.5">
  

  <!-- 解决post乱码 -->
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
  	<url-pattern>*.action</url-pattern>
  </servlet-mapping>
  
  
</web-app>
```

**springmvc.xml:**

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
	
	<!--将controller中的返回值，打印到页面 -->
	<mvc:annotation-driven>
		<mvc:message-converters register-defaults="false">
			<bean class="org.springframework.http.converter.StringHttpMessageConverter">
					<constructor-arg value="UTF-8"/>
				</bean>
		</mvc:message-converters>
	</mvc:annotation-driven>

	<!-- 配置dubbo的应用名称 -->
	<dubbo:application name="students-web"/>
	<!-- 配置注册中心地址 -->
	<dubbo:registry address="zookeeper://192.168.80.27:2181" />
	<!-- 配置dubbo扫描包 -->
	<dubbo:annotation  package="org.student.controller"/>
	<!-- 将控制器所在包 加入IOC容器 -->
	<context:component-scan base-package="org.student.controller"></context:component-scan>
		
</beans>
```

**controller:**

```java
package org.student.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.student.entity.Student;
import org.student.service.StudentService;

import com.alibaba.dubbo.config.annotation.Reference;

@RequestMapping("/controller")
@RestController
public class StudentController {

	@Reference
	StudentService service;
	
	@RequestMapping("/query")
	public String queryStuByNo() {
		Student student = service.queryStuByNo(4);
		System.out.println(student.getStuName());
		return "success";
	}
	
	@RequestMapping("/add")
	public String addStu() {
		Student student=new Student(1, 22, "zhangsan");
		service.addStudent(student);
		return "success";
	}
}

```

# \===========运行：

启动linux中的zookeeper

1、运行service  
右键项目->run as->maven build:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521143511505.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

2、运行stu-web  
同上

3、访问：  
http://localhost:8882/controller/query.action