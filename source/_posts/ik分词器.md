---
title: ik分词器
date: 2020-11-03 11:12:06
tags: 
categories: ElasticSearch
---

<!--more-->

### ik分词器

**分词:** 即把一段中文或者别的划分成一个个的关键字,我们在搜索时候会把自己的信息进行分词,会把数据库中或者索引库中的数据进行分词,然后进行一个匹配操作。

默认的中文分词是将每个字看成一个词,比如“好好学习”会被分为"好",“好”,“学”,“习” ,这显然是不符合要求的,所以我们需要安装中文分词器ik来解决这个问题。

**如果要使用中文,建议使用ik分词器\!**

IK提供了两个分词算法: ik\_ smart和ik\_ max\_ word ,其中ik\_ smart为最少切分, ik\_ max\_ \_word为最细粒度划分\!

**【ik\_smart】测试：**

```json
GET _analyze
{
  "analyzer": "ik_smart",
  "text": "我是社会主义接班人"
}

//输出
{
  "tokens" : [
    {
      "token" : "我",
      "start_offset" : 0,
      "end_offset" : 1,
      "type" : "CN_CHAR",
      "position" : 0
    },
    {
      "token" : "是",
      "start_offset" : 1,
      "end_offset" : 2,
      "type" : "CN_CHAR",
      "position" : 1
    },
    {
      "token" : "社会主义",
      "start_offset" : 2,
      "end_offset" : 6,
      "type" : "CN_WORD",
      "position" : 2
    },
    {
      "token" : "接班人",
      "start_offset" : 6,
      "end_offset" : 9,
      "type" : "CN_WORD",
      "position" : 3
    }
  ]
}
```

**【ik\_max\_word】测试：**

```json
GET _analyze
{
  "analyzer": "ik_max_word",
  "text": "我是社会主义接班人"
}
//输出
{
  "tokens" : [
    {
      "token" : "我",
      "start_offset" : 0,
      "end_offset" : 1,
      "type" : "CN_CHAR",
      "position" : 0
    },
    {
      "token" : "是",
      "start_offset" : 1,
      "end_offset" : 2,
      "type" : "CN_CHAR",
      "position" : 1
    },
    {
      "token" : "社会主义",
      "start_offset" : 2,
      "end_offset" : 6,
      "type" : "CN_WORD",
      "position" : 2
    },
    {
      "token" : "社会",
      "start_offset" : 2,
      "end_offset" : 4,
      "type" : "CN_WORD",
      "position" : 3
    },
    {
      "token" : "主义",
      "start_offset" : 4,
      "end_offset" : 6,
      "type" : "CN_WORD",
      "position" : 4
    },
    {
      "token" : "接班人",
      "start_offset" : 6,
      "end_offset" : 9,
      "type" : "CN_WORD",
      "position" : 5
    },
    {
      "token" : "接班",
      "start_offset" : 6,
      "end_offset" : 8,
      "type" : "CN_WORD",
      "position" : 6
    },
    {
      "token" : "人",
      "start_offset" : 8,
      "end_offset" : 9,
      "type" : "CN_CHAR",
      "position" : 7
    }
  ]
}
```