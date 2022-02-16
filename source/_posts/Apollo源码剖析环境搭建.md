---
title: Apollo源码剖析环境搭建
date: 2022-01-13 22:15:08
tags: java
categories: Apollo
---

<!--more-->

### Apollo源码剖析环境搭建

- [1 源码下载](#1__1)
- [2 导入数据库](#2__6)
- [3 apollo-assembly启动服务](#3_apolloassembly_11)
- [4 服务测试](#4__53)

# 1 源码下载

我们使用git从<https://github.com/ctripcorp/apollo>下载源码，下载后的源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cd367ac02d6d4225a9bec45e8bb85c63.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
版本切换至v1.7.1,如下操作：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/79edc29214534dff83abace5bcdccf1a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2 导入数据库

在跟路径下有 scripts/sql 目录，下面有2个sql脚本，我们将该脚本导入到数据库中。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fff7c2eb63484b409effcb2f5d434131.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如下图  
![在这里插入图片描述](https://img-blog.csdnimg.cn/522dfb43ead947fc9a5986f08ed687b0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3 apollo-assembly启动服务

我们启动Apollo服务，需要同时启动configservice、adminservice，如果手动启动比较慢，Apollo帮我们封装了一个工程 `apollo-assembly` ，可以基于该工程同时启动 `apollo-adminservice`和 `apollo-configservice`项目。

修改 apollo-configservice 的核心配置文件 bootstrap.yml 添加Eureka不注册Eureka数据也不获取Eureka数据，配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4b30a9938ace44f583c44c556c9e3c4e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
完整代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/08633722d8564df3b01c52e15933aedf.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们先配置该工程，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3133462d89dd4c84aa6a555a7f78224a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
这里的VM optins:

```shell
-Dapollo_profile=github
-Dspring.datasource.url=jdbc:mysql://localhost:3306/ApolloConfigDB?useUnicode=true&characterEncoding=utf-8&serverTimezone=UTC
-Dspring.datasource.username=root
-Dspring.datasource.password=123456
-Dlogging.file=D:/project/xc-apollo/apollo-assembly.log
```

参数 `Program arguments` 中的两个参数分别表示启动 configservice 和 adminservice 服务。

启动完成后，我们请求Eureka`http://localhost:8080/`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ea968c3737b945b5a1a221f8f26898d8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**PortalService启动**  
apollo-portal工程需要单独启动，启动的时候我们也需要配置密码和日志输出文件，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b8b6228a79834163af7d40ec13d752d0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
VM options配置如下：

```shell
-Dapollo_profile=github,auth
-Ddev_meta=http://localhost:8080/
-Dserver.port=8070
-Dspring.datasource.url=jdbc:mysql://localhost:3306/ApolloPortalDB?useUnicode=true&characterEncoding=utf-8&serverTimezone=UTC
-Dspring.datasource.username=root
-Dspring.datasource.password=123456
-Dlogging.file=D:/project/xc-apollo/apollo-portal.log
```

启动完成后，我们接下来访问控制台 `http://localhost:8070` 效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e360bd0484b648b3bec2f0710773e3d2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 4 服务测试

我们可以先创建一个项目并且app.id=100004458【必须是这个，因为配置文件中已经写死了】,如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fdc03616342e44fe87c6f8ef06c41977.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3bf5f93090794c849b3f9cca161d29f5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在该项目的 `application.properties` 中添加一个`username`参数，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e6f0b20f0a5048dcafde55a5091be676.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Apollo 提供了内置的测试服务，该服务会访问 Apollo 服务`app.id=100004458` 的项目，我们可以在该工程启动时配置 VM options 参数指定 Apollo 注册中心地址，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7ea4fb9f511c4a899876f77906e4da1b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
VM options参数配置如下：

```shell
-Denv=dev
-Ddev_meta=http://localhost:8080
```

启动程序，我们输入username回车，可以看到对应数据，如下输出结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/053caaf756fa4a028b11a91b0e8703f2.png)