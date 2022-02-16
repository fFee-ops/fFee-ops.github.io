---
title: 启动docker容器报错iptables failed:iptables --wait -t nat -A DOCKER
date: 2021-12-02 21:00:25
tags: docker 容器 运维
categories: 踩坑
---

<!--more-->

# **启动docker容器时报错：**  

/usr/bin/docker-current: Error response from daemon: driver failed programming external connectivity on endpoint node \(7e1282d78b546d89e53823c2f96b75e53c683a10c725f4ce2454ee08b00cace0\): \(iptables failed: iptables \--wait \-t nat \-A DOCKER \-p tcp \-d 0/0 \--dport 3000 \-j DNAT \--to-destination 172.17.0.2:3000 \! \-i docker0: iptables: No chain/target/match by that name.

**解决方案：重启docker**

```shell
systemctl restart docker
```