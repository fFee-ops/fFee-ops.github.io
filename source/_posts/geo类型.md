---
title: geo类型
date: 2022-02-19 20:36:12
tags:
password:
categories: Redis
---

## 概述
Redis 3.2 中增加了对GEO类型的支持。GEO，Geographic，地理信息的缩写。该类型，就是元素的2维坐标，在地图上就是经纬度。redis基于该类型，提供了经纬度设置，查询，范围查询，距离查询，经纬度Hash等常见操作。
应用场景：附近的人、摇一摇、附近的车、附近银行站点查询
![在这里插入图片描述](https://img-blog.csdnimg.cn/8e260717cf1a4dff820fd1290642b936.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 环境要求
1. redis版本需要3.2及以上
2. 如果使用jedis操作redis，需要jedis版本为2.9及以上
3. 如果使用spring data redis操作redis，需要spring data redis版本为1.8.0及以上


## redis GEO常用命令
在学习geo命令时会使用到经纬度坐标信息，可以在百度地图的拾取坐标系统中获取测试坐标信息，网址：[http://api.map.baidu.com/lbsapi/getpoint/index.html](http://api.map.baidu.com/lbsapi/getpoint/index.html)
### 1. geoadd命令

为了进行地理位置相关操作， 我们首先需要将具体的地理位置记录起来， 这一点可以通过执行 geoadd命令来完成， 该命令的基本格式如下：
```shell
# location：地域合集 longitude ：经度 latitude ：纬度 name ：地区名
GEOADD location-set longitude latitude name [longitude latitude name ...]
```
以下代码展示了如何通过 GEOADD 命令， 将武汉、襄阳、宜昌、枝江、咸宁等数个湖北省的市添加到位置集合 hubeiCities 集合里面
```shell
geoadd hubeiCities 114.32538 30.534535 wuhan
geoadd hubeiCities 112.161882 32.064505 xiangyang 111.305197 30.708127 yichang 111.583717 30.463363 zhijiang 114.295174 29.885892 xianning
```

###  2. geopos命令
此命令用于根据输入的位置名称获取位置的坐标信息，基本语法如下
```shell
GEOPOS location-set name [name ...]
```
案例：查询襄阳市的位置信息
```shell
geopos hubeiCities xiangyang
--结果如下【1为经度 2为纬度】
1) "112.16188341379165649"
2) "32.06450528704699821"
```
也可以一次查询多个位置的经纬度
```shell
geopos hubeiCities xiangyang wuhan
--襄阳的经纬度
1) "112.16188341379165649"
2) "32.06450528704699821"
--武汉的经纬度
2) "114.32538002729415894"
2) "30.53453492166421057"
```


### 3. geodist命令
此命令用于计算两个位置之间的距离，基本语法如下：
```shell
GEODIST location-set location-x location-y [unit]
```
可选参数 unit 用于指定计算距离时的单位， 它的值可以是以下单位的其中一个：
- m 表示单位为米。
- km 表示单位为千米。
- mi 表示单位为英里。
- ft 表示单位为英尺。

案例：分别以默认距离单位和指定距离单位计算襄阳和武汉的距离
```shell
--不指定距离单位
127.0.0.1:6381> geodist hubeiCities xiangyang wuhan
"266889.7642"
--指定距离单位km
127.0.0.1:6381> geodist hubeiCities xiangyang wuhan km
"266.8898
```

### 4. georadius命令和georadiusbymember命令
这两个命令都可以用于获取指定范围内的元素，也即查找特定范围之内的其他存在的地点。比如找出地点A范围200米之内的所有地点，找出地点B范围50公里之内的所有地点等等。

这两个命令的作用一样， 只是指定中心点的方式不同：
-  georadius 使用用户给定的经纬度作为计算范围时的中心点
-  georadiusbymember 则使用**储存在位置集合里面的某个地点**作为中心点。

以下是这两个命令的基本语法
```shell
GEORADIUS location-set longitude latitude radius m|km|ft|mi [WITHCOORD] [WITHDIST] [ASC|DESC] [COUNT count]

GEORADIUSBYMEMBER location-set location radius m|km|ft|mi [WITHCOORD] [WITHDIST] [ASC|DESC] [COUNT count]
```
这两个命令的各个参数的意义如下：
- m|km|ft|mi 指定的是计算范围时的单位；
- 如果给定了WITHCOORD，那么在返回匹配的位置时会将位置的经纬度一并返回；
- 如果给定了WITHDIST ， 那么在返回匹配的位置时会将位置与中心点之间的距离一并返回；
- 在默认情况下， GEORADIUS 和 GEORADIUSBYMEMBER 的结果是未排序的， ASC 可以让查找结果根据距离从近到远排序， 而 DESC 则可以让查找结果根据从远到近排序；
- COUNT参数用于指定要返回的结果数量。

下面通过案例分别演示georadius命令和georadiusbymember命令
**GEORADIUS案例：**
在hubeiCities位置集合中查找距离经纬度为112.927076，28.235653（长沙）500km以内的位置信息，查找结果中应包含不超过5个位置的坐标信息，距离信息，并按距离由近到远排序。
查询代码如下：
```shell
georadius hubeiCities 112.927076 28.235653 500 km withcoord withdist asc count 5
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/571cb5b3e01f426383071fa8b9d51030.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**GEORADIUSBYMEMBER案例：**
在hubeiCities位置集合中查找距离襄阳200km以内的位置信息【这里指定的目标位置只能是hubeiCities中存在的位置，而不能指定位置坐标】，查找结果中应包含不超过2个位置的坐标信息，距离信息，并按距离由远到近排序。
查询代码如下：
```shell
georadiusbymember hubeiCities xiangyang 200 km withcoord withdist desc count 2
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2a61319d83984ddcb3b43dfc0fd5999e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)