---
title: 剑指 Offer 27. 二叉树的镜像
date: 2021-03-04 16:12:02
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 27. 二叉树的镜像

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

很简单，就是递归调用`mirrorTree()`得到输入的那个节点，比如你输入的是`mirrorTree(root.right)`那么返回的节点其实就是`root.right`，然后你再用一个变量保存起来，再把左右节点进行交换就可以了；

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
    public TreeNode mirrorTree(TreeNode root) {
        if(root==null){
            return root;
        }
        //递归该方法其实就是，返回输入的那个节点
        TreeNode leftRoot = mirrorTree(root.right);
        TreeNode rightRoot = mirrorTree(root.left);

        root.left = leftRoot;
        root.right = rightRoot;

        return root;
    }
}
```