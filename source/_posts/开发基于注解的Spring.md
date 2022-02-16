---
title: 开发基于注解的Spring
date: 2020-04-19 11:49:56
tags: 
categories: Spring
---

<!--more-->

### 开发基于注解的Spring

- [Spring IOC容器](#Spring_IOC_2)
- - [注解形式存放bean](#bean_21)
  - - [\@import使用](#import_82)
    - [FactoryBean](#FactoryBean_94)
- [bean的作用域（单例模式和非单例模式）](#bean_156)
- [条件注解](#_167)

# Spring IOC容器

springIOC容器有两种形式：

```
1、
xml配置文件：applicationContext.xml
		存bean:  <bean id class>
		取bean:
ApplicationContext context= new ClassPathXmlApplicationContext("applicationContext.xml");
		context.getBean();



2、注解：带有@Configuration注解的类（配置类）
	存bean
		***在下面单独说明***
	取bean
 ApplicationContext context  = new AnnotationConfigApplicationContext(MyConfig.class) ;
```

## 注解形式存放bean

1.必须有\@Configuration注解（配置类）  
2.形式：

```
①三层组件加入IOC容器： 给个各类加	注解 、 扫描器识别注解所在包
a.给三层组件 分别加注解（@Controller、@Service、@Repository -> @Component）
b.将注解所在包 纳入ioc扫描器（ComponentScan）
		纳入ioc扫描器:  
		①xml配置文件 :   
		 <context:component-scan base-package="org.cduck.controller"  >
  	     </context:component-scan>
  	     ②注解扫描器:
  	     @ComponentScan(value ="org.cduck"）
逻辑： 在三层类上加注解  ，让ioc识别，扫描器
component-scan：只对三层组件负责		
②非三层组件（Student.class 、IntToStringConver.class）：

			i.  @Bean+方法的返回值 ,id默認就是方法名（可以通过@Bean("stu") 修改id值）
			ii. import 、FactoryBean
```

---

**给扫描器指定规则**  
过滤类型：FilterType\(ANNOTATION，ASSIGNABLE\_TYPE，CUSTOM\)  
ANNOTATION：三层注解类型\@Controller、\@Service、\@Repository \-> \@Component  
_**excludeFilters：排除**_

```java
排除org.cduck包下的Service层和Dao层只扫描其他层
@ComponentScan(value ="org.cduck",
excludeFilters = {@ComponentScan.Filter(  type =
FilterType.ANNOTATION,
value = {Service.class,Repository.class } )})
```

_**includeFilters：有默认行为，可以通过useDefaultFilters = false禁止**_  
ANNOTATION:

```java
只扫描org.cduck包下的service和Dao层
@ComponentScan(value ="org.cduck",
includeFilters = {@ComponentScan.Filter(type=FilterType.ANNOTATION,
value = {Service.class,Repository.class } )},
useDefaultFilters = false)
```

ASSIGNABLE\_TYPE：

```java
只扫描org.cduck包下的StudentController类
@ComponentScan(value ="org.cduck",
includeFilters  = {@ComponentScan.Filter(  type =FilterType.ASSIGNABLE_TYPE,
value = {StudentController.class})},
useDefaultFilters = false)
```

区分:  
ANNOTATION:Controller.clss 指的是 所有标有\@Controller的类  
ASSIGNABLE\_TYPE：值得是具体的一个类 StudentController.class

---

CUSTOM自定义：自己定义包含规则  
\@ComponentScan.Filter\(type= FilterType.CUSTOM ,value=\{MyFilter.class\}

MyFilter implements TypeFilter 重写其中的match，如果return true则加入IoC容器

### \@import使用

①直接编写到\@Import中，并且id值 是全类名  
②自定义ImportSelector接口的实现类，通过selectimports方法实现（方法的返回值 就是要纳入IoC容器的Bean） 。 并且 告知程序 自己编写的实现类。 \@Import\(\{Orange.class,MyImportSelector.class\}\)  
③编写ImportBeanDefinitionRegistrar接口的实现类，重写方法

下面只介绍①  
假如有一个类Apple  
我们只需要在配置类中假如\@import  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200419140519846.png)  
如果有多个类 \@Import\(\{Orange.class,MyImportSelector.class，ImportBeanDefinitionRegistrar.class\}\)

### FactoryBean

1.准备bean。实现类和重写方法

```java
例如：把apple类放入IOC容器
package org.cduck.config;

import org.cduck.entity.apple;
import org.springframework.beans.factory.FactoryBean;


public class MyFactoryBean implements FactoryBean{

	@Override
	public  Object getObject() throws Exception {

		return new apple();
	}

	@Override
	public Class<?> getObjectType() {
		return apple.class;
	}

	@Override
	public boolean isSingleton() {
		//是否使用单例模式
		return true;
	}

}
```

2.注册bean。注册到\@Bean中

```java
注意要在MyConfig中写以下代码
	@Bean
	public FactoryBean<apple> myFactoryBean() {
		return new MyFactoryBean();
	}
```

3.测试

```java

    public static void testAnnotation(){
        //注解方式
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MyConfig.class) ;
        Object bean = context.getBean("&myFactoryBean");
        Object bean2 = context.getBean("myFactoryBean");
        	System.out.println(bean);
        	System.out.println(bean2);
    }

---------------------------------------------------------
结果：org.cduck.config.MyFactoryBean@394df057
	 org.cduck.entity.apple@4961f6af
```

_**注意：需要通过\&区分 获取的对象是哪一个 ：  
不加\&,获取的是最内部真实的Apple；  
如果加了\&，获取的 是FacotryBean**_

# bean的作用域（单例模式和非单例模式）

scope: singleton | prototype

```
执行时机（产生bean的时机）：
	singleton：容器在初始化时，就会创建对象（唯一的一个）；以后再getBean时，不再产生新的bean。singleton也支持延迟加载（懒加载）：在第一次使用时产生。 @Lazy
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200419135654187.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

```
	prototype：容器在初始化时，不创建对象；只是在每次使用时（每次从容器获取对象时 ，context.getBean(Xxxx)）,再创建对象;并且  每次getBean()都会创建一个新的对象。
```

# 条件注解

可以让某一个Bean 在某些条件下 加入Ioc容器，其他情况下不加IoC容器。  
a.准备 bean  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200419135817536.png)  
b.增加条件Bean：给每个Bean设置条件 ，必须实现Condition接口  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200419135830718.png)

```java
package org.cduck.condition;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class OilCarConditon implements Condition {

//	如果当前环境是oil则加入 oilcar
	@Override
	public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {

		Environment environment = conditionContext.getEnvironment();
		String carType = environment.getProperty("car.type");//car.type=oil
		if (carType.contains("oil")) {
			return true;
		}
		
		return false;
	}

}
```

```java
package org.cduck.condition;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class EnergyCarCondition implements Condition {

	@Override
	public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata arg1) {
		Environment environment = conditionContext.getEnvironment();
		String carType = environment.getProperty("car.type");//car.type=energy
		if (carType.contains("energy")) {
			return true;
		}
		return false;
	}



}
```

c.根据条件，加入IoC容器  
在STS中设置jvm启动参数，car.type。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/202004191400551.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

d.测试

```java
   public static void testAnnotation(){
        //注解方式
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MyConfig.class) ;
//        Student stu =   (Student) context.getBean("myStudent");
//    	System.out.println(stu);
        String[] ids=context.getBeanDefinitionNames();//获取所有BEAN的id
        for (String id : ids) {
			System.out.println(id);
		}
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200419140311331.png)