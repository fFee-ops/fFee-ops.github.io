---
title: SpringMVC通过ajax处理json数据
date: 2020-05-01 11:32:41
tags: 
categories: SpringMVC
---

<!--more-->

### T

- [Ajax请求SpringMVC，并且JSON格式的数据](#AjaxSpringMVCJSON_2)
- - [\@ResponseBody](#ResponseBody_59)

# Ajax请求SpringMVC，并且JSON格式的数据

步骤：  
a.  
jar（注意版本，如果版本不兼容会报错）  
jackson-annotations-2.8.9.jar  
jackson-core-2.8.9.jar  
jackson-databind-2.8.9.jar

b.  
前端：

```html
首先用一个按钮来触发该事件
<input type="button" value="testJson" id="testJson">
```

```html
<!--引入Jquery库 -->
<script type="text/javascript" src="js/jquery-1.8.3.js"></script>
<script type="text/javascript">
//通过jquery的方式操作ajax
	$(document).ready(function () {
		$("#testJson").click(function () {
			//通过ajax请求MVC
			$.post(
			 //服务器地址		
			 "testJson",
			 //{"name":"zs"}
			 function (result) {/*服务端处理完毕后的回调函数 ，即后
			 端的students传到这里的result(以json数组的形式)*/
				for (var i = 0; i < result.length; i++) {
					alert(result[i].id+"~~~"+result[i].name);
				}
			}
			);
		});
		
	});

</script>
```

控制器：

```java
		@ResponseBody
		@RequestMapping(value = "testJson")
		public List<Student> testJson() {
			//模拟用三层查询
			Student stu1=new Student(1,"zs");
			Student stu2=new Student(2,"ls");
			Student stu3=new Student(3,"ww");
			
			List<Student> students=new ArrayList<Student>();
			students.add(stu1);
			students.add(stu2);
			students.add(stu3);
			return students;
		} 
```

## \@ResponseBody

i.  
\@ResponseBod修饰的方法，会将该方法的返回值 以一个json数组的形式返回给前台.  
ii.  
\@ResponseBody-告诉SpringMVC，此时的返回 不是一个 View页面，而是一个 ajax调用的返回值（Json数组）