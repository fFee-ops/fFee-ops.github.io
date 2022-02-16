---
title: Web开发
date: 2020-05-08 17:34:53
tags: 
categories: SpringBoot
---

<!--more-->

### \-

- - [简介](#_1)
  - [SpringBoot对静态资源的映射规则；](#SpringBoot_11)
  - [模板引擎](#_40)

## 简介

1）、创建SpringBoot应用，选中我们需要的模块；

2）、SpringBoot已经默认将这些场景配置好了，只需要在配置文件中指定少量配置就可以运行起来

3）、自己编写业务代码；

```
xxxxAutoConfiguration：帮我们给容器中自动配置组件；
xxxxProperties:配置类来封装配置文件的内容；
```

## SpringBoot对静态资源的映射规则；

1）所有 /webjars/\*\* ，都去 classpath:/META-INF/resources/webjars/ ，找资源；  
webjars：以jar包的方式引入静态资源；  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200508172331951.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

```xml
<!--引入jquery-webjar-->在访问的时候只需要写webjars下面资源的名称即可
		<dependency>
			<groupId>org.webjars</groupId>
			<artifactId>jquery</artifactId>
			<version>3.3.1</version>
		</dependency>
```

2）/\*\* 访问当前项目的任何资源，都去（静态资源的文件夹）找映射

```
"classpath:/META-INF/resources/", 
"classpath:/resources/",
"classpath:/static/", 
"classpath:/public/" 
"/"：当前项目的根路径
```

比如：localhost:8080/abc === 去静态资源文件夹里面找abc

3）欢迎页； 静态资源文件夹下的所有index.html页面；被"/\*\*"映射；

比如： localhost:8080/ 找index页面

4）所有的 \*\*/favicon.ico 都是在静态资源文件下找；

## 模板引擎

JSP、Velocity、Freemarker、Thymeleaf![在这里插入图片描述](https://img-blog.csdnimg.cn/20200508172728622.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

\*\*Springboot推荐使用Thymeleaf

**1、引入thymeleaf；\(可以在创建Springboot项目时直接勾选上\)**

```xml
	<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
          	2.1.6
		</dependency>
切换thymeleaf版本
<properties>
		<thymeleaf.version>3.0.9.RELEASE</thymeleaf.version>
		<!-- 布局功能的支持程序  thymeleaf3主程序  layout2以上版本 -->
		<!-- thymeleaf2   layout1-->
		<thymeleaf-layout-dialect.version>2.2.2</thymeleaf-layout-dialect.version>
  </properties>
```

**2、Thymeleaf使用**

```java
@ConfigurationProperties(prefix = "spring.thymeleaf")
public class ThymeleafProperties {

	private static final Charset DEFAULT_ENCODING = Charset.forName("UTF-8");

	private static final MimeType DEFAULT_CONTENT_TYPE = MimeType.valueOf("text/html");

	public static final String DEFAULT_PREFIX = "classpath:/templates/";

	public static final String DEFAULT_SUFFIX = ".html";
```

只要我们把HTML页面放在classpath:/templates/，thymeleaf就能自动渲染；  
_**使用：**_  
1、导入thymeleaf的名称空间

```xml
<html lang="en" xmlns:th="http://www.thymeleaf.org">
```

2、使用thymeleaf语法

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <h1>成功！</h1>
    <!--th:text 将div里面的文本内容设置为 -->
    <div th:text="${hello}">这是显示欢迎信息</div>
</body>
</html>
```

3、语法规则  
1）、th:text；改变当前元素里面的文本内容；

```
th：任意html属性；来替换原生属性的值
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200508173214598.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
2）、表达式

很多，自行Google