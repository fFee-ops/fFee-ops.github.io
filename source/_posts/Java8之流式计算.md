---
title: Java8之流式计算
date: 2020-10-08 10:47:22
tags: 
categories: java
---

<!--more-->

### Java8之流式计算

- [函数式接口](#_3)
- - [代码](#_8)
- [Stream流](#Stream_29)
- - [是什么](#_30)
  - [特点](#_35)
  - [如何工作](#_40)
  - [代码](#_47)

# 函数式接口

来自于java.util.function。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201008103614867.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 代码

```java
 public static void testMyInterface() {
        Function<String ,Integer> function=(s)->{return s.length();};
        System.out.println(function.apply("abc"));

        Predicate<String> predicate=(s)->{return s.isEmpty();};
        System.out.println(predicate.test("xxxax"));

        Consumer<String> consumer=(s)->{
            System.out.println(s);
        };
        consumer.accept("safa");

        Supplier<String> supplier=()->{return  "JAVAVAVA";};
        System.out.println(supplier.get());
    }

```

# Stream流

## 是什么

流\(Stream\) 到底是什么呢？  
是数据渠道，用于**操作**数据源（集合、数组等）所生成的元素序列。“集合讲的是数据，流讲的是计算！”

## 特点

1、Stream 自己不会存储元素  
2、Stream 不会改变源对象。相反，他们会返回一个持有结果的新Stream。  
3、Stream 操作是延迟执行的。这意味着他们会等到需要结果的时候才执行。

## 如何工作

**阶段**  
①创建一个Stream：一个数据源（数组、集合）  
②中间操作：一个中间操作，处理数据源数据  
③终止操作：一个终止操作，执行中间操作链，产生结果

## 代码

```java
/**
 * 如果不用lombok插件的话，要实现链式编程 要给set方法加上retun this；
 */
class  User{
private Integer id;
private String userName;
private int age;

    public Integer getId() {
        return id;
    }

    public User setId(Integer id) {
        this.id = id;
        return this;
    }

    public String getUserName() {
        return userName;
    }

    public User setUserName(String userName) {
        this.userName = userName;
        return this;
    }

    public int getAge() {
        return age;
    }

    public User setAge(int age) {
        this.age = age;
        return this;
    }

    public User() {
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", userName='" + userName + '\'' +
                ", age=" + age +
                '}';
    }

    public User(Integer id, String userName, int age) {
        this.id = id;
        this.userName = userName;
        this.age = age;
    }
}


/**
 *请按照给出数据,找出同时满足以下条件的用户,也即以下条件全部满足
 * 偶数ID
 * 且年龄大于24
 * 且用户名转为大写
 * 且用户名字母倒序
 * 只输出一个用户名字
 */

public class SteamDemo {
    public static void main(String[] args) {
        User U1=new User(11,"a",23);
        User U2=new User(12,"b",24);
        User U3=new User(13,"c",22);
        User U4=new User(14,"d",28);
        User U5=new User(16,"e",26);

        List<User> list= Arrays.asList(U1,U2,U3,U4,U5);
//有点类似于sql语句
        list.stream().filter((u)->{return u.getId()%2==0;})
                .filter((u)->{return  u.getAge()>24;})
                .map((m)->{return m.getUserName().toUpperCase();})//用map映射给U1...5每个元素的name转为大写
                .sorted((u1,u2)->{return u2.compareTo(u1);})
                .limit(1)
                .forEach(System.out::println);





        /**
         *
         map  ：映射，下面语句中的作用就是映射list2中的每一个元素，给它们乘以2；
        List<Integer> list2= Arrays.asList(1,2,3);
        list2.stream().map((x)->{return  x*2;}).forEach(System.out::println);
         */
    }


}
```