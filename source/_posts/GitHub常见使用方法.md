---
title: GitHub常见使用方法
date: 2021-01-05 19:36:00
tags: 
categories: Git
---

<!--more-->

### GitHub常见使用方法

- [常用词含义](#_2)
- [in关键词限制搜索范围](#in_8)
- [stars或fork数量关键词去查找](#starsfork_17)
- [awesome加强搜索](#awesome_26)
- [高亮显示某一行代码](#_30)
- [项目内搜索](#_37)
- [搜索某个地区内大佬](#_40)

# 常用词含义

watch：会持续收到该项目的动态  
fork：复制某个项目到自己的GitHub仓库  
star：点赞  
clone：将项目下载至本地  
follow：关注作者

# in关键词限制搜索范围

**公式：xxx关键词 in:name或description或readme**  
xxx in:name 项目名包含xxx  
xxx in:description 项目描述包含xxx  
xxx in:readme 项目的readme文件包含xxx

**组合使用**  
例如搜索项目名或readme中包含秒杀的项目，`seckill in:name,readme`

# stars或fork数量关键词去查找

**公式：xxx关键词 stars 通配符`:> 或 :>=`、区间范围数据`数字1..数字2`**

查找stars数大于等于5000的springboot项目：`springboot stars:>=5000`  
查找forks数大于500的springcloud项目：`springcloud forks:>500`

**组合使用**  
查找fork在100到200之间并且star数在80到100之间的springboot项目：`springboot forks:100..200 stars 80..100`

# awesome加强搜索

**公式：awesome关键字（awesome系列，一般是用来收集学习、工具、书籍等相关的项目）**  
搜索优秀的redis相关项目，包括框架、教程等：`awesome redis`

# 高亮显示某一行代码

在查看该代码的页面的URL中：  
要高亮一行：`地址后面紧跟#L数字`  
高亮多行：`地址后面紧跟#L数字-L数字2`

# 项目内搜索

在该仓库页面按下小写的`t`就可以开始搜索了

# 搜索某个地区内大佬

`location:地区 加上language:语言`

北京地区java用户：`location:beijing language:Java`