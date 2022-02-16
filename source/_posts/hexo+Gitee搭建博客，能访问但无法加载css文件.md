---
title: hexo+Gitee搭建博客，能访问但无法加载css文件
date: 2020-11-13 19:36:43
tags: 
categories: 踩坑
---

<!--more-->

今天将hexo搭建的博客部署到码云，然后主题样式可以出来，但是图片出不来  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201113193422291.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
，

**解决：**  
1、修改hexo中 \_config.yml 文件  
2、root 后面写你 github 仓库的名字，**前后斜杠都不能省**！我就是省略了仓库后面的/，导致图片出不来

```yml
url: http://yoursite.com
root: /仓库名/
```

url填这个网站地址  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201113193629572.png#pic_center)