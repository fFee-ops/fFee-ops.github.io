---
title: hexo部署，只能本地搜索
date: 2020-11-14 22:04:46
tags: 
categories: 踩坑
---

<!--more-->

用hexo搭建博客，**hexo-generator-search** 作为  
搜索插件，然后发现只能在自己的电脑上用搜索功能，换别人的电脑或者手机都不行，报下面的错误  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201114220009107.png#pic_center)  
**原因：** http不能直接访问https

**解决：** 部署的时候用https  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201114220149690.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)