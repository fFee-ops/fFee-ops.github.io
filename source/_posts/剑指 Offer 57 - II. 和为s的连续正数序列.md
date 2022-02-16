---
title: 剑指 Offer 57 - II. 和为s的连续正数序列
date: 2021-03-08 22:51:46
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 57 - II. 和为s的连续正数序列

- [解题思路](#_2)
- [代码](#_9)

# 解题思路

这题根本来说还可以转化为和数组有关的问题，要用双指针中的**滑动窗口**  
来解决。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210308225128805.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210308225134967.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
        public int[][] findContinuousSequence(int target) {
        List<int[]> res = new ArrayList<>();
        //注意本题的窗口就是target转化后的数组，利用俩指针来构建出窗口
        int left = 1;
        int right = 2;
        int sum = 3;//窗口中的元素和。初始化为3，因为窗口[1,2]的和为3

        while (left < right) {
            if (sum < target) {
                //注意这里要先扩大窗口，再把新的元素加入
                right++;
                sum = sum + right;
            } else if (sum > target) {
                //这里要先减掉将要排除的元素，才可以移动左边界
                sum = sum - left;
                left++;
            } else {
                int[] arr = new int[right - left + 1];
                for (int i = left; i <= right; i++) {
                    arr[i - left] = i;
                }
                res.add(arr);
                //右移左边界缩小窗口。继续寻找
                sum = sum - left;
                left++;
            }

        }

        return res.toArray(new int[res.size()][]);
    }
}
```