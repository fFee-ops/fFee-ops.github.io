---
title: 剑指 Offer 36. 二叉搜索树与双向链表
date: 2021-03-10 16:28:58
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 36. 二叉搜索树与双向链表

- [解题思路](#_2)
- [代码](#_9)

# 解题思路

- 排序链表： 节点应从小到大排序，因此应使用 中序遍历 “从小到大”访问树的节点。
- 双向链表： 在构建相邻节点的引用关系时，设前驱节点 pre 和当前节点 cur ，不仅应构建 pre.right = cur ，也应构建 cur.left = pre 。
- 循环链表： 设链表头节点 head 和尾节点 tail ，则应构建 head.left = tail 和 tail.right = head 。

根据以上分析，考虑使用中序遍历访问树的各节点 cur ；并在访问每个节点时构建 cur 和前驱节点 pre 的引用指向；中序遍历完成后，最后构建头节点和尾节点的引用指向即可。

# 代码

```java
/*
// Definition for a Node.
class Node {
    public int val;
    public Node left;
    public Node right;

    public Node() {}

    public Node(int _val) {
        val = _val;
    }

    public Node(int _val,Node _left,Node _right) {
        val = _val;
        left = _left;
        right = _right;
    }
};
*/
class Solution {
    //pre：当前节点的前一个节点指针 head：头节点指针
    Node pre, head;

    public Node treeToDoublyList(Node root) {
        if (root == null) return null;
        help(root);

        //对首尾节点进行连接
        head.left = pre;
        pre.right = head;
        return head;
    }

    public void help(Node cur) {
        if (cur == null) {
            return;
        }

        help(cur.left);
//pre用于记录双向链表中位于cur左侧的节点，即上一次迭代中的cur,当pre==null时，cur左侧没有节点,即此时cur为双向链表中的头节点
        if (pre == null) {
            head = cur;
        } else {//反之需要把pre的指针指向cur
            pre.right = cur;
        }
        cur.left = pre;//把cur的指针指向pre,pre是否为null对这句没有影响,最后会在treeToDoublyList()方法中对头尾节点进行连接
        pre = cur;//即将进行下一次循环，那么pre就应该变成cur了，cur就会变成cur的下一个节点
        help(cur.right);
    }
}
```