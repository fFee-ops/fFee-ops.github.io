---
title: JWT
date: 2021-01-30 14:23:41
tags: 
categories: JavaWeb
---

# 简介

JWT（Json Web Token）, 是为了在网络应用环境间传递声明而执行的一种基于JSON的开放标准。JWT一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息，以便于从资源服务器获取资源，也可以增加一些额外的其它业务逻辑所必须的声明信息，该token也可直接被用于认证，也可被加密。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210130142013471.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# JWT可以用在单点登录的系统中

传统的JavaWeb项目，利用`HttpSession`保存用户的登陆凭证。如果后端系统采用了负载均衡设计，当用户在A节点成功登陆，那么登陆凭证保存在A节点的`HttpSession`中。如果用户下一个请求被负载均衡到了B节点，因为B节点上面没有用户的登陆凭证，所以需要用户重新登录，这个体验太糟糕了。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210130142046349.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
如果用户的登陆凭证经过加密，生成一个令牌（`Token`）保存在客户端，客户端每次提交请求的时候，把`Token`上传给后端服务器节点。即便后端项目使用了负载均衡，每个后端节点接收到客户端上传的`Token`之后，经过检测，是有效的`Token`，于是就断定用户已经成功登陆，接下来就可以提供后端服务了。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210130142150805.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# JWT兼容更多的客户端

传统的HttpSession依靠浏览器的Cookie存放SessionId，所以要求客户端必须是浏览器。现在的JavaWeb系统，客户端可以是浏览器、APP、小程序，以及物联网设备。为了让这些设备都能访问到JavaWeb项目，就必须要引入JWT技术。JWT的Token是纯字符串，至于客户端怎么保存，没有具体要求。只要客户端发起请求的时候，附带上Token即可。所以像物联网设备，我们可以用SQLite存储Token数据。

