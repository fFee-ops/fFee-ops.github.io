---
title: 剑指 Offer 33. 二叉搜索树的后序遍历序列
date: 2021-03-05 15:14:42
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 33. 二叉搜索树的后序遍历序列

- [解题思路](#_2)
- [代码](#_12)

# 解题思路

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021030515123211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
先来看一个二叉树的后序遍历：\[3，5，4，10，12，9\]。

- 后续遍历的最后一个数字一定是根节点，所以数组中**最后一个数字9**就是根节点
- 我们从前往后找到第一个比9大的数字10，那么10后面的\[10，12\]（除了9）都是9的右子节点，10前面的\[3，5，4\]都是9的左子节点
- 后面的需要判断一下，如果有小于9的，说明不是二叉搜索树，直接返回false。然后再以递归的方式判断左右子树。

这就是大体思路；

# 代码

```java
class Solution {
    public boolean verifyPostorder(int[] postorder) {
        return help(postorder, 0, postorder.length - 1);
    }

    public boolean help(int[] postorder, int left, int right) {
        //如果left==right，就一个节点不需要判断了，如果left>right,说明没有节点，也不用再看了,否则就要继续往下判断
        if (left >= right) {
            return true;
        }
        //因为数组中最后一个值postorder[right]是根节点，这里从左往右找出第一个比
        //根节点大的值，他后面的都是根节点的右子节点（包含当前值，不包含最后一个值，
        //因为最后一个是根节点），他前面的都是根节点的左子节点
        int mid = left;
        int root = postorder[right];
        while (postorder[mid] < root) {
            mid++;
        }
        int temp = mid;
        //因为postorder[mid]前面的值都是比根节点root小的，
        //我们还需要确定postorder[mid]后面的值都要比根节点root大，
        //如果后面有比根节点小的直接返回false
        while (temp < right) {
            if (postorder[temp] < root) {
                return false;
            }
            temp++;
        }


//然后对左右子节点进行递归调用
        return help(postorder, left, mid - 1) && help(postorder, mid, right - 1);
    }
}
```