---
title: 剑指 Offer 15. 二进制中1的个数
date: 2021-03-03 16:49:05
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 15. 二进制中1的个数

- [解题思路](#_2)
- [代码](#_25)

# 解题思路

第一种常规解法：不断右移n。

```java
public class Solution {
    public int hammingWeight(int n) {
        int res = 0;
        while(n != 0) {
            res += n & 1;
            n >>>= 1;
        }
        return res;
    }
}
```

第二种方法（最优的）：巧用 `n&(n−1)`  
每次执行`n&(n−1)`都会 消去数字 n 最右边的 1。只要执行一次，res+1即可。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210303164901300.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
public class Solution {
    // you need to treat n as an unsigned value
    public int hammingWeight(int n) {
        int res = 0;
        while (n != 0) {
            res++;
            n = n & (n - 1);
        }
        return res;
    }
}
```