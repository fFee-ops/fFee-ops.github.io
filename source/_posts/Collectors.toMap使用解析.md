---
title: Collectors.toMap使用解析
date: 2022-03-29 17:46:13
tags: redis java postman
categories: java
---

<!--more-->

# 背景

之前我们可能会遇到一些把**List 转 Map 操作，在过去我们可能使用的是 for 循环遍历的方式。**

例如：

```java
Map<String, String> map = new HashMap<>();
for (User user : userList) {
    map.put(user.getId(), user.getName());
}
```

在java8之后我们就可以用stream来操作集合了。

# 使用

在上面的例子，假如用stream流新特性来做就一行代码

```java
userList.stream().collect(Collectors.toMap(User::getId, User::getName));
```

如果希望得到 Map 的 value 为对象本身时，可以这样写：

```java
userList.stream().collect(Collectors.toMap(User::getId, Function.identity()));
```

> **Function.identity\(\)**  
> 返回一个输出跟输入一样的Lambda表达式对象，等价于形如`t \-> t`形式的Lambda表达式。

# 参数解析

Collectors.toMap 有三个重载方法：

```java
toMap(Function<? super T, ? extends K> keyMapper, Function<? super T, ? extends U> valueMapper);
toMap(Function<? super T, ? extends K> keyMapper, Function<? super T, ? extends U> valueMapper,
        BinaryOperator<U> mergeFunction);
toMap(Function<? super T, ? extends K> keyMapper, Function<? super T, ? extends U> valueMapper,
        BinaryOperator<U> mergeFunction, Supplier<M> mapSupplier);
```

参数含义

```java
keyMapper：Key 的映射函数

valueMapper：Value 的映射函数

mergeFunction：当 Key 冲突时，调用的合并方法

mapSupplier：Map 构造器，在需要返回特定的 Map 时使用
```