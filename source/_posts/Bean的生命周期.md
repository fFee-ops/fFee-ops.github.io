---
title: Bean的生命周期
date: 2020-04-20 11:21:24
tags: 
categories: Spring
---

<!--more-->

### Bean的生命周期

- [Bean的生命周期：](#Bean_1)

# Bean的生命周期：

创建\(new …\)、初始化（赋初值）、 …、销毁  
方法一: Student.java  
适用于：\@Bean+返回值方式  
首先在Student类中写上init 和destory方法  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200420112002591.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
xml:  
init-method=“myInit” destroy-method=“myDestroy”

```xml
	<bean id="student" class="org.cduck.entity.Student" init-method="myInit" destroy-method="myDestroy">
	<property name="stuNo" value="4"></property>
	<property name="stuName" value="zszs"></property>
	<property name="stuAge" value="45"></property>
</bean>
```

注解：  
\@Bean\(value=“stu”,initMethod = “myInit”,destroyMethod = “myDestroy”\)

```java
@Bean(value = "myStudent",initMethod = "myInit",destroyMethod = "myDestroy")//id=myStudent  返回值=Student
	public Student myStudent() {
		Student student = new Student(1,"zs",22);
		student.setAddress(new Address("hunan", "beijing"));
		return student;
	}
```

IoC容器在初始化时，会自动创建对象\(构造方法\) \->init \->…->当容器关闭时 调用destroy…

方法二：  
三层注解 （功能性注解、MyIntToStringConverter.java）：\@Controller、\@Service、\@Repository、\@Component

–>三层注解（功能性注解【三层、功能性类】）  
三层组件： 扫描器 + 三层注解（4个）

```
JAVA规范 ：JSR250
```

1.将响应组件 加入 \@Component注解、 给初始化方法加\@PostConstruct、给销毁方法加\@PreDestroy  
\@PostConstruct：相当于方法一的init  
\@PreDestroy：相当于方法一的destroy

```java
package org.cduck.converter;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.springframework.stereotype.Component;

@Component
public class MyConverter {

	@PostConstruct
	public void init() {
		System.out.println("转换的init");
	}
	public void myConverter() {
		System.out.println("转换....");
	}
	@PreDestroy
	public void destory() {
		System.out.println("转换的destory");
	}
}
```

```
如果要获取@Component注解中的bean，那么该Bean的名字就是@Component（value="xxx"）的value值
```