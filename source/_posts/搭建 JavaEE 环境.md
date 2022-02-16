---
title: 搭建 JavaEE 环境
date: 2020-05-12 11:53:12
tags: 
categories: Linux
---

<!--more-->

### 搭建 JavaEE 环境

- [安装 JDK](#_JDK_3)
- [安装tomcat](#tomcat_29)
- [安装Eclipse](#Eclipse_59)

  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512110454537.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 安装 JDK

步骤：  
0\) 先将软件通过 xftp5 上传到 /opt 下

1.  解压缩到 /opt

2.  配置环境变量的配置文件 vim /etc/profile  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512110604223.png)

    ```
	JAVA_HOME=/opt/jdk1.7.0_79
	 PATH=/opt/jdk1.7.0_79/bin:$PATH 
	 export JAVA_HOME PATH
    ```

3.  需要注销用户，环境变量才能生效

4.  在任何目录下就可以使用 java 和 javac

**注意**：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512114551643.png)  
如果export 前也没有空格会导致java命令可以用，但是javac不行。

---

测试：  
编写一个简单的 Hello.java 输出"hello,world\!"  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512115259943.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512115307475.png)

# 安装tomcat

1、先去apache官网下载tomcat  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513112719754.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

2、传输到LINUX /opt目录下

3、解压缩到 /opt  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513112841483.png)

4、启动tomcat \-------------- ./startup.sh

1）先进入tomcat的bin目录再启动startup.sh  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513114454696.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
2）在本地浏览器访问tomcat  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513114519345.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
3\) 开放端口 8080 ,这样外网才能访问到 tomcat

centos7：

```
firewall-cmd --permanent --zone=public --add-port=8080/tcp开启8080端口
firewall-cmd --reload使最新的防火墙设置规则生效
firewall-cmd --list-ports命令查看所有开放的端口	
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513114829652.png)

4）windows浏览器访问LUNUX的tomcat  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200513115218531.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 安装Eclipse

1、下载Eclipse  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200514161440404.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

1.  解压缩到/opt

2.  在/usr/bin目录为该Eclipse创建软链接：

    ln \-s /opt/eclipse/eclipse /usr/bin/eclipse

将该软链接（相当于Windows中的快捷方式）复制到桌面，即可从桌面启动Eclipse。

---

启动方法 1: 创建一个快捷方式  
启动方式 2: 进入到 eclipse 解压后的文件夹，然后执行 ./eclipse 即可