---
title: 剑指 Offer 10- II. 青蛙跳台阶问题
date: 2021-03-02 20:31:12
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 10- II. 青蛙跳台阶问题

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

和Leetcode70题一样。也是用动态规划求解，但是要注意这个0个台阶也有一种跳法，然后就是结果要`%1000000007`。

# 代码

```java
class Solution {
    
    public int numWays(int n) {
        if(n==0){
            return 1;
        }

        if(n==1){
            return 1;
        }
        if(n==2){
            return 2;
        }        
    int[] dp=new int[n+1];
        //base case
        dp[0]=0;
        dp[1]=1;
        dp[2]=2;

        for(int i=3;i<=n;i++){
            dp[i]=dp[i-1]+dp[i-2];
            dp[i]=dp[i]%1000000007;
        }

        return dp[n];

    }
}
```