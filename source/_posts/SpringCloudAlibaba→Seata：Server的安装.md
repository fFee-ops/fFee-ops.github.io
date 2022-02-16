---
title: SpringCloudAlibaba→Seata：Server的安装
date: 2022-01-06 21:53:47
tags: java
categories: SpringCloudAlibaba
---

<!--more-->

### Seata-Server安装

- [安装步骤](#_8)
- [运行](#_28)
- [高可用](#_38)

我们在选择用Seata版本的时候，可以先参考下官方给出的版本匹配（Seata版本也可以按自己的要求选择）：  
[https://github.com/alibaba/spring-cloud-alibaba/wiki/\%E7\%89\%88\%E6\%9C\%AC\%E8\%AF\%B4\%E6\%98\%8E](https://github.com/alibaba/spring-cloud-alibaba/wiki/%E7%89%88%E6%9C%AC%E8%AF%B4%E6%98%8E)

我们当前 SpringCloud Alibaba 的版本是 2.2.5.RELEASE ，对应Seata版本是1.3.0,所以我们首先安装`Seata-Server1.3.0`：

# 安装步骤

1、 我们先去[官网](https://github.com/seata/seata/releases/tag/v1.3.0)下载对应的压缩包。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ed5c324743864306bae9ec17443b2b1f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

2、 上传到服务器，解压缩  
3、修改conf目录下的file.conf配置文件  
①先备份原始file.conf文件  
②主要修改：事务日志存储模式为db+数据库连接信息  
③store模块\(file.conf\)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3bdb316ea9024f138f7cb26829e56c32.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

4、修改registry.conf文件  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ddf6a21108e342379b1f8cbc279cfd5e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_19,color_FFFFFF,t_70,g_se,x_16)

> group默认为:`SEATA_GROUP,`更改`DEFAULT_GROUP`  
> 或者和自己服务相同的group,否则会报错No available service

5、在seata库里建表  
①建表db\_store.sql在\\seata-server-0.9.0\\seata\\conf目录里面`db_store.sql`和`db_undo_log.sql`。**1.0后的版本就没有内置这个sql文件了，需要去0.9复制一下**

# 运行

进入到bin目录。执行【必须带上参数-h】

```shell
./seata-server.sh -h 192.168.80.16
```

可以看到nacos中已经有该服务了  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a9125abaf1334dcda9a6a7c62c0b3c7e.png)

# 高可用

seata-server目前使用的是一个单节点，而生产环境项目一般都会做集群。  
我们需要准备2个seata-server，并且配置会话共享，会话共享支  
持3种方式

1.  file【集群不可用】
2.  redis
3.  db

我们这里选择redis存储会话信息实现共享  
①修改seata-server的file.conf，修改如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5a2a81c46c1c47d590e69c065ea19fd7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时停掉任意一个节点，分布式事务仍然生效。