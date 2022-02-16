---
title: Java8之lambda表达式
date: 2020-09-30 22:18:44
tags: 
categories: java
---

<!--more-->

### Java8之lambda表达式

- [lambda表达式](#lambda_2)
- [接口里是否能有实现方法？](#_21)
- [代码](#_36)

# lambda表达式

**什么是Lambda**

> Lambda 是一个匿名函数，我们可以把 Lambda表达式理解为是一段可以传递的代码（将代码像数据一样进行传递）。可以写出更简洁、更灵活的代码。作为一种更紧凑的代码风格，使Java的语言表达能力得到了提升。Lambda 表达式在Java 语言中引入了一个新的语法元素和操作符。这个操作符为 “->” ， 该操作符被称为 Lambda 操作符或剪头操作符。它将 Lambda 分为两个部分：左侧：指定了 Lambda 表达式需要的所有参数 ，右侧：指定了 Lambda 体，即 Lambda 表达式要执行的功能

**要求**  
接口只有一个方法：  
lambda表达式，如果一个接口只有一个方法，我可以把方法名省略

```java
Foo foo = () -> {System.out.println("****hello lambda");};
```

**写法**  
拷贝小括号（），写死右箭头->，落地大括号\{…\}

**函数式接口**  
lambda表达式，必须是函数式接口，必须只有一个方法如果接口只有一个方法java默认它为函数式接口。为了正确使用Lambda表达式，需要给接口加个注解：\@FunctionalInterface。如有两个方法，立刻报错。

# 接口里是否能有实现方法？

**①default方法**  
接口里在java8后容许有接口的实现，default方法默认实现

```java
default int div(int x,int y) {  return x/y; }
```

接口里default方法可以有很多个

**②静态方法实现**  
静态方法实现：接口新增

```java
 public static int sub(int x,int y){  return x-y;}
```

可以有很多个

# 代码

```java
package cduck.cn;

/**
 * 1、口诀：拷贝小括号，写死右箭头，落地大括号
 *
 * 2、@FunctionalInterface 如果接口里面只有一个方法  会默认给这个接口加上这个注解，代表该接口是一个函数式接口
 *
 * 3、JDK8新特性：可以用default来写默认函数，即可以理解为  接口中的方法有了默认实现
 */
@FunctionalInterface
interface Foo{
//    public  void xx();   标准方法 只能有一个，不然Lambda表达式找不到是哪一个。但default 与static方法可以写很多
    public  int add(int x,int y);

    default int div(int x,int y){
        System.out.println("我是新特性嘎嘎嘎");
        return x/y;
    }


    public static  int mv(int x, int y){
        System.out.println("我是静态方法");
        return x*y;
    }
}

public class LambdaLeran {
    public static void main(String[] args) {
//        Foo foo=()->{
//            System.out.println("2323");
//        };
//        foo.xx();


       Foo foo=(x,y)->{
           System.out.println("2321313");
           return  x+y;
       };
        System.out.println( foo.add(3,5));


        System.out.println(foo.div(10,5));

        System.out.println(Foo.mv(2,55));
    }
}

```