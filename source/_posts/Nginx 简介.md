---
title: Nginx 简介
date: 2020-10-10 23:48:53
tags: 
categories: Nginx
---

<!--more-->

### Nginx 简介

- [什么是 nginx](#_nginx_2)
- [正向代理](#_7)
- [反向代理](#_12)
- [负载均衡](#_16)
- [动静分离](#_20)

# 什么是 nginx

Nginx 是高性能的 HTTP 和反向代理的**服务器**，处理高并发能力是十分强大的，能经受高负载的考验,有报告表明能支持高达 50,000 个并发连接数。

[详细介绍](https://lnmp.org/nginx.html)

# 正向代理

需要在客户端配置代理服务器进行指定网站访问  
如果把局域网外的 Internet 想象成一个巨大的资源库，则局域网中的客户端要访 问 Internet，则需要通过代理服务器来访问，这种代理服务就称为正向代理。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020101023423220.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 反向代理

暴露的是代理服务器地址，隐藏了真实服务器 IP 地址。  
反向代理，其实客户端对代理是无感知的，因为客户端不需要任何配置就可以访问，我们只需要将请求发送到反向代理服务器，由反向代理服务器去选择目标服务器获取数据后，在返回给客户端，此时反向代理服务器和目标服务器对外就是一个服务器，暴露的是代理服务器地址，隐藏了真实服务器 IP 地址。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010234547831.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 负载均衡

**增加服务器的数量，然后将请求分发到各个服务器上**，将原先请求集中到单个服务器上的情况改为将请求分发到多个服务器上，将负载分发到不同的服务器，也就是我们所说的负载均衡  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010234705761.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 动静分离

为了加快网站的解析速度，可以把动态页面和静态页面由不同的服务器来解析，加快解析速度。降低原来单个服务器的压力。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010234819706.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201010234829628.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)	





# Nginx 模块
整体采用模块化设计是 Nginx 的一个重大特点，甚至 http 服务器核心功能也是一个模块。旧版本的 Nginx 的模块是静态的，添加和删除模块都要对 Nginx 进行重新编译，1.9.11 以及更新的版本已经支持动态模块加载。

高度模块化的设计是 Nginx 的架构基础。Nginx 服务器被分解为多个模块，每个模块就是一个功能模块，只负责自身的功能，模块之间严格遵循“高内聚，低耦合”的原则。

![在这里插入图片描述](https://img-blog.csdnimg.cn/1e7001bb77334031b5054c16e2df9404.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**1、核心模块**
核心模块是 Nginx 服务器正常运行必不可少的模块，提供错误日志记录、配置文件解析、事件驱动机制、进程管理等核心功能。

**2、标准 HTTP 模块**
标准 HTTP 模块提供 HTTP 协议解析相关的功能，如：端口配置、网页编码设置、HTTP 响应头设置等。

**3、可选 HTTP 模块**
可选 HTTP 模块主要用于扩展标准的 HTTP 功能，让 Nginx 能处理一些特殊的服务，如：Flash 多媒体传输、解析 GeoIP 请求、SSL 支持等。

**4、邮件服务模块**
邮件服务模块主要用于支持 Nginx 的邮件服务，包括对 POP3 协议、IMAP 协议和 SMTP 协议的支持。

**5、第三方模块**
第三方模块是为了扩展 Nginx 服务器应用，完成开发者自定义功能，如：Json 支持、Lua 支持等。