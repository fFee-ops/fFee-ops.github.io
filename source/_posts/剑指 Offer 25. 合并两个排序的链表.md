---
title: 剑指 Offer 25. 合并两个排序的链表
date: 2021-03-04 15:37:50
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 25. 合并两个排序的链表

- [解题思路](#_2)
- [代码](#_6)

# 解题思路

第一想法就是**双指针**。单链表一般用快慢指针，剩下的一般用普通双指针。本题核心思路，新建一个链表，然后遍历比较`l1,l2`当前的节点，把小的那个放到新链表去，多次重复。

# 代码

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode fake=new ListNode(0);//伪节点
        ListNode cur=fake;//当前节点：新节点要添加到cur后

        while(l1 != null && l2 != null){
            if(l1.val<l2.val){
                cur.next=l1;//加入到新链表
                l1=l1.next;//移动到下一个待判断的节点
            }else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur=cur.next;//更新cur
        }
         //判断那个链表走到了尽头，将未走到尽头的链表全部追加在cur后边
         if(l1==null){
             cur.next=l2;
         }else{
             cur.next=l1;
         }
        //最开始建立了一个伪节点0，现在要丢掉它
         return fake.next;
    }
}
```