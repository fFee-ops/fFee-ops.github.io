---
title: 剑指 Offer 40. 最小的k个数
date: 2021-03-06 14:34:09
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 40. 最小的k个数

- [解题思路](#_2)
- [代码](#_9)

# 解题思路

**思路一：**  
注意找前 K 大/前 K 小问题不需要对整个数组进行 O\(NlogN\)O\(NlogN\) 的排序！  
例如本题，直接通过快排切分排好第 K 小的数（下标为 K-1），那么它左边的数就是比它小的另外 K-1 个数啦

**思路二\(容易理解一点\)：**  
利用大顶堆

# 代码

**思路一：**

```java
class Solution {
    public int[] getLeastNumbers(int[] arr, int k) {
        if (k == 0 || arr.length == 0) {
            return new int[0];
        }
        // 最后一个参数表示我们要找的是下标为k-1的数
        return quickSearch(arr, 0, arr.length - 1, k - 1);
    }

    private int[] quickSearch(int[] nums, int lo, int hi, int k) {
        // 每快排切分1次，找到排序后下标为j的元素，如果j恰好等于k就返回j以及j左边所有的数；
        int j = partition(nums, lo, hi);
        if (j == k) {
            return Arrays.copyOf(nums, j + 1);
        }
        // 否则根据下标j与k的大小关系来决定继续切分左段还是右段。
        return j > k? quickSearch(nums, lo, j - 1, k): quickSearch(nums, j + 1, hi, k);
    }

    // 快排切分，返回下标j，使得比nums[j]小的数都在j的左边，比nums[j]大的数都在j的右边。
    private int partition(int[] nums, int low, int high) {
        int i=low;
        int j=high;
        //基准
        int temp=nums[low];
        while(i<j){
            //j 先动
            while(nums[j]>=temp&&i<j){
                j--;
            }
            while(nums[i]<=temp&&i<j){
                i++;
            }
            if(i<j){
            int t=nums[i];
            nums[i]=nums[j];
            nums[j]=t;   
            }
            
        }
        //两指针重合后：交换基准
        nums[low]=nums[i];
        nums[i]=temp;
        return j;
    }
}
```

**思路二：**

```java
class Solution {
    public int[] getLeastNumbers(int[] arr, int k) {
        if(arr.length==0||k<=0){
            return new int[]{};
        }
        PriorityQueue<Integer> maxHeap=new PriorityQueue<>(3,(Integer a, Integer b)->{
            return b-a;
        });

        maxHeap.add(arr[0]);
        for(int i=1;i<arr.length;i++){
            if(maxHeap.size()<k){
                maxHeap.add(arr[i]);
            }else{
                if(arr[i]<maxHeap.peek()){
                    maxHeap.remove();//移除堆顶元素
                    maxHeap.add(arr[i]);
                }
            }
            
        }

        int[] res=new int[k];
        int size=maxHeap.size();
        for(int i=0;i<size;i++){
            res[i]=maxHeap.peek();
            maxHeap.remove();
        }
        return res;
    }
}
```