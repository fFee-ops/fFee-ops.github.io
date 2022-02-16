---
title: 剑指 Offer 12. 矩阵中的路径
date: 2021-03-03 14:56:01
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 12. 矩阵中的路径

- [解题思路](#_2)
- [代码](#_7)

# 解题思路

本问题是典型的矩阵搜索问题，可使用 深度优先搜索（DFS）+ 剪枝 解决。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210303145548777.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    public boolean exist(char[][] board, String word) {
        char[] words = word.toCharArray();
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                if (dfs(board, words, i, j, 0)) {//看dfs是否找到了结果
                    return true;
                }
            }
        }
        return false;
    }

    boolean dfs(char[][] board, char[] word, int i, int j, int k) {
        //结束条件，越界、或者当前元素与目标字符不匹配、或者元素已经被访问过了
        if (i >= board.length || i < 0 || j >= board[0].length || j < 0 || board[i][j] != word[k]) {
            return false;
        }
        //证明已经找到了一条符合要求的路径
        if (k == word.length - 1) {
            return true;
        }
        //将走过的路标记为‘#’，防止重复访问
        board[i][j] = '#';

        //分别向下、上、右、左四个方向遍历
        boolean res = dfs(board, word, i + 1, j, k + 1) ||
                dfs(board, word, i - 1, j, k + 1) ||
                dfs(board, word, i, j + 1, k + 1) ||
                dfs(board, word, i, j - 1, k + 1);
        //恢复防止访问的标志
        board[i][j] = word[k];
        return res;
    }
}
```