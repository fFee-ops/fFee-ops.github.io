---
title: JQuery中的html() text() val()区别
date: 2020-06-11 20:01:06
tags: 
categories: 前端
---

<!--more-->

### 文章目录

- [html](#html_2)
- [TEXT](#TEXT_32)
- [VAL](#VAL_61)
- [text\(\)和html\(\)的对比](#texthtml_78)

# html

html\(\)： 取得第一个匹配元素的html内容（标签+内容）。  
html\(val\)： 设置每一个匹配元素的html内容，就是将上一步取得的内容全部替换成括号中val。  
注：html\(\)方法可以用于XHTML文档，但不能用于XML文档！  
**html\(\)方法使用在多个元素上时，只读取第一个元素**

```html
<div id="textDiv1">
    <span class="textSpan">我是第一个span</span>
    <span class="textSpan">我是第二个span</span>
    <span class="textSpan">我是第三个span</span>
</div>
```

执行

```js
alert($("#textDiv1").html());
```

结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200611195419270.png)

---

执行

```js
alert($(".textSpan").html());
```

结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200611195459953.png)

# TEXT

text\(\)：取得所有匹配元素的内容（仅包括文本，没有标签）。  
text\(val\)：设置所有匹配元素的文本内容。  
**text\(\)用来读取元素的纯文本内容，包括其后代元素，text\(\)方法不能使用在表单元素上**

```html
<div id="textDiv1">
    <span class="textSpan">我是第一个span</span>
    <span class="textSpan">我是第二个span</span>
    <span class="textSpan">我是第三个span</span>
</div>
```

执行：

```js
alert($("#textDiv1").text());
```

结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200611195620476.png)

---

执行：

```js
alert($(".textSpan").text());
```

结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200611195646339.png)

# VAL

val\(\)：val\(\)常用来操作标准的表单组件对象，如button,text,hidden。  
val\(val\)：设置每一个匹配元素的值。

```html
<select id="selectVal">
    <option value="1" selected="selected">1</option>
    <option value="2" >2</option>
</select>
```

执行：

```js
alert($("#selectVal").val()); //取得值为：1 
```

# text\(\)和html\(\)的对比

```html
<div></div>
```

执行：

```js
$("div").html("<b>Nice to meet you</b>");
-------------------------------------------
$("div").text("<b>Nice to meet you</b>");
```

结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200611200010862.png)