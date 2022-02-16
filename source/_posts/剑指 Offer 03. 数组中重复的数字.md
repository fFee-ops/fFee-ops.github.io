---
title: 剑指 Offer 03. 数组中重复的数字
date: 2021-03-02 13:39:58
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 03. 数组中重复的数字

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

首先想到暴力解法，但是时间复杂度太高了，所以想到用map来优化，还是遍历数组，把遇到的元素的对应的次数存入map，只要次数`>=2`就证明出现了重复元素，直接返回即可。

# 代码

```java
class Solution {
    public int findRepeatNumber(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
            if (map.get(num) >= 2) {
                return num;
            }

        }
        return 0;
    }
}
```