---
title: 记 Linux与windos   ping不通的解决
date: 2020-05-06 23:08:06
tags: 
categories: Linux
---

<!--more-->

今天做实验将Centos7的IP地址改为了静态地址，随后发现无法与windows进行ping通。

原因是因为没有更改VMvare的网段，导致windows和CentOS不在同一网段。

首先更改静态IP：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506230343921.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506230434797.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506230446898.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

然后：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506230643536.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

最后测试一下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200506230752746.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

大功告成。