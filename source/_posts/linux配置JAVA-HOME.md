---
title: linux配置JAVA_HOME
date: 2022-02-05 22:45:00
tags:
password:
categories: Linux
---

1、首先输入

```shell
echo $JAVA_HOME
```
看有没有输出。有的话证明已经配置了，没有就继续。

2、输入`find / -name java`找到JDK位置
![在这里插入图片描述](https://img-blog.csdnimg.cn/ae1c38ff428a4690aecbbcc36898f1db.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

3、复制选中的jdk的路径

4、`vi /etc/profile` 添加如下内容：
```shell
	export JAVA_HOME=刚刚复制的路径
	export PATH=$JAVA_HOME/bin:$PATH
	export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
```

4、`source  /etc/profile`刷新文件，立即生效