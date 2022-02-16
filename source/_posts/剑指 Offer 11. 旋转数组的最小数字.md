---
title: 剑指 Offer 11. 旋转数组的最小数字
date: 2021-03-03 14:44:46
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 11. 旋转数组的最小数字

- [解题思路](#_2)
- [代码](#_18)

# 解题思路

排序数组的查找问题首先考虑使用 二分法 解决。

**流程：**

- 初始化： 声明了l;,r双指针分别指向 nums 数组左右两端；
- 循环二分： 设 `mid` 为每次二分的中点，可分为以下三种情况：

1.  当 `nums[mid] > nums[r]` 时： mid一定在 左排序数组 中，即旋转点 x 一定在 `[mid+1,r]`闭区间内，因此执行`l=mid+1`；
2.  当 `nums[mid] < nums[r]` 时： mid一定在 右排序数组 中，即旋转点 x 一定在`[l,mid]`闭区间内，因此执行`r=mid`；
3.  当 `nums[mid] =nums[r]` 时： 无法判断 mm 在哪个排序数组中。解决方案： 执行`r-1`缩小判断范围。

- 返回值： 当`l=r`时跳出二分循环，并返回 旋转点的值`nums[l]` 即可。

**这题要注意，套用平时的二分搜索模板 r应该为mid-1，但是这里是mid。**  
这是因为当`nums[mid] < nums[r]` 时候，mid可能就是那个反转点，所以不能省略掉mid这个元素，故而mid不能减1。但是如果 `nums[mid] > nums[r]`那就可以肯定mid不是反转元素，因为它居然比别人大。

**这个也告诉了我，套模板一般没错，但是有时候还是要详细考虑边界问题。**

# 代码

```java
class Solution {
    public int minArray(int[] numbers) {
        int l = 0;
        int r = numbers.length - 1;

        while (l <= r) {
//注意这里，因为在l=r的时候还会循环一次，但是我们在l=r的时候已经得到了答案，就需要跳出循环了
            if (l == r) {
                break;
            }

            int mid = l + (r - l) / 2;
            if (numbers[mid] > numbers[r]) {
// mid 一定在 左排序数组 中
                l = mid + 1;
            }
// mid 一定在 右排序数组 中
            else if (numbers[mid] < numbers[r]) {
                r = mid;
            }
// 无法判断 mm 在哪个排序数组中
            else if (numbers[mid] == numbers[r]) {
// 解决方案： 执行 r=r-1 缩小判断范围
                r--;
            }

        }

//返回反转点，也就是最小值
        return numbers[l];
    }
}
```