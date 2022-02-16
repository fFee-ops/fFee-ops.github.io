---
title: CentOS7修改主机名
date: 2020-10-14 22:45:02
tags: 
categories: Linux
---

<!--more-->

在CentOS或RHEL中，有三种定义的主机名:

静态的（static），  
瞬态的（transient），  
灵活的（pretty）。

“静态”主机名也称为内核主机名，是系统在启动时从/etc/hostname自动初始化的主机名。“瞬态”主机名是在系统运行时临时分配的主机名，例如，通过DHCP或mDNS服务器分配。静态主机名和瞬态主机名都遵从作为互联网域名同样的字符限制规则。而另一方面，“灵活”主机名则允许使用自由形式（包括特殊/空白字符）的主机名，以展示给终端用户（如mss01）。

centos7和之前的修改hostname的方式不同，之前修改/etc/sysconfig/network里面的配置文件即可，centos7可以

在CentOS/RHEL 7中，可以用hostnamectl命令查看或修改与主机名相关的配置。

> 可以使用hostnamectl set-hostname命令来修改hostname  
>   
> 修改pretty级别的hostname可以使用hostnamectl \--pretty set-hostname \[主机名\]来修改  
>   
> 要永久修改主机名，你可以修改静态主机名：  
> hostnamectl \--static set-hostname \[主机名\]