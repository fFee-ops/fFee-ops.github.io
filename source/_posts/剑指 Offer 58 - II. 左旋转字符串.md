---
title: 剑指 Offer 58 - II. 左旋转字符串
date: 2021-03-09 14:28:32
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 58 - II. 左旋转字符串

- [解题思路](#_2)
- [代码](#_16)

# 解题思路

直接切片，如果面试不让切片，那就用stringBuilder来拼接

```java
class Solution {
    public String reverseLeftWords(String s, int n) {
        StringBuilder res = new StringBuilder();
        for(int i = n; i < s.length(); i++)
            res.append(s.charAt(i));
        for(int i = 0; i < n; i++)
            res.append(s.charAt(i));
        return res.toString();
    }
}
```

# 代码

```java
class Solution {
    public String reverseLeftWords(String s, int n) {
        return s.substring(n, s.length()) + s.substring(0, n);
    }
}
```