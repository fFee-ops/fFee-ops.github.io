---
title: ES高可用集群配置
date: 2022-07-17 19:44:21
tags: elasticsearch 大数据 搜索引擎
categories: ElasticSearch
---

<!--more-->

# ElasticSearch集群介绍

**主节点（或候选主节点）**  
主节点负责创建索引、删除索引、分配分片、追踪集群中的节点状态等工作， 主节点负荷相对较轻， 客户端请求可以直接发往任何节点， 由对应节点负责分发和返回处理结果。

一个节点启动之后， 采用 Zen Discovery机制去寻找集群中的其他节点， 并与之建立连接， 集群会从候选主节点中选举出一个主节点， 并且一个集群只能选举一个主节点， 在某些情况下， 由于网络通信丢包等问题， 一个集群可能会出现多个主节点， 称为“脑裂现象”， 脑裂会存在丢失数据的可能， 因为主节点拥有最高权限， 它决定了什么时候可以创建索引， 分片如何移动等， 如果存在多个主节点， 就会产生冲突， 容易产生数据丢失。要尽量避免这个问题， 可以通过`discovery.zen.minimum_master_nodes` 来设置最少可工作的候选主节点个数（即节点获得的票数必须大于该值才能成为master）。 建议设置为`（候选主节点/2） + 1` 比如三个候选主节点，该配置项为 `（3/2）+1` ,来保证集群中有半数以上的候选主节点， 没有足够的master候选节点， 就不会进行master节点选举，减少脑裂的可能。

主节点的参数设置：

```shell
node.master = true
node.data = false
```

**数据节点**  
数据节点负责数据的存储和CRUD等具体操作，数据节点对机器配置要求比较高、，首先需要有足够的磁盘空间来存储数据，其次数据操作对系统CPU、Memory和IO的性能消耗都很大。通常随着集群的扩大，需要增加更多的数据节点来提高可用性。  
数据节点的参数设置：

```shell
node.master = false
node.data = true
```

**客户端节点**  
客户端节点不做候选主节点， 也不做数据节点的节点，只负责请求的分发、汇总等等，增加客户端节点类型更多是为了负载均衡的处理。

```shell
node.master = false
node.data = false
```

**提取节点（预处理节点）**  
能执行预处理管道，有自己独立的任务要执行， 在索引数据之前可以先对数据做预处理操作， 不负责数据存储也不负责集群相关的事务。  
参数设置：

```shell
node.ingest = true
```

**协调节点**  
协调节点，是一种角色，而**不是真实的Elasticsearch的节点**，不能通过配置项来指定哪个节点为协调节点。集群中的任何节点，都可以充当协调节点的角色。当一个节点A收到用户的查询请求后，会把查询子句分发到其它的节点，然后合并各个节点返回的查询结果，最后返回一个完整的数据集  
给用户。在这个过程中，节点A扮演的就是协调节点的角色。

**部落节点**  
在多个集群之间充当联合客户端， 它是一个特殊的客户端 ， 可以连接多个集群，在所有连接的集群上执行搜索和其他操作。 部落节点从所有连接的集群中检索集群状态并将其合并成全局集群状态。 掌握这一信息，就可以对所有集群中的节点执行读写操作，就好像它们是本地的。 请注意，部落节点需要能够连接到每个配置的集群中的每个单个节点。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/15dd82b0c1f64feaa87836a37efe4533.png)

# ElasticSearch集群原理

## 集群分布式原理

ES集群可以根据节点数， 动态调整分片与副本数， 做到整个集群有效均衡负载。  
单节点状态下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/17c88d60f4fa42349b580a0ddf969f9b.png)  
两个节点状态下， 副本数为1：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cf6906049245438e95f964c0485d7c6a.png)  
三个节点状态下， 副本数为1：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0428de4d54424c72bb5e993966cf03fd.png)  
三个节点状态下， 副本数为2：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c2298167d947404c9e581ef8bafa6dee.png)

## 分片处理机制

设置分片大小的时候， 需预先做好容量规划， 如果节点数过多， 分片数过小， 那么新的节点将无法分片， 不能做到水平扩展， 并且单个分片数据量太大， 导致数据重新分配耗时过大。  
假设一个集群中有一个主节点、两个数据节点。orders索引的分片分布情况如下所示：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5e0694d4e1cd413aa5086667adee7969.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f4516111f45e45528a17fec0645d946b.png)  
整个集群中存在P0和P1两个主分片， P0对应的两个R0副本分片， P1对应的是两个R1副本分片。

## 新建索引处理流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/15d33baa6dfb4a9295157bfedcaa1e10.png)

1.  写入的请求会进入主节点， 如果是NODE2副本接收到写请求， 会将它转发至主节点。
2.  主节点接收到请求后， 根据documentId做取模运算（外部没有传递documentId，则会采用内部自增ID）,如果取模结果为P0，则会将写请求转发至NODE3处理。
3.  NODE3节点写请求处理完成之后， 采用异步方式， 将数据同步至NODE1和NODE2节点

## 读取索引处理流程

![在这里插入图片描述](https://img-blog.csdnimg.cn/08e76973c2c9445bbf1d26d349d15fac.png)

1.  读取的请求进入MASTER节点， 会根据取模结果， 将请求转发至不同的节点。
2.  如果取模结果为R0，内部还会有负载均衡处理机制，如果上一次的读取请求是在NODE1的R0， 那么当前请求会转发至NODE2的R0， 保障每个节点都能够均衡的处理请求数据。
3.  读取的请求如果是直接落至副本节点， 副本节点会做判断， 若有数据则返回，没有的话会转发至其他节点处理。

# ElasticSearch集群部署规划

准备一台虚拟机：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/86d143180e7e4d35a0eaf8bf796d1fda.png)

# ElasticSearch集群配置

1、解压安装包

```shell
cd /usr/local/cluster
tar -xvf elasticsearch-7.10.2-linux-x86_64.tar.gz
```

将安装包解压至/usr/local/cluster目录。  
2、修改集群配置文件：

```shell
vi /usr/local/cluster/elasticsearch-7.10.2-node1/config/elasticsearch.yml
```

192.168.116.140, 第一台节点配置内容：

```yml
# 集群名称
cluster.name: my-application
#节点名称
node.name: node-1
# 绑定IP地址
network.host: 192.168.116.140
# 指定服务访问端口
http.port: 9200
# 指定API端户端调用端口
transport.tcp.port: 9300
#集群通讯地址
discovery.seed_hosts: ["192.168.116.140:9300",
"192.168.116.140:9301","192.168.116.140:9302"]
#集群初始化能够参选的节点信息
cluster.initial_master_nodes: ["192.168.116.140:9300",
"192.168.116.140:9301","192.168.116.140:9302"]
#开启跨域访问支持，默认为false
http.cors.enabled: true
##跨域访问允许的域名, 允许所有域名
http.cors.allow-origin: "*"
```

修改目录权限：

```shell
chown -R elsearch:elsearch /usr/local/cluster/elasticsearch-7.10.2-node1
```

3、 复制ElasticSearch安装目录：  
复制其余两个节点：

```shell
cd /usr/local/cluster
cp -r elasticsearch-7.10.2-node1 elasticsearch-7.10.2-node2
cp -r elasticsearch-7.10.2-node1 elasticsearch-7.10.2-node3
```

4、修改其余节点的配置：  
192.168.116.140 第二台节点配置内容：

```yml
# 集群名称
cluster.name: my-application
#节点名称
node.name: node-2
# 绑定IP地址
network.host: 192.168.116.140
# 指定服务访问端口
http.port: 9201
# 指定API端户端调用端口
transport.tcp.port: 9301
#集群通讯地址
discovery.seed_hosts: ["192.168.116.140:9300",
"192.168.116.140:9301","192.168.116.140:9302"]
#集群初始化能够参选的节点信息
cluster.initial_master_nodes: ["192.168.116.140:9300",
"192.168.116.140:9301","192.168.116.140:9302"]
#开启跨域访问支持，默认为false
http.cors.enabled: true
##跨域访问允许的域名, 允许所有域名
http.cors.allow-origin: "*"
```

192.168.116.140 第三台节点配置内容：

```yml
# 集群名称
cluster.name: my-application
#节点名称
node.name: node-3
# 绑定IP地址
network.host: 192.168.116.140
# 指定服务访问端口
http.port: 9202
# 指定API端户端调用端口
transport.tcp.port: 9302
#集群通讯地址
discovery.seed_hosts: ["192.168.116.140:9300",
"192.168.116.140:9301","192.168.116.140:9302"]
#集群初始化能够参选的节点信息
cluster.initial_master_nodes: ["192.168.116.140:9300",
"192.168.116.140:9301","192.168.116.140:9302"]
#开启跨域访问支持，默认为false
http.cors.enabled: true
##跨域访问允许的域名, 允许所有域名
http.cors.allow-origin: "*"
```

5、启动集群节点  
先切换elsearch用户， 在三台节点依次启动服务：

```shell
su elsearch
/usr/local/cluster/elasticsearch-7.10.2-node1/bin/elasticsearch -d
/usr/local/cluster/elasticsearch-7.10.2-node2/bin/elasticsearch -d
/usr/local/cluster/elasticsearch-7.10.2-node3/bin/elasticsearch -d
```

注意： 如果启动出现错误， 将各节点的data目录清空， 再重启服务。

6、集群状态查看  
集群安装与启动成功之后， 执行请求： http://192.168.116.140:9200/\_cat/nodes\?pretty  
可以看到三个节点信息，三个节点会自行选举出主节点：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/00977312ff0d4e3b8139d966e498a5b4.png)

# ElasticSearch集群分片测试

修改kibana的配置文件，指向创建的集群节点：

```shell
elasticsearch.hosts:
["http://192.168.116.140:9200","http://192.168.116.140:9201","http://192.168.116
.140:9202"]
```

重启kibana服务， 进入控制台：  
http://192.168.116.140:5601/app/home#/  
再次创建索引（副本数量范围内）：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9865d14fbf384e39a9fa5c7e2e209c5a.png)  
可以看到， 这次结果是正常：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/62cd813c6b724c53a5f40c75079ae25a.png)  
集群并非可以随意增加副本数量， 创建索引（超出标准副本数量范围）：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/667b4587ab4644c484276ca975855661.png)  
可以看到出现了yellow警告错误：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/30cb66045bda495c8d744342f1420b35.png)