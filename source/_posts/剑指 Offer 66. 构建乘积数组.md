---
title: 剑指 Offer 66. 构建乘积数组
date: 2021-03-10 16:28:44
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 66. 构建乘积数组

- [解题思路](#_3)
- [代码](#_10)

# 解题思路

- 1、计算每个元素左边所有元素的乘积，结果记录在left数组中,注意left\[0\] = 1，因为第一个位置左边没有元素；
- 2、计算每个元素右边所有元素的乘积，结果记录在res数组中，同理res\[a.length-1\] = 1;
- 3、最终，每个位置除当前元素外，其它元素的乘积 = left\[i\] \* res\[i\]  
  注意：res是最终的结果，为了节省空间，先用res记录右边元素的乘积

# 代码

```java
class Solution {
        public int[] constructArr(int[] a) {
        if (a == null || a.length == 0) {
            return new int[0];
        }

        //先计算出，每个元素左边所有元素的乘积
        int[] left = new int[a.length];
        //l=0,当前元素就是第一个元素，所以left[0] = 1，乘以1相当于啥也没乘
        left[0] = 1;
        for (int l = 1; l < a.length; l++) {
            //l-1可以保证永不到达l，也就是只会乘以到l左边的元素
            left[l] = left[l - 1] * a[l - 1];
        }

        //res用来计算每个元素右边所有元素的乘积
        int[] res = new int[a.length];
        //a.length-1，当前元素是右边第一个元素，所以res[a.length-1] = 1
        res[a.length - 1] = 1;
        for (int r = a.length - 2; r >= 0; r--) {
            res[r] = res[r + 1] * a[r + 1];
        }

        //所以res[i] = left[i] * res[i],left[i]是当前位置左边所有元素的乘积，res[i]是当前位置右边所有元素的乘积，两个相乘，也就是除了当前元素其它所有元素的乘积
        //res是最终要返回的结果，所有重复利用了res数组,节省空间,也可以再定义一个right数组记录右边元素的乘积
        for (int i = 0; i < a.length; i++) {
            res[i] = left[i] * res[i];
        }
        return res;
    }
}
```