---
title: 剑指 Offer 22. 链表中倒数第k个节点
date: 2021-03-04 14:50:20
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 22. 链表中倒数第k个节点

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

链表嘛，第一反应**快慢指针**。让快指针先走**k** 步，然后快慢同时前进相同的步数，快指针走到null，慢指针的位置就是倒数第k个元素

# 代码

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) { val = x; }
 * }
 */
class Solution {
    public ListNode getKthFromEnd(ListNode head, int k) {
        ListNode slow=head;
        ListNode fast=head;

        while(k-->0){
            fast=fast.next;
        }
        while(fast!=null){
            slow=slow.next;
            fast=fast.next;
        }
        return slow;
    }
}
```