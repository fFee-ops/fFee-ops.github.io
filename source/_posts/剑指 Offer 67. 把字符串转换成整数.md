---
title: 剑指 Offer 67. 把字符串转换成整数
date: 2021-03-10 16:28:38
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 67. 把字符串转换成整数

- [解题思路](#_2)
- [代码](#_12)

# 解题思路

**越界判断：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210309223817589.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210309223708493.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 代码

```java
class Solution {
    public int strToInt(String str) {
        char[] c = str.trim().toCharArray();
        if (c.length == 0) {
            return 0;
        }

        int res = 0;//保存结果
        int boundary = Integer.MAX_VALUE / 10;
        int sign = 1;//保存符号

        int i = 1;
        if (c[0] == '-') {
            sign = -1;
        } else if (c[0] != '+') {
            /*
            这里主要是为了应对两种情况：①第一个字符就是数字，没有符号罢了②第一个字符不是符号，是字母
            对于第一种情况：让i=0，即从第一个字符开始判断即可
            对于第二种情况：虽然能过这个if，等到下个if判断出不是字符，直接就会结束循环了
             */
            i = 0;
        }

        for (int j = i; j < c.length; j++) {
            //不是数字了就结束循环
            if (c[j] < '0' || c[j] > '9') {
                break;
            }

            //除了个位以外的位大于了bndry，或者除了个位以外的位等于bndry，但是个位大于7了也是越界
            if (res > boundary || res == boundary && c[j] > '7') {
                return sign == 1 ? Integer.MAX_VALUE : Integer.MIN_VALUE;
            }
            res = res * 10 + (c[j] - '0');
        }
        return sign * res;
    }
}
```