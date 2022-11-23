---
title: TIDB集群部署
date: 2022-11-06 15:59:03
tags: tidb 服务器 linux
categories: TIDB
---

<!--more-->

# 1 环境要求

## 1.1 操作系统建议配置

TiDB 作为一款开源分布式 NewSQL 数据库，可以很好的部署和运行在 Intel 架构服务器环境、ARM 架构的服务器环境及主流虚拟化环境，并支持绝大多数的主流硬件网络。作为一款高性能数据库系统，TiDB 支持主流的 Linux 操作系统环境。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/34e71bb896f44fe3af947b1149a91c1b.png)

## 1.2 服务器建议配置

TiDB 支持部署和运行在 Intel x86-64 架构的 64 位通用硬件服务器平台或者 ARM 架构的硬件服务器平台。对于开发，测试，及生产环境的服务器硬件配置（不包含操作系统 OS 本身的占用）有以下要求和建议：

**开发及测试环境**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/723ee626f92246159edfb94e7cf1ec64.png)  
**生产环境**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a898fc44e0624ce38b0b9e74bf9bce32.png)

# 2 环境准备

准备一台部署主机，确保其软件满足需求：

- 推荐安装 CentOS 7.3 及以上版本
- Linux 操作系统开放外网访问，用于下载 TiDB 及相关软件安装包

最小规模的 TiDB 集群拓扑  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8a549f5ca6d24db294c619d4e92a3ce5.png)

# 3 安装TiUP

## 3.1 什么是TiUP

从 TiDB 4.0 版本开始，TiUP 作为新的工具，承担着包管理器的角色，管理着 TiDB 生态下众多的组件，如 TiDB、PD、TiKV 等。用户想要运行 TiDB 生态中任何组件时，只需要执行 TiUP 一行命令即可，相比以前，极大地降低了管理难度。

## 3.2 安装TiUP组件

使用普通用户登录中控机，以 tidb 用户为例，后续安装 TiUP 及集群管理操作均通过该用户完成

```shell
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
```

该命令将 TiUP 安装在 `$HOME/.tiup` 文件夹下，之后安装的组件以及组件运行产生的数据也会放在该文件夹下。同时，它还会自动将 `$HOME/.tiup/bin` 加入到 Shell Profile 文件的 PATH 环境变量中，这样你就可以直接使用 TiUP 了。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/57773e9dc4054287a96d99dffb575f60.png)

## 3.3 配置TiUP环境

```shell
source .bash_profile
```

## 3.4 检查TiUP 工具是否安装

```shell
which tiup
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/8ac6fc916c774994963853e732795a7e.png)

## 3.5 安装 cluster 组件

```shell
tiup cluster
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/0a8d5893bab849a6bc577f495e479b9d.png)

## 3.6 升级cluster组件

如果机器已经安装 TiUP cluster，需要更新软件版本

```shell
tiup update --self && tiup update cluster
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/c62348e42ba646ffb5aa07faba4d34d3.png)

# 4 编辑部署文件

请根据不同的集群拓扑，编辑 TiUP 所需的集群初始化配置文件。

## 4.1 单机极简部署

部署主机软件和环境要求：

- 部署需要使用部署主机的 root 用户及密码
- 部署主机关闭防火墙或者开放 TiDB 集群的节点间所需端口

![在这里插入图片描述](https://img-blog.csdnimg.cn/8298a7d9ba5f4092add47d59431a4811.png)  
**编辑配置文件**  
按下面的配置模板，编辑配置文件，命名为 topo.yaml

- user: “tidb” ：表示通过 tidb 系统用户（部署会自动创建）来做集群的内部管理，默认使用22 端口通过 ssh 登录目标机器
- replication.enable-placement-rules ：设置这个 PD 参数来确保 TiFlash 正常运行
- host ：设置为本部署主机的 IP

![在这里插入图片描述](https://img-blog.csdnimg.cn/29af680d12214cada9265025718fc96c.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/54ecdc85b6894e08825cd0c6f2a93a71.png)

# 5 执行集群部署命令

## 5.1 命令格式

```shell
tiup cluster deploy <cluster-name> <tidb-version> ./topo.yaml --user root -p
```

> 参数 cluster-name 表示设置集群名称  
> 参数 tidb-version 表示设置集群版本，可以通过 tiup list tidb 命令来查看当前支持部署的 TiDB 版本  
> 参数： \--user root 通过 root 用户登录到目标主机完成集群部署，该用户需要有 ssh 到目标机器的权限，并且在目标机器有 sudo 权限。也可以用其他有 ssh 和 sudo 权限的用户完成部署。

## 5.2 检查TiDB最新版本

```shell
tiup list tidb
```

## 5.3 执行部署命令

```shell
tiup cluster deploy tidb-cluster 4.0.11 ./topo.yaml --user root -p
```

下面输入 y 继续后输入密码进行安装界面  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f807ae259e0a4cebb6029703df71659a.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d002a2b731b44a4cb48b242ee8eb369e.png)  
如果出现 deployed successfully 表示部署成功,集群名称是 tidb-cluster  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f3e3263ceca94a7b833e5cba8b3870a0.png)

## 5.4 启动集群

```shell
tiup cluster start tidb-cluster
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/183d104186734526803a41ddd944738a.png)

## 5.5 查看节点状态

```shell
tiup cluster display tidb-cluster
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/b4e3c90405af48179cddda414a7ef74d.png)

# 6 测试TiDB集群

## 6.1 第三方客户端访问

使用SQLyog访问TiDB  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a5316a38bf8e42d489089d880f4b7baa.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8340ce8965414e149e79f35c9509b8d5.png)

## 6.2 访问Grafana监控

通过 `http://{grafana-ip}:3000` 访问集群 Grafana 监控页面，默认用户名和密码均为 admin  
![在这里插入图片描述](https://img-blog.csdnimg.cn/26ab316a2dac46a3863c54d03747876b.png)

## 6.3 访问Dashboard

通过 `http://{pd-ip}:2379/dashboard` 访问集群 TiDB Dashboard监控页面，默认用户名为 root，密码为空。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/725c9e8bff9d4624af3db3a77938c147.png)

## 6.4 查看集群列表\& 查看集群拓扑

```shell
tiup cluster list
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/14fdd9d30d39443aa9722f34bbffc15e.png)

```shell
tiup cluster display tidb-cluster
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/f59eee2dfc164f1698ca022f361776aa.png)