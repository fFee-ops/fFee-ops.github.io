---
title: maven基础
date: 2020-04-16 14:59:40
tags: maven
categories: Maven
---

<!--more-->

### Maven

- [maven的作用 :](#maven%09_2)
- [Maven概念：](#Maven_11)
- - [1.下载配置maven](#1maven_43)
  - [2.使用maven](#2maven_54)
- [依赖：](#_89)
- - [依赖有效性](#_145)
- [仓库：](#_148)

# maven的作用 :

a.

```
	i.增加第三方Jar   (commons-fileupload.jar   commons-io.jar)
	ii.jar包之间的依赖关系 （commons-fileupload.jar 自动关联下载所
	有依赖的Jar，并且不会冲突）
```

b.将项目拆分成若干个模块

# Maven概念：

是一个基于Java平台的 _**自动化构建工具**_  
make-ant-maven-gradle

一些名词的解释

```
清理：删除编译的结果，为重新编译做准备。
编译：java->class
测试： 针对于 项目中的关键点进行测试，亦可用 项目中的测试代码 去测试开发代码；
报告：将测试的结果 进行显示
打包： 将项目中包含的多个文件 压缩成一个文件， 用于安装或部署。 （java项目-jar、web项目-war）
安装：将打成的包  放到  本地仓库，供其他项目使用。
部署：将打成的包  放到  服务器上准备运行。
	--将java、js、jsp等各个文件 进行筛选、组装，变成一个 可以直接运行的项目
	-- 大米->米饭


-Eclipse中部署的web项目可以运行
	-将Eclipse中的项目，复制到tomcat/webapps中则不能运行
	-项目可以在webappas中直接运行
	
Eclipse中的项目 ，在部署时 会生成一个 对应的 部署项目(在wtpwebapps中)，区别在于： 部署项目 没有源码文件src(java)，只有编译后的class文件和jsp文件
	因为二者目录结构不一致，因此tomcat中无法直接运行 Eclips中复制过来的项目 （因为 如果要在tomcat中运行一个项目，则该项目 必须严格遵循tomcat的目录结构）
	
Eclipse中的项目 要在tomcat中运行，就需要部署：
	 a.通过Eclipse中Add and Remove按钮进行部署
     b.将Web项目打成一个war包，然后将该war包复制到tomcat/webapps中 即可执行运行
```

自动化构建工具maven：将 原材料（java、js、css、html、图片）->产品（可发布项目）

## 1.下载配置maven

```
a.配置JAVA_HOME
b.配置MAVEN_HOME    :    D:\apache-maven-3.5.3\bin
      M2_HOME
c.配置path
	%MAVEN_HOME%\bin	
d.验证
	mvn -v
e.配置本地仓库  maven目录/conf/settings.xml
	默认本地仓库 ：C:/Users/YANQUN/.m2/repository
	修改本地仓库：  <localRepository>D:/mvnrep</localRepository>
```

## 2.使用maven

```
约定 优于 配置 

硬编码方式：job.setPath("d:\\abc") ;
配置方式：
	job
conf.xml                   <path>d:\\abc</path>

约定：使用默认值d:\\abc
	job


maven约定的目录结构：
	项目
	-src				
		--main			：程序功能代码
			--java		 java代码  (Hello xxx)
			--resources      资源代码、配置代码
		--test			：测试代码
			--java			
			--resources	
```

Maven 中的pom.xml

```xml
	<groupId>域名翻转.大项目名</groupId>
	<groupId>org.lanqiao.maven</groupId>

	<artifactId>子模块名</artifactId>
	<artifactId>HelloWorld</artifactId>


	<version>版本号</version>
	<version>0.0.1-SNAPSHOT</version>
```

# 依赖：

commons-fileupload.jar \--> commons-io.jar  
A中的某些类 需要使用B中的某些类，则称为A依赖于B  
在maven项目中，如果要使用 一个当时存在的Jar或模块，则可以通过 依赖实现（去本地仓库、中央仓库去寻找）

执行mvn： 必须在pom.xml所在目录中执行

```
maven常见命令： （第一次执行命令时，因为需要下载执行该命令的基础环境，所以会从中央仓库下载该环境到本地仓库）
编译：  (  Maven基础组件 ，基础Jar)
mvn compile   --只编译main目录中的java文件
mvn test     测试
mvn package          打成jar/war
mvn install  将开发的模块 放入本地仓库，供其他模块使用 （放入的位置 是通过gav决定）

mvn clean  删除target目录（删除编译文件的目录）
运行mvn命令，必须在pom.xml文件所在目录
```

```xml
1.依赖的范围、依赖的有效性
	compile(默认)  	test 	 provided
2.依赖排除
   A.jar ->B.jar
  当我们通过maven引入A.jar时，会自动引入B.jar
	A.jar(x.java ,y.java,z.java)     B.jar(p.java  c.java  i.java)
		A.jar和B.jar之间的 依赖的本质：z.java ->c.java

   <!-- 排除依赖 beans -->
		    <exclusions>
		    	<exclusion>
		    		<groupId>org.springframework</groupId>
   					 <artifactId>spring-beans</artifactId>
		    	</exclusion>
		    
		    </exclusions>
		    
 a.commons-fileupload.jar  commons-io.jar  :虽然我们实际开发时，认
为二者jar必须关联，但是maven可能不这么认为。
 b.如果X.jar 依赖于Y.jar，但是在引入X.jar之前  已经存在了Y.jar，则
 maven不会再在 引入X.jar时 引入Y.jar
 
3.依赖的传递性
A.jar-B.jar->C.jar

要使 A.jar ->C.jar:当且仅当 B.jar 依赖于C.jar的范围是compile

多个maven项目（模块）之间如何 依赖： p项目 依赖于->q项目
1.  p项目 install 到本地仓库
2.  q项目 依赖：
		<!-- 本项目  依赖于HelloWorld2项目 -->
 		 <dependency>
 		 	 <groupId>org.lanqiao.maven</groupId>
			  <artifactId>HelloWorld2</artifactId>
			  <version>0.0.1-SNAPSHOT</version>
 		 </dependency>
```

## 依赖有效性

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020041615121740.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 仓库：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200416145927576.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)