---
title: Zookeeper CLI
date: 2020-07-08 17:00:52
tags: 
categories: zookeeper
---

<!--more-->

### 文章目录

ZooKeeper命令行界面（CLI）用于与ZooKeeper集合进行交互以进行开发。它有助于调试和解决不同的选项。  
要执行ZooKeeper CLI操作，首先打开ZooKeeper服务器（“bin/zkServer.sh start”），然后打开ZooKeeper客户端（“bin/zkCli.sh”）。

示例操作：

1、创建Znodes

```
create /path /data
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708161031560.png)

 -    创建顺序节点：

```
create -s /path /data
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708161140339.png)

 -    创建临时节点：

```
create -e /path /data
```

2、获取数据

```
get /path 
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708161259286.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

要访问顺序节点，必须输入znode的完整路径。

3、Watch（监视）

```
get /path [watch] 1
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708164256623.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

输出类似于普通的 get 命令，但它会等待后台等待znode更改。

4、设置数据

```
set /path /data
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708165521235.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708165549455.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

5、创建子项/子节点

```
create /parent/path/subnode/path /data
```

创建子节点类似于创建新的znode。唯一的区别是，子znode的路径也将具有父路径。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708165722963.png)

6、列出子项

```
ls /path
```

此命令用于列出和显示znode的子项。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708165821700.png)

7、检查状态

```
stat /path
```

状态描述指定的znode的元数据。它包含时间戳，版本号，ACL，数据长度和子znode等细项。

8、移除Znode

```
rmr /path
```

移除指定的znode并递归其所有子节点。只有在这样的znode可用的情况下才会发生。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200708165936250.png)

删除\(delete/path\)命令类似于 remove 命令，除了它只适用于没有子节点的znode。