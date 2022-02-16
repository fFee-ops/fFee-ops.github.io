---
title: springCloud→Cosul：安装并运行Consul
date: 2020-10-19 08:55:29
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### 安装并运行Consul

- [官网安装说明](#_2)
- [常用操作](#_12)

# 官网安装说明

[官网安装说明](https://learn.hashicorp.com/consul/getting-started/install.html)

[下载地址](https://www.consul.io/downloads.html)

下载完成后只有一个consul.exe文件。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019085209478.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 常用操作

1、查看版本信息。

```shell
consul  --version
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019085301642.png#pic_center)

2、使用开发模式启动

```shell
consul agent -dev
```

输入后能看到这样的cmd窗口  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019085408446.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

然后输入：http://localhost:8500/  
可以看到  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ac7a1b7c6afb4ade95d0ec7932ec459e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`Services`:服务信息。

`Nodes`:节点信息，Consul支持集群。

`Key/Value`:存储的动态配置信息。

`ACL`:权限信息。

`Intentions`:通过命令的方式对consul进行管理。