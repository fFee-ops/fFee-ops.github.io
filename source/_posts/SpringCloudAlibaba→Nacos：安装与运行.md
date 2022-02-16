---
title: SpringCloudAlibaba→Nacos：安装与运行
date: 2020-10-26 11:14:55
tags: centos linux 微服务
categories: SpringCloudAlibaba
---

<!--more-->

### 安装并运行Nacos

- [Centos安装](#Centos_2)
- - [1.Nacos Derby安装](#1Nacos_Derby_11)
  - [2.Nacos MySQL版安装](#2Nacos_MySQL_22)
- [Windows安装](#Windows_40)

# Centos安装

Nacos安装模式有多种：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/66a32f259c174b8bb4b306b4c7ba6a80.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

前提是我们下载好nacos的安装包。并上传到linux服务器。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6e3bd4c1cbff4c8295a52de6fef6ab0b.png)

## 1.Nacos Derby安装

1、把压缩包进行解压。  
2、进入bin目录直接启动即可

```shell
cd /nacos/bin
#启动
sh startup.sh -m standalone
```

**一定要加standalone**  
3、访问`192.168.80.1/nacos`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ce944b995d0e405d8be6b46d6e6495c9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.Nacos MySQL版安装

1、在mysql中新建一个数据库`nacos`  
2、将nacos的`conf`目录下的`nacos-mysql.sql`文件在数据库中运行  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cf6580a1f57947e884f4dfe4b5b11f44.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2d3300c51c54465db943050e87d788c4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
3、编辑 nacos的`config` 目录下的`application.properties` 文件，将下图的配置打开，并且换为自己mysql的信息  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e2889f16129342a5b3c123b4936914c1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
修改后为下图  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0ed77bee5da144d1b9150160f733af13.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

4、然后再以单机，模式启动nacos

```shell
cd /nacos/bin
#启动
sh startup.sh -m standalone
```

# Windows安装

1、本地Java8+Maven环境已经OK  
2、[先从官网下载Nacos](https://github.com/alibaba/nacos/releases/tag/1.1.4)  
3、解压安装包，直接运行bin目录下的startup.cmd  
4、命令运行成功后直接访问http://localhost:8848/nacos`默认账号密码都是nacos`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201026111432206.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)