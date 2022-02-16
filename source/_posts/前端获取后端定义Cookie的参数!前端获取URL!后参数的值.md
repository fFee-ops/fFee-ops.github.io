---
title: 前端获取后端定义Cookie的参数|前端获取URL?后参数的值
date: 2020-06-03 21:42:07
tags: 
categories: JavaWeb
---

<!--more-->

```javascript
		//获取cookie中的参数
		function getCookiesPbyName(s) {
			var strcookie = document.cookie;
			strcookie = strcookie.replace(/\ +/g, "");
			strcookie = strcookie.replace(/[\r\n]/g, "");
			var arrcookie = strcookie.split(";");//分割
			for (var i = 0; i < arrcookie.length; i++) {
				var arr = arrcookie[i].split("=");
				if (arr[0] == s) {
					return arr[1];
				}
			}
			return "";
		}
```

---

```javascript
//获取url某个参数
	function getUrlPByName(s) {
		var url_ = location.href;
		url_ = url_.replace(/\ +/g, "");
		url_ = url_.replace(/[\r\n]/g, "");
		//console.log(strcookie);
		var urlArr = url_.split("?"); //分割
		if (urlArr.length > 1) {
			var ParaArr = urlArr[1].split("&");
			//遍历匹配
			for (var i = 0; i < ParaArr.length; i++) {
				var arr = ParaArr[i].split("=");
				if (arr[0] == s) {
					return arr[1];
				}
			}
			return "";
		} else {
			return "";
		}
	}
```