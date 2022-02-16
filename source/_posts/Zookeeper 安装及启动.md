---
title: Zookeeper 安装及启动
date: 2020-07-08 15:54:09
tags: zookeeper
categories: zookeeper
---

<!--more-->

### Zookeeper 安装

- [安装](#_1)
- - [集群搭建](#_16)
- [启动](#_32)
- [配置解读](#_42)

# 安装

1、安装好java环境

2、[下载zookeeper](https://zookeeper.apache.org/releases.html)，传到Linux，并且解压到自定义文件夹下

3、重命名zookeeper的配置文件：zoo\_sample.cfg改名为zoo.cfg

4、在zoo.cfg中：可以发现 zookeeper的端口号是 clientPort=2181

5、在zookeeper文件夹下新建zkData文件夹，将zoo.cfg中的dataDir=  
xxxx更改为dataDir=/apps/zookeeper-3.4.14/zkData  
dataDir是zookeeper保存数据的目录

---

## 集群搭建

假设有三台机器node2、3、4.

 1.     先把zk分别解压缩到这些机器
 2.     按照单机的先配置一下
 3.     配置服务器编号：在zk根目录下创建`zkData`文件夹，在该文件夹下创建`myid`【必须这么命名】，并写入数据2。（注意：上下不要有空行，左右不要有空格）
 4.     机器3、4也要配myid，内容分别为3、4.
 5.     配置zoo.cfg：  
    ###增加如下配置\(每台机器都要做\)

```shell
#######################cluster##########################
server.2=node2的ip:2888:3888
server.3=node3的ip:2888:3888
server.4=node4的ip:2888:3888
```

# 启动

进入到zookeeper的bin目录下执行\(集群的话必须启动半数以上的机器，才能启动成功\)

```shell
./zkServer start
#查看状态
./zkServer status
```

# 配置解读

![在这里插入图片描述](https://img-blog.csdnimg.cn/c9e66a7dd0c741298cfd20f38bec9486.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/2ac0678fca744dc0ba8e1b3b16c01ada.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- **tickTime = 2000：通信心跳时间，Zookeeper服务器与客户端心跳时间，单位毫秒**

- **initLimit = 10：LF初始通信时限**  
  Leader和Follower初始连接时能容忍的最多心跳数（tickTime的数量）

- **syncLimit = 5：LF同步通信时限**  
  Leader和Follower之间通信时间如果超过syncLimit \* tickTime，Leader认为Follwer死掉，从服务器列表中删除Follwer。

- **dataDir：保存Zookeeper中的数据**  
  注意：默认的tmp目录，容易被Linux系统定期删除，所以一般不用默认的tmp目录。

- **clientPort = 2181：客户端连接端口，通常不做修改。**