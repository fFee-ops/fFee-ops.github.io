---
title: Google Protobuf
date: 2021-07-03 16:42:34
tags: 
categories: Netty
---

<!--more-->

### Google Protobuf

- [编码和解码的基本介绍](#_2)
- [为什么要有 Google Protobuf？](#_Google_Protobuf_6)
- [Protobuf](#Protobuf_15)
- [使用步骤](#_24)

# 编码和解码的基本介绍

编写网络应用程序时，因为数据在网络中传输的都是二进制字节码数据，在发送数据时就需要编码，接收数据时就需要解码  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210703155056612.png)

# 为什么要有 Google Protobuf？

因为netty自身虽然带有codec\(编解码器\)，但是底层使用的仍是 Java 序列化技术 , 而 Java 序列化技术本身效率就不高，存在如下问题

> 无法跨语言  
> 序列化后的体积太大，是二进制编码的 5 倍多。  
> 序列化性能太低

所以Google 的 Protobuf就诞生了

# Protobuf

Protobuf 是 Google 发布的开源项目，全称 Google Protocol Buffers，是一种轻便高效的结构化数据存储格式，可以用于结构化数据串行化，或者说序列化。它很适合做数据存储或 RPC\[远程过程调用 remote procedure call \] 数据交换格式 。

1.  Protobuf 是以 message 的方式来管理数据的.
2.  支持跨平台、跨语言，即\[客户端和服务器端可以是不同的语言编写的
3.  高性能，高可靠性

![在这里插入图片描述](https://img-blog.csdnimg.cn/202107031638461.png)

# 使用步骤

第1步：在Maven 项目中引入 Protobuf 坐标，下载相关的jar包

pom.xml中

```xml
<dependencies>

    <dependency>
        <groupId>com.google.protobuf</groupId>
        <artifactId>protobuf-java</artifactId>
        <version>3.6.1</version>
    </dependency>

</dependencies>
```

第 2 步： 编写proto 文件 Student.proto

```proto
syntax = "proto3"; //版本
option java_outer_classname = "StudentPoJO"; //设置生成的Java类

//内部类的名称，是真正的PoJo 类
message Student{ // message 的规定的
   int32 id = 1; //PoJo 类的属性数据类型类型和 序号(不是属性值)
   string name = 2;
}
```

第 3 步：通过 protoc.exe 根据描述文件生成 Java 类，具体操作如下所示  
说明：protoc-3.6.1-win32 是从网上下载的 google 提供的文件.  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210703164155728.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

生成了  
StudentPoJO.java

第四步：把生成的 StudentPoJo.java 拷贝到自己的项目中打开,然后进行操作就行了。