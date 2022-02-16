---
title: seata-server启动是内网ip导致springboot项目无法找到seata服务
date: 2022-01-07 14:34:14
tags: tcp/ip spring boot java
categories: 踩坑
---

<!--more-->

**问题描述：**  
seata部署在linux，然后用springboot项目去访问显示无法找到seata服务。

**问题发现：**  
seata如果直接用启动脚本去启动那么默认是用的内网ip，就算你注册到nacos你也可以看看，ip地址并不是你虚拟机的公网ip。

**解决：**  
启动的时候带上-h参数指定外网地址

```shell
./seata-server.sh -h 192.168.80.16
```