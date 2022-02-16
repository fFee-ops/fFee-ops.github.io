---
title: java中的Pair
date: 2020-12-02 22:53:33
tags: 
categories: java
---

<!--more-->

# Pair

今天刷题遇到了Pair,以前没遇到过，在这里记录一下

**简介**  
配对\(Pair\)。配对提供了一种方便方式来处理简单的键值关联，当我们想从方法返回两个值时特别有用。

Pair类在javafx.util 包中，类构造函数有两个参数，键及对应值：

```java
    Pair<Integer, String> pair = new Pair<>(1, "One");
    Integer key = pair.getKey();
    String value = pair.getValue();
```

**作用**  
平常我们在想取出一个二维数组的下标的时候可能比较麻烦。  
比如`T[0][1]`。我们想取出值很简单，但是要取出`0,1`就比较麻烦。当用了Pair之后，可以直接`Pair<Integer, Integer> poll =T`,  
然后`poll.getKey()，poll.getvalue()`