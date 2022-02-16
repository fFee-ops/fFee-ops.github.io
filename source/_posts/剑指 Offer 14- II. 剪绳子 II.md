---
title: 剑指 Offer 14- II. 剪绳子 II
date: 2021-03-03 16:05:02
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 14- II. 剪绳子 II

- [解题思路](#_2)
- [代码](#_4)

# 解题思路

和`剪绳子Ⅰ` 思路一样，多了个取模运算而已。

# 代码

```java
class Solution {
    public int cuttingRope(int n) {
        if(n<4){
            return n-1;
        }
        //注意这里要用long，不可用int，不然n=120的时候就会报错了
        long res=1;
        while(n>4){
            res=res*3%1000000007;
            n=n-3;
        }

        return (int) (res*n%1000000007);
    }
}
```