---
title: GC日志分析
date: 2020-09-30 10:15:58
tags: 
categories: JVM底层原理
---

<!--more-->

### GC日志分析

- [打开GC日志：](#GC_7)
- [一些补充说明](#_31)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930094811623.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 打开GC日志：

**①**

```shell
-verbose:gc
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930095153484.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930095224154.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**②**

```shell
-verbose:gc   -XX:+PrintGCDetails
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930100613920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
**③**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930100757258.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

**如果想把GC日志存到文件，使用：**

```shell
-Xloggc:/path/to/gc.log
```

# 一些补充说明

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020093010094448.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020093010102895.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930101413122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930101505307.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200930101521430.png#pic_center)