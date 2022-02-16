---
title: HashMap扩容以及ConcurrentHashMap扩容机制
date: 2021-08-23 22:32:56
tags: 
categories: java
---

<!--more-->

### HashMap扩容以及ConcurrentHashMap扩容机制

- [HashMap](#HashMap_2)
- - [1.7](#17_3)
  - [1.8](#18_34)
- [ConcurrentHashMap](#ConcurrentHashMap_36)
- - [1.7](#17_37)
  - [1.8](#18_39)

# HashMap

## 1.7

![在这里插入图片描述](https://img-blog.csdnimg.cn/ac479a76afd344c5ba8eba69892a3a54.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

```java

void transfer(Entry[] newTable) {    
    // 1.7 的hashmap 数组+链表
    // 获取到旧表
    Entry[] src = table;
    // 获取到新表的长度(数组的长度)
    int newCapacity = newTable.length;    
    // 遍历旧表的每一条链表
    for (int j = 0; j < src.length; j++) { //遍历旧的Entry数组    
        Entry<K, V> e = src[j];             //取得旧Entry数组的每个元素    
        if (e != null) {   
            // 释放掉旧的Entry数组的对象引用
            src[j] = null;
            // 遍历链表中的元素进行转移到新表中(头插法转移元素)
            do {    
                Entry<K, V> next = e.next;  
                // 重新计算每个元素在数组中的位置！！      
                int i = indexFor(e.hash, newCapacity); 
                e.next = newTable[i];
                newTable[i] = e;
                e = next;
            } while (e != null);    
        }    
    }    
}  

```

## 1.8

![在这里插入图片描述](https://img-blog.csdnimg.cn/b25570573d654027bddd648f909f0abf.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# ConcurrentHashMap

## 1.7

## 1.8

![在这里插入图片描述](https://img-blog.csdnimg.cn/22b50be5f1c04ee79315b1e643f606b7.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)