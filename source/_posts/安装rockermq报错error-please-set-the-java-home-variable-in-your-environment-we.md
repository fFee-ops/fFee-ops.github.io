---
title: '安装rockermq报错error:please set the java_home variable in your environment, we'
date: 2022-01-26 20:56:49
tags:
password:
categories: 踩坑
---

# 问题描述

今天安装RocketMQ，到启动Nameserver就报错：`ERROR: Please set the JAVA_HOME variable in your environment, We need java(x64)! !!`

网上百度一圈说是没有配置`JAVA_HOME`,但是我echo javahome能发现我自己已经配置了。

# 解决

1、 配置`.bash_profile`中的java_home。（原来只在`/etc/profile`配置过javahome）

```shell
vim ~/.bash_profile
```

添加如下配置

```shell
JAVA_HOME="/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.312.b07-1.el7_9.x86_64/jre/bin/java"
export JAVA_HOME
CLASS_PATH="$JAVA_HOME/lib"
PATH=".$PATH:$JAVA_HOME/bin"
```

2、进入到解压后rocketMQ的bin目录，修改以下两个文件runbroker.sh、runserver.sh
找到配置

```shell
[ ! -e "$JAVA_HOME/bin/java" ] && JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.312.b07-1.el7_9.x86_64/jre/
[ ! -e "$JAVA_HOME/bin/java" ] && JAVA_HOME=/usr/java
[ ! -e "$JAVA_HOME/bin/java" ] && error_exit "Please set the JAVA_HOME variable in your environment, We need java(x64)!"
```

注释掉2、3行，在第一行填上自己的JAVA_HOME就行了。两个文件改一样的地方。

------

**注意：有个很奇怪的点，我的javahome明明是**

```shell
/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.312.b07-1.el7_9.x86_64/jre/bin/java
```

**但是我直接把这个配置到要修改的文件的JAVA_HOME处会报错**、
![在这里插入图片描述](https://img-blog.csdnimg.cn/86e023fb3b4b4f9ca066931786d2c377.png)
**可以发现它自动帮我们加了个`/bin/java`。于是我们修改配置文件的时候，写JAVA_HOME就只要写**

```shell
/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.312.b07-1.el7_9.x86_64/jre
```

**真的是个很奇怪的机制....