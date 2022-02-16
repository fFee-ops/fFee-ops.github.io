---
title: 剑指 Offer 35. 复杂链表的复制
date: 2021-03-05 20:45:59
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 35. 复杂链表的复制

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

利用哈希表的查询特点，考虑构建 原链表节点 和 新链表对应节点 的键值对映射关系，再遍历构建新链表各节点的 next 和 random 引用指向即可。

# 代码

```java
/*
// Definition for a Node.
class Node {
    int val;
    Node next;
    Node random;

    public Node(int val) {
        this.val = val;
        this.next = null;
        this.random = null;
    }
}
*/
class Solution {
    public Node copyRandomList(Node head) {
        if(head==null){
            return null;
        }
        //指针
        Node cur=head;
        Map<Node, Node> map = new HashMap<>();
        // 复制各节点，并建立 “原节点 -> 新节点” 的 Map 映射
        while(cur!=null){
            map.put(cur, new Node(cur.val));
            cur = cur.next;
        }
        //重置一下cur为head，方便下一轮遍历，给指针赋值
        cur=head;
        // 构建新链表的 next 和 random 指向
        while(cur != null) {
            //拿到当前节点的下一个元素的值，让新节点指向它
            map.get(cur).next = map.get(cur.next);
            map.get(cur).random = map.get(cur.random);
            cur = cur.next;
        }
        //返回新链表头节点
        return map.get(head);
    }
}
```