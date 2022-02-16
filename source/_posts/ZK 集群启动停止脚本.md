---
title: ZK 集群启动停止脚本
date: 2021-10-23 23:10:02
tags: linux 运维 服务器 1024程序员节
categories: zookeeper
---

<!--more-->

### ZK 集群启动停止脚本

- [编写](#_4)

之所以想写一个启动脚本，是因为假如我们集群中有一百台zk，那么每次停止都要跑到每台zk的bin目录下执行stop命令，很是麻烦。

# 编写

1.在某台安装了zk的服务器的某个目录下创建一个zk.sh执行脚本  
2\. 执行`vim zk.sh`

```bash
#!/bin/bash
case $1 in
"start"){
for i in 192.168.80.18 192.168.80.19 192.168.80.20
do
 echo ---------- zookeeper $i 启动 ------------
ssh $i "/softwares/zookeeper-3.5.7/bin/zkServer.sh start"
done
};;
"stop"){
for i in 192.168.80.18 192.168.80.19 192.168.80.20
do
 echo ---------- zookeeper $i 停止 ------------
ssh $i "/softwares/zookeeper-3.5.7/bin/zkServer.sh stop"
done
};;
"status"){
for i in 192.168.80.18 192.168.80.19 192.168.80.20
do
 echo ---------- zookeeper $i 状态 ------------
ssh $i "/softwares/zookeeper-3.5.7/bin/zkServer.sh status"
done
};;
esac
```

3.执行`chmod 777 zk.sh`

之后启动集群执行`zk.sh start`命令即可，停止用`zk.sh stop`，查看状态用`zk.sh status`。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f43025fbbf2e470fb6b3ffabe49f05f6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/3b058f7669fe4935828a5a282ced4768.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)