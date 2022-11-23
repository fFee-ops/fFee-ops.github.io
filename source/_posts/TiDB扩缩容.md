---
title: TiDB扩缩容
date: 2022-11-06 16:08:31
tags: 服务器
categories: TIDB
---

<!--more-->

# 1 当前集群部署拓扑

![在这里插入图片描述](https://img-blog.csdnimg.cn/8d1d00e106b94f769a9eae98f5d71845.png)

# 2 扩容TiKV节点

需要扩容一个TiKV节点  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4f7468fb401b4919b9a179dced0366fc.png)

## 2.1 编写扩容脚本

在 scale-out.yaml 文件添加扩容拓扑配置

```shell
vi scale-out.yaml
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/0ee2181e3d9544bdb28a9d7b3890e938.png)

## 2.2 执行扩容命令

**命令格式**

```shell
tiup cluster scale-out <cluster-name> scale-out.yaml -p
```

cluster-name：TiDB集群名称  
p：使用密码方式登录当前机器

**执行**

```shell
tiup cluster scale-out tidb-cluster scale-out.yaml -p
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/143d6b479798479194537202fe7853b0.png)  
出现 successfully 表示节点扩容成功  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a6c0db015b3945538c39c5278e0abe52.png)

## 2.3 验证扩容信息

```shell
tiup cluster display tidb-cluster
```

我们看到Tikv已经增加了一个节点  
![在这里插入图片描述](https://img-blog.csdnimg.cn/77510191c8ab451ebd9550e96eed02b9.png)

# 3 缩容TiKV节点

查看节点信息

```shell
tiup cluster display tidb-cluster
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/d453e98cc21149fd8bb028f9217424b1.png)  
当前TiKV是4个节点

**执行缩容操作:**

**缩容命令**

```shell
tiup cluster scale-in <cluster-name> --node 192.168.64.152:20163
```

参数解释  
cluster-name：集群名称  
node：需要删除的节点地址  
**执行命令**

```shell
tiup cluster scale-in tidb-cluster --node 192.168.64.152:20163
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/d09f2f6e9d144bdabf91363648b7bbba.png)

**验证缩容信息**

```shell
tiup cluster display tidb-cluster
```

我们看到需要缩容的节点状态是 Tombstone 说明已经下线，下线需要一定时间，下线节点的状态变为 Tombstone 就说明下线成功

![在这里插入图片描述](https://img-blog.csdnimg.cn/34436ee3bbe047c288a07739f09540b4.png)