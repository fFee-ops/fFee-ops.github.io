---
title: 剑指 Offer 05. 替换空格
date: 2021-03-02 13:59:29
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 05. 替换空格

- [解题思路](#_2)
- [代码](#_4)

# 解题思路

这个很简单，用个stringbuilder即可解决

# 代码

```java
class Solution {
    public String replaceSpace(String s) {
        StringBuilder res = new StringBuilder();

        for (char item : s.toCharArray()) {
            if (item == ' ') {
                res.append("%20");
            }else{
            res.append(item);
            }
        }

        return res.toString();

        // return s.replace(" ","%20");  直接用库函数
    }
}
```