---
title: nginx 原理与优化参数配置
date: 2020-10-11 19:54:56
tags: 
categories: Nginx
---

<!--more-->

### nginx 原理与优化参数配置

  
**1、mater 和 worker**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011194035970.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**2、worker 如何进行工作的**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011194109961.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
**3、一个 master 和多个 woker 有好处**

（1）可以使用 nginx –s reload 热部署，利用 nginx 进行热部署操作  
（2）每个 woker 是独立的进程，如果有其中的一个 woker 出现问题，其他 woker 独立的，继续进行争抢，实现请求过程，不会造成服务中断

**4、设置多少个 woker 合适**  
worker 数和服务器的 cpu 数相等是最为适宜的。设少了会浪费 cpu，设多了会造成 cpu 频繁切换上下文带来的损耗。

> ![在这里插入图片描述](https://img-blog.csdnimg.cn/2020101119455658.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**5、连接数 worker\_connection**  
第一个：发送请求，占用了 woker 的几个连接数？  
答案：2 或者 4 个

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011195450438.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

第二个：nginx 有一个 master，有四个 woker，每个 woker 支持最大的连接数 1024，支持的最大并发数是多少？  
答案：

> √ 普通的静态访问最大并发数是： worker\_connections \* worker\_processes /2，  
>   
> √ 而如果是 HTTP 作 为反向代理来说，最大并发数量应该是 worker\_connections \*worker\_processes/4。