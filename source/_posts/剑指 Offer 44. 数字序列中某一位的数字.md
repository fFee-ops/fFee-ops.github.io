---
title: 剑指 Offer 44. 数字序列中某一位的数字
date: 2021-03-06 16:47:10
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 44. 数字序列中某一位的数字

- [解题思路](#_2)
- [代码](#_11)

# 解题思路

主要思路就三步：

- 找到n应该在几位数中
- 找到n所在的那个数字
- 确定n是数字中的哪一位

具体思路理解：[见这篇题解](https://leetcode-cn.com/problems/shu-zi-xu-lie-zhong-mou-yi-wei-de-shu-zi-lcof/solution/shuang-100chao-hao-li-jie-xiang-xi-ju-li-tong-su-d/)

# 代码

```java
class Solution {
    //找规律题
    public int findNthDigit(int n) {
        if (n <= 9){
            return n;
        }
        int digit = 1 ; //数字位数(例如三位数digit=3)
        long start = 1; //digit位数的第一个数字（0是特殊数字）
        long count = 10; //所有digit位数所占的  数位数量
        while(n>count){//1.确定n所在的数字的位数digit
            n -= count;
            digit += 1;
            start *= 10;
            count = digit*start*9;
        }
        //2. 确定n所在的数字num
        //此时n的值是相对于start的位置
        long num = start + n/digit; 
        //3. 确定n是num的第几位
        //这里引入s和c方便理解
        String s = Long.toString(num);
        char c = s.charAt(n%digit); 
        return c - '0';
    }
}
```