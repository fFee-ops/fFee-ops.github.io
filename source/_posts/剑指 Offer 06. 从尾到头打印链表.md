---
title: 剑指 Offer 06. 从尾到头打印链表
date: 2021-03-02 14:16:55
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 06. 从尾到头打印链表

- [解题思路](#_2)
- [代码](#_10)

# 解题思路

链表特点： 只能从前至后访问每个节点。  
题目要求： 倒序输出节点值。  
这种 先入后出 的需求可以借助 **栈** 来实现。

**算法流程：**

- 入栈： 遍历链表，将各节点值 push 入栈。
- 出栈： 将各节点值 pop 出栈，存储于数组并返回。

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
    public int[] reversePrint(ListNode head) {
        Stack<Integer> stack=new Stack<>();

        while(head != null){
            stack.push(head.val);
            head=head.next;
        }
        //这里很重要
        int size=stack.size();
        int[] res = new int[size];
        
        //这里size一定要用之前保存的，不然你pop一下 stack的size在动态的变化
        for(int i=0;i<size;i++){
            res[i]=stack.pop();
        }
        return res;
    }
}
```