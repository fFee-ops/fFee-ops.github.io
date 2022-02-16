---
title: 剑指 Offer 46. 把数字翻译成字符串
date: 2021-03-06 23:09:01
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 46. 把数字翻译成字符串

- [解题思路](#_2)
- [代码](#_14)

# 解题思路

典型动态规划题目。  
首先定义dp数组含义：`dp[i]` 代表以nums\[\]中第i位数字为结尾的数字的翻译方案数量。

**推导状态转移方程：**  
比如数字6 2 4，手动推出应该有2种翻译方案.

> dp\[0\]=0；dp\[1\]=1；dp\[2\]=1；dp\[3\]=2=dp\[1\]+dp\[2\]----->`dp[i]=dp[i-2]+dp[i-1]`

比如数字630,手动推出只有1种翻译方案.

> dp\[0\]=0；dp\[1\]=1；dp\[2\]=1；dp\[3\]=1=dp\[2\]----->`dp[i]=dp[i-1]`

# 代码

```java
class Solution {
    public int translateNum(int num) {
        if (num < 10) {
            //个位数，只可能有一种翻译的方法
            return 1;
        }
        String s = String.valueOf(num);
        //dp[i] 代表以nums[]中第i位数字为结尾的数字的翻译方案数量。
        int[] dp = new int[s.length() + 1];
        //第0位数字，即 “无数字” 和 “第 1 位数字” 的翻译方法数量均为 1 ；
        dp[0] = dp[1] = 1;


        for (int i = 2; i <= s.length(); i++) {
            //计算当前数和前一个数组成的数值大小,如"1225",那么就是截取出来下标[0,2),也就是12
            String temp = s.substring(i - 2, i);
            if (temp.compareTo("10") >= 0 && temp.compareTo("25") <= 0) {
                //组成数值处于[10,25]范围内,则可翻译的方法数为前两个数的翻译总和
                dp[i] = dp[i - 1] + dp[i - 2];
            } else {
                //组成数值不在[10,25]范围内，则只能算一种翻译,和前一个数能翻译的方法数一样
                dp[i] = dp[i - 1];
            }
        }
        return dp[s.length()];
    }
}
```