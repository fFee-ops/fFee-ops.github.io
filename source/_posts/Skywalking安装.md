---
title: Skywalking安装
date: 2021-12-01 20:33:53
tags: zk zookeeper 分布式
categories: Skywalking
---

<!--more-->

### Skywalking安装

- [2.1 elasticsearch安装](#21_elasticsearch_6)
- [2.2 Skywalking安装](#22_Skywalking_62)

Skywalking数据存储方式有2种，分别为H2\(内存\)和elasticsearch，如果数据量比较大，建议使用后者，工作中也建议使用后者。  
Skywalking自身提供了UI管理控制台，我们安装的组件：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cc63817a74d04e5093e82bac377be89d.png)

# 2.1 elasticsearch安装

**1\)系统资源配置修改**  
elasticsearch占用系统资源比较大，我们需要修改下系统资源配置，这样才能很好的运行elasticsearch，修改虚拟机配置， vi /etc/security/limits.conf ，追加内容:

```shell
* soft nofile 65536
* hard nofile 65536
```

修改 vi /etc/sysctl.conf ，追加内容 :

```shell
vm.max_map_count=655360
```

让配置立即生效：

```shell
/sbin/sysctl -p
```

**2\)安装elasticsearch**  
建议安装elasticsearch7.x，我们这里选择7.6.2,并且采用容器的安装方式，安装如下：

```shell
docker run --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e ES_JAVA_OPTS="-Xms84m -Xmx512m" -d elasticsearch:7.6.2
```

**3\)elasticsearch跨域配置**  
elasticsearch默认是没有开启跨域，我们需要配置跨域，并配置集群节点名字：

```shell
#进入容器
docker exec -it elasticsearch /bin/bash
```

修改容器中 `/usr/share/elasticsearch/config/elasticsearch.yml` 文件，添加配置如下：

```shell
cluster.name: "elasticsearch"
http.cors.enabled: true
http.cors.allow-origin: "*"
network.host: 0.0.0.0
discovery.zen.minimum_master_nodes: 1
```

> 参数说明：  
> **cluster.name**:集群服务名字  
> **http.cors.enabled**:开启跨域  
> **http.cors.allow-origin**: 允许跨域域名，\*代表所有域名  
> **network.host**: 外部访问的IP  
> **discovery.zen.minimum\_master\_nodes**: 最小主节点个数

安装完成后，重启容器 `docker restart elasticsearch`，再访问 http://192.168.xx.xx:9200/效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/859371a60f14408186ab76044916c281.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**安装 ElasticSearch管理界面elasticsearch-hq：**

```shell
docker run -d --name elastic-hq -p 5000:5000 --restart always elastichq/elasticsearch-hq
```

安装完成后，访问控制台地址 `http://192.168.211.145:5000/#!/clusters/elasticsearch`

![在这里插入图片描述](https://img-blog.csdnimg.cn/892aa8e18a984c05884c3068cdbcf728.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2.2 Skywalking安装

Skywalking的安装我们也采用Docker安装方式，同时我们需要为Skywalking指定存储服务：

```shell
#安装Skywalking
docker run --name skywalking -d -p 1234:1234 -p 11800:11800 -p 12800:12800 --restart always --link elasticsearch:elasticsearch -e SW_STORAGE=elasticsearch7 -e SW_STORAGE_ES_CLUSTER_NODES=elasticsearch:9200 apache/skywalking-oap-server:8.3.0-es7
```

注意，一定要加skywalking 的版本，不然就会一直疯狂报错！！！，版本可以去docker hub看

> 参数说明：  
> **–link elasticsearch:elasticsearch**:存储服务使用elasticsearch  
> **\-e SW\_STORAGE=elasticsearch7**：存储服务elasticsearch的版本  
> **\-e SW\_STORAGE\_ES\_CLUSTER\_NODES=elasticsearch:9200**:存储服务elasticsearch的链接地址

接下来安装Skywalking-UI，需要指定Skywalking服务名字：

```shell
docker run --name skywalking-ui -d -p 8080:8080 --link skywalking:skywalking -e SW_OAP_ADDRESS=skywalking:12800 --restart always apache/skywalking-ui:8.3.0
```

注意，一定要加和skywalking对应的版本，不然就也会一直疯狂报错！！！，版本可以去docker hub看  
安装完成后，我们接下来访问Skywalking控制台`http://192.168.80.16:8080`

> 如果直接访问8080是白屏，可以访问`http://192.168.80.16:8080/trace`

![在这里插入图片描述](https://img-blog.csdnimg.cn/b7df0a9cf0aa4822a921d0a962725f85.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)