---
title: jvisualvm插件安装失败
date: 2020-09-17 21:13:01
tags: 
categories: 踩坑
---

<!--more-->

### 记jvisualvm插件安装失败。

- [解决方法：](#_1)

# 解决方法：

**此处以安装GC插件为例**  
1、找到[新的更新地址](https://visualvm.github.io/pluginscenters.html)

2、进入“Plugins”，找到对应自己JDK版本的更新地址  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200917210753752.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

3、进入jvisualvm的插件管理

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200917210937985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

4、在"设置"中修改url地址为刚才我们在github上找到的对应我们JDK版本的地址  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200917211038375.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

5、再去插件中心下载插件  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020091721112331.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

6、成功  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200917211255923.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**注意：有的插件是有依赖关系的，你如果没有先把这个插件依赖的插件安装好，jvisualvm还是会去联网下载，结果肯定是失败。所以，你要先把依赖提前安装好。**