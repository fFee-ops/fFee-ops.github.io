---
title: 剑指 Offer 53 - I. 在排序数组中查找数字 I
date: 2021-03-07 16:00:29
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 53 - I. 在排序数组中查找数字 I

- [解题思路](#_2)
- [代码](#_7)

# 解题思路

有序数组！直接，**二分搜索** 。先找到一个和target相等的数。然后返回它的下标，再从下标向两边扩散找到有无相同的数。  
最后返回下标的差，就是target的个数。

> 注意，最后跳出循环的时候left和right已经不是target的下标了，所以要给它们复原，即`left+1`、`right-1`

# 代码

```java
class Solution {
    public int search(int[] nums, int target) {
        int find = Helper(nums, target);
        //如果没找到，返回0
        if (find == -1) {
            return 0;
        }

        int left = find - 1;
        int right = find + 1;
        //查看前面是否还有target
        while (left >= 0 && nums[left] == target) {
            left--;
        }
        //查看后面是否还有target
        while (right < nums.length && nums[right] == target) {
            right++;
        }

        return (right - 1) - (left + 1) + 1;
    }

    //二分法查找
    public int Helper(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] < target) {
                left = mid + 1;
            } else if (nums[mid] > target) {
                right = mid - 1;
            } else {
                return mid;
                /*找到了该目标值的地址，就将地址返回，但是要注意，再寻找一下还有没有其余的target*/
            }
        }
        return -1;//如果没找到就返回-1
    }
}
```