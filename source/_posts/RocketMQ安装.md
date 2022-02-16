---
title: RocketMQ安装
date: 2022-01-26 20:54:42
tags:
password:
categories: RocketMQ
---

# Linux安装

##  环境说明
对于 RocketMQ 4.3.0版本，官方要求环境如下，其中 Git 用于从 GitHub 获取源码，没有安装也没关系，可以直接下载。
官方推荐的流程是：Linux 系统上安装 Git 工具 、Maven、Java JDK
Git 工具用于直接从 GitHub 获取 RocketMQ 项目源码下载到 Linux 系统上
然后 Maven 将 RocketMQ 源码进行编译成二进制文件
安装了 Java JDK 就可以运行 RocketMQ 了

## JDK和RocketMQ 版本说明
![在这里插入图片描述](https://img-blog.csdnimg.cn/3245e76c90ef4cb18ed4507a9bce9ef6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## RocketMQ 下载
可以从apache的文件库下载 [https://archive.apache.org/dist/rocketmq/](https://archive.apache.org/dist/rocketmq/)这里我们选择最新版
![在这里插入图片描述](https://img-blog.csdnimg.cn/992bdc1a93624886be09c52b502f6b17.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
##  RocketMQ 安装
**1、项目解压**
```shell
unzip rocketmq-all-4.7.1-bin-release.zip  -d  /usr/local/rocketmq
```
**2、修改RocketMQ启动配置**
修改目录` /usr/local/rocketmq/rocketmq-all-4.7.1-bin-release/bin `下的 3 个配置文件： `runserver.sh`、`runbroker.sh` 、`tools.sh`不然会报**insufficient memory**

设置 runserver.sh 中此项配置
```shell
JAVA_OPT="${JAVA_OPT} -server -Xms256m -Xmx256m -Xmn512m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m"
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3709cdde60624cb7bd1ccf882d6ea98f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2586a7810e2b42adbf61e7c98d67bc86.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

设置 runbroker.sh 中此项配置
```shell
JAVA_OPT="${JAVA_OPT} -server -Xms256m -Xmx256m -Xmn128m"
```

设置 tools.sh 中此项配置
```shell
JAVA_OPT="${JAVA_OPT} -server -Xms256m -Xmx256m -Xmn256m -XX:PermSize=128m -XX:MaxPermSize=128m"
```

修改`broker.conf`文件

```shell
vim ./conf/broker.conf
```
添加如下两行配置
![在这里插入图片描述](https://img-blog.csdnimg.cn/39726da98f4e49c48d1f670a0cde2405.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
>不配置这个用客户端去连接的话会报错

## RocketMQ 启动

**启动 NameServer**
进入 RocketMQ 安装目录下的` /usr/local/rocketmq/rocketmq-all-4.7.1-bin-release `目录进行操作。

执行命令启动NameServer
```shell
nohup sh bin/mqnamesrv &
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/67b5c22e3d29462f9f603e27d8612589.png)
>`nohup sh mqnamesrv &` ：属于后台启动
>`sh mqnamesrv` ：属于终端启动，直接输出日志信息，按 ctrl+c 可直接关闭退出

*查看启动状态*
在当前目录下会有一个 nohup.out 的日志文件，可以打开查看 namesrv 的启动情况。如下所示，看到 `The Name Server boot success.serializeType=JSON` 表示启动成功


**启动 Broker**
同样进入 RocketMQ 安装目录下的` /usr/local/rocketmq/rocketmq-all-4.7.1-bin-release` 目录进行操作
```shell
# 启动命令，并且常驻内存:注意ip地址要配置成为服务的ip地址，保证地址以及端口能够访问。并且指定配置文件启动
nohup sh bin/mqbroker -n 192.168.80.16:9876 -c ./conf/broker.conf &
```
>`nohup sh bin/mqbroker -n 192.168.64.144:9876 &` ：属于后台启动<BR>
>`sh bin/mqbroker -n 192.168.64.144:9876 `：属于终端启动，直接输出日志信息，按 ctrl+c 可直接关闭退出


*查看启动状态*
同样去看` nohup.out 文件`，看到下图所示即启动成功：
![在这里插入图片描述](https://img-blog.csdnimg.cn/446d2650595740e0b4a8d2824301b6a2.png)

## 发送消息
发送/接收消息之前，需要告诉客户端(Producer、Consumer)名称服务器的位置，RocketMQ 提供了多种方法来实现这一点:
1. 编程方式，如：producer.setNamesrvAddr("ip:port")
2. Java 选项，如：rocketmq.namesrv.addr
3. 环境变量，如：NAMESRV_ADDR
4. HTTP 端点

如下所示官方提供这个例子属于生产者，用于发送消息，运行之后会发送大量的消息，之后就会退出。注意，在安装目录` /usr/local/rocketmq/rocketmq-all-4.7.1-bin-release` 进行操作
```shell
export NAMESRV_ADDR=localhost:9876
sh bin/tools.sh org.apache.rocketmq.example.quickstart.Producer
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c2080f329d7646bdb7da83e4b6473f29.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 接收消息
上面的消息发送完毕之后就会退出，在同一窗口中可以使用消费者类来进行接收消息，如下所示，显然是多线程的
```shell
[root@localhost rocketmq-all-4.7.1-bin-release]# sh bin/tools.sh org.apache.rocketmq.example.quickstart.Consumer
```
下图可以看到接收到了消息
![在这里插入图片描述](https://img-blog.csdnimg.cn/0fd3663c1e28434c9752d38bc929ea57.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 关闭服务器
同样都是在 RocketMQ 安装目录下的 distribution/target/apache-rocketmq 目录下执行命令

与启动顺序相反进行关闭，先关闭 broker、在关闭 nameserv
```shell
> sh bin/mqshutdown broker
The mqbroker(36695) is running...
Send shutdown request to mqbroker(36695) OK
 
> sh bin/mqshutdown namesrv
The mqnamesrv(36664) is running...
Send shutdown request to mqnamesrv(36664) OK
```