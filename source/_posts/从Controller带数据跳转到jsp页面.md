---
title: 从Controller带数据跳转到jsp页面
date: 2020-04-28 13:57:00
tags: 
categories: SpringMVC
---

<!--more-->

### Titile

- [用ModelAndView实现](#ModelAndView_1)
- [用ModelMap实现](#ModelMap_25)
- [用Map或Model实现](#MapModel_46)
- [将上述数据放入session中](#session_80)
- [\@ModelAttribute 详解](#ModelAttribute__100)

# 用ModelAndView实现

前端：

```
<a href="testModelAndView">testModelAndView</a>
```

控制器:

```java

		@RequestMapping(value = "testModelAndView")
		public ModelAndView testModelAndView() {
			ModelAndView mv=new ModelAndView("successe");//这里面就是View
			Student student=new Student();
			student.setId(1);
			student.setName("张三");
			mv.addObject("student",student);//相当于request.setAttribute("student",student)
		return mv;
		} 
```

在success.jsp页面接收：

```html

 	${requestScope.student.id }=====${requestScope.student.name }
```

# 用ModelMap实现

前端：

```
<a href="testModelMap">testModelMap</a>
```

控制器:

```java

		@RequestMapping(value = "testModelMap")
		public String testModelMap(ModelMap mm) {
			Student student=new Student();
			student.setId(2);
			student.setName("张三");
			mm.put("student2",student);//相当于放在request域
			return "successe";
		} 
```

在success.jsp页面接收：

```html
 	${requestScope.student2.id }=====${requestScope.student2.name }<br>
```

# 用Map或Model实现

前端：

```
<a href="testMap">testMap</a>
<br>
<a href="testModel">testModel</a>
```

控制器:

```java
		@RequestMapping(value = "testMap")
		public String testMap(Map<String, Object> m) {
			Student student=new Student();
			student.setId(3);
			student.setName("张三");
			m.put("student3",student);//相当于放在request域
			return "successe";
		} 
		
		@RequestMapping(value = "testModel")
		public String testModel(Model model) {
			Student student=new Student();
			student.setId(4);
			student.setName("张三");
			model.addAttribute("student4",student);//相当于放在request域
			return "successe";
		}
```

在success.jsp页面接收：

```html
<body>
	${requestScope.student3.id }=====${requestScope.student3.name }<br>
 	${requestScope.student4.id }=====${requestScope.student4.name }<br>
 	<body/>
```

# 将上述数据放入session中

```java
//@SessionAttributes("student4")//如果该对象被放入了request域中那么session中也会放一份
@SessionAttributes(types = Student.class)
@Controller
public class MvcController {
....注意要用该注解，那么前提是必须用上面的四种方法其中之一，将数据先放
入request域中。
}
```

success.jsp页面接收：

```html
 	${sessionScope.student.id }=====${sessionScope.student.name }<br>
 	${sessionScope.student2.id }=====${sessionScope.student2.name }<br>
 	${sessionScope.student3.id }=====${sessionScope.student3.name }<br>
 	${sessionScope.student4.id }=====${sessionScope.student4.name }<br>
```

# \@ModelAttribute 详解

用\@ModelAttribute 模拟修改学生姓名

前端：

```html
<form action="testModelAttribute">
<input name="id" type="hidden" value="23">
<input name="name" type="text" placeholder="姓名">
<input type="submit" value="修改">
</form>
```

控制器：

```java
	
		@ModelAttribute//在任何一次请求前都会先执行该方法
		public void queryStudentById(Map<String, Object> map) {
			//模拟三层进行查询
			Student student=new Student();
			student.setId(23);
			student.setName("大张伟");//修改前的姓名
			map.put("student", student);//约定：map的key就是testUpdate方法中(Student stu）的Student首字母小写，与stu无关
			//map.put的作用就是将查询到的学生传递到修改方法去，确保修改的学生是查询到的那个
		}
		
		
		//修改  大张伟--->ls
		@RequestMapping(value = "testModelAttribute")
		public String ModelAttribute(Student stu) {
			stu.setName("ls");
			System.out.println(stu.getId()+","+stu.getName());
			return "successe";
		} 
```

\@ModelAttribute  
i.经常在 更新时使用  
ii.在不改变原有代码的基础之上，插入一个新方法。  
**map.put的作用就是将查询到的学生传递到修改方法去，确保修改的学生是查询到的那个**  
**必须满足的约定：  
map.put\(k,v\) 其中的k 必须是即将查询的方法参数 的首字母小写  
testModelAttribute\(Student xxx\) ，即student；**