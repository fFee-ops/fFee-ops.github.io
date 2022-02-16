---
title: Dubbo SPI机制
date: 2021-11-20 23:43:05
tags: zookeeper 分布式 云原生
categories: Dubbo
---

<!--more-->

### Dubbo SPI机制

- [SPI的概述](#SPI_2)
- - [SPI的主要作用](#SPI_3)
  - [入门案例](#_8)
  - [总结](#_68)
- [Dubbo中的SPI](#DubboSPI_83)
- - [概述](#_84)
  - [入门案例](#_88)
  - [源码分析](#_134)
- [SPI中的IOC和AOP](#SPIIOCAOP_153)
- - [依赖注入](#_154)
  - [动态增强](#_165)
  - - [装饰者模式](#_169)
    - [dubbo中的AOP](#dubboAOP_250)
- [动态编译](#_313)
- - [SPI中的自适应](#SPI_314)
  - [javassist入门](#javassist_328)
  - [源码分析](#_428)

# SPI的概述

## SPI的主要作用

SPI 全称为 `Service Provider Interface`，是一种服务发现机制。SPI 的本质是将**接口实现类的全类名配置在文件中，并由服务加载器读取配置文件，加载实现类**。这样可以在运行时，动态为接口替换实现类。正因此特性，我们可以很容易的通过 SPI 机制为我们的程序提供拓展功能。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c9bcccc295e9471586c9cef1adf5fc5f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Java SPI 实际上是“**基于接口的编程＋策略模式＋配置文件**”组合实现的动态加载机制。

## 入门案例

首先，我们定义一个接口，名称为 Robot。

```java
public interface Robot {
	void sayHello();
}
```

再定义两个实现类，分别为 OptimusPrime 和 Bumblebee。

```java
public class Bumblebee implements Robot {
    public void sayHello(URL url) {
        System.out.println("Hello, I am Bumblebee.");
    }
}


public class OptimusPrime implements Robot {
	public void sayHello(URL url) {
		System.out.println("Hello, I am Optimus Prime.");
	}
}
```

接下来 META-INF/services 文件夹下创建一个文件，名称为 Robot 的全限定名`com.itheima.java.spi.Robot`。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6f8a18824c214fb7b0eb0b4e1f2d3c24.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)

文件内容为实现类的全限定的类名，如下：

```yml
com.itheima.java.spi.impl.Bumblebee
com.itheima.java.spi.impl.OptimusPrime
```

以上就做好了全部的准备工作，现在就来写一个测试用例：

```java
public class JavaSPITest {

	@Test
	public void sayHello(){
		//创建一个ServiceLoader对象,服务加载器 ->Iterator
		ServiceLoader<Robot> serviceLoader = ServiceLoader.load(Robot.class);

		//获取实例集合
		Iterator<Robot> iterator = serviceLoader.iterator();

		/***
		 * 循环调用
		 * 	1）hasNextService()
		 * 	2）
		 */
		while (iterator.hasNext()){
			Robot robot = iterator.next();
			robot.sayHello();
		}
	}
}
```

运行结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9827575fc10d46409fb0a10671ae8610.png)

> 从测试结果可以看出，我们的两个实现类被成功的加载，并输出了相应的内容。

## 总结

**1、调用过程：**

- 应用程序调用ServiceLoader.load方法，创建一个新的ServiceLoader，并实例化该类中的成员变量
- 应用程序通过迭代器接口获取对象实例，ServiceLoader先判断成员变量providers对象中\(LinkedHashMap\<String,S>类型\)是否有缓存实例对象，如果有缓存，直接返回。 如果没有缓存，执行类的装载。

**2、优点：**  
使用 Java SPI 机制的优势是实现解耦，使得接口的定义与具体业务实现分离，而不是耦合在一起。

**3、缺点：**

- 不能按需加载。虽然 ServiceLoader 做了延迟载入，但是基本只能通过遍历全部获取，也就是接口的实现类得全部载入并实例化一遍。如果你并不想用某些实现类，或者某些类实例化很耗时，它也被载入并实例化了，这就造成了浪费。
- 获取某个实现类的方式不够灵活，只能通过 Iterator 形式获取，不能根据某个参数来获取对应的实现类。
- 多个并发多线程使用 ServiceLoader 类的实例是不安全的。
- 加载不到实现类时抛出并不是真正原因的异常，错误很难定位。

# Dubbo中的SPI

## 概述

Dubbo 并未使用 Java SPI，而是重新实现了一套功能更强的 SPI 机制。Dubbo SPI 的相关逻辑被封装在了`ExtensionLoader`类中，通过ExtensionLoader，我们可以加载指定的实现类。

## 入门案例

与 Java SPI 实现类配置不同，Dubbo SPI 是通过键值对的方式进行配置，这样我们可以按需加载指定的实现类。下面来演示 Dubbo SPI 的用法：

Dubbo SPI 所需的配置文件需放置在 `META-INF/dubbo` 路径下，  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6796b794d8a14214bada6eb2daece29a.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)

与 Java SPI 实现类配置不同，DubboSPI 是通过键值对的方式进行配置，配置内容如下：

```java
bumblebee = com.itheima.dubbo.spi.impl.Bumblebee
optimusPrime = com.itheima.dubbo.spi.impl.OptimusPrime
```

在使用Dubbo SPI 时，需要在接口上标注 \@SPI 注解。

```java
@SPI
public interface Robot {
void sayHello();
}
```

通过 ExtensionLoader，我们可以加载指定的实现类，下面来写个测试类演示 Dubbo SPI ：\(robot的实现类和javaSPI的内容一样\)

```java
public class DubboSPITest {

	//测试dubbo spi机制
	@Test
	public void sayHello() throws Exception {
		//1、创建ExtentionLoader
		ExtensionLoader<Robot> extensionLoader = ExtensionLoader.getExtensionLoader(Robot.class);

		//2、根据指定的名字获取对应的实例
		Robot robot = extensionLoader.getExtension("bumblebee");
		//获取默认的实例
		//Robot robot = extensionLoader.getDefaultExtension();
		robot.sayHello();
	}
}
```

运行结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4d119ac860294035b93bdefeba307710.png)

> Dubbo SPI 除了支持按需加载接口实现类，还增加了 IOC 和 AOP 等特性

## 源码分析

上面的例子简单演示了 Dubbo SPI 的使用方法，首先通过 `ExtensionLoader`的 `getExtensionLoader`方法获取一个 ExtensionLoader 实例，然后再通过 ExtensionLoader 的 `getExtension`方法获取拓展类对象。下面我们从 ExtensionLoader 的 getExtension 方法作为入口，对拓展类对象的获取过程进行详细的分析。

![在这里插入图片描述](https://img-blog.csdnimg.cn/a3926f51997347f4bdb964037dca53ca.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

上面代码的逻辑比较简单，首先检查缓存，缓存未命中则创建拓展对象。下面我们来看一下创建拓展对象的过程`createExtension()`是怎样的。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8b9d54a9a45b482786472b5f4704d58b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
createExtension 方法的逻辑稍复杂一下，主要包含了如下的步骤：

1.  通过 getExtensionClasses 获取所有的拓展类
2.  通过反射创建拓展对象
3.  向拓展对象中注入依赖
4.  将拓展对象包裹在相应的 Wrapper 对象中  
    以上步骤中，**第一个步骤**是加载拓展类的关键，第三和第四个步骤是 Dubbo IOC 与 AOP 的具体实现。由于此类设计源码较多，这里简单的总结下ExtensionLoader整个执行逻辑：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/7719db40a6f04e3bb0afa7bfc0ef71dd.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# SPI中的IOC和AOP

## 依赖注入

Dubbo IOC 是通过 setter 方法注入依赖。Dubbo 首先会通过反射获取到实例的所有方法，然后再遍历方法列表，检测方法名是否具有 setter 方法特征。若有，则通过 ObjectFactory 获取依赖对象，最后通过反射调用 setter 方法将依赖设置到目标对象中。整个过程对应的代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/15c4939f781b449e89b6191c7ab10080.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在上面代码中，objectFactory 变量的类型为 `AdaptiveExtensionFactory`，AdaptiveExtensionFactory内部维护了一个 `ExtensionFactory`列表，用于存储其他类型的 ExtensionFactory。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/243b480078f8444ca2eb9fe055be8324.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

Dubbo 目前提供了两种 ExtensionFactory，分别是 `SpiExtensionFactory` 和 `SpringExtensionFactory`。前者用于创建自适应的拓展，后者是用于从 Spring 的 IOC 容器中获取所需的拓展。这两个类的类的代码不是很复杂，这里就不一一分析了。

Dubbo IOC 目前仅支持 setter 方式注入，总的来说，逻辑比较简单易懂。

## 动态增强

在用Spring的时候，我们经常会用到AOP功能。在目标类的方法前后插入其他逻辑。比如通常使用Spring AOP来实现日志，监控和鉴权等功能。 Dubbo的扩展机制也支持类似的功能。  
在Dubbo中，有一种特殊的类，被称为`Wrapper`类。通过装饰者模式，使用包装类包装原始的扩展点实例。在原始扩展点实现前后插入其他逻辑，实现AOP功能。

### 装饰者模式

装饰者模式：在不**改变原类文件**以及**不使用继承**的情况下，动态地将责任附加到对象上，从而实现动态拓展一个对象的功能。它是通过创建一个包装对象，也就是装饰来包裹真实的对象。  
下面来举个例子说明一下：  
假如我现在有一个Shape接口，它有一个实现类Circle，而Circle中有个方法，现在我想利用装饰器模式来增强Circle中的方法。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2d9b4c4cc7b444b89a204fb327807d63.png)

```java
public interface Shape {
	void draw();
}
```

```java
/**
 * 实现类
 *  被增强对象（被装饰）
 *
 *  被装饰对象：
 *  	1）被装饰对象
 *  	2）不能继承Circle
 *  	3）不能修改Circle代码
 *  	符合要求实现：
 *  		1）创建一个新的类->实现被装饰对象实现的接口
 *  		2）把被装饰对象作为新类的属性
 *  		3）新的类中先执行增强，再执行被装饰类的指定功能
 */
public class Circle implements Shape {

	public void draw() {
		System.out.println("绘制圆形");
	}

}
```

装饰器类：RedShapeDecorator

```java
/**
 * 装饰者
 * 对Circle增强
 * 1、执行增强逻辑
 * 2、执行被装饰者对象的方法
 * 前提条件，调用时，装饰者中需要持有被装饰者对象
 * 构造方法：
 * 赋值
 */
public class RedShapeDecorator implements Shape {

    private Circle circle;

    public RedShapeDecorator(Circle circle) {
        this.circle = circle;
    }

    private void setRedBorder() {
        System.out.println("红色，粗体");
    }

    public void draw() {
        //增强逻辑
        setRedBorder();
        //调用被装饰者内部方法，完成业务
		circle.draw();
    }
}
```

下面来写个测试类测试下：

```java
public class DecoratorDemo {
	@Test
	public static void main(String[] args) {
		//被装饰对象
		Circle circle = new Circle();
		//创建装饰者对象
		RedShapeDecorator rd = new RedShapeDecorator(circle);
		//调用方法
		rd.draw();
	}
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/e67aaff8456d4ab58343fdd54e3995b8.png)

### dubbo中的AOP

Dubbo AOP 是通过装饰者模式完成的，接下来通过一个简单的案例来学习dubbo中AOP的实现方式。  
首先定义一个接口:

```java
@SPI
public interface Phone {
void call();
}
```

定义接口的实现类，也就是被装饰者

```java
public class IphoneX implements Phone {
public void call() {
System.out.println("iphone正在拨打电话");
}
}
```

为了简单，这里省略了装饰者接口。仅仅定义一个装饰者，实现phone接口，内部配置增强逻辑方法

```java
//装饰者（增强类）
public class MusicPhone implements Phone {

	private Phone phone;

	//构造函数
	public MusicPhone(Phone phone) {
		this.phone = phone;
	}

	public void call() {
		System.out.println("播放彩铃");
		this.phone.call();
	}
}
```

添加拓展点配置文件META-INF/dubbo/com.itheima.dubbo.Phone,内容如下

```yml
iphone = com.itheima.dubbo.IphoneX
filter = com.itheima.dubbo.MusicPhone
```

**测试类：**

```java
public class PhoneDemo {

	public static void main(String[] args) {
		ExtensionLoader<Phone> extensionLoader = ExtensionLoader.getExtensionLoader(Phone.class);
		//创建对应的实例
		Phone phone = extensionLoader.getExtension("iphone");
		phone.call();
	}
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/f5ac3bcbb9ac4515acad58a444a21230.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

> 先调用装饰者增强，再调用目标方法完成业务逻辑。

通过测试案例，可以看到在Dubbo SPI中具有增强AOP的功能，我们只需要关注dubbo源码`ExtensionLoader`中这样一行代码就够了  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b5c3ca8719f442f7a2bba8622273e2f1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 动态编译

## SPI中的自适应

自适应其实就是**懒加载**。例如有些拓展并不想在框架启动阶段被加载，而是希望在拓展方法被调用时，根据运行时参数进行加载。

这种在运行时，根据方法参数才动态决定使用具体的拓展，在dubbo中就叫做扩展点自适应实例。其实是一个扩展点的代理，将扩展的选择从Dubbo启动时，延迟到RPC调用时。Dubbo中每一个扩展点都有一个自适应类，如果没有显式提供，Dubbo会自动为我们创建一个，默认使用Javaassist。

**自适应拓展机制的实现逻辑是这样的**

1.  首先 Dubbo 会为拓展接口生成具有代理功能的代码；
2.  通过 javassist 或 jdk 编译这段代码，得到 Class 类；
3.  通过反射创建代理类；
4.  在代理类中，通过URL对象的参数来确定到底调用哪个实现类；

## javassist入门

Javassist是一个开源的分析、编辑和创建Java字节码的类库。它已加入了开放源代码JBoss 应用服务器项目,通过使用Javassist对字节码操作为JBoss实现动态AOP框架。  
javassist是jboss的一个子项目，其主要的优点，在于简单，而且快速。直接使用java编码的形式，而不需要了解虚拟机指令，就能动态改变类的结构，或者动态生成类。为了方便更好的理解dubbo中的自适应，这里通过案例的形式来熟悉下Javassist的基本使用

```java
package com.itheima.javassist.compiler;

import java.io.File;
import java.io.FileOutputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;

import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtConstructor;
import javassist.CtField;
import javassist.CtMethod;
import javassist.CtNewMethod;

/**
 *  Javassist是一个开源的分析、编辑和创建Java字节码的类库
 *  能动态改变类的结构，或者动态生成类
 */
public class CompilerByJavassist {

	public static void main(String[] args) throws Exception {

		// ClassPool：class对象容器
		ClassPool pool = ClassPool.getDefault();

		// 通过ClassPool生成一个User类  Class
		CtClass ctClass = pool.makeClass("com.itheima.javassist.domain.User");

		// 添加属性     -- private String username
		CtField enameField = new CtField(pool.getCtClass("java.lang.String"),
				"username", ctClass);
		//修饰符
		enameField.setModifiers(Modifier.PRIVATE);
		//作为属性添加到CtClass中
		ctClass.addField(enameField);

		// 添加属性    -- private int age
		CtField enoField = new CtField(pool.getCtClass("int"), "age", ctClass);
		enoField.setModifiers(Modifier.PRIVATE);
		ctClass.addField(enoField);

		//添加方法
		ctClass.addMethod(CtNewMethod.getter("getUsername", enameField));
		ctClass.addMethod(CtNewMethod.setter("setUsername", enameField));
		ctClass.addMethod(CtNewMethod.getter("getAge", enoField));
		ctClass.addMethod(CtNewMethod.setter("setAge", enoField));


		// 无参构造器
		CtConstructor constructor = new CtConstructor(null, ctClass);
		constructor.setBody("{}");
		ctClass.addConstructor(constructor);

		// 添加构造函数
		//ctClass.addConstructor(new CtConstructor(new CtClass[] {}, ctClass));

		CtConstructor ctConstructor = new CtConstructor(new CtClass[] {pool.get(String.class.getName()),CtClass.intType}, ctClass);
		ctConstructor.setBody("{\n this.username=$1; \n this.age=$2;\n}");
		ctClass.addConstructor(ctConstructor);

		// 添加自定义方法
		CtMethod ctMethod = new CtMethod(CtClass.voidType, "printUser",new CtClass[] {}, ctClass);
		// 为自定义方法设置修饰符
		ctMethod.setModifiers(Modifier.PUBLIC);
		// 为自定义方法设置函数体
		StringBuffer buffer2 = new StringBuffer();
		buffer2.append("{\nSystem.out.println(\"用户信息如下\");\n")
				.append("System.out.println(\"用户名=\"+username);\n")
				.append("System.out.println(\"年龄=\"+age);\n").append("}");
		ctMethod.setBody(buffer2.toString());
		ctClass.addMethod(ctMethod);

		//生成一个class
		Class<?> clazz = ctClass.toClass();

		Constructor cons2 = clazz.getDeclaredConstructor(String.class,Integer.TYPE);

		Object obj = cons2.newInstance("itheima",20);

		//反射 执行方法
		obj.getClass().getMethod("printUser", new Class[] {})
				.invoke(obj, new Object[] {});

		// 把生成的class文件写入文件
		byte[] byteArr = ctClass.toBytecode();
		FileOutputStream fos = new FileOutputStream(new File("D://User.class"));
		fos.write(byteArr);
		fos.close();
	}
}
```

运行上述代码就可以创建一个user对象。  
我们可以知道使用javassist可以方便的在运行时，按需动态的创建java对象，并执行内部方法。而这也是dubbo中动态编译的核心

## 源码分析

**Adaptive注解：**  
在开始之前，我们有必要先看一下与自适应拓展息息相关的一个注解，即 Adaptive 注解。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ce0766d0d412431abd0edbabe75a2102.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
从上面的代码中可知，Adaptive 可注解在类或方法上。

- 标注在类上：Dubbo 不会为该类生成代理类。
- 标注在方法上：Dubbo 则会为该方法生成代理逻辑，表示当前方法需要根据 参数URL 调用对应的扩展点实现。

**获取自适应拓展类：**  
dubbo中每一个扩展点都有一个自适应类，如果没有显式提供，Dubbo会自动为我们创建一个，默认使用Javaassist。 先来看下创建自适应扩展类的代码:  
`org.apache.dubbo.common.extension.ExtensionLoader#getAdaptiveExtension`

![在这里插入图片描述](https://img-blog.csdnimg.cn/e9011a9e6e664a3abf20c4bfd9ebcb52.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
继续看createAdaptiveExtension方法  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8fbde05c9d054124862df9e3ecc6431e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
继续看getAdaptiveExtensionClass方法  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f23d236a5baf4137a7d856bd111d0e0c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
继续看`createAdaptiveExtensionClass`方法，绕了一大圈，终于来到了具体的实现了。看这个createAdaptiveExtensionClass方法，它首先会生成自适应类的Java源码，然后再将源码编译成Java的字节码，加载到JVM中。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/24cba3124d4b404fb532cca9464d5840.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Compiler的代码，默认实现是javassist。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1a3eab84480741e2906fcf49c582f1c5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)