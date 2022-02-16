---
title: 剑指 Offer 52. 两个链表的第一个公共节点
date: 2021-03-07 15:15:22
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 52. 两个链表的第一个公共节点

- [解题思路](#_3)
- [代码](#_6)

# 解题思路

链表用**快慢指针** 俩指针，分别指向两个链表，快指针指向长度长的那个链表，先让快指针走，走到两个链表长度相同，然后同时走，边走边判断是否相遇

# 代码

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class Solution {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        int aLength = length(headA);
        int bLength = length(headB);

        while (aLength != bLength) {//让长度长的先走，直到二者长度相同，再同时前进
            if (aLength > bLength) {
                headA = headA.next;
                aLength--;
            } else {
                headB = headB.next;
                bLength--;
            }
        }

        //同时前进
        while (headA != headB) {
            headA = headA.next;
            headB = headB.next;
        }
        //head要么为null，要么就是相遇的第一个节点
        return headA;
    }


    //统计链表的长度
    private int length(ListNode node) {
        int length = 0;
        while (node != null) {
            node = node.next;
            length++;
        }
        return length;
    }
}
```