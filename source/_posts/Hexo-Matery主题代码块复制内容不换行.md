---
title: Hexo Matery主题代码块复制内容不换行
date: 2022-01-23 21:07:17
tags:
password:
categories: 踩坑
---

# 问题
在hexo中使用matery主题时，复制代码然后粘贴就会丢失格式。
![在这里插入图片描述](https://img-blog.csdnimg.cn/8f07cc5539014ba0a4976530c07480b4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
粘贴后就会丢失格式
![在这里插入图片描述](https://img-blog.csdnimg.cn/87978c8f7ec44e01890d783c0c37cb5a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

#  解决
修改Matery源代码找到添加copyright的复制版权信息的文件位置`themes\matery\layout\_partial\post-detail.ejs`
![在这里插入图片描述](https://img-blog.csdnimg.cn/93d4695c062d4edd89152cdb31b8fbda.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
修改为`CODE`
![在这里插入图片描述](https://img-blog.csdnimg.cn/2ffb7b22b22b4b4e9c87ea191fd27928.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)