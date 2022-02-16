---
title: 剑指 Offer 38. 字符串的排列
date: 2021-03-06 14:04:02
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 38. 字符串的排列

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

这道题其实就是字符上的全排列问题，使用回溯算法就可以完成。

# 代码

```java
class Solution {
    public String[] permutation(String s) {
        if (s.length() == 0) {
            return new String[0];
        }

        // 转换成字符数组是常见的做法
        char[] charArr = s.toCharArray();
        // 排序是为了去重方便:使得相同的元素挨在一起
        Arrays.sort(charArr);

        // 由于操作的都是字符，使用 StringBuilder
        StringBuilder path = new StringBuilder();
        boolean[] used = new boolean[s.length()];

        // 为了方便收集结果，使用动态数组
        List<String> res = new ArrayList<>();
        backtrack(charArr, used, path, res);
        // 记得转成字符串数组
        return res.toArray(new String[0]);
    }

    /**
     * @param charArr 字符数组【选择列表】
     * @param used    当前字符是否使用
     * @param path    从根结点到叶子结点的路径【路径】
     * @param res     保存结果集的变量
     */
    public void backtrack(char[] charArr,
                     boolean[] used,
                     StringBuilder path,
                     List<String> res){
        if(path.length()==charArr.length){
            res.add(path.toString());
            return;
        }
        for(int i=0;i<charArr.length;i++){
            if(!used[i]){
                if (i > 0 && charArr[i] == charArr[i - 1] && used[i - 1]) {
                    continue;
                }
                used[i]=true;
                //做选择
                path.append(charArr[i]);
                backtrack(charArr,used,path,res);
                //撤销选择
                path.deleteCharAt(path.length() - 1);
                used[i]=false;
            }
        }
    }
}
```