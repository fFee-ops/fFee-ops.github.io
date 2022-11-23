---
title: ElasticSearch高阶操作
date: 2022-08-28 14:16:26
tags: elasticsearch 大数据 数据库
categories: ElasticSearch
---

<!--more-->

# 1\. 准备工作

默认数据库有下面这张表

```sql
CREATE TABLE `t_hotel`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '酒店名称',
  `address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '酒店地址',
  `brand` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '品牌',
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '类型',
  `price` int(11) NULL DEFAULT NULL COMMENT '酒店价格',
  `specs` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '规格',
  `salesVolume` int(11) NULL DEFAULT NULL COMMENT '销量',
  `synopsis` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '酒店简介',
  `area` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '区',
  `imageUrl` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '图片路径',
  `createTime` date NULL DEFAULT NULL COMMENT '创建时间',
  `isAd` tinyint(1) NULL DEFAULT 0 COMMENT '是否广告',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 293659 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '酒店信息' ROW_FORMAT = Dynamic;
```

表中有N条数据类似于下面这种

```sql
INSERT INTO `t_hotel` VALUES (1, '北京市东城区七天酒店', '广西壮族自治区北京县东丽郑州路N座 818276', '七天', '酒店', 847, '五星级', 47, '度假天堂', '北京市', 'https://www.hilton.com.cn/file/images/20160923/20160923102144437IHi7uQu_thum_mid.jpg', '2015-10-26', 0);
```

我们通过kibana创建索引结构

```json
PUT hotel {
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "name":{
        "type": "text"
      },
      "address":{
        "type": "text"
      },
      "brand":{
        "type": "keyword"
}, "type":{
        "type": "keyword"
      },
       "price":{
        "type": "integer"
},"specs":{
        "type": "keyword"
      },
       "salesVolume":{
        "type": "integer"
      },
      "area":{
        "type": "text"
      },
      "imageUrl":{
        "type": "text"
      },
      "synopsis":{
        "type": "text"
      },
      "createTime":{
        "type": "date",
        "format": "yyyy-MM-dd"
      },
      "isAd":{
        "type":"integer"
} 
}
}
}

```

然后通过自定义的接口把mysql里的数据导入到ES中去

# 2\. 基础查询

**1\. 查询所有酒店**

```json
GET hotel/_search
{
  "query": {
    "match_all": {}
} 
}
```

**2\. 分页查询酒店列表**

```json
GET hotel/_search
{
  "query": {
    "match_all": {}
  },
  "from": 0,
  "size": 5
}
```

**3\. 分页查询酒店列表**  
wildcard:会对查询条件进行分词。还可以使用通配符 \?\(任意单个字符\) 和 \* \(0个或多个字符\)

```json
GET hotel/_search
{
    "query": {
        "wildcard": {
			"brand": { 
				"value": "美*"
				} 
			}
		} 
	}
```

**4\. 分页查询酒店列表**  
展示出"万豪"品牌下的所有酒店信息  
term:不会对查询条件进行分词

```json
GET hotel/_search
{
  "query": {
    "term": {
"brand": "万豪" }
} }
```

可以看到没有匹配到任何结果，因为term是拿整个词“万豪”进行匹配， 而ES默认保存数据是做单字分 词， 将“万豪”划分为了“万”和“豪”， 所以匹配不到结果。

# 3\. bool查询

**1\. should查询: 只要其中一个为true则成立。**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/95552c905f7146a79c4e2f680ee4eefa.png)  
**2\. must查询: 必须所有条件都成立。**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c2a51b8ec6d447bb80ba22782190aaa2.png)  
**3\. must\_not查询:必须所有条件都不成立。**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/011663780e5441fb85a47a2920f8032b.png)  
**4\. filter过滤查询: 查询品牌为万豪下的酒店**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c1e582d50f374dbda00324b2cea16869.png)

# 4\. 聚合查询操作

统计品牌为万豪的最贵酒店价格，max、min、sum等等。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a0bbe726f9f745efb65b7e30c7811756.png)

# 5\. 分词查询操作

查询出了很多万豪相关的酒店，现在以 北京市东城区万豪酒店 查询name域，可以发现无法查询到结果。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3c6f44d4086b4121b39f766255fe4cf9.png)  
在创建索引时，对于name域，数据类型是 text 。当添加文档时，对于该域的值会进行分词，形成若干 term\(词条\)存储在倒排索引中。

根据倒排索引结构，当查询条件在词条中存在，则会查询到数据。如果词条中没有，则查询不到数  
据。  
那么对于 北京市东城区万豪酒店 的分词结果是什么呢\?  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7c9d0d4f86034aac94ca1795c1fedb28.png)  
此时可以发现，每个字形成了一个词，所以并没有找到相匹配的词，导致无法查询到结果

在ES中内置了很多分词器  
• **Standard Analyzer \- 默认分词器，按英文空格切分**  
• Simple Analyzer \- 按照非字母切分\(符号被过滤\)  
• Stop Analyzer \- 小写处理，停用词过滤\(the,a,is\)  
• Whitespace Analyzer \- 按照空格切分，不转小写  
• Keyword Analyzer \- 不分词，直接将输入当作输出  
• Patter Analyzer \- 正则表达式，默认\\W+\(非字符分割\)  
而我们想要的是，分词器能够智能的将中文按照词义分成若干个有效的词。此时就需要额外安装中文分 词器。 对于中文分词器的类型也有很多，其中首选的是:IK分词器。

# 6\. IK分词器

1、 首先下载[IK分词器](<https://objects.githubusercontent.com/github-production-release-asset-2e65be/2993595/67f5cf00-6acb-11eb-9231-1ed8e1472be3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A/20220828/us-east-1/s3/aws4_request&X-Amz-Date=20220828T055049Z&X-Amz-Expires=300&X-Amz-Signature=677bb03cc03c2b2bacbffe0428e3a57d6b3b3472110c4d88aa63a1e920767509&X-Amz-SignedHeaders=host&actor_id=0&key_id=0&repo_id=2993595&response-content-disposition=attachment; filename=elasticsearch-analysis-ik-7.10.2.zip&response-content-type=application/octet-stream>)

2、 执行安装  
采用本地文件安装方式， 进入ES安装目录， 执行插件安装命令:

```shell
[elsearch@localhost plugins]$../bin/elasticsearch-plugin install
file:///usr/local/elasticsearch-7.10.2/elasticsearch-analysis-ik-7.10.2.zip
```

安装成功后， 会给出对应提示:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7ed1cb86aded4b30bbe168f9421eb982.png)  
3、重启ElasticSearch服务

4、IK分词器最佳运用  
analyzer指定的是构建索引的分词，search\_analyzer指定的是搜索关键字的分词。  
实践运用的时候， 构建索引的时候采用max\_word，将分词最大化; 查询的时候则使用 smartword智能化分词，这样能够最大程度的匹配出结果。  
例如在创建索引的时候指定分词器  
![在这里插入图片描述](https://img-blog.csdnimg.cn/87ecc9beeee848f4a62c7d956bbe6b9c.png)

# 7\. 搜索匹配进阶

**1\. or关系**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2181f645f960445a92e862f2ea68564c.png)  
match搜索实质上就是or关系， 分为”金龙“ 和”金辉“两个关键词进行or关系搜索。

**2\. or关系最小词匹配**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1a342db188904843af53442ab6703a01.png)

这里minimum\_should\_match设定为2， 只要匹配两个字符，即出现"金龙" 和 “金辉”，那么这样 的数据都会展示出来。

**3\. and关系**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f793f1ac5d5549b29e2bee1baeb905f1.png)  
通过operator属性来标识对应的操作。这个时候搜索出来的name会包含"金龙"和"金辉"两个关键 字。

**4\. 短语查询**  
如果想直接搜索某个短语， 比如:金龙 金辉， 可以采用match\_phrase  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d46092c1699b45f4b0d265c94c118aad.png)

**5\. 多字段查询**  
如果想对多个字段同时查询， 可以采用multi\_match方式。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3c86b0ebad40499591a51b7936632732.png)  
同时查询name和address两个属性， 都包含“如心 天津市”的记录， 相比一个属性name的查询， 多出 更多的记录。

# 8\. Query String查询

可以采用更简便的方式，直接使用AND、OR和NOT操作。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4940e00ebcc249a2b03f09cf809d3704.png)