---
title: NotSafeDemo
date: 2020-10-04 17:15:43
tags: 
categories: JUC
---

<!--more-->

### NotSafeDemo

- [需求](#_1)
- - [线程不安全的错误](#_4)
  - [原理](#_10)
  - [解决方案](#_22)
- [例子](#_66)
- - [ListNotSafe\(\)](#ListNotSafe_67)
  - [SetNotSafe\(\)](#SetNotSafe_134)
  - [MapNotSafe\(\)](#MapNotSafe_167)

# 需求

请举例说明集合类是不安全的

## 线程不安全的错误

> **java.util.ConcurrentModificationException**

ArrayList在迭代的时候如果同时对其进行修改就会抛出并发修改异常.

## 原理

```java

看ArrayList的源码
public boolean add(E e){
        ensureCapacityInternal(size+1);
        Increments modCount!!elementData[size++]=e;
        return true;
        }
   //没有synchronized线程不安全
```

## 解决方案

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201004165633525.png#pic_center)  
**1、Vector**

```java
List<String> list = new Vector<>();
看Vector的源码
public synchronized boolean add(E e){
		modCount++;ensureCapacityHelper(elementCount+1);
        elementData[elementCount++]=e;
        return true;
        }
        //有synchronized线程安全 
```

**2、Collections**

```java
List<String> list = Collections.synchronizedList(new ArrayList<>());

Collections提供了方法synchronizedList保证list是同步线程安全的
```

**3、写时复制**

```java
List<String> list = new CopyOnWriteArrayList<>(); 
看看源码：
    public boolean add(E e) {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            Object[] elements = getArray();
            int len = elements.length;
            Object[] newElements = Arrays.copyOf(elements, len + 1);
            newElements[len] = e;
            setArray(newElements);
            return true;
        } finally {
            lock.unlock();
        }
    }   
```

> CopyOnWrite容器即写时复制的容器。往一个容器添加元素的时候，不直接往当前容器Object\[\]添加，而是先将当前容器Object\[\]进行Copy，复制出一个新的容器Object\[\] newElements，然后向新的容器Object\[\] newElements里添加元素。添加元素后，再将原容器的引用指向新的容器setArray\(newElements\)。  
>   
> 这样做的好处是可以对CopyOnWrite容器进行并发的读，而不需要加锁，因为当前容器不会添加任何元素。所以CopyOnWrite容器也是一种**读写分离**的思想，读和写不同的容器。

# 例子

## ListNotSafe\(\)

```java
package cduck.cn;

/**
 * ArrayList 有序可重复
 * HashSet、HashMap 无序不可重复
 *
 * ”一有则全有，一无则全无“
 */

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CopyOnWriteArraySet;

public class NotSafeDemo {

    public static void main(String[] args) {

    public static void ListNotSafe() {
        /**
         * ArrayList()线程不安全会出现ConcurrentModificationException
         *
         * 解决：1、用Vector<>();  虽然能保证数据一致性，但是访问效率低下
         *      2、Collections.synchronizedList();
         *      3、new CopyOnWriteArrayList();只锁住你的写操作，同时允许别人读
         */
        List<String> list= new CopyOnWriteArrayList();//Collections.synchronizedList(new ArrayList<>());
        /**
         * 看它的源码：
         * public boolean add(E e) {
         *         final ReentrantLock lock = this.lock;
         *         lock.lock();
         *         try {
         *             Object[] elements = getArray();
         *             int len = elements.length;
         *             Object[] newElements = Arrays.copyOf(elements, len + 1);
         *             newElements[len] = e;
         *             setArray(newElements);
         *             return true;
         *         } finally {
         *             lock.unlock();
         *         }
         *     }
         *
         *     相当于有一个签到表，现在有一部分人已经签到了，然后A来了，要签到，他把这个签名表
         *     复制了一份拿走去签名(每次扩容一个位置--就是自己的签名位置👉对应了源码中的“len + 1”)，然后
         *     原版本1.0，就粘贴在墙上可以让别人观看，但是别人不能写。当他写完了,通知下一个人B，B同样Copy一份
         *     1.1版本(A已经签名了的)去写，然后把另一张1.1版本贴在墙上供别人观看。
         *
         */
        for (int i=0;i<30;i++){
            new Thread(()->{
                list.add(UUID.randomUUID().toString().substring(0,8));//给list中加入随机元素
                System.out.println(list);
            },String.valueOf(i)).start();

        }
    }
}


```

## SetNotSafe\(\)

```java
 public static void SetNotSafe() {
        /**
         * 问题同List
         *
         * 解决方法：
         *          1、Collections.synchronizedSet(new HashSet<>());
         *          2、new CopyOnWriteArraySet<>();--JUC下的！
         *
         *
         *HashSet的底层实现是HashMap，但是明明Map是K,V对，是两个值，HashSet是一个值，为什么说底层实现是HashMap呢？
         *
         *  答：先来看HashSet的部分源码
         *              public boolean add(E e) {
         *         return map.put(e, PRESENT)==null;
         *     }
         *     可以看到，HashSet存的是Map的Key，而本该存Value的地方存放的是一个PRESENT常量，所以可以看作是只存了一个K。
         *
         */
        Set<String> set=new CopyOnWriteArraySet<>(); //Collections.synchronizedSet(new HashSet<>());
        for (int i=0;i<30;i++){
            new Thread(()->{
                set.add(UUID.randomUUID().toString().substring(0,8));//给set中加入随机元素
                System.out.println(set);
            },String.valueOf(i)).start();

        }
    }

```

## MapNotSafe\(\)

```java
  public static void MapNotSafe() {
        /**
         * 问题 同List
         *
         * 解决：
         *      1、Collections.synchronizedMap(new HashMap<>());
         *      2、new ConcurrentHashMap<>();--JUC中的！
         */
        Map<String,String> map=new ConcurrentHashMap<>(); //Collections.synchronizedMap(new HashMap<>()); //new HashMap();
//      Map<String,String> map2= new HashMap<>(16);查看API可以发现MAP默认长度是16，负载因子是0.75;
//        如果你可以明确的知道MAP中存放的东西大小是多少，比如一直都是100多条电话号码，你可以直接把Map的size设置为200，省去了之后扩容的时间

        for (int i=0;i<30;i++){
            new Thread(()->{
                map.put(Thread.currentThread().getName(), UUID.randomUUID().toString().substring(0,8));//给map中加入随机元素
                System.out.println(map);
            },String.valueOf(i)).start();

        }
        /**
         * map中其实存放的是一个个node，node中有key，value
         *
         * 读一小段map源码
         *     static class Node<K,V> implements Map.Entry<K,V> {
         *         final int hash;
         *         final K key;
         *         V value;
         *         Node<K,V> next;
         *
         *         Node(int hash, K key, V value, Node<K,V> next) {
         *             this.hash = hash;
         *             this.key = key;
         *             this.value = value;
         *             this.next = next;
         *         }
         *         .........
         *         }
         *
         */}
```