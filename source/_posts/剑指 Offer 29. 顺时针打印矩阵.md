---
title: 剑指 Offer 29. 顺时针打印矩阵
date: 2021-03-04 17:33:27
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 29. 顺时针打印矩阵

- [解题思路](#_2)
- [代码](#_12)

# 解题思路

顺时针打印矩阵的顺序是 “从左向右、从上向下、从右向左、从下向上” 循环。因此，考虑设定矩阵的“左、上、右、下”四个边界，模拟以上矩阵遍历顺序。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210304173242850.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**主要流程:**

1.  根据边界打印，即将元素按顺序添加至列表 res 尾部；
2.  边界向内收缩 1 （代表已被打印）；
3.  判断是否打印完毕（边界是否相遇），若打印完毕则跳出。

# 代码

```java
class Solution {
public int[] spiralOrder(int[][] matrix) {
        if (matrix.length == 0) {
            return new int[]{};
        }
        int left = 0;
        int right = matrix[0].length - 1;
        int up = 0;
        int down = matrix.length - 1;
        int x = 0;//res的下标
        int[] res = new int[matrix.length * matrix[0].length];

        while (true) {
            //从左往右
            for (int i = left; i <= right; i++) {
                //这里要掌握技巧：从左往右，行不变，列变，所以找一个不变的行，就是up
                res[x] = matrix[up][i];
                x++;
            }
            //边界收缩：遍历完了一行，那么up就下一一行
            up++;
            //遍历完了，边界收缩，看看是否越界，也就是是否打印完了
            if (up > down) {
                break;
            }

            //从上往下
            for (int i = up; i <= down; i++) {
                res[x] = matrix[i][right];
                x++;
            }
            right--;
            if (right < left) {
                break;
            }

            //从右往左
            for (int i = right; i >= left; i--) {
                res[x] = matrix[down][i];
                x++;
            }
            down--;
            if (down < up) {
                break;
            }

            //从下往上
            for (int i = down; i >= up; i--) {
                res[x] = matrix[i][left];
                x++;
            }
            left++;
            if (left > right) {
                break;
            }


        }
        return res;
    }
}
```