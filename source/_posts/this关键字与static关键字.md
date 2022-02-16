---
title: this关键字与static关键字
date: 2020-06-05 16:21:31
tags: 
categories: java
---

<!--more-->

# this

**关于this关键字，你只需要记住它就是指自身，this即代表自己，this.属性访问的是自己的属性、this\(\)访问的就是自己的无参构造方法。**

**this\(\)调用的是Person自己的无参构造方法，this.name访问的是Person对象自身的name，而方法参数中的name则表示方法传入的值。**

---

# static

static是静态的意思，是一个修饰符，就像是一个形容词，是用来形容类，变量，方法的。

static修饰变量，这个变量就变成了静态变量，修饰方法这个方法就成了静态方法，

static关键字方便在没有创建对象的情况下来进行调用（方法/变量）。

**1.修饰变量**  
不使用static关键字访问对象的属性：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200605162548380.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
使用static关键字访问对象的属性：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200605162604215.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**注意：如果一个类的成员变量被static修饰了，那么所有该类的对象都共享这个变量。无论这个类实例化多少对象，它的静态变量只有一份拷贝。**  
例如：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200605162719685.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

```
输出：
	李四
	李四
	李四
```

**2.修饰方法**

用static关键字修饰的方法叫做静态方法。静态方法我们已经用过，它有一个特点相信你已经很熟悉，那就是不需要创建对象就可以直接使用。

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020060516282325.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

注意：  
**1、静态方法不能使用类的非静态变量；**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200605162856287.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**2、静态方法可以直接调用静态方法，但是调用普通方法只能通过对象的实例才能调用**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200605162926342.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**3、静态代码块**  
运行：![在这里插入图片描述](https://img-blog.csdnimg.cn/20200605162953796.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

```
结果：
			我被调用了
```

上图中static\{ \}就是一个静态代码块。

我们在main方法中没有编写任何代码，可是运行的时候，程序还是会输出我被调用了，由此我们可以发现静态代码块是不需要依赖main方法就可以独立运行的。

**关于静态代码块只需要记住一句话：在类被加载的时候运行且只运行一次。**

静态代码块中变量和方法的调用也遵守我们之前所说的规则，即只能直接调用静态的属性和方法。

---

注意： 在Java中是不能用static关键字修饰局部变量