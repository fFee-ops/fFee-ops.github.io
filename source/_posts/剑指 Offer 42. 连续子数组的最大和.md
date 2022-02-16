---
title: 剑指 Offer 42. 连续子数组的最大和
date: 2021-03-06 15:32:00
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 42. 连续子数组的最大和

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

最基本的动态规划题目，只要找准`dp[i]`的含义，那就十分简单

# 代码

```java
class Solution {
    public int maxSubArray(int[] nums) {
        if(nums.length==0){
            return 0;
        }
        int N=nums.length;
        //dp[i]：以nums[i]结尾的“最大子数组和”，可以对照“最长递增子序列”中dp[i]的定义
        int[] dp=new int[N];
        //base case
        dp[0]=nums[0];

        for(int i=1;i<N;i++){
            //要么自成一派，要么和前面的子数组合并
            dp[i]=Math.max(nums[i],nums[i]+dp[i-1]);
        }
            int res = Integer.MIN_VALUE;
            for (int i = 0; i < dp.length; i++) {
                res = Math.max(res, dp[i]);
            }

            return res;
    }
}
```