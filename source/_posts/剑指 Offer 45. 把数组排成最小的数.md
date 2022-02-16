---
title: 剑指 Offer 45. 把数组排成最小的数
date: 2021-03-06 17:48:43
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 45. 把数组排成最小的数

- [解题思路](#_2)
- [代码](#_11)

# 解题思路

此题求拼接起来的最小数字，本质上是一个排序问题。设数组 numsnums 中任意两数字的字符串为 x 和 y ，则规定 排序判断规则 为：

- 若拼接字符串 x + y > y + x，则 x“大于” y ；
- 反之，若 x + y \< y + x，则 y“小于” x；

> x “小于” y代表：排序完成后，数组中 x应在 y左边；“大于” 则反之。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210306174821386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    public String minNumber(int[] nums) {
        String[] strs = new String[nums.length];
        for (int i = 0; i < nums.length; i++) {
            strs[i] = String.valueOf(nums[i]);
        }
        /*
        Arrays.sort()是某比较方法的结果,如果返回结果>0就交换两个元素，<0就不交换
        比如X+y>y+x，那么证明x“大于”y，也就是说排序后x应该在y的右边，也即交换了x,y的位置
         */

        Arrays.sort(strs, (x, y) -> {
            // x+y 和 y+x 比大小
            return (x + y).compareTo(y + x);
        });
        StringBuilder res = new StringBuilder();
        for (String s : strs) {
            res.append(s);
        }

        return res.toString();
    }
}
```