---
title: Shiro简介与示例
date: 2020-05-24 23:02:12
tags: 
categories: Shiro
---

<!--more-->

### Shiro简介与示例

- [什么是Shiro](#Shiro_1)
- [Shiro的认证过程](#Shiro_34)
- [Shiro靠什么做认证与授权的？](#Shiro_46)
- [示例（源代码见GITHUB）](#GITHUB_52)
- - - - [POM.XML文件中引入Shiro依赖](#POMXMLShiro_54)
      - [index.html](#indexhtml_70)
      - [login.html](#loginhtml_98)
      - [controller:](#controller_125)
      - [Shiro配置类所依赖的realm:](#Shirorealm_212)
      - [配置类:](#_301)
      - [userMapper.xml](#userMapperxml_412)

# 什么是Shiro

```
Apache Shiro™是一个强大且易用的Java安全框架,能够用于身份验证、授权、
加密和会话管理。Shiro拥有易于理解的API,您可以快速、轻松地获得任何应
用程序——从最小的移动应用程序到最大的网络和企业应用程序。
```

简而言之，Apache Shiro 是一个强大灵活的开源安全框架，可以完全处理身份验证、授权、加密和会话管理。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200524225009317.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**Authentication（认证）**：用户身份识别，通常被称为用户“登录”

**Authorization（授权）**：访问控制。比如某个用户是否具有某个操作的使用权限。

**Session Management（会话管理）**：会话管理，即用户登录后就是一次会话，在没有退出之前，它的所有信息都在会话中；会话可以是普通 JavaSE 环境的，也可以是如 Web 环境的。

**Cryptography（加密）**：加密，保护数据的安全性，如密码加密存储到数据库，而不是明文存储。

还有一些扩展的功能：  
**Web Support**：Web支持，可以非常容易的集成到 web 环境。

**Caching**：缓存，比如用户登录后，其用户信息、拥有的角色/权限不必每次去查，这样可以提高效率。

**Concurrency**：shiro 支持多线程应用的并发验证，即如在一个线程中开启另一个线程，能把权限自动传播过去。

**Testing**：提供测试支持。

**Run As**：允许一个用户假装为另一个用户（如果他们允许）的身份进行访问。

**Remember Me**：记住我，这个是非常常见的功能，即一次登录后，下次再来的话不用登录了。

# Shiro的认证过程

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200524225542150.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
①Subject：主体，代表了当前“用户”。  
这个用户不一定是一个具体的人，与当前应用交互的任何东西都是 Subject，如网络爬虫，机器人等。所有 Subject 都绑定到 SecurityManager，与 Subject 的所有交互都会委托给 SecurityManager。我们可以把 Subject 认为是一个门面，SecurityManager 才是实际的执行者。

②SecurityManager：安全管理器。  
即所有与安全有关的操作都会与 SecurityManager 交互，且它管理着所有 Subject。可以看出它是 Shiro 的核心，它负责与后边介绍的其他组件进行交互，如果学习过 SpringMVC，我们可以把它看成 DispatcherServlet 前端控制器。

③Realm：域。  
Shiro 从 Realm 获取安全数据（如用户、角色、权限），就是说 SecurityManager 要验证用户身份，那么它需要从 Realm 获取相应的用户进行比较以确定用户身份是否合法，也需要从 Realm 得到用户相应的角色/权限进行验证用户是否能进行操作。我们可以把 Realm 看成 DataSource，即安全数据源。

# Shiro靠什么做认证与授权的？

Shiro可以利用`HttpSession`或者`Redis`存储用户的登陆凭证，以及角色或者身份信息。然后利用`过滤器（Filter`），对每个Http请求过滤，检查请求对应的HttpSession或者Redis中的认证与授权信息。如果用户没有登陆，或者权限不够，那么Shiro会向客户端返回错误信息。

也就是说，我们写用户登陆模块的时候，用户登陆成功之后，要调用Shiro保存登陆凭证。然后查询用户的角色和权限，让Shiro存储起来。将来不管哪个方法需要登陆访问，或者拥有特定的角色跟权限才能访问，我们在方法前设置注解即可，非常简单。

# 示例（源代码见GITHUB）

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200525140003320.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

#### POM.XML文件中引入Shiro依赖

```xml
	<!-- thymel对shiro的扩展坐标 -->
		<dependency>
			<groupId>com.github.theborakompanioni</groupId>
			<artifactId>thymeleaf-extras-shiro</artifactId>
			<version>2.0.0</version>
		</dependency>

	<dependency>
			<groupId>org.apache.shiro</groupId>
			<artifactId>shiro-spring</artifactId>
			<version>1.4.0</version>
		</dependency>
```

#### index.html

```html
<!DOCTYPE html>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
<h4>test</h4>
<hr/>

<div shiro:hasPermission="user:add">
<a href="/add">用户添加</a>
</div>
<br/>
<div shiro:hasPermission="user:update">
<a href="/update">用户更新</a>
</div>
</body>
</html>
```

```html
<div shiro:hasPermission="user:add"> </div>
在该div中的元素只有在用户有 user：add 资源权限时才会显示	
```

#### login.html

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
<h1 style="align-content: center;">用户登录</h1>


<font style="color: red;" th:text="${msg}"></font>
<form action="/tologin">
	用户名：<input name="name" />  <br/>
	密码：<input name="password" type="password"/>  <br/>
	<input type="submit" value="登录"/>  <br/>

</form>
</body>
</html>
```

```html
<font style="color: red;" th:text="${msg}"></font>
用来展示登录验证信息。从Controller 中拿值
```

#### controller:

```java
package com.sl.spring.controller;

import java.lang.ProcessBuilder.Redirect;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class UserController {
private final String PREFIX = "user/";
	/**
	 * 测试方法
	 */
	@RequestMapping("/test")
	public String test(){
		return "index";
	}
	@RequestMapping("/add")
	public String add(){
		return PREFIX+"add";
	}
	@RequestMapping("/update")
	public String update(){
		return PREFIX+"update";
	}
	
	@RequestMapping("/login")
	public String login(){
		return "login";
	}
	
	
	/**
	 * 登录逻辑处理
	 */
	@RequestMapping("/tologin")
	public String tologin(String name,String password,Model model){
		//使用Shiro编写认证操作
		Subject subject = SecurityUtils.getSubject();
		//封装用户数据
		UsernamePasswordToken token = new UsernamePasswordToken(name, password);
		
		//执行登录方法
		try {
			subject.login(token);
		//没有捕获到异常就是登录成功	
			return "redirect:/test";//重定向到/test请求从而跳转到index.html
		} catch (UnknownAccountException e) {
//			  登陆失败:用户名不存在
			model.addAttribute("msg", "用户名不存在！");
			return "login";//因为存放有数据，重定向会丢失数据，所以直接返回页面
			
		}catch (IncorrectCredentialsException e) {
//			 登陆失败:密码错误
			model.addAttribute("msg", "密码错误！");
			return "login";
			
		}
	
	}
	
	
	@RequestMapping("/unAuth")
	public String unAuth(){
		return "unAuth";
	}
	
	
	
}
```

```java
登录逻辑其实是根据是否抛出异常来判断是否成功，如果失败，则利用model把错
误信息放到request域中，然后login.html就能拿到该信息并展示给用户。
```

#### Shiro配置类所依赖的realm:

```java
package com.sl.spring.realm;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;

import com.sl.spring.entity.User;
import com.sl.spring.service.UserService;

public class UserRealm  extends AuthorizingRealm{
/*
 * 执行授权逻辑
 */
	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
		System.out.println("执行授权逻辑");
		SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
				
				
		//获取当前登录的用户
		Subject subject = SecurityUtils.getSubject();	
		User user=(User) subject.getPrincipal();
		
		User dUser=service.findById(user.getId());
		System.out.println(dUser.toString());
		info.addStringPermission(dUser.getPerms());
				return info;
	}

	/*
	 * 执行认证逻辑
	 */
	@Autowired
	private UserService service;
	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
		System.out.println(" 执行认证逻辑");
		
		//编写判断逻辑，来判断用户名和密码是否正确
		UsernamePasswordToken token2=(UsernamePasswordToken) token;//Controller传来的Token
		
		User user = service.findByName(token2.getUsername());
		
		
		
		//1、判断用户名
		if (user==null) {
			//用户名不存在
			return null;//Shiro底层会抛出UnknownAccountException
			
		}
		
		//2、判断密码
		return new SimpleAuthenticationInfo(user,user.getPassword(),"");
	}

}

```

```java
UsernamePasswordToken token2=(UsernamePasswordToken) token;
这里的token就是前面controller用来封装用户数据的那个token

=========
//2、判断密码
return new SimpleAuthenticationInfo(user,user.getPassword(),"");

这里的user会传到授权逻辑的方法去。
======================================
User user=(User) subject.getPrincipal();
来获得上面的那个user


info.addStringPermission(dUser.getPerms());
从数据库中获得用户对应的资源权限，并赋给用户
```

#### 配置类:

```java
package com.sl.spring.config;

import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.sl.spring.realm.UserRealm;

import at.pollux.thymeleaf.shiro.dialect.ShiroDialect;

@Configuration
public class ShiroConfig {
/**
 * 创建Realm
 */
	@Bean(value = "getRealm")
	public  UserRealm getRealm() {
		
		return new UserRealm();
	}
	
	/**
	 * 创建DefaultWebSecurityManager
	 */
	
	@Bean(value = "security")
	public DefaultWebSecurityManager gDefaultWebSecurityManager(@Qualifier("getRealm") UserRealm realm) {
		DefaultWebSecurityManager securityManager=new DefaultWebSecurityManager();
		//关联Realm
		securityManager.setRealm(realm);
		return securityManager;
	}
	
	/**
	 * 创建ShiroFilterFactoryBean
	 * @return
	 */
	@Bean
	public ShiroFilterFactoryBean getShiroFilterFactoryBean(@Qualifier("security")DefaultWebSecurityManager securityManager) {
		ShiroFilterFactoryBean factoryBean = new ShiroFilterFactoryBean();
	
		//设置安全管理器
		factoryBean.setSecurityManager(securityManager);
		
		//添加shiro的内置过滤器
		/**
		 * Shiro内置过滤器，可以实现权限相关的拦截器
		 *    常用的过滤器：
		 *       anon: 无需认证（登录）可以访问
		 *       authc: 必须认证才可以访问
		 *       user: 如果使用rememberMe的功能可以直接访问
		 *       perms： 该资源必须得到资源权限才可以访问
		 *       role: 该资源必须得到角色权限才可以访问
		 */
		Map<String, String> map=new LinkedHashMap<String, String>();
		//放行/tologin请求
		map.put("/tologin", "anon");
		
		
		//授权过滤器
		//注意，当前授权拦截后，Shiro会自动跳转到一个提示未授权的页面
		map.put("/add", "perms[user:add]");
		map.put("/update", "perms[user:update]");
		
		//要过滤什么请求
		map.put("/*", "authc");//这个一定要写最后，不然没办法执行授权逻辑（过滤链是有顺序的）
		
		//修改被拦截后的跳转页面
		factoryBean.setLoginUrl("/login");
		
		
		//设置未授权提示页面
		factoryBean.setUnauthorizedUrl("/unAuth");
		
		
		factoryBean.setFilterChainDefinitionMap(map);
		return factoryBean;
	}
	
	/**
	 * 配置ShiroDialect，用于thymeleaf和shiro标签配合使用
	 */
	@Bean
	public ShiroDialect getShiroDialect(){
		return new ShiroDialect();
	}

}

```

```java
Realm-->DefaultWebSecurityManager-->ShiroFilterFactoryBean
逐层依赖。
===========
map.put("/*", "authc");
一定要写最后，不然授权无法访问，过滤链是有顺序的
===================
map.put("/add", "perms[user:add]");
给/add请求增加一个资源授权限制
```

#### userMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!-- 该文件存放CRUD的sql语句 -->
<mapper namespace="com.sl.spring.mapper.UserMapper">
	
	<select id="findByName" parameterType="string" resultType="com.sl.spring.entity.User">
	SELECT 	id, 
		NAME, 
		PASSWORD,
		perms
		FROM 
		user where name = #{name}
	</select>
	
	<select id="findById" parameterType="int" resultType="com.sl.spring.entity.User">
	SELECT 	id, 
		NAME, 
		PASSWORD,
		perms
		FROM 
		user where id = #{id}
	</select>
</mapper>

```