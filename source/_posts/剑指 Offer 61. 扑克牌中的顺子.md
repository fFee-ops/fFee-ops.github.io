---
title: 剑指 Offer 61. 扑克牌中的顺子
date: 2021-03-09 16:44:36
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 61. 扑克牌中的顺子

- [解题思路](#_2)
- [代码](#_7)

# 解题思路

本题主要知道两点，

1.  有重复肯定不是顺子
2.  顺子最大值减去最小值\<=4，因为最多只有5张牌，可以自己举个例子看看

# 代码

```java
class Solution {
    public boolean isStraight(int[] nums) {
        int joker=0;//存储有多少张大小王
        Arrays.sort(nums);
        for(int i=0;i<4;i++){
            if(nums[i]==0){
                joker++;
            }else if(nums[i]==nums[i+1]){
                //有重复肯定不是顺子
                return false;
            }

        }

        // 最大牌 - 最小牌 <=4 则可构成顺子；nums[joker]：除去大小王后的最小的牌。
        //比如[0,0,3,4,5]，jioker=2，所以nums[2]=3；
        return nums[4]-nums[joker]<=4;
    }
}
```