---
title: Maven继承、聚合、web部署
date: 2020-04-16 15:37:44
tags: 
categories: Maven
---

<!--more-->

### Maven

- [打包方式：](#_1)
- [继承实现步骤：](#_7)
- [聚合：](#_39)
- [部署Web工程：war](#Webwar_69)

# 打包方式：

打包方式：  
java工程——jar  
web项目-war  
父工程-pom

# 继承实现步骤：

1.建立父工程： 父工程的打包方式为pom

2.在父工程的pom.xml中编写依赖：

```xml
<dependencyManagement>
  	<dependencies>
  		<dependency>
```

3.子类:

```xml
  <!-- 给当前工程 继承一个父工程：1加入父工程坐标gav   2当前工程的Pom.xml到父工程的Pom.xml之间的 相对路径  -->
 	 <parent>
 	 	<!-- 1加入父工程坐标gav -->
 	 	  <groupId>org.lanqiao.maven</groupId>
		  <artifactId>B</artifactId>
		  <version>0.0.1-SNAPSHOT</version>
		 <!-- 2当前工程的Pom.xml到父工程的Pom.xml之间的 相对路径 --> 
		  <relativePath>../B/pom.xml</relativePath>
 	 </parent>
```

4.在子类中 需要声明 ：使用那些父类的依赖

```xml
 			 <dependency>
	  		  <!-- 声明：需要使用到父类的junit （只需要ga） -->
				<groupId>junit</groupId>
				<artifactId>junit</artifactId>
			  </dependency>
```

# 聚合：

Maven项目能够识别的： 自身包含、本地仓库中的

Maven2依赖于Maven1，则在执行时：必须先将Maven1加入到本地仓库\(install\)，之后才能执行Maven2  
以上 前置工程的install操作，可以交由“聚合” 一次性搞定。。。

聚合的使用：

```xml
在一个总工程中配置聚合： （聚合的配置 只能配置在（打包方式为pom）的
Maven工程中）

  <modules>
  		<!--项目的根路径  -->
  	  <module>../Maven1</module>
  	  <module>../Maven2</module>
  	  
  </modules>
配置完聚合之后，以后只要操作总工程，则会自动操作 改聚合中配置过的工程

注意：clean命令 是删除 target目录，并不是清理install存放入的本地仓库


聚合：
	Maven将一个大工程拆分成 若干个子工程（子模块） 
	聚合可以将拆分的多个子工程 合起来
继承：
	父->子工程,可以通过父工程  统一管理依赖的版本
```

# 部署Web工程：war

通过maven直接部署运行web项目：  
a.配置cargo  
[Cargo的配置](https://blog.csdn.net/xiaojin21cen/article/details/78570030)  
b. maven命令：deploy

实际开发中，开发人员 将自己的项目开发完毕后 打成war包\(package\) 交给实施人员去部署；