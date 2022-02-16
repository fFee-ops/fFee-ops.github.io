---
title: 剑指 Offer 50. 第一个只出现一次的字符
date: 2021-03-07 13:47:05
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 50. 第一个只出现一次的字符

- [解题思路](#_2)
- [代码](#_6)

# 解题思路

两次循环，第一次记录出现数字，第二次找出第一个数字为1的。

# 代码

```java
class Solution {
    public char firstUniqChar(String s) {
        HashMap<Character, Boolean> map = new HashMap<>();
        char[] sc = s.toCharArray();
        for (char item : sc) {
            if (!map.containsKey(item)) {
                map.put(item, true);//出现次数为1次
            } else {
                map.put(item, false);//出现次数大于1次
            }
        }
        //找出第一个次数为1的数
        for (char item : sc) {
            if (map.get(item)) {
                return item;
            }
        }
        return ' ';
    }
}
```