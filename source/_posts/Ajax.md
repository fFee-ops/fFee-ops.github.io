---
title: Ajax
date: 2020-05-07 11:08:41
tags: 
categories: JavaWeb
---

<!--more-->

### Ajax

- [JS方法实现](#JS_6)
- [jquery:推荐](#jquery_40)

Ajax：异步js 和 xml  
异步刷新： 如果网页中某一个地方需要修改，异步刷新可以使：只刷新该需要修改的地方，而页面中其他地方 保持不变。例如：百度搜索框、视频的点赞

# JS方法实现

js: XMLHttpRequest对象

XMLHttpRequest对象的方法：

```
open(方法名(提交方式get|post),服务器地址,true) :与服务端建立连接
send():
	get:	send(null)
	post:	send(参数值)
setRequestHeader(header,value):
	get:不需要设置此方法
	post:需要设置：
		a.如果请求元素中包含了 文件上传:
			setRequestHeader("Content-Type","multipart/form-data");
		b.不包含了 文件上传
			setRequestHeader("Content-Type","application/x-www-form-urlencoded")
```

XMLHttpRequest对象的属性：

```
readyState:请求状态   只有状态为4 代表请求完毕
status:响应状态  只有200 代表响应正常
onreadystatechange:回调函数
responseText：响应格式为String
responseXML：相应格式为XML
```

**请求状态：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200507110236501.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**响应状态：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200507110255575.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# jquery:推荐

```html
$.ajax({
url:服务器地址,
请求方式:get|post,
data:请求数据,
success:function(result,testStatus)
{

},
error:function(xhr,errrorMessage,e){

}


});


$.get(
服务器地址,
请求数据,
function (result){

},
预期返回值类型（string\xml）
);

$.post(
服务器地址,
请求数据,
function (result){

},
	"xml" 或 "json" 或 "text" 
);



$(xxx).load(
服务器地址,
请求数据
);

load:将服务端的返回值  直接加载到$(xxx)所选择的元素中



$.getJSON(
服务器地址,
JSON格式的请求数据,
function (result){

}

);
```