---
title: ElasticSearch安装及基础操作
date: 2022-07-17 18:37:19
tags: elasticsearch 大数据 搜索引擎
categories: ElasticSearch
---

<!--more-->

# 安装

[ElasticSearch下载地址](https://mirrors.huaweicloud.com/elasticsearch/?C=N&O=D)

[可视化界面elasticsearch-head下载地址](https://github.com/mobz/elasticsearch-head)

[kibana下载地址](https://mirrors.huaweicloud.com/kibana/?C=N&O=D) **：解压超级久。。。。**

[ik分词器下载地址](https://github.com/medcl/elasticsearch-analysis-ik)

**jdk必须是1.8及以上的版本，且要配置nodejs、python环境。**

## 需要注意的点

ELK都是解压即用的，但是有一些需要注意的点。

1、kibana的国际化设置 yml中设置成zh-CN

2、最开始打开es-head会发现连接不上es，这是因为有跨域问题。  
**解决：es下的yml文件添加**

```yml
http.cors.enabled: true
http.cors.allow-origin: "*" 
```

3、分词器下载后，修改里面的pom文件修改对应es的版本，放到es的plugins的ik目录下（ik是自己创建的文件夹），放进去。

## ElasticSearch安装

1.  下载ElasticSearch服务  
    下载最新版ElasticSearch7.10.2: <https://www.elastic.co/cn/start>

2.  解压安装包

    ```shell
    tar -xvf elasticsearch-7.10.2-linux-x86_64.tar.gz
    ```

3.  ElasticSearch不能以Root身份运行， 需要单独创建一个用户

    ```shell
    1. groupadd elsearch
    2. useradd elsearch -g elsearch -p elasticsearch
    3. chown -R elsearch:elsearch  /usr/local/elasticsearch-7.10.2
    ```

    执行以上命令，创建一个名为elsearch用户， 并赋予目录权限。

4.  修改配置文件  
    vi config/elasticsearch.yml, 默认情况下会绑定本机地址， 外网不能访问， 这里要修改下:

    ```yml
    network.host: 0.0.0.0
    ```

5.  关闭防火墙

    ```shell
    systemctl stop  firewalld.service
    systemctl disable  firewalld.service
    ```

6.  指定JDK版本  
    最新版的ElasticSearch需要**JDK11**版本， 下载JDK11压缩包， 并进行解压。 修改环境配置文件  
    `vi bin/elasticsearch-env` 参照以下位置， 追加一行， 设置JAVA\_HOME， 指定JDK11路径。

    ```shell
    JAVA_HOME=/usr/local/jdk-11.0.11
    # now set the path to java
    if [ ! -z "$JAVA_HOME" ]; then
  JAVA="$JAVA_HOME/bin/java"
    else
  if [ "$(uname -s)" = "Darwin" ]; then
    # OSX has a different structure
    JAVA="$ES_HOME/jdk/Contents/Home/bin/java"
  else
    JAVA="$ES_HOME/jdk/bin/java"
  fi
    fi
    ```

7.  启动ElasticSearch  
    切换用户:su elsearch  
    以后台常驻方式启动  
    bin/elasticsearch \-d

8.  访问验证  
    访问地址:http://192.168.116.140:9200/\_cat/health  
    启动状态有green、yellow和red。 green是代表启动正常。

## Kibana服务安装

Kibana是一个针对Elasticsearch的开源分析及可视化平台，用来搜索、查看交互存储在Elasticsearch索  
引中的数据。

 1.     到官网下载， Kibana安装包, 与之对应7.10.2版本， 选择Linux 64位版本下载，并进行解压。

```shell
tar -xvf kibana-7.10.2-linux-x86_64.tar.gz
```

 2.     Kibana启动不能使用root用户， 使用上面创建的elsearch用户， 进行赋权:

```shell
chown -R elsearch:elsearch kibana-7.10.2-linux-x86_64
```

 3.     修改配置文件  
    vi config/kibana.yml , 修改以下配置:

```yml
# 服务端口
server.port: 5601
# 服务地址
server.host: "0.0.0.0"
# elasticsearch服务地址
elasticsearch.hosts: ["http://192.168.116.140:9200"]
```

 4.     启动kibana

```shell
./kibana -q
```

看到以下日志， 代表启动正常

```shell
log   [01:40:00.143] [info][listening] Server running at http://0.0.0.0:5601
```

5.  访问服务  
    http://192.168.116.140:5601/app/home#/

# 基础操作

## 1、 进入Kibana管理后台

地址: http://192.168.116.140:5601 进入"Dev Tools"栏:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8dc15e2726284f0fb4fc566dea24ebbd.png)  
在Console中输入命令进行操作。

## 2、分片设置：

这里增加名为orders的索引， 因为是单节点， 如果创建了副本， 是会出现错误。（因为副本不能和主分片在一个节点，所以就导致了主分片可用，但是副本分片不可用，于是健康状态变为YELLOW。如果 存在不可用的主分片，那么状态变为RED。）

```shell
PUT orders
{
"settings": {
"index": {
"number_of_shards": 2,
"number_of_replicas": 2
}
}
}
```

查看索引信息， 会出现yellow提示：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1add2b2f8b62417582df11e73d37c40a.png)  
删除重新创建：

```shell
PUT orders
{
"settings": {
"index": {
"number_of_shards": 2,
"number_of_replicas": 0
}
}
}
```

将副本分片数设为0， 再次查看， 则显示正常：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e18577c38b3f40c48768ede5a9433044.png)

## 3、 索引

新建索引orders

```shell
## 创建索引
PUT orders
```

查询索引orders

```shell
## 查询索引
GET orders
```

通过查询命令， 能查看到对应信息， 默认分片数和副本数都为1：

```shell
"number_of_shards" : "1", ## 主分片数
"number_of_replicas" : "1", ## 副分片数
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/bf46923ed5ba44fe876a5316ad543750.png)  
删除索引

```shell
## 删除索引
DELETE orders
```

索引的设置

```shell
## 设置索引
PUT orders
{
"settings": {
"index": {
"number_of_shards": 1,
"number_of_replicas": 0
}
}
}
```

## 4、 文档

创建文档

```shell
## 创建文档，自动生成默认的文档id
POST orders/_doc
{
"name": "袜子1双",
"price": "200",
"count": 1,
"address": "北京市"
}
## 创建文档，生成自定义文档id
POST orders/_doc/1
{
"name": "袜子1双",
"price": "2",
"count": 1,
"address": "北京市"
}
```

查询文档

```shell
## 根据指定的id查询
GET orders/_doc/1
## 根据指定条件查询文档
GET orders/_search
{
"query": {
"match": {
"address": "北京市"
}
}
}
## 查询全部文档
GET orders/_search
```

更新文档

```shell
## 更新文档 此方法会直接覆盖原来的纪录，相当于新建一个只有price的文档
POST orders/_doc/1
{
"price": "200"
}
## 更新文档 此方法才是在原文档上修改这一filed
POST orders/_update/1
{
"doc": {
"price": "200"
}
}
```

删除文档

```shell
## 删除文档
DELETE orders/_doc/1
```

## 5、 域

对于映射，只能进行字段添加，不能对字段进行修改或删除，如有需要，则重新创建映射。

```shell
## 设置mapping信息
PUT orders/_mappings
{
"properties":{
"price": {
"type": "long"
}
}
}
## 设置分片和映射
PUT orders
{
"settings": {
"index": {
"number_of_shards": 1,
"number_of_replicas": 0
}
},
"mappings": {
"properties": {
"name": {
"type": "text"
},
"price": {
"type": "long"
},
"count": {
"type": "long"
},
"address": {
"type": "text"
}
}
}
}
```