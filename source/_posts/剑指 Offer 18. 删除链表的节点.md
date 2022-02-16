---
title: 剑指 Offer 18. 删除链表的节点
date: 2021-03-03 20:51:30
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 18. 删除链表的节点

- [解题思路](#_2)
- [代码](#_4)

# 解题思路

单链表，一看就用**快慢指针**。没啥说的

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
    public ListNode deleteNode(ListNode head, int val) {
        //base case
        if(head.val==val){
            return head.next;
        }
        ListNode slow=head;
        ListNode fast=head.next;
        while(slow!=null&&fast.val!=val){
            slow=slow.next;
            fast=fast.next;
        }
        //fast到达了目标值
        slow.next=fast.next;
        return head;
    }
}
```