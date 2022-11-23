---
title: ES数据类型
date: 2022-07-17 19:23:59
tags: elasticsearch 大数据 搜索引擎
categories: ElasticSearch
---

<!--more-->

整体数据类型结构：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9ce49e9061cd4016b687e6bd890ff5d4.png)

## String 类型

主要分为text与keyword两种类型。两者区别主要在于能否分词。  
text类型

```shell
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

会进行分词处理， 分词器默认采用的是standard。  
keyword类型  
不会进行分词处理。在ES的倒排索引中存储的是完整的字符串

## Date时间类型

数据库里的日期类型需要规范具体的传入格式， ES是可以控制，自适应处理。  
传递不同的时间类型：

```shell
PUT my_date_index/_doc/1
{ "date": "2021-01-01" }
PUT my_date_index/_doc/2
{ "date": "2021-01-01T12:10:30Z" }
PUT my_date_index/_doc/3
{ "date": 1520071600001 }
```

查看日期数据：

```shell
GET my_date_index/_mapping
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/c544b99b111e453689cb6a6d3e0f267d.png)  
ES的Date类型允许可以使用的格式有：

> yyyy-MM-dd HH:mm:ss  
> yyyy-MM-dd  
> epoch\_millis（毫秒值）

## 复合类型

复杂类型主要有三种： Array、object、nested。  
**Array类型**： 在Elasticsearch中，数组不需要声明专用的字段数据类型。但是，在数组中的所有值都必须具有相同的数据类型。举例：

```shell
POST orders/_doc/1
{
//插入失败，因为有一个不同类型
"goodsName":["足球","篮球","兵乓球", 3]
}
POST orders/_doc/1
{
//插入成功
"goodsName":["足球","篮球","兵乓球"]
}
```

**object类型**： 用于存储单个JSON对象， 类似于JAVA中的对象类型， 可以有多个值， 比如LIST，可以包含多个对象。  
但是LIST只能作为整体， 不能独立的索引查询。举例：

```shell
# 新增第一组数据， 组别为美国，两个人。
POST my_index/_doc/1
{
"group" : "america",
"users" : [
{
"name" : "John",
"age" : "22"
},
{
"name" : "Alice",
"age" : "21"
}
]
}
# 新增第二组数据， 组别为英国， 两个人。
POST my_index/_doc/2
{
"group" : "england",
"users" : [
{
"name" : "lucy",
"age" : "21"
},
{
"name" : "John",
"age" : "32"
}
]
}
```

这两组数据都包含了name为John，age为21的数据，  
采用这个搜索条件， 实际结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/54478ccdf7a84bd5b65622bc7c33b445.png)  
结果可以看到， 这两组数据都能找出，因为每一组数据都是作为一个整体进行搜索匹配， 而非具体某一条数据。

**Nested类型**  
用于存储多个JSON对象组成的数组， nested 类型是 object 类型中的一个特例，可以让对象数组独立索引和查询。  
举例：  
创建nested类型的索引：

```shell
PUT my_index
{
"mappings": {
"properties": {
"users": {
"type": "nested"
}
}
}
}
```

发出查询请求：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/76e8874743cd4301b42440835bfda22d.png)  
采用以前的条件， 这个时候查不到任何结果， 将年龄改成22， 就可以找出对应的数据：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e661e51ffe2e4cc99af7623b0a17ed70.png)

**GEO地理位置类型**  
现在大部分APP都有基于位置搜索的功能， 比如交友、购物应用等。这些功能是基于GEO搜索实现的。  
对于GEO地理位置类型，分为地图：Geo-point， 和形状：Geo-shape 两种类型。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/372a5d4ac02a4eedaa9ed55a72f06301.png)

创建地理位置索引：

```shell
PUT my_locations
{
"mappings": {
"properties": {
"location": {
"type": "geo_point"
}
}
}
}
```

添加地理位置数据：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/38d290bdc5a2454ebcd602ccaa0efcfd.png)  
需求：搜索出距离我\{“lat” : 40,“lon” : \-70\} 200km范围内的人：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7c0ea870b7234f96af8949223ba56ee0.png)