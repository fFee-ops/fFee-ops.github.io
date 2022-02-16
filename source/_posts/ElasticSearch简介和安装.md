---
title: ElasticSearch简介和安装
date: 2020-11-03 11:01:16
tags: 
categories: ElasticSearch
---

<!--more-->

### ElasticSearch简介和安装

- [简介](#_2)
- [安装](#_11)
- - [需要注意的点](#_23)
- [核心概念](#_63)
- - [文档](#_68)
  - [类型](#_82)
  - [索引](#_92)
  - [倒排索引](#_104)

# 简介

Elasticsearch 是一个分布式可扩展的**实时搜索和分析引擎**,一个建立在全文搜索引擎 Apache Lucene™ 基础上的搜索引擎.当然 Elasticsearch 并不仅仅是 Lucene 那么简单，它不仅包括了全文搜索功能，还可以进行以下工作:

- 分布式实时**文件存储**，并将每一个字段都编入索引，使其可以被搜索。
- 实时分析的分布式搜索引擎。
- 可以扩展到上百台服务器，处理PB级别的结构化或非结构化数据。

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

4、es-head的启动：首先要给windows安装cnpm。  
然后进入到es-head的目录 进行

```shell
cnpm install
```

然后启动

```shell
npm run start
```

5、分词的粒度设置，比如一个分词只是将一个词的单体拆分，“李逵哈哈”，可能只是将李逵两个都分开了，并没有分成“李逵”这个词，那就要自己去写字典了

在ik分词下的config目录下新增一个 “lk.dic”,内容为

```
李逵
```

把自己的dic 添加到配置中 IKAnalyzer.cfg.xml中

```xml
<!-- 用户可以在这扩展自己的用户字典-->  
<entry key="ext_dict">lk.dic</entry>
```

# 核心概念

**以下为ES和Mysql等的对照关系**

| Relational DB | Elasticsearch |
| --- | --- |
| 数据库（database） | 索引（indices） |
| 表（tables） | types |
| 行（rows） | documents |
| 字段（columns） | fields |

## 文档

就是类似关系型数据库的一条条的记录

elasticsearch是**面向文档**的,那么就意味着索弓和搜索数据的最小单位是文档。

**elasticsearch中,文档有几个重要属性:**

- 自我包含, 一篇文档同时包含字段和对应的值,也就是同时包含key:value \!
- 可以是层次型的
- 灵活的结构,文档不依赖预先定义的模式,我们知道关系型数据库中,要提前定义字段才能使用,在elasticsearch中,对于字段是非常灵活的,有时候,我们可以忽略该字段,或者动态的添加一个新的字段。

尽管我们可以随意的新增或者忽略某个字段,但是,每个字段的类型非常重要,比如一一个年龄字段类型,可以是字符串也可以是整形。因为elasticsearch会保存字段和类型之间的映射及其他的设置。这种映射具体到每个映射的每种类型,这也是为什么在elasticsearch中,类型有时候也称为**映射类型。**

## 类型

类型是文档的逻辑容器,就像关系型数据库一样,表格是行的容器。

**类型中对于字段的定义称为映射**,比如name映射为字符串类型。

我们说文档是无模式的 ,它们不需要拥有映射中所定义的所有字段。

但是如果要新增一个字段,那么elasticsearch的流程是什么？

> elasticsearch会自动的将新字段加入映射,但是这个字段的不确定它是什么类型, elasticsearch就开始猜,如果这个值是18 ,那么elasticsearch会认为它是整形。但是elasticsearch也可能猜不对 ，所以最安全的方式就是提前定义好所需要的映射,这点跟关系型数据库殊途同归了,先定义好字段,然后再使用。

## 索引

可以浅显的理解为就是**数据库**。

索引是映射类型的容器, elasticsearch中的索引是一个非常大的文档集合。索引存储了映射类型的字段和其他设置。然后它们被存储到了各个分片上。

**分片**  
在es中，默认一个Es就是一个集群，一个集群又至少有一个节点。而一个节点就是一个es进程,节点可以有多个默认索引,如果你创建新索引,那么索引将会由5个分片\( primary shard ,又称主分片\)构成,每一个主分片会有一个副本\( replica shard ,又称复制分片）  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201103104809626.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

> 上图是一个有3个节点的集群,可以看到主分片和对应的复制分片都不会在同一个节点内,这样有利于某个节点挂掉了,数据也不至于丢失。  
> 实际上, 一个分片是一个Lucene索引, 一个包含倒排索引的文件目录,倒排索引的结构使得elasticsearch在不扫描全部文档的情况下,就能告诉你哪些文档包含特定的关键字

## 倒排索引

elasticsearch使用的是一种称为倒排索引的结构,采用Lucene倒排索作为底层。这种结构适用于快速的全文搜索，一个索引由文档中**所有不重复的列表**构成,对于每一个词,都有一个包含它的文档列表。 例如,现在有两个文档，每个文档包含如下内容:

```
Study every day， good good up to forever  # 文档1包含的内容
To forever, study every day，good good up  # 文档2包含的内容
```

为为创建倒排索引,我们首先要将每个文档拆分成独立的词\(或称为词条或者tokens\) ,然后创建一个包含所有不重复的词条的排序列表,然后列出每个词条出现在哪个文档:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201103105519259.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

现在，我们试图搜索 to forever，只需要查看包含每个词条的文档

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201103105640651.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
两个文档都匹配,但是第一个文档比第二个匹配程度更高。如果没有别的条件,现在,这两个包含关键字的文档都将返回。

---

再来看一个示例,比如我们通过博客标签来搜索博客文章。那么倒排索引列表就是这样的一个结构:

| 博客文章\(原始数据\) | 博客文章\(原始数据\) | 索引列表\(倒排索引\) | 索引列表\(倒排索引\) |
| --- | --- | --- | --- |
| 博客文章ID | 标签 | 标签 | 博客文章ID |
| 1 | python | python | 1，2，3 |
| 2 | python | linux | 3，4 |
| 3 | linux，python |  |  |
| 4 | linux |  |  |

> 如果要搜索含有python标签的文章,那相对于查找所有原始数据而言，查找倒排索引后的数据将会快的多。只需要查看标签这一栏,然后获取相关的文章ID即可。完全过滤掉无关的所有数据,提高效率\!

> **elasticsearch的索引和Lucene的索引对比**  
> 在elasticsearch中，索引\(库\)这个词被频繁使用,这就是术语的使用。在elasticsearch中 ,索引被分为多个分片,每份分片是一个Lucene的索引。所以一个elasticsearch索引是由多 个Lucene索引组成的。