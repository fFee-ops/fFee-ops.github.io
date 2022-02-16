---
title: 剑指 Offer 32 - III. 从上到下打印二叉树 III
date: 2021-03-05 12:55:30
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 32 - III. 从上到下打印二叉树 III

- [解题思路](#_2)
- [代码](#_8)

# 解题思路

和前面两个上到下打印二叉树一样，不过有个特点，要按照z字形打印每一层的元素，其实总结一下就是**奇数层正序打印，偶数层倒序打印**，要实现这个功能很简单，只要在上一题的代码上稍微改一下，用`LinkedList`来替代之前的`ArrayList`即可。

注意！  
**res 的长度为 奇数 ，说明当前是偶数层**

> 每打印一层， res 长度就会加 1 ；因此，在遍历第 1 层时， res 长度为 0 ；在遍历第 2 层时， res 长度为 1；以此类推。 因此， res 的长度为 奇数 ，说明当前是偶数层。

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
            return new ArrayList<>();
        }
        Queue<TreeNode> q = new LinkedList<>(); // 核心数据结构
        //  保存结果
        List<List<Integer>> res = new ArrayList<>();
        q.add(root);

        while (!q.isEmpty()) {
            //这个临时保存的list一定要在这里，只有这样保存完一层的节点了，才会刷新为null
            LinkedList<Integer> tempRes = new LinkedList<>();
            int size = q.size();
            for (int i = 0; i < size; i++) {
                TreeNode cur = q.poll();
                if (res.size() % 2 == 0) {//奇数层：正序打印
                    tempRes.addLast(cur.val);
                } else {//偶数层：倒序打印
                    tempRes.addFirst(cur.val);
                }

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