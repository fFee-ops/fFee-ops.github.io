---
title: hash类型
date: 2022-02-19 18:58:38
tags:
password:
categories: Redis
---

## 介绍
![在这里插入图片描述](https://img-blog.csdnimg.cn/369f77d3083c4a9ea24c2631c9633637.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
hash 类似于 JDK1.8 前的 HashMap，内部实现也差不多(数组 + 链表)。不过，Redis 的hash 做了更多优化。另外，hash 是一个 string 类型的 field 和 value 的映射表，特别适合用于存储对象，后续操作的时候，你可以直接仅仅修改这个对象中的某个字段的值。 比如我们可以 hash数据结构来存储用户信息，商品信息等等。

其实它的结构可以看成  `(K,(K,V))`，只不过val中的K被称为filed

## 常用命令
hset,hmset,hexists,hget,hgetall,hkeys,hvals 等


## 应用场景
系统中**对象**数据的存储。

**1、对象缓存**
```shell
# 模板
HMSET user {userId}:username zhangfei {userId}:password 123456
# 实列
HMSET user 1:username zhangfei 1:password 123456
HMGET user 1:username 1:password
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/7e91ccdc067048a88cbf6eb1c1bbc9d6.png)


**2、电商购物车**
![在这里插入图片描述](https://img-blog.csdnimg.cn/6bddec64907d49868f21c3f46c9c6285.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
1）添加商品 ---> `hset cart:1001 10088 1`
2) 增加数量 ---> `hincrby cart:1001 10088 1`
3） 商品总数 ---> `hlen cart:1001`
4） 删除商品---> `hdel cart:1001 10088`
5）获取购物车所有商品---> `hgetall cart:1001`



## 优缺点
**优点：**
1）同类数据归类整合储存，方便数据管理
2）相比String操作消耗内存和cpu更小
3）相比String储存 更节省空间

**缺点：**
1）过期功能不能使用在field上，只能用在key上
2）Redis集群架构下不适合大规模使用。
因为如果一个hash的key中的属性很多的话，只能存在一个redis节点上，那么这个节点压力会比其他节点压力大很多，造成redis集群下压力分配不均衡！
![在这里插入图片描述](https://img-blog.csdnimg.cn/31552ca4c1174059ad4c2704b9f80acb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)