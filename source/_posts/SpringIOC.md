---
title: SpringIOC
date: 2020-04-10 13:15:11
tags: spring
categories: Spring
---

<!--more-->

### SpringIOC

- [开发第一个Spring程序（IOC）](#SpringIOC_1)
- [springIOC发展史](#springIOC_25)
- [IOC控制反转/依赖注入](#IOC_36)
- [图解三种方式的区别](#_46)
- - [依赖注入的三种方式](#_49)
  - [自动装配（只适用于 ref类型 ）](#_ref__228)
  - [使用注解定义bean](#bean_246)
  - [Value与\< Value >注入方式的区别](#Value_Value__264)

# 开发第一个Spring程序（IOC）

```java
		ApplicationContext conext = new     ClassPathXmlApplicationContext("applicationContext.xml") ;
		//执行从springIOC容器中获取一个 id为student的对象
		Student student = (Student)conext.getBean("student") ;
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

<bean id="student" class="org.cduck.entity.Student">
	<property name="stuNo" value="1"></property>
	<property name="stuName" value="zs"></property>
	<property name="stuAge" value="21"></property>
</bean>
</beans>

```

可以发现，springioc容器 帮我们new了对象，并且给对象赋了值，我们再需要使用该对象时，只需要去IOC容器中“拿”。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200410131438194.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# springIOC发展史

```
1.
	Student student = new Student();
	student.setXxx();
2.
	简单工厂
3.
	ioc（超级工厂）	
```

# IOC控制反转/依赖注入

IOC（控制反转）也可以称之为DI（依赖注入）：  
控制反转：将 创建对象、属性值 的方式 进行了翻转，从new、setXxx\(\) 翻转为了 从springIOC容器getBean\(\)  
依赖注入：将属性值 注入给了属性，将属性 注入给了bean，将bean注入给了ioc容器；

_**总结**_：ioc/di ，无论要什么对象，都可以直接去springioc容器中获取，而不需要自己操作（new\\setXxx\(\)）

因此之后的ioc分为2步：1 先给springioc中存放对象并赋值 2 拿

# 图解三种方式的区别

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200410131341161.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 依赖注入的三种方式

1.set注入：通过调用setXxx\(\)赋值。

赋值，默认使用的是 set方法\(\);  
依赖注入底层是通过反射实现的。  
\<property…>

```xml
<bean id="teacher" class="org.cduck.entity.Teacher" >
	<!--  通过调用set方法进行赋值-->
	<property name="name" value="张三"></property>
	<property name="age" value="22"></property>
</bean>
```

2.构造器注入：通过构造方法赋值

需要注意：如果 的顺序 与构造方法参数的顺序不一致，则需要通过type或者index或name指定。

```xml
<bean id="teacher" class="org.cduck.entity.Teacher" >
		<!-- 通过构造器赋值.  <constructor-arg value="ls" type="String" index="0" name="name"></constructor-arg>-->
		<constructor-arg value="李四" name="name"></constructor-arg>
		<constructor-arg value="25" name="age"></constructor-arg>
		</bean>
```

3.p命名空间注入  
引入p命名空间  
xmlns:p=“http://www.springframework.org/schema/p”  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200411105338240.png)

```xml
<bean id="teacher" class="org.cduck.entity.Teacher" p:age="24" p:name="王五">
	</bean>
```

注意：  
简单类型：  
p:属性名=“属性值”  
引用类型（除了String外）：  
p:属性名-ref=“引用的id”  
注意多个 p赋值的时候 要有空格。

示例：  
注入各种集合数据类型: List Set map

```java
package org.cduck.entity;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class AllCollectionType {

	private List<String> listEList;
	private String[] array;
	private Set<String> setESet;
	private Map<String, String> mapEMap;
	public List<String> getListEList() {
		return listEList;
	}
	public void setListEList(List<String> listEList) {
		this.listEList = listEList;
	}
	public String[] getArray() {
		return array;
	}
	public void setArray(String[] array) {
		this.array = array;
	}
	public Set<String> getSetESet() {
		return setESet;
	}
	public void setSetESet(Set<String> setESet) {
		this.setESet = setESet;
	}
	public Map<String, String> getMapEMap() {
		return mapEMap;
	}
	public void setMapEMap(Map<String, String> mapEMap) {
		this.mapEMap = mapEMap;
	}
	public AllCollectionType(List<String> listEList, String[] array, Set<String> setESet, Map<String, String> mapEMap) {
		super();
		this.listEList = listEList;
		this.array = array;
		this.setESet = setESet;
		this.mapEMap = mapEMap;
	}
	
	public AllCollectionType() {
	}
	@Override
	public String toString() {
		String tempString="";
		for (String str : array) {
			tempString+=str+",";
		}
		
		return "listEList=" + listEList + "\n array=" + Arrays.toString(array) + "\n setESet="
				+ setESet + "\n mapEMap=" + mapEMap ;
	}
	
	
}
```

```xml
<bean id="collection" class="org.cduck.entity.AllCollectionType">

<property name="listEList">
		<list>
			<value>足球1</value>
			<value>篮球1</value>
			<value>乒乓1</value>
		</list>
</property>



<property name="array">
	<array>
			<value>足球2</value>
			<value>篮球2</value>
			<value>乒乓2</value>
	</array>
</property>



<property name="setESet">
	<set>
			<value>足球3</value>
			<value>篮球3</value>
			<value>乒乓3</value>
	
	</set>
</property>

<property name="mapEMap">
	<map>
		<entry>
			<key>
				<value>foot</value>
			</key>
			<value>足球4</value>
		</entry>
			
		<entry>	
			<key>
				<value>bas</value>
			</key>
			<value>篮球4</value>
		</entry>
			
		<entry>
			<key>
				<value>pp</value>
			</key>
			<value>乒乓4</value>
		</entry>	
	</map>
	
</property>
</bean>	
```

---

给对象类型赋值null ：

```xml
<property name="name" >  
				<null/>       -->注意 没有<value>
		</property>
```

赋空值 “” :

```xml
<property name="name" >  
				<value></value>  
		</property>
```

_**在ioc中定义bean的前提：该bean的类 必须提供了 无参构造**_

## 自动装配（只适用于 ref类型 ）

自动装配：

```xml
<bean ... class="org.lanqiao.entity.Course"  autowire="byName|byType|constructor|no" >
```

byName本质是byId  
byName: 自动寻找：其他bean的id值=该Course类的属性名  
byType: 其他bean的类型\(class\) 是否与 该Course类的ref属性类型一致 （注意，此种方式 必须满足：当前Ioc容器中 只能有一个Bean满足条件 ）  
constructor： 其他bean的类型\(class\) 是否与 该Course类的构造方法参数 的类型一致；此种方式的本质就是byType

可以在头文件中 一次性将该ioc容器的所有bean 统一设置成自动装配：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
...
default-autowire="byName">
```

**自动装配虽然可以减少代码量，但是会降低程序的可读性，使用时需要谨慎。**

## 使用注解定义bean

```xml
<context:component-scan base-package="org.lanqiao.dao">
</context:component-scan>
```

Spring在启动的时候，会根据base-package在 该包中扫描所有类，查找这些类是否有注解\@Component\(“studentDao”\),如果有，则将该类 加入spring Ioc容器。  
注意：要在xml引入命名空间  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200411122241611.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200411122404141.png)  
\@Component细化：

dao层注解：\@Repository  
service层注解：\@Service  
控制器层注解：\@Controller

## Value与\< Value >注入方式的区别

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200412131941993.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)