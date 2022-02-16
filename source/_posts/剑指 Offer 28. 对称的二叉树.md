---
title: 剑指 Offer 28. 对称的二叉树
date: 2021-03-04 16:26:09
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 28. 对称的二叉树

- [解题思路](#_2)
- [代码](#_7)

# 解题思路

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210304162532921.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

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
    public boolean isSymmetric(TreeNode root) {
        if (root == null) {
            return true;
        }
//从两个子节点开始判断
        return help(root.left, root.right);
    }

    //比较L和R的是否相同
    public boolean help(TreeNode L, TreeNode R) {
        /*如果左子树右子树都为空 那也是镜像对称的一种。
           还可以当成循环终止的一个条件，如果遍历到最后，即子树为空了。还没有返回过false，那就返回true。
        */
        if (L == null && R == null) {
            return true;
        }
        if (L == null || R == null) {//两个子树只有一个为空当然不对成。 “两个都为空在上面的if已经给筛选了”
            return false;
        }
        if (L.val != R.val) {
            return false;
        }

//然后左子节点的左子节点和右子节点的右子节点比较，左子节点的右子节点和右子节点的左子节点比较
        return help(L.left, R.right) && help(L.right, R.left);
    }
}
```