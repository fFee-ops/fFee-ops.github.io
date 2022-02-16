---
title: RabiitMQ 配置
date: 2020-10-13 10:23:28
tags: 
categories: RabbitMQ
---

<!--more-->

### RabiitMQ 配置

- [RabbitMQ 管理命令行](#RabbitMQ__1)
- [web管理界面介绍](#web_13)
- - [Admin用户和虚拟主机管理](#Admin_25)

# RabbitMQ 管理命令行

```shell
# 1.服务启动相关
	systemctl start|restart|stop|status rabbitmq-server

# 2.管理命令行  用来在不使用web管理界面情况下命令操作RabbitMQ
	rabbitmqctl  help  可以查看更多命令

# 3.插件管理命令行
	rabbitmq-plugins enable|list|disable 
```

# web管理界面介绍

**overview概览**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013101411924.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

> - **connections：** 无论生产者还是消费者，都需要与RabbitMQ建立连接后才可以完成消息的生产和消费，在这里可以查看连接情况
> - **channels：** 通道，建立连接后，会形成通道，消息的投递获取依赖通道。
> - **Exchanges：** 交换机，用来实现消息的路由
> - **Queues：** 队列，即消息队列，消息存放在队列中，等待消费，消费后被移除队列。

## Admin用户和虚拟主机管理

**1\. 添加用户**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013101914892.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

> 上面的Tags选项，其实是指定用户的角色，可选的有以下几个：
> 
> - 超级管理员\(administrator\)  
>   可登陆管理控制台，可查看所有的信息，并且可以对用户，策略\(policy\)进行操作。
> - 监控者\(monitoring\)  
>   可登陆管理控制台，同时可以查看rabbitmq节点的相关信息\(进程数，内存使用情况，磁盘使用情况等\)
> - 策略制定者\(policymaker\)  
>   可登陆管理控制台, 同时可以对policy进行管理。但无法查看节点的相关信息\(上图红框标识的部分\)。
> - 普通管理者\(management\)  
>   仅可登陆管理控制台，无法看到节点信息，也无法对策略进行管理。
> - 其他  
>   无法登陆管理控制台，通常就是普通的生产者和消费者。

**2\. 创建虚拟主机**

> **虚拟主机\(类比数据库\)：** 为了让各个用户可以互不干扰的工作，RabbitMQ添加了虚拟主机（Virtual Hosts）的概念。其实就是一个独立的访问路径，不同用户使用不同路径，各自有自己的队列、交换机，互相不会影响。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013102135213.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
**3\. 绑定虚拟主机和用户**  
创建好虚拟主机，我们还要给用户添加访问权限：

点击添加好的虚拟主机：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013102216234.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
进入虚拟机设置界面:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013102304838.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)