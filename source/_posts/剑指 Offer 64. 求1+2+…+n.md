---
title: 剑指 Offer 64. 求1+2+…+n
date: 2021-03-09 18:11:35
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 64. 求1+2+…+n

- [解题思路](#_2)
- [代码](#_8)

# 解题思路

核心是**用逻辑运算符的短路效应来结束递归**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210309181121974.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
        int res=0;
    public int sumNums(int n) {
         boolean tmp = (n>1)&&(sumNums(n-1)>0);//tmp值用不到，只是为了使得后面的语句进行;
         res=res+n;
         return res;        
    }
}
```