---
title: 剑指 Offer 32 - I. 从上到下打印二叉树
date: 2021-03-05 11:03:29
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 32 - I. 从上到下打印二叉树

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

层级遍历，无脑`BFS模板`，甚至还可以省略回头记录，和步数

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
    public int[] levelOrder(TreeNode root) {
        if (root == null) {
            return new int[]{};
        }

        Queue<TreeNode> q = new LinkedList<>(); // 核心数据结构

        //  保存结果
        List<Integer> ans = new ArrayList<>();

        q.add(root);
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                TreeNode cur = q.poll();
                ans.add(cur.val);

                //找到cur的相邻节点
                if (cur.left != null) {
                    q.add(cur.left);
                }
                if (cur.right != null) {
                    q.add(cur.right);
                }
            }
        }
        int[] res = new int[ans.size()];
        for (int i = 0; i < ans.size(); i++) {
            res[i] = ans.get(i);
        }
        return res;
    }
}
```