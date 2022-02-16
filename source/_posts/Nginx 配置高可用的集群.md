---
title: Nginx 配置高可用的集群
date: 2020-10-11 19:38:39
tags: 
categories: Nginx
---

<!--more-->

### Nginx 配置高可用的集群

  
**1、什么是 nginx 高可用**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011192953572.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
即有主从两台Nginx服务器，平时都是主机在工作，当主机宕机后，从机能接替主机工作，避免服务中断。

---

（1）需要两台 nginx 服务器  
（2）需要 keepalived  
（3）需要虚拟 ip

**2、配置高可用的准备工作**  
（1）需要两台服务器 192.168.17.129 和 192.168.17.131  
（2）在两台服务器安装 nginx  
（3）在两台服务器安装 keepalived

**3、在两台服务器安装 keepalived**  
（1）使用 yum 命令进行安装

```shell
yum install keepalived –y
```

（2）安装之后，在 etc 里面生成目录 keepalived，有文件 keepalived.conf

**4、完成高可用配置（主从配置）**  
（1）修改/etc/keepalived/keepalivec.conf 配置文件

```shell
global_defs {
 notification_email {
 acassen@firewall.loc
 failover@firewall.loc
 sysadmin@firewall.loc
 }
 notification_email_from Alexandre.Cassen@firewall.loc
 smtp_server 192.168.17.129
 smtp_connect_timeout 30
 router_id LVS_DEVEL
}
vrrp_script chk_http_port {
 script "/usr/local/src/nginx_check.sh"
 interval 2 #（检测脚本执行的间隔）
 weight 2
}
vrrp_instance VI_1 {
 state BACKUP # 备份服务器上将 MASTER 改为 BACKUP
 interface ens33 //网卡
 virtual_router_id 51 # 主、备机的 virtual_router_id 必须相同
 priority 90 # 主、备机取不同的优先级，主机值较大，备份机值较小
 advert_int 1
 authentication {
 auth_type PASS
 auth_pass 1111
 }
 virtual_ipaddress {
 192.168.17.50 // VRRP H 虚拟地址
 }
}
```

（2）在/usr/local/src 添加检测脚本

```shell
#!/bin/bash
A=`ps -C nginx –no-header |wc -l`
if [ $A -eq 0 ];then
 /usr/local/nginx/sbin/nginx
 sleep 2
 if [ `ps -C nginx --no-header |wc -l` -eq 0 ];then
 killall keepalived
 fi
fi
```

（3）把两台服务器上 nginx 和 keepalived 启动  
启动 nginx：./nginx  
启动 keepalived：systemctl start keepalived.service

**5、最终测试**  
（1）在浏览器地址栏输入 虚拟 ip 地址 192.168.17.50

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011193643980.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
（2）把主服务器（192.168.17.129）nginx 和 keepalived 停止，再输入 192.168.17.50  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011193717126.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)