---
title: JS中设置window.location.href跳转无效(在a标签里或这form表单里)
date: 2020-06-03 22:48:01
tags: 
categories: 前端
---

<!--more-->

### 文章目录

  
代码如下：

```html
 <li><a href="myblog.html" onclick="checkLogin()">博客管理</a></li>
```

```js
 function checkLogin() {
        var user_id=getCookiesPbyName("user_id");
        if (user_id == null || user_id == ""){
            alert("该页面需登陆以进入！");
            window.location.href = "login.html";
            window.event.returnValue=false;
        }
    }
```

原因：  
a标签的href跳转会执行在window.location.href设置的跳转之前:

如果是表单form的话 也会先执行form提交。

提交之后 就已经不在当前页面了。所以window.location.href无效。

解决：

**方法一：**  
在js函数中加上

```js
window.event.returnValue=false
```

这个属性放到提交表单中的onclick事件中在这次点击事件不会提交表单，如果放到超链接中则在这次点击事件不执行超链接href属性。

---

修改后的代码：

```js
 function checkLogin() {
        var user_id=getCookiesPbyName("user_id");
        if (user_id == null || user_id == ""){
            alert("该页面需登陆以进入！");
            window.location.href = "login.html";
            window.event.returnValue=false;
        }
    }
```

**方法二：**  
点击事件中 οnclick=“checkLogin\(\)” 变成οnclick=“return checkLogin\(\);”

并且在checkLogin中 return false;这样的话 a标签的href也不会执行。 这样就能window.location.href顺利跳转。

代码如下：

```html
 <li><a href="myblog.html" onclick="return checkLogin()">博客管理</a></li>
```

```js
<script type="text/javascript">
    function checkLogin() {
        var user_id=getCookiesPbyName("user_id");
        if (user_id == null || user_id == ""){
            alert("该页面需登陆以进入！");
            window.location.href = "login.html";
           return false;
        }
    }
  </script>
```