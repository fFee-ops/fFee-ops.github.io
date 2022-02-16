---
title: 自动装配--@Autowired与环境切换
date: 2020-04-21 14:34:48
tags: 
categories: Spring
---

<!--more-->

### 自动装配与环境切换

- [\@Autowired](#Autowired_2)
- - [细节问题](#_44)
  - [其它自动注入方式](#_93)
- [环境切换](#_100)

# \@Autowired

三层组件：  
通过\@Autowired从Ioc容器中 根据类型自动注入（没有调用setXxx\(\)方法）  
\-如果\@Autowired在属性前标注，则不调用setXxx；如果标注在setXxx前面 ，则调用setXxx  
\-不能放在方法的参数前

```java
@Autowired
private Xxx xx;

public void aa()
{

}
--------------------------------------------------------------

@Autowired
public void setXxx(xx xx)
{
  
}
```

Bean+返回值：  
\@Autowired 在方法的参数前（也可以省略）、方法前 （构造方法：特殊，如果只有一个有参构造方法，则构造方法前的\@Autowired也可以省略）

比如：给student自动注入address值

```java
	@Bean(value = "myStudent",initMethod = "myInit",destroyMethod = "myDestroy")//id=myStudent  返回值=Student
	public Student myStudent(@Autowired Address address) {
		Student student = new Student(1,"zs",22);
//		student.setAddress(new Address("hunan", "beijing"));
		student.setAddress(address);
		return student;
	}
	
	@Bean
	public Address address() {
	
	return new Address("hunan", "beijing");
	}
```

## 细节问题

\@Autowired 根据类型匹配：  
三层注入方式/\@Bean+返回值  
1.如果有多个类型相同的，匹配哪个？  
报错。 /默认值\@primary  
假如有两个类

```java
@Repository("stuDao1")
public class StudentDaoImpl1 implements StudentDao {

}
------------------------------------------------
@Primary
@Repository("stuDao2")
public class StudentDaoImpl2 implements StudentDao{

}

```

```java
则在给service中自动装配studentDao时会选择带有@Primary注解的类
@Service("stuService")
public class StudentService {
@Autowired(required = false)
//	@Qualifier("stuDao1")
private StudentDao studentDao;
}
```

2.能否根据名字匹配？  
可以，结合 \@Qualifier\(“stuDao1”\)使用。

```java
@Service("stuService")
这样自动注入的就是id为“stuDao1”的studentDao。
public class StudentService {
	@Autowired(required = false)
//	@Qualifier("stuDao1")
private StudentDao studentDao;
}
```

3.如果有0个类型相同，默认报错；可以修改成不注入（null），\@Autowired\(required=false\)

```java
如果IOC容器中没有studentDao开启该注解后，不会报错，如果打印出来结果是null
@Service("stuService")
public class StudentService {
	@Autowired(required = false)
private StudentDao studentDao;
```

## 其它自动注入方式

```
自动注入方式一：	@Autowired (Spring) ，默认根据类型
自动注入方式二	@Resource（JSR250），默认根据名字 （如果 有名字，根据名字匹配；如果没有名字，先根据名字查找，如果没找到，再根据类型查找）；也可以通过name或type属性 指定根据名字 或类型找。
自动注入方式一：	@Inject（JSR330），额外引入javax.inject.jar，默认根据类型匹配
```

# 环境切换

\@Profile  
在配置类中给待切换的环境加上\@Profile注解

```java
@Profile("myapple")
	@Bean("apple")
	public Fruit apple() {
		
		return new apple();
	}
	
	@Profile("mybanana")
	@Bean("banana")
	public Fruit banana() {
		
		return new banana();
	}
```

激活方式一：  
\-Dspring.profiles.active=\@Profile环境名  
\-Dspring.profiles.active=myApple  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200421161356827.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
然后测试

```java
 AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(MyConfig.class) ;
        System.out.println(context.getBean("apple"));
```

激活方式二：  
硬编码

```java
public static void testAnnotation(){
        //注解方式
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext() ;
        ConfigurableEnvironment environment = (ConfigurableEnvironment)context.getEnvironment();
        environment.setActiveProfiles("mybanana");

        //保存点
        context.register(MyConfig.class);
        context.refresh();

        System.out.println(context.getBean("banana"));
}
```

_**注意：AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext\(\) ;是调用的无参构造，而不是有参构造，如果xxx= new AnnotationConfigApplicationContext\(MyConfig.class\) ;则会报错GenericApplicationContext does not support multiple refresh attempts: just call ‘refresh’ once**_

---

**坑：错误写法**

```java
	    ApplicationContext context = new AnnotationConfigApplicationContext(MyConfig.class) ;

        ConfigurableEnvironment environment = (ConfigurableEnvironment)context.getEnvironment();
        environment.setActiveProfiles("myBanana");
```

```
其中AnnotationConfigApplicationContext中有一个refresh()操作：会将我们设置的一些参数还原
没激活 |(保存点)->进行激活 ->刷新 ->没激活


流程调整：
	没激活->进行激活  |(保存点)   ->刷新->已激活
```

什么时候设置 保存点|： 配置类的编写处\( context.register\(MyConfig.class\); \)