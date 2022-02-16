---
title: Dubbo-Admin部署
date: 2020-05-21 13:53:40
tags: zk zookeeper 分布式
categories: Dubbo
---

<!--more-->

### Dubbo-Admin部署

- [2.6.0版本](#260_8)
- - [打包](#_9)
  - [部署](#_20)
- [2.7版本](#27_38)
- - [简介](#_39)
  - [打包、部署](#_42)
  - [验证](#_77)

[2.6.0版本下载地址](https://github.com/apache/dubbo/tree/dubbo-2.6.0)  
[2.7.x版本下载](https://github.com/apache/dubbo-admin)

运行dubboAdmin的前提是已经安装并且将zk运行起来了，下文就默认zk是运行的

# 2.6.0版本

## 打包

1、进入dubbo-admin文件夹  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521134950342.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521135032875.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
2、进入命令行模式  
执行

```powershell
mvn  package -Dmaven.skip.test=true
```

## 部署

3、将打包好的war包传输到LINUX的tomcat的webapps目录下  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200521135302363.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

4、进入webapps目录下，进入webapps\\dubbo-admin-2.6.0\\WEB-INF目录下，找到dubbo.properties，修改如下

```yml
# 和zookeeper注册中心<dubbo:registry address="zookeeper://127.0.0.1:2181" />中的保持一致
dubbo.registry.address=zookeeper://127.0.0.1:2181
# 用户名
dubbo.admin.root.password=root
# 密码
dubbo.admin.guest.password=guest

```

5、启动zookeeper和tomcat，然后访问dubbo-admin即可。

# 2.7版本

## 简介

2.7的版本相对于之前的版本比较大的一个变化就是变成了前后分离的结构了。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9edd46e013014235a6ad69d416289e9b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 打包、部署

直接在idea将整个项目打开，然后我们需要更改的地方只在  
![在这里插入图片描述](https://img-blog.csdnimg.cn/80330c5e880e4d81a0187f42033d9b0b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)  
首先看`application.properties`：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d263fa99053e4472bedd8a835ad24281.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们需要新增红框内的两个配置，并修改三个ip地址。

再来看`application-test.properties`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d1d650f3563e41b896487b63970d517e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们就只需要改ip了。  
此时就配置好了。

在`dubbo-admin-server`目录下打开cmd,执行Maven打包命令，执行：

```java
mvn package -Dmaven.test.skip=true
```

打包成功后我们就可以直接把`dubbo-admin-server`下的target下的JAR包丢到阿里云服务器，并用`java \-jar`去执行这个jar包。至此后台已经搞定了，但因为是前后分离我们还要去配置一下前端项目。

> 如果你想在后台运行jar包那么执行`nohup java \-jar XXX.jar >temp.txt &`  
> 解释一下：它将所有输出都写入到temp.txt文件，也就不会输出到默认的nohup.out文件中了  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/ae635aa6a4694862b98bf4ea211df14b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

---

我们打开dubbo-admin-ui中的`vue.config.js`文件，修改如下两处。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/efedf0945ca34b75b8ffda181dadf64e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
然后来到dubbo-admin-ui打开cmd窗口执行：  
安装组件命令（只需要在第一次运行项目前执行即可）：

```bash
npm install
```

运行命令：

```bash
npm run dev
```

## 验证

在做完上述步骤后，后台jar包已经在云服务器运行了，我们只需要来到dubbo-admin-ui打开cmd窗口执行：`npm run dev`。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ce836d93329148ba8f88c907bac4f7b0.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们去访问<http://localhost:8082/>,看到如下界面，表示安装成功。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e7272d474c4f4a6b942e21a532eb13f7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fadc0a0e15d1475d9e66150c934809ba.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)