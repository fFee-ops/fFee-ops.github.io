---
title: 剑指 Offer 48. 最长不含重复字符的子字符串
date: 2021-03-07 10:56:38
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 48. 最长不含重复字符的子字符串

- [解题思路](#_2)
- [代码](#_9)

# 解题思路

套用模板即可，因为只有一个字符串，所以模板还可以简化一下，不需要`need和valid`。

更新窗口内数据只要更新window内该字符出现的次数就可以了。

还要注意更新结果是在收缩窗口之后。要保证无重复字符串，那么哪一个窗口是没有重复的字符串呢？回头看一下我们收缩窗口的条件：存在重复元素，所以我们收缩窗口之后的那个窗口是一定没有重复元素的。

# 代码

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> window = new HashMap<>();
        int left = 0;
        int right = 0;
        int res = 0;//记录结果

        while (right < s.length()) {
            char c = s.charAt(right);
            right++;
            //进行窗口内数据的更新
            window.put(c, window.getOrDefault(c, 0) + 1);

            //说明有重复的字串出现，因为名称为c的字符出现的次数大于1了，不符合条件
            while (window.getOrDefault(c, 0) > 1) {
                char d = s.charAt(left);
                left++;
                //进行窗口内数据的更新
                window.put(d, window.getOrDefault(d, 0) - 1);
            }

            //在这里更新答案
            res = Math.max(res, right - left);

        }
        return res;
    }
}
```