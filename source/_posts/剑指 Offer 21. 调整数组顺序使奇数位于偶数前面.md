---
title: 剑指 Offer 21. 调整数组顺序使奇数位于偶数前面
date: 2021-03-04 14:45:09
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 21. 调整数组顺序使奇数位于偶数前面

- [解题思路](#_2)
- [代码](#_6)

# 解题思路

这题很简单，**用左右指针即可。**

**注意啊：如果要求调整后元素的相对位置不能改变，那就要用`冒泡排序`**

# 代码

```java
class Solution {
    public int[] exchange(int[] nums) {
        if (nums.length == 0 || nums == null) {
            return new int[]{};
        }
        int left = 0;
        int right = nums.length - 1;
        int temp = 0;

        while (left <= right) {
            if (left == right) {//这题l、r重合了就可以结束了
                break;
            }

            // 指针 i 遇到奇数则执行 i = i + 1 跳过，直到找到偶数；
            while (left < right && (nums[left] % 2) == 1) {
                left++;
            }
            // 指针 j 遇到偶数则执行 j = j - 1 跳过，直到找到奇数；
            while (left < right && (nums[right] % 2) == 0) {
                right--;
            }
            temp = nums[left];
            nums[left] = nums[right];
            nums[right] = temp;
        }
        return nums;
    }
}
```