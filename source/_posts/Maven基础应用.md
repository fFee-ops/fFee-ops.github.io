---
title: Maven基础应用
date: 2020-04-16 15:27:59
tags: 
categories: Maven
---

<!--more-->

### Maven

- [在Eclipse中创建maven工程：](#Eclipsemaven_2)
- [maven生命周期:](#maven_20)

# 在Eclipse中创建maven工程：

1.配置maven:  
配置maven版本  
配置本地仓库 ： 设置settings.xml

2.打开Eclipse–>window–>Prefrences–>Maven---->Installations , 点击右侧的Add按钮，在弹出的窗口中，选择刚刚解压玩的文件夹,如图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200416152310186.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
完成之后，还要把新增的maven勾上：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020041615234356.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
3.连接本地仓库  
新建一个文件夹，作为本地仓库，这里我新建了一个maven-Repository的文件夹，就是最上放和jdk放在一起的

找到解压后的maven文件夹，打开conf子文件夹，找到settings.xml, 编辑加入一行配置：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200416152457114.png)  
回到Eclipse，打开window---->Preferences —>Maven---->User Settings：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200416152521723.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# maven生命周期:

生命周期和构建的关系：  
生命周期中的顺序：a b c d e  
当我们执行c命令，则实际执行的是 a b c

生命周期包含的阶段：3个阶段  
clean lifecycle ：清理  
pre-clean clean post-clearn

default lifecycle ：默认\(常用\)

site lifecycle：站点  
pre-site site post-site site-deploy

再次强调：在pom.xml中增加完依赖后 需要maven \- update project  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200416152108773.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)