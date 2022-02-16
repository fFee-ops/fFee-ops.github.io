---
title: 剑指 Offer 19. 正则表达式匹配
date: 2021-03-04 13:13:50
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 19. 正则表达式匹配

- [解题思路](#_2)
- [代码](#_26)

# 解题思路

**dp数组含义：`dp[i][j]` 代表 A的前 i 个字符和 B 的前 j 个字符能否匹配**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210304131442899.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210304131446632.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**转移方程：** 需要注意，由于 `dp[0][0]`代表的是空字符的状态， 因此 dp\[i\]\[j\] 对应的添加字符是 `s[i \- 1] 和 p[j \- 1]` 。

- 当 `p[j \- 1] = '*'` 时， `dp[i][j]` 在当以下任一情况为 true 时等于 true ：

    1.  dp\[i\]\[j - 2\]： 即将字符组合 p\[j - 2\] \* 看作出现 0 次时，能否匹配；
    2.  dp\[i - 1\]\[j\] 且 s\[i - 1\] = p\[j - 2\]: 即让字符 p\[j - 2\] 多出现 1 次时，能否匹配；
    3.  dp\[i - 1\]\[j\] 且 p\[j - 2\] = ‘.’: 即让字符 ‘.’ 多出现 1 次时，能否匹配；

- 当 `p[j \- 1] != '*'` 时，`dp[i][j]` 在当以下任一情况为 true 时等于 true ：

    1.  dp\[i - 1\]\[j - 1\] 且 s\[i - 1\] = p\[j - 1\]： 即让字符 p\[j - 1\] 多出现一次时，能否匹配；
    2.  dp\[i - 1\]\[j - 1\] 且 p\[j - 1\] = ‘.’： 即将字符 . 看作字符 s\[i - 1\] 时，能否匹配；

**初始化:**

- 空串和空正则是匹配的，f\[0\]\[0\] = true
- 空串和非空正则，不能直接定义 true和 false，必须要计算出来。（比如A= ‘’ ‘’ ,B=a \* b \* c \*）
- 非空串和空正则必不匹配，f\[1\]\[0\]=…=f\[n\]\[0\]=false
- 非空串和非空正则，那肯定是需要计算的了

# 代码

```java
class Solution {
    public boolean isMatch(String A, String B) {
        int m = A.length()+1;
        int n = B.length()+1;
        //dp[i][j] 代表 A的前 i 个字符和 B 的前 j 个字符能否匹配
        boolean[][] dp = new boolean[m ][n ];

        //base case
        //空串和空串肯定能匹配,dp[0][1]和dp[1][0]~dp[s.length][0]默认值为false所以不需要显式初始化
        dp[0][0] = true;
        //填写第一行dp[0][2]~dp[0][p.length]
        for (int k = 2; k <= B.length(); k++) {
            //p字符串的第2个字符是否等于'*',此时j元素需要0个，所以s不变,减除p的*号以及*号前 这两个字符
            dp[0][k] = B.charAt(k - 1) == '*' && dp[0][k - 2];
        }
        // 状态转移：填写dp数组剩余部分
        //之所以下标都从1开始，是因为下标0代表的是空串，而两个字符串的空串情况我们在上面已经初始化完了，现在考虑的是二者都不为空串的情况
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                //匹配串的第j个字符是否为* :注意字符串的第一个字符，应该是j-1,因为dp数组的0，留给了空串
                if (B.charAt(j - 1) == '*') {
                    //将字符组合 B[j - 2] * 看作出现 0 次时，能否匹配
                    if (dp[i][j - 2]) {
                        dp[i][j] = true;
                    }
                    //让字符 B[j - 2] 多出现 1 次时，能否匹配；
                    else if (dp[i - 1][j] && A.charAt(i - 1) == B.charAt(j - 2)) {
                        dp[i][j] = true;
                    }
                    //让字符 '.' 多出现 1 次时，能否匹配；
                    else if (dp[i - 1][j] && B.charAt(j - 2) == '.') {
                        dp[i][j] = true;
                    }

                } else {
                    if (dp[i - 1][j - 1] && A.charAt(i - 1) == B.charAt(j - 1)) {
                        dp[i][j] = true;  // 1.即让字符 B[j - 1] 多出现一次时，能否匹配；
                    } else if (dp[i - 1][j - 1] && B.charAt(j - 1) == '.') {
                        dp[i][j] = true;         // 2.即将字符 . 看作字符 A[i - 1] 时，能否匹配；
                    }
                }
            }
        }
        return dp[m-1][n-1];
    }
}
```