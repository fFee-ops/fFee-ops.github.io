---
title: 剑指 Offer 41. 数据流中的中位数
date: 2021-03-06 15:22:53
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 41. 数据流中的中位数

- [解题思路](#_2)
- [代码](#_15)

# 解题思路

这题用**小顶堆+大顶堆来做**。维护一个小顶堆，用来存放数组中较大的那一部分，维护一大顶堆，用来存放数组中较小的一部分。要始终保持小顶堆的**最小值大于等于大顶堆的最大值**。`也就是说小顶堆是保存大一部分的值嘛，那么大一部分的值中的最小值，都要大于较小部分的值的最大值`。 然后就是两个堆中元素数量相差为0，或者为1,不能>1

**算法步骤：**  
**A小顶堆：维护大元素；B大顶堆：维护小元素**

- 如果两个堆大小相等，就先插入到B再把B的最大值插入到A
- 不等就和上面的步骤反过来
- 把插入总结一下就是，如果俩堆大小相同，那么最终要插入到A，不同最终要插入到B。假如要插入到A，那么要先放到B，再取出B最大的元素放入A
- 然后求中位数，N是偶数就是大小顶堆的堆顶元素的和的一半，如果是奇数就是小顶堆的堆顶元素。

# 代码

```java
class MedianFinder {
        Queue<Integer> A, B;

        /**
         * initialize your data structure here.
         */
        public MedianFinder() {
            A = new PriorityQueue<>(); // 小顶堆，保存较大的一半
            B = new PriorityQueue<>((x, y) -> (y - x)); // 大顶堆，保存较小的一半
        }

        // 维持堆数据平衡，并保证小顶堆的最小值大于或等于右边堆的最大值 
        public void addNum(int num) {
            // N 为 奇数：需向 B 添加一个元素。实现方法：将新元素 num插入至 A ，再将 A堆顶元素插入至 B ；
            if (A.size() != B.size()) {
                A.add(num);
                B.add(A.poll());
            } else {//当 m = n（即 N 为 偶数）：需向 A 添加一个元素。实现方法：将新元素 num 插入至 B ，再将 B 堆顶元素插入至 A ；
                B.add(num);
                A.add(B.poll());
            }
        }

        public double findMedian() {
            //A.size() != B.size()相当是奇数，如果是偶数A,B的长度应该相同
            return A.size() != B.size() ? A.peek() : (A.peek() + B.peek()) / 2.0;
        }
    }
```