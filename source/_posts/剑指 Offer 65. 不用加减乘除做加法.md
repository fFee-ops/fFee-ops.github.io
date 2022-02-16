---
title: 剑指 Offer 65. 不用加减乘除做加法
date: 2021-03-09 18:39:59
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 65. 不用加减乘除做加法

- [解题思路](#_2)
- [代码](#_20)

# 解题思路

本题考的是**位运算**。

**前置知识：**

- \^ 亦或 ----相当于 无进位的求和
- 与\(\&\) 然后左移\(\<\<\)----相当于求每位的进位数

来解释一下上面的前置知识：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210309183806166.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

再来举个例子看看（假如数字是十进制）：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210309183903186.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    public int add(int a, int b) {
        while (b != 0) {// 当进位为 0 时跳出

            //一轮过后。a=tempSum  b=carraySum.即进位数字加上无需进位的数字
            int tempSum = a ^ b;
            int carrySum = (a & b) << 1;
            a = tempSum;
            b = carrySum;
        }
        return a;
    }
}
```