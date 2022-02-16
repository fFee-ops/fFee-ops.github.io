---
title: 剑指 Offer 17. 打印从1到最大的n位数
date: 2021-03-03 20:42:54
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 17. 打印从1到最大的n位数

- [解题思路](#_3)

# 解题思路

详情见[这篇题解](https://leetcode-cn.com/problems/da-yin-cong-1dao-zui-da-de-nwei-shu-lcof/solution/jian-zhi-offer-17-da-yin-cong-1dao-zui-d-ngm4/)。  
以下的代码是考虑大数、n从0开始、返回的是字符串的解题代码

```java
class Solution {
      int[] res;
    int count = 0;

    public int[] printNumbers(int n) {
        res = new int[(int) Math.pow(10, n) - 1];

        // digit表示要生成的数字的位数
        for (int digit = 1; digit <= n; digit++) {
            for (char first = '1'; first <= '9'; first++) {
                //其实这里存放的是当前要拼接的那个数字，比如现在digit=2；那么num其实就是为了拼接两位数字组成的其中一种情况，比如'11'、'23',也就是说一个num数组代表一个完整的数字
                char[] num = new char[digit];
                //先固定好首位的值
                num[0] = first;
                dfs(1, num, digit);
            }
        }
        return res;
    }

    public void dfs(int index, char[] num, int digit) {
        //固定完了
        if (index == digit) {
            res[count++] = Integer.parseInt(String.valueOf(num));
            return;
        }
        //除了首位剩下的都可以取到0
        for (char i = '0'; i <= '9'; i++) {
            num[index] = i;
            dfs(index + 1, num, digit);
        }

    }
```