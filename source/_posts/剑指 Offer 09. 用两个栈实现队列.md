---
title: 剑指 Offer 09. 用两个栈实现队列
date: 2021-03-02 18:05:34
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 09. 用两个栈实现队列

- [解题思路](#_2)
- [代码](#_13)

# 解题思路

> 题目只要求实现 加入队尾appendTail\(\) 和 删除队首deleteHead\(\) 两个函数的正常工作，因此我们可以设计栈 A 用于加入队尾操作，栈 B 用于将元素倒序，从而实现删除队首元素。

用两个栈来实现。

- 加入队尾 appendTail\(\)函数： 将数字 val 加入栈 A 即可。
- 删除队首deleteHead\(\)函数： 有以下三种情况。
  - 当栈 B 不为空： B中仍有已完成倒序的元素，因此直接返回 B 的栈顶元素。
  - 否则，当 A 为空： 即两个栈都为空，无元素，因此返回 -1 。
  - 否则： 将栈 A 元素全部转移至栈 B 中，实现元素倒序，并返回栈 B 的栈顶元素。

# 代码

```java
class CQueue {

    Stack<Integer> A,B;

    public CQueue() {
        A = new Stack<Integer>();
        B = new Stack<Integer>();
    }
    
    public void appendTail(int value) {
        A.push(value);
    }
    
    public int deleteHead() {
        if(!B.isEmpty()){
            return B.pop();
        }
        if(A.isEmpty()){//上面判断了B不为空，如果来到这里，证明B为空，A也为空
            return -1;
        }
        while(!A.isEmpty()){//A不为空，就把A的元素弹出到B，再删除B栈顶元素
            B.push(A.pop());
        }
        return B.pop();
    }
}

/**
 * Your CQueue object will be instantiated and called as such:
 * CQueue obj = new CQueue();
 * obj.appendTail(value);
 * int param_2 = obj.deleteHead();
 */

```