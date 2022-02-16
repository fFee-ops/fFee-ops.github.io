---
title: springCloud→OpenFeign：数据压缩
date: 2021-11-26 19:05:04
tags: zookeeper 分布式 java
categories: SpringCloud
---

<!--more-->

### OpenFeign数据压缩

用户在网络请求过程中，如果网络不佳、传输数据过大，会造成体验差的问题，我们需要将传输数据压缩提升体验。SpringCloud OpenFeign支持对请求和响应进行GZIP压缩，以减少通信过程中的性能损耗。

通过配置开启请求与响应的压缩功能：\(是在**消费方**的配置文件中开启\)

```yml
feign:
	compression:
      request:
        enabled: true # 开启请求压缩
      response:
        enabled: true # 开启响应压缩
```

也可以对请求的数据类型，以及触发压缩的大小下限进行设置:

```yml
feign:
	compression:
      request:
        enabled: true # 开启请求压缩
        mime-types:	text/html,application/xml,application/json # 设置压缩的数据类型
        min-request-size: 2048 # 设置触发压缩的大小下限
        #以上数据类型，压缩大小下限均为默认值
      response:
        enabled: true # 开启响应压缩
```