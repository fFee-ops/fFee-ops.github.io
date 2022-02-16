---
title: 剑指 Offer 43. 1～n 整数中 1 出现的次数
date: 2021-03-06 16:25:16
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 43. 1～n 整数中 1 出现的次数

- [解题思路](#_2)
- [代码](#_29)

# 解题思路

将 1 \~ n 的个位、十位、百位、…的 1 出现次数相加，即为 1 出现的总次数。  
**某位中 1出现次数的计算方法：**

- 当 cur = 0时： 此位 1 的出现次数只由高位 high 决定，计算公式为：`high×digit`  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/2021030616220053.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
- 当 cur = 1 时： 此位 1 的出现次数由高位 high 和低位 low决定，计算公式为：`high×digit+low+1`  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210306162240199.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
- 当 cur>1时： 此位 1 的出现次数只由高位 high 决定，计算公式为：`(high+1)×digit`  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210306162337774.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**设计按照 “个位、十位、…” 的顺序计算，则 high / cur / low / digit应初始化为：**

```java
high = n // 10
cur = n % 10
low = 0
digit = 1 # 个位
```

**因此，从个位到最高位的变量递推公式为：**

```java
            low += cur * digit;//将 cur 加入 low ，组成下轮 low
            cur = high % 10;//下轮 cur 是本轮 high 的最低位
            high /= 10;//将本轮 high 最低位删除，得到下轮 high
            digit *= 10;//位因子每轮 × 10
```

# 代码

```java
class Solution {
    public int countDigitOne(int n) {

        // 设计按照 “个位、十位、...” 的顺序计算，最开始cur为个位
        int digit = 1, res = 0;
        int high = n / 10, cur = n % 10, low = 0;
        while (high != 0 || cur != 0) {//当 high 和 cur 同时为 0 时，说明已经越过最高位，因此跳出
            //下面三个if else就是推出来的公式
            if (cur == 0) {
                res += high * digit;
            } else if (cur == 1) {
                res += high * digit + low + 1;
            } else {
                res += (high + 1) * digit;
            }
            low += cur * digit;//将 cur 加入 low ，组成下轮 low
            cur = high % 10;//下轮 cur 是本轮 high 的最低位
            high /= 10;//将本轮 high 最低位删除，得到下轮 high
            digit *= 10;//位因子每轮 × 10
        }
        return res;
    }
}
```