---
title: 剑指 Offer 26. 树的子结构
date: 2021-03-04 16:03:03
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 26. 树的子结构

- [解题思路](#_2)
- [代码](#_8)

# 解题思路

主要是要构建一个辅助函数：来判断以x为根节点的树是否包含B

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210304160038888.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

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
// 先序遍历树 A 中的每个节点 n_A
    public boolean isSubStructure(TreeNode A, TreeNode B) {
        if (A == null || B == null) {
            return false;
        }
        //B是以A为根节点的子树
        if (A.val == B.val && (helper(A.left, B.left) && helper(A.right, B.right))) {
            return true;
        }

        //B是以A为左、右节点的子树。上述三种情况只要满足一种就ok
        return isSubStructure(A.left, B) || isSubStructure(A.right, B);

    }

    // 判断树 A 中 以 n_A为根节点的子树 是否包含树 B
    private boolean helper(TreeNode root1, TreeNode root2) {
        // 当节点 B 为空：说明树 B 已匹配完成（越过叶子节点），因此返回 true ；
        if (root2 == null) {
            return true;
        }
        // 当节点 A 为空：说明已经越过树 A 叶子节点，即匹配失败，返回 false ；
        if (root1 == null) {
            return false;
        }
        if (root1.val == root2.val) {//根节点相等，还要判断子节点
            return helper(root1.left, root2.left) && helper(root1.right, root2.right);

        } else {//当节点 A和 B的值不同：说明匹配失败
            return false;
        }
    }
}
```