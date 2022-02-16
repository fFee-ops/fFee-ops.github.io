---
title: 剑指 Offer 68 - I. 二叉搜索树的最近公共祖先
date: 2021-03-10 16:28:31
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 68 - I. 二叉搜索树的最近公共祖先

- [解题思路](#_3)
- [代码](#_18)

# 解题思路

```

本题用  递归
    这题有三个大情况：
        ①p,q都在以root为根的树中，返回p,q的最近公共祖先
        ②p,q都不在以root为根的树中，返回null
        ③p,q只有一个在以root为根的树中，返回在树中的那个节点

        把情况①（p,q都在以root为根的树中）拎出来看一下细节情况：
            ①p,q中有一个就是root，比如p==root，则直接返回root，当然，依据情况③，只要p或者q有一个和root相等，就返回哪一个。
            
            ②p,q都不等于root，那么对于p,q的公共祖先T来说，T的left肯定就是p，T的right就是q
```

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
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        //base case
        if(root==null){
            return null;
        }

        if(root==p||root==q){//如果root是p或者q其中一个，那root就是他们的公共祖先
            return root;
        }

        TreeNode left=lowestCommonAncestor(root.left,p,q);
        TreeNode right=lowestCommonAncestor(root.right,p,q);
        //上面的base case保证了到达这里的root不为空，也不为p或者q
        //情况一：p,q都在以root为根的节点中，因为用的是后序遍历，所以对于p、q的公共祖先来说p一定是它的left，q一定是它的right
        if(left!=null&&right!=null){
            return root;
        }
        //情况二：俩都为null，即root没有子树，p,q都不在以root为根节点的树中
        if(left==null&&right==null){
            return null;
        }

        //情况三：只有p或者q在以root为根节点的树中，那就只返回该节点
        return left==null?right:left;

        

    }
}
```