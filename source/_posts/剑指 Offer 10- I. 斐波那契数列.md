---
title: 剑指 Offer 10- I. 斐波那契数列
date: 2021-03-02 20:24:55
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 10- I. 斐波那契数列

- [解题思路](#_2)
- [代码](#_4)

# 解题思路

动态规划思路，主要知道`dp[i]`的值代表 斐波那契数列第 i 个数字 。

# 代码

```java
class Solution {
    /* 0、1、1、2、3、5、8、13、21、34、……*/
    public int fib(int n) {
        if (n == 0) {
            return 0;
        }

        if (n == 1) {
            return 1;
        }

        // dp[i] 的值代表 斐波那契数列第 i 个数字 。
        //所以为了存储到最后一个数字。也就是dp[n]。dp的长度就要为n+1
        int[] dp = new int[n + 1];
        //base case
        dp[0] = 0;
        dp[1] = 1;

        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
            dp[i]=dp[i]%1000000007;
        }
        return dp[n];
    }
}
```