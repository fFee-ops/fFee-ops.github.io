---
title: RequestMapping映射及其属性
date: 2020-04-26 13:33:34
tags: 
categories: SpringMVC
---

<!--more-->

### Ttile

- [属性](#_1)
- [ant风格的请求路径](#ant_40)
- [通过\@PathVariable获取动态参数](#PathVariable_57)

# 属性

设置name="xxxx"的情况：

```java
@Controller
public class MvcController {
	
	@RequestMapping(value = "welcome",method = RequestMethod.POST,params = {"name","age!=23"})
	public String welcome() {
		
		return "successe";
	}
		}	
```

↓

```html

<form action="welcome" method="post">
<input type="text"><br>
<input name="name" placeholder="姓名"><br>
<input name="age" placeholder="年龄"><br>
<input type="submit" value="提交">

</form>
```

```
params = {"name","age!=23"}

"name"：
必须有参数为name的属性
age!=23 :   
	 a.如果有name="age"，则age值不能是23
	 b.没有age
params = {"name=zs"}
必须有name属性，并且值必须为zs
```

# ant风格的请求路径

```
?  单字符
*  任意个字符（0或多个）
** 任意目录
```

```java
@RequestMapping("welcome2/*/ll/a?c")
	public String welcome2() {
		
		return "successe";
	}
```

↓

```html
<a href="welcome2/lww/ll/abc"> 欢迎点击 2</a>
```

# 通过\@PathVariable获取动态参数

```html
<a href="welcome3/zs">传递姓名</a>
```

```java
@RequestMapping("welcome3/{name}")
	public String welcome3(@PathVariable("name") String name) {
		System.out.println(name);
		return "successe";
	}
```