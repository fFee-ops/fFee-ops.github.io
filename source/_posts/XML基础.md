---
title: XML基础
date: 2020-09-14 09:53:33
tags: 
categories: JavaWeb
---

<!--more-->

### XML基础

- [概述](#_2)
- [XML语法](#XML_55)

# 概述

XML是Extensible Markup Language 的缩写，是一种类似于HTML的标记语言，称为可扩展标记语言。所谓的可扩展就是指用户可以按照一定的规则自定义标记。

**city.xml：**

```xml
<?xml version="1.0"  encoding="UTF-8"?>
<中国>
	<河北>
		<城市>张家口</城市>
		<城市>石家庄</城市>
	</河北>
</中国>
```

**xml与html比较**

<table width="898" cellspacing="1" cellpadding="1" border="1"><tbody><tr><td><font face="KaiTi_GB2312">比较内容<strong></strong><br></font></td><td><strong>html</strong></td><td><strong>xml</strong></td></tr><tr><td><strong>设计目标</strong></td><td>显示数据，如何更好地显示数据，焦点是数据外观</td><td>描述数据，什么是数据，如何存放数据，焦点是数据的内容</td></tr><tr><td><strong>语法</strong></td><td>不要求标记的嵌套、配对等；<br>不区分大小写<br>引号是可用可不用的；<br>可以拥有不带值的属性名；<br>过滤掉空格；<br></td><td>严格要求嵌套、配对，并遵循DTD的树形结构；<br>区分大小写；<br>属性值必须分装在引号中；<br>所有的属性都必须带有相应的值；<br>空白部分不会被解析器自动删除；<br>xml比html 语法要求更严格<br></td></tr><tr><td><strong>数据和显示的关系</strong></td><td>内容描述与显示方式整合为一体</td><td>内容描述与显示方式分离</td></tr><tr><td><strong>标签</strong></td><td>预定义</td><td>免费、自定义、可扩展</td></tr><tr><td><strong>可读性及可维护性</strong></td><td>难于阅读、维护</td><td>结构清晰、便于阅读、维护</td></tr><tr><td><strong>结构描述</strong></td><td>不支持深层的结构描述</td><td>文件结构嵌套可以复杂到任何程度</td></tr><tr><td><strong>与数据库的关系</strong></td><td>没有直接联系</td><td>与关系型和层状数据库均可对应和转换</td></tr><tr><td><strong>超链接</strong></td><td>单文件、书签链接</td><td>可以定义双向链接、多目标链接、扩展链接<br></td></tr></tbody></table>

# XML语法

**①XML 声明文件的可选部分，如果存在需要放在文档的第一行**，如下所示：

```xml
<?xml version="1.0"  encoding="UTF-8"  standalone="yes"?>
```

第一个？与xml之间不能有空格！

上述代码中。version代表XML版本，encoding代表编码方式。  
Standalone声明这个文档是否为独立文档，默认情况它的值为no，表示文档依赖于外部文档。

**②所有的 XML 元素都必须有一个关闭标签**

**③XML 标签对大小写敏感**

```xml
<Message>这是错误的</message>
<message>这是正确的</message>
```

**④XML 属性值必须加引号**

```xml
<note date=12/11/2007>错误
<note date="12/11/2007">正确
```

**⑤实体引用**  
在 XML 中，一些字符拥有特殊的意义。

如果把字符 “\<” 放在 XML 元素中，会发生错误，这是因为解析器会把它当作新元素的开始。

```xml
<message>if salary < 1000 then</message>
```

**为了避免这个错误，请用实体引用来代替 “\<” 字符：**

```xml
<message>if salary &lt; 1000 then</message>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200914095235104.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**⑥在 XML 中，空格会被保留**  
HTML 会把多个连续的空格字符裁减（合并）为一个在 XML 中，文档中的空格不会被删减。