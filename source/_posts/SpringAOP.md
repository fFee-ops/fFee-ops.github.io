---
title: SpringAOP
date: 2020-04-11 22:20:09
tags: 
categories: Spring
---

<!--more-->

### SpringAOP（面向切面编程）

- [使用注解实现事务](#_1)
- [前置通知](#_60)
- [表达式Expression](#Expression_116)
- [后置通知](#_119)
- [异常通知](#_129)
- [环绕通知](#_153)
- [实现注解实现 通知 ,aop](#__aop_192)

# 使用注解实现事务

目标：通过事务 使以下方法 要么全成功、要么全失败。  
public void addStudent\(\)  
\{<!-- -->  
//增加班级  
//增加学生  
//crdu  
\}

a. jar包  
spring-tx-4.3.9.RELEASE  
ojdbc.jar  
commons-dbcp.jar 连接池使用到数据源  
commons-pool.jar 连接池  
spring-jdbc-4.3.9.RELEASE.jar  
aopalliance.jar

b.配置  
增加事务tx的命名空间![在这里插入图片描述](https://img-blog.csdnimg.cn/20200411221457511.png)

```xml
<!-- 配置数据库相关 -->
<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
	<property name="driverClassName" value="com.mysql.cj.jdbc.Driver"></property>
	<property name="url" value="jdbc:mysql://localhost:3306/testjdbc?useUnicode=true"></property>
	<property name="username" value="root"></property>
	<property name="password" value="19991226"></property>
</bean>

<!-- 配置事务管理器 -->
<bean id="txManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
	<property name="dataSource" ref="dataSource"></property>

</bean>

<!-- 增加对事务的支持  ...核心！！-->
<tx:annotation-driven transaction-manager="txManager"/>
```

c.使用

将需要 成为事务的方法 前增加注解：  
\@Transactional\(readOnly=false,propagation=Propagation.REQUIRED\)

```java
@Service
public class StudentServiceImpl implements IStudentService{
 
	@Autowired
	IStudentDao dao;
	
	@Transactional(readOnly = false,propagation = Propagation.REQUIRED)//声明HI（）是一个事务，要么都成功要么都失败
	@Override
	public void hi(Student student) {
		dao.hi(student);
	}
	
}
```

_**\@Transactional注解的属性**_  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200411221908437.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 前置通知

```
前置通知相关概念：
	前置通知：	比如有一个方法Hi（） 则在每次运行hi方法之前都要运行
	一个方法	before（）则要想实现该功能，要将该方法所在的类变为前置通知。
	切点：    每次运行before方法都是在hi方法之前  所以hi（）即为切点
	切面	：   before方法即为切面，假如在多个类的hi方法中都是前置执行，那么
	连起来看before方法就像是一个切面。

```

将 一个普通的类 \-> 有特定功能的类  
通常有四种办法： a.继承类 b.实现接口 c.注解 d.配置

目标：类 \-> “通知”  
前置通知实现步骤：

a.jar  
aopaliance.jar  
aspectjweaver.jar

b.配置

```xml
<!-- 配置前置通知   -->
<bean id="studentService" class="org.cduck.service.StudentServiceImpl">
</bean>

<!-- 先把前置通知和要执行的方法放入IOC中，hi（）方法已经通过注解放进来了 -->
<!--===============连接线的一方==============-->
<bean id="LogBefore" class="org.cduck.aop.LogBefore">
</bean>

<!-- 将hi（）和前置通知进行关联 -->
<aop:config proxy-target-class="true">
<!-- 配置切入点，即在哪里执行 -->
<!--===============连接线的另一方==============-->
<aop:pointcut expression="execution(public void org.cduck.service.StudentServiceImpl.delete()) or execution(public void org.cduck.service.StudentServiceImpl.hi(org.cduck.entity.Student))" id="pointcut"/>

<!--advisor：相当于连接切入点 和切面的线  -->
<!--===============连接线==============  -->
<aop:advisor advice-ref="LogBefore" pointcut-ref="pointcut"/>
</aop:config>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200412131607652.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
c.编写

```java
public static void TestAOP() {
//		spring 上下文对象 context
		ApplicationContext context=new ClassPathXmlApplicationContext("applicationContext.xml");
		StudentServiceImpl service = (StudentServiceImpl) context.getBean("studentService");
		Student student=new Student();
		service.hi(student);
		service.delete();
	}		

```

# 表达式Expression

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200412132114436.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 后置通知

后置通知：  
a.通知类 ，普通实现接口  
b.业务类、业务方法  
StudentServiceImpl中的addStudent\(\)  
c.配置：  
将业务类、通知 纳入springIOC容器  
定义切入点（一端）、定义通知类（另一端），通过pointcut-ref将两端连接起来  
类似于前置通知

# 异常通知

异常通知：  
根据异常通知接口的定义可以发现，异常通知的实现类 必须编写以下方法：  
public void afterThrowing\(\[Method, args, target\], ThrowableSubclass\)：

```
a.public void afterThrowing(Method, args, target, ThrowableSubclass)
b.public void afterThrowing( ThrowableSubclass)
```

```java
	package org.cduck.aop;

import java.lang.reflect.Method;

import org.springframework.aop.ThrowsAdvice;

public class LogException implements ThrowsAdvice{
//异常通知的具体方法
	public void afterThrowing(Method method,Object[] args,Object target, Throwable ex) { 
		
		System.out.println("异常通知： 目标对象："+target+",方法名："+method.getName()+",方法的参数个数："+args.length+",异常类型："+ex.getMessage());
	}
}
```

# 环绕通知

环绕通知： 在目标方法的前后、异常发生时、最终等各个地方都可以 进行的通知，最强大的一个通知；  
可以获取目标方法的 全部控制权（目标方法是否执行、执行之前、执行之后、参数、返回值等）

在使用环绕通知时，目标方法的一切信息 都可以通过invocation参数获取到  
环绕通知 底层是通过拦截器实现的。

```java
package org.cduck.aop;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

public class LogAround implements MethodInterceptor {

	@Override
	public Object invoke(MethodInvocation invocation) throws Throwable {
		Object result=null;
		try {
			
			System.out.println("用环绕通知实现的【前置通知】...");
//			invocation.proceed();之前的代码：前置通知
		 result=	invocation.proceed();//控制着目标方法hi（）的执行
//		reslut就是目标方法hi（）的返回值
//			invocation.proceed();之后的代码：后置通知		
		System.out.println("用环绕通知实现的【后置通知】...");
		System.out.println("---后置通知： 目标对象："+invocation.getThis()+",方法名："+invocation.getMethod().getName()+",方法的参数个数："+invocation.getArguments().length+",返回值型："+result);
		} catch (Exception e) {
//			异常通知
			System.out.println("用环绕通知实现的【异常通知】...");
		}
		
		return result;
	}

}
```

这四种通知的配置都与前置相似，所以不再写出来了。

# 实现注解实现 通知 ,aop

a.jar  
与 实现接口 的方式相同  
b.配置  
将业务类、通知 纳入springIOC容器  
开启注解对AOP的支持

```xml
<!-- 开启注解对AOP的支持 -->
<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
```

业务类 addStudent \- 通知

c.编写

```java
package org.cduck.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Component("logAnnotation")
@Aspect//这个类是一个通知
public class LogAspectAnnotation {

	@Before("execution(public void org.cduck.service.impl.StudentServiceImpl.hi(org.cduck.entity.Student))")//定义切点
	public void mybefore() {
		
		System.out.println("==---==注解形式（（前置通知））");
	}
	
	
	@AfterReturning(pointcut = "execution(public void org.cduck.service.impl.StudentServiceImpl.hi(org.cduck.entity.Student))"
				/*,returning =" returningValue"*/)
	public void myAflter(/*JoinPoint jp,Object returningValue*/) {
		
		System.out.println("==---==注解形式（（后置通知））");
	}
	
	@AfterThrowing(pointcut= "execution(public void org.cduck.service.impl.StudentServiceImpl.hi(org.cduck.entity.Student))"/*,throwing="e"*/)
	public void myException(/*JoinPoint pj, NullPointerException e*/) {//NullPointerException e 指定异常类型-->只捕获该类异常
		System.out.println("==---==注解形式（（异常通知））");
	}
	
	
	@Around("execution(public void org.cduck.service.impl.StudentServiceImpl.hi(org.cduck.entity.Student))")
	public void myAround(ProceedingJoinPoint jp  ) {
		//前置通知֪
		System.out.println("注解形式{环绕}前置通知");
		
		try {
			
			jp.proceed() ;//控制着目标方法hi（）的执行
	
			//后置通知֪
			System.out.println("注解形式{环绕}后置通知");
		}catch(Throwable e) {
			//异常通知
			System.out.println("注解形式{环绕}异常通知");
		}finally {
			//最终通知֪
			System.out.println("注解形式{环绕}最终通知");
		}
	}
	
	@After("execution(public void org.cduck.service.impl.StudentServiceImpl.hi(org.cduck.entity.Student))")
	public void myAfter() {
		System.out.println("~~~最终通知~~~");
	}
	
}
```

_**注意：**_  
**1、扫描器 会将 指定的包 中的 \@Componet \@Service \@Respository \@Controller修饰的类产生的对象 增加到IOC容器中  
\@Aspect不需要 加入扫描器，只需要开启即可：\< aop:aspectj-autoproxy>\</aop:aspectj-autoproxy>**

**2、通过注解形式 实现的aop，如果想获取 目标对象的一些参数，则需要使用一个对象：JointPoint**  
hi  
**3、注解形式的返回值：  
a.声明返回值 的参数名：  
\@AfterReturning\( pointcut= “execution\(public \* hi\(…\)\)” ,returning=“returningValue” \)  
public void myAfter\(JoinPoint jp,Object returningValue\) \{//returningValue是返回值，但需要告诉spring  
System.out.println\(“返回值：”+returningValue \);  
注解形式实现aop时，通知的方法的参数不能多、少**