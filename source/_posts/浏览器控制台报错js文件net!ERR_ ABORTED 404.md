---
title: 浏览器控制台报错js文件net::ERR_ ABORTED 404
date: 2020-11-03 16:31:45
tags: 
categories: 踩坑
---

<!--more-->

今天引入了一个axios.min.js，路径绝对没问题。然后无论是重启idea，还是重新构建项目，都显示  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020110316303769.png#pic_center)

---

**经过排查检查target目录，发现目录下没有该js文件**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201103163126127.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
**解决：删除target目录，重新启动项目，js文件即可发布至target目录下**