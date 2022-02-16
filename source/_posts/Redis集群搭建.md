---
title: Redis集群搭建
date: 2020-09-09 09:11:29
tags: 
categories: Redis
---

<!--more-->

### Redis集群搭建

- [创建集群步骤](#_8)

  
可以查看Redis官网查看集群搭建方式，连接如下

[官方手册](https://redis.io/topics/cluster-tutorial)

以下步骤是在一台 Linux 服务器上搭建有6个节点的 Redis集群。

# 创建集群步骤

**1、把下载好的redis-5.0.2.tar.gz放在/usr/local文件夹下，并解压**

```shell
wget http://download.redis.io/releases/redis-5.0.2.tar.gz

tar xzf redis-5.0.2.tar.gz

cd redis-5.0.2
进入到解压好的redis-5.0.2目录下，进行编译与安装
make & make install
```

**2、创建6个Redis配置文件\(redis集群需要至少要三个master节点,配置文件是从源码包里面拷贝过来的\)**

第一步：在第一台机器的/usr/local下创建文件夹redis-cluster，然后在其下面创建6个文件夾如下:

```shell
mkdir -p /usr/local/redis-cluster

mkdir 8001 8002 8003 8004 8005 8006
```

第二步：把之前的redis.conf配置文件copy到8001下，修改如下内容：

**配置文件的内容为：**

```shell
port 8001  #端口
cluster-enabled yes #启用集群模式
cluster-config-file nodes.conf
cluster-node-timeout 5000 #超时时间
appendonly yes
daemonize yes #后台运行
protected-mode no #非保护模式
pidfile  /var/run/redis_8001.pid
bind 127.0.0.1（去掉bind绑定访问ip信息）
dir /usr/local/redis-cluster/8001/（指定数据文件存放位置，必须要指定不同的目录位置，不然会丢失数据）

如果要设置密码需要增加如下配置：
requirepass xxx (设置redis访问密码)
masterauth xxx (设置集群节点间访问密码，和上面一致)
```

其中 port 、dir 和 pidfile 需要随着 文件夹的不同调增。

**3、分别启动6个redis实例，然后检查是否启动成功**

```shell
/usr/local/redis/redis-5.0.2/src/redis-server /usr/local/redis-cluster/800*/redis.conf
```

**查看是否启动成功:**

```shell
ps -ef | grep redis 
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200909085749815.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**4、用redis-cli创建整个redis集群\(redis5以前的版本集群是依靠ruby脚本redis-trib.rb实现\)**

```shell
/usr/local/redis/redis-5.0.2/src/redis-cli -a xxx --cluster create --cluster-replicas 1 192.168.5.100:8001 192.168.5.100:8002 192.168.5.100:8003 192.168.5.100:8004 192.168.5.100:8005 192.168.5.100:8006
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200909090146733.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200909090240319.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

代表为每个创建的主服务器节点创建一个从服务器节点

**5、验证集群**  
1）连接任意一个客户端即可：

```shell
./redis-cli -c -a xxx -h 192.168.5.100 -p 8001
```

\-a访问服务端密码，-c表示集群模式，指定ip地址和端口号

2）进行验证： cluster info（查看集群信息）、cluster nodes（查看节点列表）  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200909090935791.png#pic_center)  
3）进行数据操作验证

干掉8001看系统工作状态

```shell
/usr/local/redis/src/redis-cli -a xxx -c -h 192.168.0.60 -p 8001 shutdown
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200909091123198.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

4）关闭集群则需要逐个进行关闭，使用命令：

```shell
/usr/local/redis/src/redis-cli -a xxx -c -h 192.168.0.60 -p 800x shutdown
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200909091010134.png#pic_center)