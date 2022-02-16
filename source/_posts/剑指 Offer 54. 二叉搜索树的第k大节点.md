---
title: 剑指 Offer 54. 二叉搜索树的第k大节点
date: 2021-03-07 16:52:44
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 54. 二叉搜索树的第k大节点

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

很简单的中序遍历

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
    List<Integer> list = new ArrayList<>();
    public int kthLargest(TreeNode root, int k) {
        help(root);

        int size = list.size();
        //第一大，也就是数组最后一个元素，下标应该为size-1 即size-k
        return list.get(size - k);
    }

    //进行中序遍历
    public void help(TreeNode root) {
        if (root == null) {
            return;
        }
        help(root.left);
        list.add(root.val);
        help(root.right);
    }
}
```