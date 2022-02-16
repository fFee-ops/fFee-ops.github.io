---
title: 剑指 Offer 20. 表示数值的字符串
date: 2021-03-04 14:28:24
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 20. 表示数值的字符串

- [解题思路](#_2)
- [代码](#_12)

# 解题思路

这题乍一看题目都看不懂？？？  
其实只要总结一下规律，只有以下几种情况是合法的：

- `‘.’`出现正确情况：只出现一次，且在e的前面

- `‘e’`出现正确情况：只出现一次，且出现前有数字

- `‘+’‘-’`出现正确情况：只能在开头和e后一位

- 字符串必须以数字结尾

- 其实`e`和`E` 都要考虑

# 代码

```java
class Solution {
    public boolean isNumber(String s) {
        if (s == null || s.length() == 0) return false;
        //去掉首位空格
        s = s.trim();//trim() 方法用于删除字符串的头尾空白符。
        boolean numFlag = false;
        boolean dotFlag = false;
        boolean eFlag = false;
        for (int i = 0; i < s.length(); i++) {
            //判定为数字，则标记numFlag
            if (s.charAt(i) >= '0' && s.charAt(i) <= '9') {
                numFlag = true;
                //判定为.  需要没出现过.并且没出现过e
            } else if (s.charAt(i) == '.' && !dotFlag && !eFlag) {
                dotFlag = true;
                //判定为e，需要没出现过e，并且出过数字了
            } else if ((s.charAt(i) == 'e' || s.charAt(i) == 'E') && !eFlag && numFlag) {
                eFlag = true;
                numFlag = false;//为了避免123e这种请求，出现e之后就标志为false
                //判定为+-符号，只能出现在第一位或者紧接e后面
            } else if ((s.charAt(i) == '+' || s.charAt(i) == '-') && (i == 0 || s.charAt(i - 1) == 'e' || s.charAt(i - 1) == 'E')) {

                //其他情况，都是非法的
            } else {
                return false;
            }
        }

        //必须以数字结尾。因为在判断e的时候把numFlag=false了。如果是正确的，那么一定是以数字结尾的，那么一定会进入到判定为数字的那个if，然后numFlag=true
        return numFlag;
    }
}
```