---
title: 剑指 Offer 59 - I. 滑动窗口的最大值
date: 2021-03-09 14:33:42
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 59 - I. 滑动窗口的最大值

- [解题思路](#_3)
- [代码](#_6)

  
\)

# 解题思路

和滑动窗口有关的题目直接用**单调队列**。本题难点是创建出单调队列

# 代码

```java
class Solution {
        /*
    实现单调队列
    */
    class MonotonicQueue {

        LinkedList<Integer> q = new LinkedList<>();

        /*在队尾添加元素*/
        public void push(int n) {
            while (!q.isEmpty() && q.getLast() < n) {
                q.pollLast();
            }
            q.addLast(n);
        }

        /*返回当前队列中的最大值*/
        public int max() {
            return q.getFirst();
        }

        /*队头元素如果是n，删除它*/
        public void pop(int n) {
            if (n == q.getFirst()) {
                q.pollFirst();
            }
        }


    }
    /*开始解题*/
    public int[] maxSlidingWindow(int[] nums, int k) {
        MonotonicQueue window = new MonotonicQueue();
        List<Integer> res = new ArrayList<>();

        for (int i = 0; i < nums.length; i++) {
            if (i < k - 1) {
                //先填满窗口的前k-1，留一个先不填
                window.push(nums[i]);
            } else {
                //扩大窗口到k
                window.push(nums[i]);
                //记录当前大小为k的窗口中的最大值
                res.add(window.max());
                //移除最左边的一个旧元素
                window.pop(nums[i - k + 1]);
            }
        }
        //把res转成int[]
        int arr[] = new int[res.size()];
        for (int i = 0; i < res.size(); i++) {
            arr[i] = res.get(i);
        }
        return arr;
    }
}
```