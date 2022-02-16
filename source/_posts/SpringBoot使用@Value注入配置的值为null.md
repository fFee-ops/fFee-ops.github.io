---
title: SpringBoot使用@Value注入配置的值为null
date: 2021-12-16 12:10:52
tags: spring boot spring java
categories: 踩坑
---

<!--more-->

### SpringBoot使用\@Value注入配置的值为null

**原因：** 产生本问题的原因大致可分为四类

1.  不能作用于静态变量（static）；

2.  不能作用于常量（final）;

3.  不能在非注册的类中使用（类需要被注册在spring上下文中，如用\@Service,\@RestController,\@Component等）；

4.  使用这个类时，只能通过依赖注入的方式，用new的方式是不会自动注入这些配置的。

我本人就是犯了第四个错误。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3496e3b366c14258946fbcda480a76fd.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如图所示，我明明把Btest交给spring容器去管理了，但是我还是去new它了。所以就导致了注入无效。

**解决：** 在用到Btest的地方都用`@Autowired`来注入。 修改后的代码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/551a09e863ee43ff9717f5fb7d3fc4a5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**反思：** 还是对某些注解理解的不够深刻。