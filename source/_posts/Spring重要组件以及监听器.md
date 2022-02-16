---
title: Spring重要组件以及监听器
date: 2020-04-21 17:42:07
tags: 
categories: Spring
---

<!--more-->

### Spring重要组件以及监听器

- [\---Spring重要组件](#Spring_1)
- [监听器：](#_17)
- - [自定被监听事件](#_67)

# —Spring重要组件

```
	BeanPostProcessor：拦截了所有中容器的Bean，并且可以进行bean的初始化 、销毁
	BeanFactoryPostProcessor：拦截了容器
	BeanDefinitionRegistryPostProcessor：即将被加载之前（解析之前，称为BeanDefination对象之前）

	
BeanDefinitionRegistryPostProcessor(a)  -》加载bean->BeanFactoryPostProcessor(b)->实例化bean->BeanPostProcessor
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200421173231116.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
同一个方法 在不同地方（类、接口）的出现时机问题：  
a继承b，因此a中必然包含b中的方法\(记c \)：虽然a和b中都有c，但是 因此c出现的时机不同， 则c的执行顺序也不同：  
如果是在a中出现，则先执行；如果是在b中出现 则后执行

# 监听器：

可以监听事件 ，监听的对象必须是 ApplicationEvent自身或其子类/子接口  
方式一：  
必须实现ApplicationListener接口，

```java
package org.cduck.listener;

import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
//监听器
@Component
public class MyListener implements ApplicationListener<ApplicationEvent>{
//监听对象
	@Override
	public void onApplicationEvent(ApplicationEvent event) {
		System.out.println("==========="+event+"~~~~~~~~~~~~~~~");	
	}

}
```

方式二：注解

\(语法上 可以监听任意事件，但建议 ApplicationEvent自身或其子类/子接口\)  
Spring：要让SPring识别自己，必须加入IOc容器（Bean+返回值| 注解+扫描器）

```java
package org.cduck.listener;

import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
//监听器
@Component
public class MyListener2 {
//本方法是一个监听方法
	@EventListener(classes = {ApplicationEvent.class})
	public void mylistener2(ApplicationEvent event) {
		System.out.println("@@@@@@@@@@@@@@@@"+event);
	}

}

```

测试

```
控制台会显示被监听的事件：
@@@@@@@@@@@@@@@@org.springframework.context.event.ContextRefreshedEvent[source=org.springframework.context.annotation.AnnotationConfigApplicationContext@69222c14: startup date [Tue Apr 21 17:29:38 CST 2020]; root of context hierarchy]
```

## 自定被监听事件

a.自定义类 实现ApplicationEvent接口（自定义事件）

```java
package org.cduck.test;

import org.springframework.context.ApplicationEvent;

public class MyEvent3 extends ApplicationEvent {

	public MyEvent3(Object source) {
		super(source);
	}

}
```

b.发布事件

```java
在testStudent类中
 public static void testAnnotation(){
  AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MyConfig.class) ;
        MyEvent3 event3=new MyEvent3("这也是自定义的监听事件");
        context.publishEvent(event3);
        }
```

测试

```
控制台会输出:
@@@@@@@@@@@@@@@@org.cduck.test.MyEvent3[source=这也是自定义的监听事件]
```

简化方法：  
直接在测试类中写

```java
 public static void testAnnotation(){
  AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MyConfig.class) ;
        //创建一个事件并发布
        context.publishEvent(new ApplicationEvent("自定义的监听事件") {
		});
        	}
```

测试

```
控制台会输出：
@@@@@@@@@@@@@@@@org.cduck.test.TestStudent$1[source=自定义的监听事件]
```