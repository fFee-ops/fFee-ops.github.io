---
title: 剑指 Offer 55 - I. 二叉树的深度
date: 2021-03-08 13:07:16
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 55 - I. 二叉树的深度

- [解题思路](#_3)
- [代码](#_5)

# 解题思路

很简单的递归，找到左子树和右子树的深度，取最大的，然后加上根节点的那个深度就是答案

# 代码

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int left = maxDepth(root.left);//左子树的深度
        int right = maxDepth(root.right);//右子树的深度
        
//左子树右子树那个深度大就取哪一个，再加上根节点的深度“1”.返回的就是结果
        return Math.max(left, right) + 1;
    }
}
```