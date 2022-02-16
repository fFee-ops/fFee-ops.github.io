---
title: Dockerfile&Docker-Compose
date: 2021-12-07 14:22:59
tags: docker 容器 运维
categories: Docker
---

<!--more-->

### Dockerfile\&Docker-Compose

- [Dockerfile](#Dockerfile_2)
- - [1.Docker远程API开放](#1DockerAPI_6)
  - [2.Dockerfile文件说明](#2Dockerfile_45)
  - [3.项目集成Dockerfile](#3Dockerfile_85)
  - [4.Idea插件集成Dockerfile](#4IdeaDockerfile_147)

# Dockerfile

**dockerfile介绍：**  
Dockerfile 是一个用来构建镜像的**文本文件**，文本内容包含了一条条构建镜像所需的指令和说明。。 Docker通过读取`Dockerfile`中的指令自动生成镜像。

## 1.Docker远程API开放

Docker 服务端开放 Remote API,Docker服务器默认只支持本地访问，所以需要开放远程调用权限。

```shell
#编辑daemon.json
vi /etc/docker/daemon.json

#往daemon.json中添加远程端口和地址
"hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
#添加完后的内容
{
"hosts": ["unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"],
"registry-mirrors":["https://almtd3fa.mirror.aliyuncs.com"]
}
```

上面配置了Docker API远程访问端口，我们接下来配置自动启动：

```shell
#创建（或修改）文件/etc/systemd/system/docker.service.d/override.conf,添加内容如下
##Add this to the file for the docker daemon to use different ExecStart
parameters (more things can be added here)
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd
#执行systemctl命令使得配置生效
systemctl daemon-reload
#重启Docker服务
systemctl restart docker
```

执行命令 netstat \-ntlp 查看相应 2375 端口是否开启监听状态。

```shell
#安装net-tools
yum install net-tools

#端口查看
netstat -ntlp
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/cdb0915436eb4940945b4a6b938527f3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.Dockerfile文件说明

Dockerfile 一般分为四部分：基础镜像信息、维护者信息、镜像操作指令和容器启动时执行指令，`#` 为Dockerfile 中的注释。  
Docker以从上到下的顺序运行Dockerfile的指令。为了指定基本映像，第一条指令必须是`FROM`。一个声明以`＃` 字符开头则被视为注释。可以在Docker文件中使用 `RUN` ， `CMD`， `FROM` ，`EXPOSE`，`ENV` 等指  
令。

**1\. FROM：指定基础镜像，必须为第一个命令**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7918b1d9a8504292a6215e1fdfc91046.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**2\. MAINTAINER: 维护者信息**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/98d126d0dc38439f81e0577acb47bd3a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**3\. RUN：构建镜像时执行的命令**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b9e13297a0cc455f9323143dd8e1f4bd.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**4\. ADD：将本地文件添加到容器中，tar类型文件会自动解压\(网络压缩资源不会被解压\)，可以访问网络资源，类似wget**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4ee5fdbc1a214e0ebe2a390d96661c98.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**5\. COPY：功能类似ADD，但是是不会自动解压文件，也不能访问网络资源**  
**6\. CMD：构建容器后调用，也就是在容器启动时才进行调用。**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ffc5b8e1f4be40b1a3439669bc89c72f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**7\. ENTRYPOINT：配置容器，使其可执行化。配合CMD可省去"application"，只使用参数。**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/87bf3af7380f4a399eb7b5d968ef725d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**8\. LABEL：用于为镜像添加元数据**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4271db23d685403caefc3170f49279e6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**9\. ENV：设置环境变量**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5e778e71b4874e5abd067b60a5f628a9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**10\. EXPOSE：指定于外界交互的端口**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3a93ce226e02483c9fb418645d85442b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**11\. VOLUME：用于指定持久化目录**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b5bafa3fbf3842c081ebcdcfa4acbf8c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**12\. WORKDIR：工作目录，类似于cd命令**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f37389b75c1b4747a7b006483946d484.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**13\. USER:指定运行容器时的用户名或 UID，后续的 RUN 也会使用指定用户。使用USER指定用户时，可以使用用户名、UID或GID，或是两者的组合。当服务不需要管理员权限时，可以通过该命令指定运行用户。并且可以在之前创建所需要的用户**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5d18e7aee2f547279e7500e05806dc05.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**14\. ARG：用于指定传递给构建运行时的变量**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f503825120344f5db9de2122d9c2cbda.png)  
**15\. ONBUILD：用于设置镜像触发器**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4ab3a61dffdb495f848826fbfc60da3e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**以下是一个小例子：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2e25e69babf745f1a729901866b3751f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
下面是一个很形象的总结：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/83b83f7121e24a6fb5764ed5a7c8363e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.项目集成Dockerfile

项目中可以直接使用Dockerfile，基于 docker-maven-plugin 插件使用非常方便，我们在项目中首先引入依赖：

```xml

#配置奖项REPOSITORY，例如 hailtaxi/driver 可以按照如下配置添加到pom.xml中
<properties>
#镜像前部分
<docker.image.prefix>hailtaxi</docker.image.prefix>
#镜像后部分
<docker.image.name>driver</docker.image.name>
</properties>
        #引入插件依赖
<plugin>
<groupId>com.spotify</groupId>
<artifactId>docker-maven-plugin</artifactId>
<version>1.0.0</version>
<configuration>
    <!--远程Docker的地址-->
    <dockerHost>http://192.168.211.145:2375</dockerHost>
    <imageName>${docker.image.prefix}/${docker.image.name}</imageName>
    <!--Dockerfile地址-->
    <dockerDirectory>src/main/docker</dockerDirectory>
    <resources>
        <resource>
            <targetPath>/</targetPath>
            <directory>${project.build.directory}</directory>
            <include>${project.build.finalName}.jar</include>
        </resource>
    </resources>
</configuration>
</plugin>
```

关于插件更多参数，大家可以参考下面列表：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e1f0bc18d57d437ba3cebf69aa8c2b21.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
引入插件之后，我们需要在项目中创建 Dockerfile 配置文件，创建  
`src/main/docker/Dockerfile` ，配置如下：

```shell
#基础镜像
FROM java:8
#挂载目录
VOLUME /tmp
#将hailtaxi-driver-1.0-SNAPSHOT.jar添加到容器中
ADD hailtaxi-driver-1.0-SNAPSHOT.jar /driver.jar
#指定容器启动程序及参数
ENTRYPOINT ["java","-jar","/driver.jar"]
```

我们需要把自己的项目创建成镜像并发布，需要先安把当前工程打包\(或者安装到Maven本地仓库\)：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/092887fb016049dbaf874270392382dc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们接下来在maven面板中找到`Plugins>docker>docker:build`，双击它，此时会创建容器。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e453a520e9d444b0b00ba3d6ab17b6fc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
控制台会输出镜像信息：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f9dd6e43b93b47cea1d3ac69023ac06c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时我们可以看到IDEA的 `Services` 中有Docker信息，可以看到服务器上的Docker镜像和容器，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6ff278d76bb3436abaee77cfac418ccc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们可以选择 `hailaxi/driver:lastest`右键创建容器：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b85d0ec5b9da4da9a8a1475d3d305421.png)  
此时我们需要填写容器名字以及创建容器所需的额外参数，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/aab29c5746e64cfba0509086aebfb41d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
容器创建后，在Containers中会显示当前已经创建好的容器，点击容器，可以选择 Show Log 查看日志，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/19821f98911c40b8a37986869863ebc0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4.Idea插件集成Dockerfile

上面集成Dockerfile用到了插件包，我们可以直接使用Idea插件集成Dockerfile要更简单，操作如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f076a43e542741e4aa92021322f9976f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
配置完成后，点击执行，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d7e40038da084a388435152a45d106d2.png)  
执行完成后，在Idea的Services中会显示容器和镜像，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e00a055ad57041cda186ebe243ff05bf.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)