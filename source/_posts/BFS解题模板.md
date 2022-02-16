---
title: BFS解题模板
date: 2020-12-02 22:44:05
tags: 
categories: 力扣
---

<!--more-->

**文字版**

```java
    void BFS()
    {
        定义队列;
        定义备忘录，用于记录已经访问的位置；

        判断边界条件，是否能直接返回结果的。

        将起始位置加入到队列中，同时更新备忘录。

        while (队列不为空) {
            获取当前队列中的元素个数。
            for (元素个数) {
                取出一个位置节点。
                判断是否到达终点位置。
                获取它对应的下一个所有的节点。
                条件判断，过滤掉不符合条件的位置。
                新位置重新加入队列。
            }
        }

    }
```

**代码版**

```java
   // 计算从起点 start 到终点 target 的最近距离
   int BFS(Node start, Node target) {
       Queue<Node> q; // 核心数据结构
       Set<Node> visited; // 避免走回头路

       q.add(start); // 将起点加入队列
       visited.add(start);
       int step = 0; // 记录扩散的步数

       while (q not empty) {
           int sz = q.size();
//            将当前队列中的所有节点向四周扩散
           for (int i = 0; i < sz; i++) {
               Node cur = q.poll();
//               划重点：这里判断是否到达终点
               if (cur is target)
               return step;
//                将 cur 的相邻节点加入队列
               for (Node x : cur.adj())
                   if (x not in visited) {
                   q.add(x);
                   visited.add(x);
               }
           }
//            划重点：更新步数在这里
           step++;
       }
   }
```

> cur.adj\(\) 泛指 cur 相邻的节点，比如说二维数组中，cur 上下左右四面的位置就是相邻节点；visited 的主要作用是防止走回头路，大部分时候都是必须的，但是像一般的二叉树结构，没有子节点到父节点的指针，不会走回头路就不需要 visited。