---
title: JavaBean与MVC设计模式
date: 2020-05-06 12:55:01
tags: 
categories: JavaWeb
---

<!--more-->

### JavaBean与MVC设计模式

- [JavaBean](#JavaBean_2)
- [MVC设计模式](#MVC_31)
- - [Servlet](#Servlet_41)
  - - [Servlet生命周期：5个阶段](#Servlet5_73)
    - [Servlet继承关系](#Servlet_101)
  - [三层优化](#_124)

# JavaBean

**定义：**  
JavaBean（就是一个Java类）的定义：满足一下2点 ，就可以称JavaBean

a.public 修饰的类 ,public 无参构造  
b.所有属性\(如果有\) 都是private，并且提供set/get \(如果boolean 则get 可以替换成is\)

**作用**  
JavaBean的作用：  
a.减轻的jsp复杂度  
b.提高代码复用（以后任何地方的 登录操作，都可以通过调用LoginDao实现）

**分类**  
使用层面，Java分为2大类：  
a.封装业务逻辑的JavaBean \(LoginDao.java封装了登录逻辑\) 逻辑  
可以将jsp中的JDBC代码，封装到Login.java类中 （Login.java）

b.封装数据的JavaBean （实体类，Student.java Person.java ） 数据  
对应于数据库中的一张表  
Login login = new Login\(uname,upwd\) ;//即用Login对象 封装了2个数据（用户名 和密码）

_**封装数据的JavaBean 对应于数据库中的一张表 \(Login\(name,pwd\)\)  
封装业务逻辑的JavaBean 用于操作 一个封装数据的JavaBean**_

可以发现，JavaBean可以简化 代码\(jsp->jsp+java\)、提供代码复用\(LoginDao.java\)

# MVC设计模式

M：Model ，模型 ：一个功能。用JavaBean实现。

V:View，视图： 用于展示、以及与用户交互。使用html js css jsp jquery等前端技术实现

C:Controller，控制器 ：接受请求，将请求跳转到模型进行处理；模型处理完毕后，再将处理的结果  
返回给 请求处 。 可以用jsp实现， 但是一般建议使用 Servlet实现控制器。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506122628853.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## Servlet

Servlet：  
Java类必须符合一定的 规范：  
a.必须继承 javax.servlet.http.HttpServlet  
b.重写其中的 doGet\(\)或doPost\(\)方法

doGet\(\)： 接受 并处 所有get提交方式的请求  
doPost\(\)：接受 并处 所有post提交方式的请求

Servlet要想使用，必须配置  
Serlvet2.5：web.xml  
Servle3.0： \@WebServlet

---

Servlet3.0，与Servlet2.5的区别：  
Servlet3.0不需要在web.xml中配置，但 需要在 Servlet类的定义处之上编写 注解\@WebServlet\(“url-pattern的值”\)  
匹配流程： 请求地址 与\@WebServlet中的值 进行匹配，如果匹配成功 ，则说明 请求的就是该注解所对应的类

---

_**项目的根目录：WebContent 、src**_

**Servlet流程：**  
请求 \-> \< url-pattern> \-> 根据\< servlet-mapping>中的\< servlet-name> 去匹配 \< servlet> 中的\< servlet-name>，然后寻找到\< servlet-class>，求中将请求交由该\< servlet-class>执行。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506123001966.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### Servlet生命周期：5个阶段

加载  
初始化： init\(\) ，该方法会在 Servlet被加载并实例化的以后 执行  
服务 ：service\(\) \->doGet\(\) doPost  
销毁 ：destroy\(\)， Servlet被系统回收时执行  
卸载

```
init():
	a.默认第一次访问 Servlet时会被执行 （只执行这一次）
	b.可以修改为 Tomcat启动时自动执行
		i.Servlet2.5：  web.xml
			  <servlet>
				...
  				 <load-on-startup>1</load-on-startup>
    			</servlet>
			其中的“1”代表第一个。
		ii.Servlet3.0
			@WebServlet( value="/WelcomeServlet" ,loadOnStartup=1  )


service() ->doGet()  doPost ：调用几次，则执行几次
destroy()：关闭tomcat服务时，执行一次。
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020050612451536.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### Servlet继承关系

```
ServletConfig:接口 
ServletContext getServletContext():获取Servlet上下文对象   application
String  getInitParameter(String name):在当前Servlet范围内，获取名为name的参数值（初始化参数）



a.ServletContext中的常见方法(application)：
getContextPath():相对路径
getRealPath()：绝对路径
setAttribute() 、getAttribute()
--->
String getInitParameter(String name);在当前Web容器范围内，获取名为name的参数值（初始化参数）
```

HttpServletRequest中的方法：\(同request\)，例如setAttrite\(\)、getCookies\(\)、getMethod\(\)  
HttpServletResponse中的方法：同response

## 三层优化

**1.加入接口**  
建议面向接口开发：先接口-再实现类  
–service、dao加入接口  
–接口与实现类的命名规范  
接口：interface， 起名 实体类Service  
实现类：implements 起名 实体类ServiceImpl

```
以后使用接口/实现类时，推荐写法：
接口 x = new 实现类();
IStudentDao studentDao = new StudentDaoImpl();
```

**2.DBUtil 通用的数据库帮助类，可以简化Dao层的代码量**  
帮助类 一般建议写在 xxx.util包

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506125418741.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)