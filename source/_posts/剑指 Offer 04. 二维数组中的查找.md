---
title: 剑指 Offer 04. 二维数组中的查找
date: 2021-03-02 13:49:50
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 04. 二维数组中的查找

- [解题思路](#_3)
- [代码](#_29)

# 解题思路

若使用暴力法遍历矩阵 matrix ，则时间复杂度为 O\(NM\)O\(NM\) 。暴力法未利用矩阵 **“从上到下递增、从左到右递增”** 的特点，显然不是最优解法。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210302134658350.png)  
我们可以发现这有点像二叉树。

我们以 **左下角元素为标志数** ，也就是`3`.

1.  若 flag > target ，则 target 一定在 flag 所在 行的上方 ，即 flag 所在行可被消去。
2.  若 flag \< target ，则 target 一定在 flag 所在 列的右方 ，即 flag 所在列可被消去。

例如：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210302134816694.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
↓  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210302134823535.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
↓  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210302134855765.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)↓  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210302134908500.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
↓  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210302134916948.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
↓  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210302134929557.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    public boolean findNumberIn2DArray(int[][] matrix, int target) {
        int i = matrix.length - 1;//行数下标
        int j = 0;//列数下标，从0开始

        while (i >= 0 && j < matrix[0].length) {//防止下标越界
            if (matrix[i][j] > target) {
                i--;//丢弃当前行
            } else if (matrix[i][j] < target) {
                j++;//丢弃当前列
            } else {//等于target
                return true;
            }
        }

        return false;
    }
}
```