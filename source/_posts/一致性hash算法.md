---
title: 一致性hash算法
date: 2021-08-16 11:26:57
tags: 
categories: 数据结构与算法
---

<!--more-->

### 一致性hash算法

- [前置场景](#_2)
- - [出现的问题](#_5)
- [一致性hash算法](#hash_12)
- - [优点](#_24)
  - [hash环的偏斜](#hash_28)

# 前置场景

在没有一致性hash算法之前，我们会遇到这种场景，假如现在有三张图片，要均匀的存放在三台缓存服务器上去，那么我们会以图片名为key进行hash运算，再对结果取余。也就是`hash（图片名称）% N` n就是服务器台数。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7c96ee51b23444fca5a53fa271d9df03.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 出现的问题

问题1：当缓存服务器数量发生变化时，会引起缓存的雪崩，可能会引起整体系统压力过大而崩溃（大量缓存同一时间失效）。

问题2：当缓存服务器数量发生变化时，几乎所有缓存的位置都会发生改变，怎样才能尽量减少受影响的缓存呢？

# 一致性hash算法

一致性哈希算法也是使用取模的方法，只是，刚才描述的取模法是对服务器的数量进行取模，而一致性哈希算法是对2\^32取模。  
把二的三十二次方想象成一个圆，就像钟表一样，钟表的圆可以理解成由60个点组成的圆，而此处我们把这个圆想象成由2\^32个点组成的圆，这个圆我们也叫`hash`环  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b07dfc28b4064d358b5e2d9037ce45c4.png)

现在的步骤变为：  
1.`hash（服务器A的IP地址） % 2^32`找到服务器A在环上的位置，b/c同理  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1bfd776ef8d44b5f8317d3171f62b9b3.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
2\. 仍然使用图片的名称作为找到图片的key，通过`hash（图片名称） % 2^32`把图片也映射到环上，则从环上图片位置出发，顺时针遇到的第一台服务器就是该图片被存放的服务器。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/25af34b8e015497a8596eb85c17e73a9.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 优点

假如b服务器挂了，那么就只会变动3号图片的位置，其余不会动。这样就能保证高可用。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fa37c4bb94204cec993997fd1509b74a.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## hash环的偏斜

即服务器分布不均匀。大部分图片被缓存到同一台服务器  
![在这里插入图片描述](https://img-blog.csdnimg.cn/780e6fdef64a4b9da037022cbae98b3b.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**解决：虚拟节点**  
既然因为数量不多导致不均匀，就添加虚拟节点让它尽量均匀。  
将现有的物理节点通过虚拟的方法复制出来，这些由实际节点虚拟复制而来的节点被称为”虚拟节点”。加入虚拟节点以后的hash环如下。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b29c8af2a60e4c2ba8faa0f3712f7870.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
“虚拟节点”是”实际节点”（实际的物理服务器）在hash环上的复制品,一个实际节点可以对应多个虚拟节点。

> 就是对每一个服务器节点计算多个哈希值，在每个计算结果位置上，都放置一个虚拟 节点，并将虚拟节点映射到实际节点。10台服务器大概要100-200个虚拟节点