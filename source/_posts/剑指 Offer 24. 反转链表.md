---
title: 剑指 Offer 24. 反转链表
date: 2021-03-04 15:14:28
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 24. 反转链表

- [解题思路](#_2)
- [代码](#_11)

# 解题思路

链表–>**快慢指针**，但是这题的快慢指针有点难理解奥？就理解成普通双指针也行。  
主要就是理清楚反转节点的步骤。

1.  把需要反转的节点的下一个节点保存起来
2.  反转当前节点，指向它的前节点（用`pre`保存着）
3.  更新pre为反转了的那个节点，因为反转了的那个节点是下一个待反转节点的前节点
4.  cur指向本次该反转的节点
5.  重复以上操作，直到待反转节点为空，此时pre，也就是待反转节点的前节点就是新链表的头节点

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
    public ListNode reverseList(ListNode head) {
        ListNode pre = null;//指向反转后的节点的前节点
        ListNode cur = head;//指向即将反转的节点
        ListNode tmp = head;//保存即将要修改节点的下一个节点


        while (cur != null) {
            tmp = cur.next;
            //逐个节点反转
            cur.next = pre;
            //更新指针
            pre = cur;
            cur = tmp;
        }
        //cur 走到null了，那么pre在cur前一位，也就是新链表的头节点
        return pre;
    }
}
```