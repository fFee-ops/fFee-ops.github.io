---
title: 剑指 Offer 13. 机器人的运动范围
date: 2021-03-03 15:37:01
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 13. 机器人的运动范围

- [解题思路](#_2)
- [代码](#_21)

# 解题思路

本题是是典型的搜索问题，可以用DFS来解决。这题右两个 前置知识需要理解。

 1.     数位之和计算：  
    可通过循环求得数位和 s ，数位和计算的封装函数如下所示

```java
int sums(int x)
    int s = 0;
    while(x != 0) {
        s += x % 10;
        x = x / 10;
    }
    return s;
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210303153656290.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    boolean[][] visited;
    int row;
    int col;
    public int sum(int x){
        int res=0;
        while(x!=0){
            res+=x%10;
            x=x/10;
        }
        return res;
    }

    public int movingCount(int m, int n, int k) {
        this.visited=new boolean[m][n];
        this.row=m;
        this.col=n;
        return dfs(0,0,k);
    } 
    public int dfs(int i,int j,int k){
        if(i>=row || j>=col|| j<0||i<0 || visited[i][j] || (sum(i)+sum(j))>k){
            return 0;
        }
        visited[i][j]=true;
        int res=1;
        
        res +=dfs(i+1,j,k)+dfs(i,j+1,k)+dfs(i-1,j,k)+dfs(i,j-1,k);

        return res;
    }
}
```