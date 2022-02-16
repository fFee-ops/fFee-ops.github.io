---
title: SpringMVC文件上传及拦截器
date: 2020-05-01 15:15:27
tags: 
categories: SpringMVC
---

<!--more-->

### SpringMVC文件上传及拦截器

- [文件上传](#_1)
- [拦截器](#_65)

# 文件上传

思路：

```
和Servlet方式的本质一样，都是通过commons-fileupload.jar和
commons-io.jar。
SpringMVC可以简化文件上传的代码，但是必须满足条件：
实现MultipartResolver接口 ；
而该接口的实现类SpringMVC也已经提供了CommonsMultipartResolver
```

具体步骤：（直接使用CommonsMultipartResolver实现上传）  
a.jar包  
commons-fileupload.jar、commons-io.jar  
b.配置CommonsMultipartResolver

```xml
<!-- 配置CommonsMultipartResolver ，用于实现文件上传，并将其加入SpringIOC容器
	-->
<bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
	<property name="defaultEncoding" value="UTF-8"></property>
	<!-- 限制上传文件大小，单位为byte，如果为-1则代表无限制 -->
	<property name="maxUploadSize" value="104857600"></property>
</bean>
```

**id必须为multipartResolver  
因为IOC容器在初始化时，会自动寻找一个id=multipartResolver的bean，并将其添加到IOC容器中，如果  
没有发现该ID则会略过**

前端：

```html

		<form action="testUpload" method="post" enctype="multipart/form-data">
				<input type="text" name="desc">
				<input type="file" name="file" >
				<input type="submit" value="上传">
		</form>
```

**注意：  
表单的method一定要是post，并且要有enctype="multipart/form-data"该属性，如果模式不是post会报500**

控制器：

```java
		@RequestMapping(value = "testUpload",method = RequestMethod.POST)
		public String testUpload(@RequestParam("desc") String desc,@RequestParam("file") MultipartFile file) throws IOException {
			System.out.println("文件描述"+desc);
			//jsp中上传的文件：file。
			InputStream inputStream = file.getInputStream();
			String Oname = file.getOriginalFilename();//文件原始的名字
			//将文件上传到服务器的某个硬盘文件中
			OutputStream out=new FileOutputStream("d:\\"+Oname);
			
			byte[] bs=new byte[1024];
			int len=-1;
			while ((len=inputStream.read(bs))!=-1) {//文件没读完就不是-1
				out.write(bs, 0, len);
				
			}
			out.close();
			inputStream.close();
			System.out.println(Oname+"上传成功");
			return "successe";
		} 
		
```

# 拦截器

拦截器的原理和过滤器相同。  
SpringMVC：要想实现拦截器，必须实现一个接口HandlerInterceptor  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200501150820525.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
步骤：  
a.编写拦截器 实现HandlerInterceptor

```java
package org.cduck.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

public class MyInterceptor implements HandlerInterceptor{

	@Override
	public void afterCompletion(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, Exception arg3)
			throws Exception {
		System.out.println("渲染（jsp）页面后拦截");
	}

	@Override
	public void postHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, ModelAndView arg3)
			throws Exception {
		System.out.println("拦截响应。。");
	}

	@Override
	public boolean preHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2) throws Exception {
		
		System.out.println("拦截请求。。。");
		return true;
	}

}
```

b.配置：将自己写的拦截器 配置到springmvc中（spring）

```xml
<!-- 配置自己的拦截器 -->
<mvc:interceptors>

<mvc:interceptor>
<!-- 要拦截的请求 -->
<mvc:mapping path="/**"/>
<!-- 不拦截哪些请求 -->
<mvc:exclude-mapping path="/testUpload"/>
<!-- 注意bean的位置 -->
<bean class="org.cduck.interceptor.MyInterceptor"></bean>
</mvc:interceptor>

</mvc:interceptors>
```

实现拦截器链（多个拦截器）：

只需要再写一个拦截器：

```java
package org.cduck.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

public class MyInterceptor2 implements HandlerInterceptor{

	@Override
	public void afterCompletion(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, Exception arg3)
			throws Exception {
		System.out.println("渲染（jsp）页面后拦截2");
	}

	@Override
	public void postHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2, ModelAndView arg3)
			throws Exception {
		System.out.println("22222拦截响应。。");
	}

	@Override
	public boolean preHandle(HttpServletRequest arg0, HttpServletResponse arg1, Object arg2) throws Exception {
		System.out.println("22222222222222拦截请求。。。");
		return true;
	}

}

```

然后再配置一次：

```xml
<!-- 配置第二个拦截器，组成拦截器链 -->
<mvc:interceptors>

<mvc:interceptor>
<!-- 要拦截的请求 -->
<mvc:mapping path="/**"/>
<!-- 不拦截哪些请求 -->
<mvc:exclude-mapping path="/testUpload"/>
<!-- 注意bean的位置 -->
<bean class="org.cduck.interceptor.MyInterceptor2"></bean>
</mvc:interceptor>

</mvc:interceptors>
```

拦截器链的执行顺序：

```
拦截器1拦截请求- >拦截器2拦截请求 - >请求方法 -> 拦截器2处理响应->
拦截器1处理响应->   渲染（jsp）页面后拦截2->渲染（jsp）页面后拦截
```