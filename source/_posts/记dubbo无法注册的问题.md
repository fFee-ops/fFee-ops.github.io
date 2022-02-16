---
title: 记dubbo无法注册的问题
date: 2020-05-18 13:27:00
tags: centos linux zookeeper
categories: 踩坑
---

<!--more-->

今天启动服务端的时候报错：

Failed to register consumer://192.168.60.1/com.duck.service.UserService\?application=user-web\&category=consumers\&check=false\&default.check=false\&default.reference.filter=regerConsumerFilter\&default.timeout=600000\&dubbo=2.6.0\&interface=com.atguigu.gmall.service.UserService\&methods=getReceiveAddressByMemberId,getAllUser\&pid=12648\&side=consumer\&timestamp=1583642177210 to zookeeper zookeeper://47.112.171.153:2181/com.alibaba.dubbo.registry.RegistryService\?application=user-web\&client=zkclient\&dubbo=2.6.0\&interface=com.alibaba.dubbo.registry.RegistryService\&pid=12648\&timestamp=1583642177225, **cause: Zookeeper is not connected yet\!**

---

问题原因，这是由于linux开启了防火墙，导致注册失败。

解决：关闭linux（基于CentOS7）防火墙

```
systemctl stop firewalld.service
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200518132654959.png)