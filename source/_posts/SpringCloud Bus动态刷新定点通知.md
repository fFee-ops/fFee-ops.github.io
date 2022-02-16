---
title: SpringCloud Bus动态刷新定点通知
date: 2020-10-24 14:02:34
tags: 1024程序员节
categories: SpringCloud
---

<!--more-->

### SpringCloud Bus动态刷新定点通知

想达到效果：只通知3355、不通知3366

**简单一句话来概括：指定具体某一个实例生效而不是全部**

> **公式**：http://localhost:配置中心的端口号/actuator/bus-refresh/\{destination\}  
>   
>   
> /bus/refresh请求不再发送到具体的服务实例上，而是发给config server并通过destination参数类指定需要更新配置的服务或实例

**案例**  
我们这里以刷新运行在3355端口上的config-client为例

> curl \-X POST “http://localhost:3344/actuator/bus-refresh/config-client:3355”