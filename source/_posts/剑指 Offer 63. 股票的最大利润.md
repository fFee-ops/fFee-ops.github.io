---
title: 剑指 Offer 63. 股票的最大利润
date: 2021-03-09 17:52:57
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 63. 股票的最大利润

- [解题思路](#_2)
- [代码](#_10)

# 解题思路

直接**动态规划**。

- dp数组含义：`dp[i]`代表 前 i 日的最大利润
- 状态转移方程：`前i日最大利润=max(前(i−1)日最大利润,第i日价格−前i日最低价格)`

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210309175158777.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    public int maxProfit(int[] prices) {
        if(prices.length==0){
            return 0;
        }

        int[] dp=new int[prices.length+1];
        int min=prices[0];
        //dp[i] 代表 前 i 日的最大利润
        dp[0]=0;//第0天的利润为0

        for(int i=1;i<=prices.length;i++){
            min=Math.min(min,prices[i-1]);
            //注意这里：prices[i-1],就是第一天的价格，假如i=1,i-1=0;prices数组下标为0，就是第一个元素，也即第一天
            dp[i]=Math.max(dp[i-1],prices[i-1]-min);
        }

        return dp[prices.length];
    }
}
```