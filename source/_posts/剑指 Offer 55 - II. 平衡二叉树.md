---
title: 剑指 Offer 55 - II. 平衡二叉树
date: 2021-03-08 13:15:02
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 55 - II. 平衡二叉树

- [解题思路](#_2)
- [代码](#_6)

# 解题思路

定义一个成员变量res，自顶向下遍历，在每次求出树的最大深度的过程中，要求左子树的最大深度和右子树的最大深度，  
每求出一个节点的左子树的最大深度和右子树的最大深度就把它们做个差。 小于1满足条件不改变res。否则把res置为false，证明深度差超过了1.最后返回res就行

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
    boolean res = true;
        public boolean isBalanced(TreeNode root) {
            if (root == null) {
                return true;
            }
            utils(root);
            return res;
        }


        public int utils(TreeNode root) {//求树的最大深度
            if (root == null) {
                return 0;
            }
            int left = utils(root.left);//左子树的深度
            int right = utils(root.right);//右子树的深度
            if (Math.abs(left - right) > 1) {//在求出每一个节点的左子树和右子树最大深度后，都进行一次减法运算，Math.bas()是把值转化为绝对值，避免出现负数干扰判断
                res = false;
            }

            return Math.max(left, right) + 1;
    }
}
```