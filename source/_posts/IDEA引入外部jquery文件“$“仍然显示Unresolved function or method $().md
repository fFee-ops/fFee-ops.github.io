---
title: IDEA引入外部jquery文件“$“仍然显示Unresolved function or method $()
date: 2020-07-22 15:46:16
tags: 
categories: 踩坑
---

<!--more-->

**问题：**

今天准备写一个新的测试页面，然后从外部引入jQuery文件。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200722153943264.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200722153951870.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

但是当我去写jQuery语法时候，"\$"仍然显示Unresolved function or method \$\(\)。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200722154024736.png)

---

**原因：** 我引入的是jQuery.min文件 所以会出现这个问题。

---

**解决：** 在百度一段时间后，发现大部分都是无脑复制粘贴。。。  
根本无法解决问题。最后在  
[IDEs Support \(IntelliJ Platform\) | JetBrains](https://intellij-support.jetbrains.com/hc/en-us/community/posts/360002260719--jQuery-shortcut-underlined-as-unresolved-function-or-method-)发现了一个类似问题。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200722154459124.png)

大概就是使用缩小的库版本（jquery-3.3.1.min.js）时，类型解析将不起作用。于是遂换成  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200722154550455.png)

问题解决![在这里插入图片描述](https://img-blog.csdnimg.cn/20200722154602106.png)