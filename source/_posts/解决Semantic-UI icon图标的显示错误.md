---
title: 解决Semantic-UI icon图标的显示错误
date: 2020-06-02 23:56:20
tags: 
categories: 前端
---

<!--more-->

在使用Semantic-UI写前端的时候，我注意到icon并不能正常地渲染出来。  
在搜索许久之后我在StackOverflow找到了这个解决方法，故分享给大家：

```html
<link rel='stylesheet prefetch' href='https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/components/icon.min.css'>
```