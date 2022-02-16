---
title: Ribbon概述
date: 2020-10-19 13:33:30
tags: 
categories: 
---

<!--more-->

### Ribbon概述

**是什么**  
Spring Cloud Ribbon是基于 Netflix ribbon实现的一套客户端负载均衡的工具。  
简单的说, Ribbon是 Netflix发布的开源项目,主要功能是提供**客户端** 的软件负载均衡算法和服务调用。 Ribbon客户端组件提供一系列  
完善的配置项如连接超时,重试等。简单的说,就是在配置文件中列出 Load balancer\(简称LB\)后面所有的机器, Ribbon会自动的帮  
助你基于某种规则\(如简单轮迿,随机连接等\)去连接这些机器。我们很容易使用 Ribbon实现自定义的负载均衡算法。

---

**官网资料**  
[Github](https://github.com/Netflix/ribbon/wiki/Getting-Started)

目前Ribbon也进入了维护模式  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019132357898.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

未来可能被替换  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019132418153.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

**能干什么**  
①LB（负载均衡）  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019132750378.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
1）、集中式LB  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019132812651.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

2）、进程内LB  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019132817802.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**总的来说就是负载均衡+RestTemplate调用**