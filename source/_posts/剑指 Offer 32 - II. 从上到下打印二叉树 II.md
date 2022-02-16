---
title: 剑指 Offer 32 - II. 从上到下打印二叉树 II
date: 2021-03-05 11:20:02
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 32 - II. 从上到下打印二叉树 II

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

和`从上到下打印二叉树 I`一样，只不多添加一个temp来保存每一层的节点值。

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
    public List<List<Integer>> levelOrder(TreeNode root) {
        if (root == null) {
            return  new ArrayList<>();
        }
        Queue<TreeNode> q = new LinkedList<>(); // 核心数据结构
        //  保存结果
        List<List<Integer>> res = new ArrayList<>();
        q.add(root);

        while (!q.isEmpty()) {
            //这个临时保存的list一定要在这里，只有这样保存完一层的节点了，才会刷新为null
           List<Integer> tempRes = new ArrayList<>();
            int size = q.size();
            for (int i = 0; i < size; i++) {
                TreeNode cur = q.poll();
                tempRes.add(cur.val);

                //找到cur的相邻节点
                if (cur.left != null) {
                    q.add(cur.left);
                }
                if (cur.right != null) {
                    q.add(cur.right);
                }
            }
                res.add(tempRes);
            
        }

        return res;
    }
}
```