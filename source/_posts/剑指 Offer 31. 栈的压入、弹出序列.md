---
title: 剑指 Offer 31. 栈的压入、弹出序列
date: 2021-03-05 10:25:45
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 31. 栈的压入、弹出序列

- [解题思路](#_2)
- [代码](#_8)

# 解题思路

借用一个辅助栈 stack，模拟 压入 / 弹出操作的排列。根据是否模拟成功，即可得到结果。

**主要步骤：**

- 入栈操作： 按照压栈序列的顺序执行。
- 出栈操作： 每次入栈后，循环判断 “栈顶元素 == 弹出序列的当前元素” 是否成立，将符合弹出序列顺序的栈顶元素全部弹出。

# 代码

```java
class Solution {
    public boolean validateStackSequences(int[] pushed, int[] popped) {
        Stack<Integer> stack=new Stack<>();
        int i=0;//记录popped数组下标
        for(int num:pushed){
            stack.push(num);
            while(!stack.isEmpty() && stack.peek() == popped[i]) { // 循环判断与出栈
                stack.pop();
                i++;
            }
        }
        //stack为空代表可以按照popped顺序出栈
        return stack.isEmpty();
    }
}
```