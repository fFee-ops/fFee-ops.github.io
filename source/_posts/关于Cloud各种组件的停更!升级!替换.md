---
title: 关于Cloud各种组件的停更/升级/替换
date: 2020-10-16 13:56:42
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### 关于Cloud各种组件的停更/升级/替换

- [由停更引发的“升级惨案”](#_6)
- - [以前的技术落地实现](#_11)
  - [现在的技术落地实现\(2020\)](#2020_13)

![请添加图片描述](https://img-blog.csdnimg.cn/9b0a0f998d1e41bc90745fa02ee19955.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 由停更引发的“升级惨案”

**停更不停用：**  
只是说已经停更的服务①被动修复bugs②不再接受合并请求③不再发布新版本，但是还是能用的。

## 以前的技术落地实现

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020101613552766.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 现在的技术落地实现\(2020\)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016135544966.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)