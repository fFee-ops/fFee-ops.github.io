---
title: nSum问题解题模板
date: 2021-02-26 00:10:45
tags: 
categories: 力扣
---

<!--more-->

```java
 /**
     * 计算数组中所有和为target的n元组
     * 注意：必须先给数组排序才可以使用本模板
     *
     * @param nums   数组
     * @param target 目标
     * @param n      几元组，也就是几sum问题
     * @param start  从nums[start]开始，计算有序数组中所有和为target的n元组
     * @return
     */
    public List<List<Integer>> nSumTarget(int[] nums, int target, int n, int start) {
        int size = nums.length;
        List<List<Integer>> res = new ArrayList<>();

        //至少要2Sum才能调用这个框架
        if (n < 2 || size < n) {
            return res;
        }

        if (n == 2) {//那就用2Sum标准的双指针那一套解法
            int lo = start;
            int hi = size - 1;

            while (lo < hi) {
                int sum = nums[lo] + nums[hi];
                int left = nums[lo];
                int right = nums[hi];

                if (sum < target) {
                    lo++;
                } else if (sum > target) {
                    hi--;
                } else {
                    //将满足条件的值添加到res
                    List<Integer> listM = new ArrayList<Integer>();
                    listM.add(left);
                    listM.add(right);
                    res.add(listM);
//题目要求的是不重复的答案，如何排除重复呢？nums[lo]==left代表出现了重复元素，那么lo还要前进，直到不是重复元素为止。
                    while (lo < hi && nums[lo] == left) {
                        lo++;
                    }
                    while (lo < hi && nums[hi] == right) {
                        hi--;
                    }
                }
            }
        } else {//不止2Sum的规模

            for (int i = start; i < size; i++) {
                //对于target-num[i]，再进行(n-1)Sum运算
                List<List<Integer>> subs = nSumTarget(nums, target - nums[i], n - 1, i + 1);
                
                for (List<Integer> sub : subs) {
                    //(n-1)Sum + nums[i]就是nSum
                    sub.add(nums[i]);
                    res.add(sub);
                }
                //跳过重复元素
                while (i < size - 1 && nums[i] == nums[i + 1]) i++;

            }
        }


        return res;
    }
```