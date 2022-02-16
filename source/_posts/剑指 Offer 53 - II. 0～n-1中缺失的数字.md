---
title: 剑指 Offer 53 - II. 0～n-1中缺失的数字
date: 2021-03-07 16:17:00
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 53 - II. 0～n-1中缺失的数字

- [解题思路](#_2)
- [代码](#_9)

# 解题思路

有序数组，**二分搜索**，注意虽然数字缺失，但是下标完整。  
比如0 1 2 4，对应的下标为0 1 2 3，这样可以根据下标和数字是否对应来判断缺失的区域在左边还是右边。  
然后就是返回值：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210307161651771.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    public int missingNumber(int[] nums) {
        int left=0;
        int right=nums.length-1;

        while(left<=right){
            int mid=left+(right-left)/2;
            if(nums[mid]==mid){//下标完整，缺失部分在右边
                left=mid+1;
            }else{
                right=mid-1;
            }
        }
         //终止条件是l = r + 1, 因此最终r在左，l在右，而切割线右边的l即为左边界
        return left;
    }
}
```