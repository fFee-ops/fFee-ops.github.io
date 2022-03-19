---
title: 'Java8新特性之双冒号（::）'
date: 2022-03-13 21:05:53
tags:
password:
categories: java
---

# 定义
双冒号运算操作符是类方法的句柄，lambda表达式的一种简写。双冒号（::）运算符在Java 8中被用作**方法引用（method reference）**，方法引用是与lambda表达式相关的一个重要特性。
大概意思就是，使用lambda表达式会创建匿名函数， 但有时候需要使用一个lambda表达式只调用一个已经存在的方法（不做其它）， 所以这才有了方法引用！


# 使用
## 使用场景
![在这里插入图片描述](https://img-blog.csdnimg.cn/f6f1daeafec342b5966d39e177c5c93c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 案例详解
**①引用静态方法**
```java
public class Colon{
    @Test
    public void test(){
        List<String> list = Arrays.asList("a","b","c");
        //静态方法引用  ClassName::methodName
        list.forEach(Colon::print);
        //上一行等价于
        //list.forEach((x)->Colon.print(x));
    }
    //静态方法
    public static void print(String s){
        System.out.println(s);
    }
}
```

**②引用特定对象实例方法**
```java
public class Colon{
    @Test
    public void test(){
        List<String> list = Arrays.asList("a","b","c");
        //实例方法引用  instanceRef::methodName
        list.forEach(new Colon()::print);
        //上一行等价于
        //list.forEach((x)->new Colon().print(x));
    }
    //实例方法
    public void print(String s){
        System.out.println(s);
    }
}
```


**③引用特定类型的任意对象的实例方法**
```java
public class Colon{
    @Test
    public void test(){
        String[] arr = { "Barbara", "James", "Mary", "John",
                "Patricia", "Robert", "Michael", "Linda" };
        //引用String类型的任意对象的compareToIgnoreCase方法实现忽略大小写排序
        Arrays.sort(arr, String::compareToIgnoreCase);
        //上一行等价于
        //Arrays.sort(arr, (a,b)->a.compareToIgnoreCase(b));
        //输出
        for(String s:arr){
            System.out.println(s);
        }
    }
}
```

**④引用超类（父类）实例方法**
```java
public class Colon extends BaseColon{
    @Test
    public void test(){
        List<String> list = Arrays.asList("a","b","c");
        //实例方法引用  instanceRef::methodName
        list.forEach(super::print);
    }
}
class BaseColon{
    //实例方法
    public void print(String s){
        System.out.println(s);
    }
}
```

**⑤引用类构造方法**
```java
public class Example {
	
	private String name;
	
	Example(String name){
		this.name = name;
	}
	
	public static void main(String[] args) {
		InterfaceExample com =  Example::new;
		Example bean = com.create("hello world");
		System.out.println(bean.name);
	}
}
interface InterfaceExample{
	Example create(String name);
}
```


**⑥引用数组构造方法**
```java
public class Colon{
 
    public static void main(String[] args) {
        Function<Integer,Colon[]> function = Colon[]::new;
        //调用apply方法创建数组，这里的5是数组的长度
        Colon[] arr = function.apply(5);
        //循环输出-初始都为null
        for(Colon c:arr){
            System.out.println(c);
        }
    }
}
```

# 总结
双冒号(::)运算操作符使用方式，在一定程度上简化了我们Java开发的冗余代码，但也增加了我们的Java学习难度，如果你无法理解此种用法，最好不使用