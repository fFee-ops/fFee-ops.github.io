---
title: 剑指 Offer 58 - I. 翻转单词顺序
date: 2021-03-09 14:11:46
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 58 - I. 翻转单词顺序

- [解题思路](#_2)
- [代码](#_10)

# 解题思路

这题可以理解为反转数组，只不过数组是个字符串罢了，可以用**双指针！**。

- 倒序遍历字符串 s ，记录单词左右索引边界 i , j ；
- 每确定一个单词的边界，则将其添加至单词列表 res ；
- 最终，将单词列表拼接为字符串，并返回即可。

# 代码

```java
class Solution {
        public String reverseWords(String s) {
        s = s.trim(); // 删除首尾空格
        int r = s.length() - 1;
        int l = r;
        StringBuilder res = new StringBuilder();
        while (l >= 0) {
            //从右往左搜索到第一个空格后跳出
            while (l >= 0 && s.charAt(l) != ' ') {
                l--;
            }
            //单词和单词间要有空格
            res.append(s.substring(l + 1, r + 1)+ " ");
            // 跳过单词间空格
            while (l >= 0 && s.charAt(l) == ' ') {
                l--;
            }
            r = l;
        }
        return res.toString().trim(); // 转化为字符串并返回
    }
}
```