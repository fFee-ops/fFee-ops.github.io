---
title: hexo部署在github并且通过自己的域名访问
date: 2022-01-21 21:48:06
tags:
password:
categories: 杂
---

# 步骤
**默认已经可以通过`xxxx.github.io`访问到页面了**

1、来到域名解析页面，点击解析设置
![在这里插入图片描述](https://img-blog.csdnimg.cn/387cd4ca08014f62aa81f2dd9c8d9c8b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
2、添加两条如下记录。
![在这里插入图片描述](https://img-blog.csdnimg.cn/dcf65386a7fe4780a76fe9d810711c36.png)
`@`对应的ip获得方法：cmd中去ping：`xxx.github.io`
![在这里插入图片描述](https://img-blog.csdnimg.cn/bc135e8a051a45a383c96c8fb2cc4942.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
3、去你hexo博客的source目录下新建一个CNAME文件（注意不要有文件扩展名），内容为你的域名。
（比如我的域名 xxx.top）
![在这里插入图片描述](https://img-blog.csdnimg.cn/221416a72a1949f3af57b91bfe81c53a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

4、再重新部署hexo，就可以访问`www.xx.top`来到hexo页面了。