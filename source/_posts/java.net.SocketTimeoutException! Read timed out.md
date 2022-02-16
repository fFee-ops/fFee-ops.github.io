---
title: java.net.SocketTimeoutException:Read timed out
date: 2021-01-27 20:44:01
tags: 
categories: 踩坑
---

<!--more-->

微服务之间进行调用的时候报错java.net.SocketTimeoutException: Read timed out。

**解决：feign的超时时间设置久一点**

```yml
feign:
  client:
    config:
      default:
        #建立连接所用的时间，适用于网络状况正常的情况下，两端连接所需要的时间
        ConnectTimeOut: 10000
        #指建立连接后从服务端读取到可用资源所用的时间
        ReadTimeOut: 10000
```