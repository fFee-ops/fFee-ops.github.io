---
title: 剑指 Offer 30. 包含min函数的栈
date: 2021-03-05 10:24:16
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 30. 包含min函数的栈

- [解题思路](#_2)
- [代码](#_7)

# 解题思路

可通过建立辅助栈实现本题。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210304175526801.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
    class MinStack {
        Stack<Integer> A;
        Stack<Integer> B;

        /**
         * initialize your data structure here.
         */
        public MinStack() {
            A = new Stack<>();
            B = new Stack<>();
        }

        public void push(int x) {
            A.push(x);
            //若 ① 栈 B 为空 或 ② x 小于等于 栈 B 的栈顶元素，则将 x 压入栈 B 
            if (B.empty() || B.peek() >= x) {
                B.push(x);
            }
        }

        public void pop() {
// 由于 Stack 中存储的是 int 的包装类 Integer ，因此需要使用 equals() 代替 == 来比较值是否相等
            Integer pop = A.pop();
            //即A最小的那个元素已经出栈了，B这边也要更新
            if (pop.equals(B.peek())) {
                B.pop();
            }

        }

        public int top() {
            return A.peek();
        }

        public int min() {
            return B.peek();
        }
    }

/**
 * Your MinStack object will be instantiated and called as such:
 * MinStack obj = new MinStack();
 * obj.push(x);
 * obj.pop();
 * int param_3 = obj.top();
 * int param_4 = obj.min();
 */
```