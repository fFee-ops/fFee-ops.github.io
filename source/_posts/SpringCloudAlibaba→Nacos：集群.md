---
title: SpringCloudAlibaba→Nacos：集群
date: 2020-10-26 00:31:57
tags: 微服务 java spring cloud
categories: SpringCloudAlibaba
---

<!--more-->

### Nacos集群

- [1、集群架构](#1_3)
- [2、Nacos集群部署](#2Nacos_18)
- [3、客户端接入Nacos集群](#3Nacos_49)

  
在生产环境Nacos一般都不是单节点存在，如果是单节点，很容易存在单点故障，因此生产环境一般都以集群形式存在。

# 1、集群架构

Nacos集群模式有多种，但其实无论哪种都是将3个Nacos服务进行集群发布，而且必须采用数据共享模式进行配置信息共享，也就是要将数据存入到同一个数据库中，我们对每种集群模式进行说明：

**1\)直连模式**  
`http://ip1:port/openAPI`直连ip模式，机器挂载需要修改ip才可以使用。  
比如我现在有3个Nacos，每次操作数据的时候，都需要使用IP：端口的模式，这种模式效率极低，并且一旦节点故障无法识别，因此官方不推荐这种模式。

**2\)VIP模式**  
`http://VIP:port/openAPI`挂载VIP模式，直连vip即可，下面挂server真实ip，可读性不好。

**3\)域名模式**  
`http://nacos.com:port/openAPI`域名 + VIP模式，可读性好，而且换ip方便，因此官方推荐该模式，该模式的结构图如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9920397aef99428e942bc65dc023c961.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2、Nacos集群部署

我们搭建Nacos集群环境，集群环境配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f954f8092fc146e7a762684ac1927969.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**1\)服务下载**  
在 [https://github.com/alibaba/nacos/releases/](https://github.com/alibaba/nacos/releases/) 下载需要的服务，当前使用的是1.4.1, 我们可以选择下载1.4.1版本，版本如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0bf60a360fd947f2bd84ccbbf7fdc029.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
解压压缩包后，包结构如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a04736169041439192e83393164a3745.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**2\)配置数据库**  
数据库初始化工作和单机版nacos安装一样，这里就不重复了，但是得记得进行初始化。

修改`conf/application.properties` 配置数据库，配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9cc2f4f6bb8a44f699508fd295a0d784.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**3\)集群配置**  
修改`conf/cluster.conf` 配置集群：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/46b71304792d47fbb090313f3eebd4ab.png)  
**4\)节点同步**  
将修改好的服务分别上传到 192.168.211.146 、 192.168.211.147 服务：

```shell
scp -r nacos 192.168.211.146:/usr/local/server/alibaba/
scp -r nacos 192.168.211.147:/usr/local/server/alibaba/
```

**5\)启动每个节点**  
进入到每个节点 nacos/bin 目录下，执行启动：

```shell
sh startup.sh
```

访问任何一个单节点，信息如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1a7ae6358cca4652b0eaf40c07c1c745.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3、客户端接入Nacos集群

客户端接入，不建议写多个节点的IP:Port，建议以域名的方式连接Nacos，因此需要配置Nacos域名，在 192.168.211.145 节点中配置域名`nacos.hailtaxi.com` ， nginx 配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b030413fe4d94dbabfafebf4cc5be235.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
配置 nacos.hailtaxi.com 域名映射：

```shell
#修改hosts文件
vi /etc/hots
#添加如下映射关系
192.168.211.145 hailtaxinacos.com
```

保存Nginx配置，并启动Nginx，修改本地 `C:\Windows\System32\drivers\hosts`，添加如下配置：

```txt
192.168.211.145 hailtaxinacos.com
```

访问 `http://hailtaxinacos.com/nacos` ，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7ec1f3f44e1a41a9ad4838b5c6e7b3ad.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
项目中Nacos地址可以把多个地址写到一起，用逗号隔开，如下代码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/289f968c25624e26a4b52404e9925173.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)