---
title: 剑指 Offer 47. 礼物的最大价值
date: 2021-03-07 10:38:49
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 47. 礼物的最大价值

- [解题思路](#_3)
- [代码](#_12)

# 解题思路

拿现在东西的最大值和前面东西的状态有关，很容易想到动态规划。

**dp数组含义：** `dp[i][j]`代表从棋盘的左上角开始，到达单元格 \(i,j\)下标从0开始！！ 时能拿到礼物的最大累计价值。

状态转移方程：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210307103842644.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    public int maxValue(int[][] grid) {
        int row = grid.length;
        int clo = grid[0].length;

        // dp[i][j]代表从棋盘的左上角开始，到达单元格 (i,j)下标从0开始！！ 时能拿到礼物的最大累计价值。
        int[][] dp = new int[row][clo];

        //base case
        dp[0][0] = grid[0][0];
        for (int i = 1; i < clo; i++) {//初始化行是列在动，所以结尾条件是列长度
            //初始化第一行！只能从左边拿
            dp[0][i] = grid[0][i] + dp[0][i - 1];
        }
        for (int i = 1; i < row; i++) {
            //初始化第一列！只能从上边拿
            dp[i][0] = grid[i][0] + dp[i - 1][0];
        }

        //第一行、第一列已经初始化完了，直接从下标[1,1]开始
        for (int i = 1; i < row; i++) {
            for (int j = 1; j < clo; j++) {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
            }
        }

        return dp[row - 1][clo - 1];
    }
}
```