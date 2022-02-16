---
title: 剑指 Offer 57. 和为s的两个数字
date: 2021-03-08 22:05:40
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 57. 和为s的两个数字

- [解题思路](#_2)
- [代码](#_4)

# 解题思路

有序数组直接无脑**二分搜索**，但本题并不能算标准的二分搜索，因为没用上mid,可以理解为双指针嘛

# 代码

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        if(nums.length==0){
            return new int[]{};
        }
        int n=nums.length;
        int left=0;
        int right=n-1;

        while(left<=right){
            //不可以自己加自己，所以left==right的时候就要跳出循环
            if(left==right){
                break;
            }
            int sum=nums[left]+nums[right];
            if(sum==target){
                return new int[]{nums[left],nums[right]};
            }else if(sum>target){
                right--;
            }else if(sum<target){
                left++;
            }

        }
        return new int[]{};
    }
}
```