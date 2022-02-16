---
title: 剑指 Offer 51. 数组中的逆序对
date: 2021-03-07 15:00:06
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 51. 数组中的逆序对

- [解题思路](#_2)
- [代码](#_14)

# 解题思路

一刷2021/3/7  
归并排序，但是大体思路还有点没理解的。

二刷2021/3/12  
其实就是个在数组中的两个数字，如果前面一个数字大于后面的数字，则这两个数字组成一个逆序对。所以只要在归并模板中加一行代码即可。

**注意temp的位置，不要定义在递归函数中，会超时**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210312202414533.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
可以发现6如果是逆序，那么对于2来说，6之后的数字也大于它。所以逆序对就是`mid-p1+1` 也就是6-8的数字个数

# 代码

```java
class Solution {
    //全局变量：统计逆序对数量
    private int count; 
    //临时数组，存放结果  一定要放在这，如果放在merge方法中，则每次递归都要创建一个数组，会超时！！
    int[] temp;
    public int reversePairs(int[] a) {
        count=0;
        temp=new int[a.length];
        MergeSort(a);
        return count;
    }
        private  void MergeSort(int[] a) {
        Sort(a, 0, a.length - 1);
    }
        //拆分
    private  void Sort(int[] a,int left,int right){
        if(left>=right){
            return;
        }
        int mid = left + (right - left) / 2;
        //二路归并要俩Sort
        Sort(a,left,mid);
        Sort(a,mid+1,right);
        merge(a,left,mid,right);
    }
    
    //合并
    private  void merge(int[] a, int left, int mid, int right) {
        int k=left;//存放指针
        //左右边界指针
        int p1=left;
        int p2=mid+1;
        while(p1<=mid&&p2<=right){
            if(a[p1]<=a[p2]){
                temp[k++]=a[p1++];
            }else{
                /*左边大于右边：为逆序，当大于时，
                表示左区间i及i之后的数都将大于j指向的数，所以出现了mid+1-i个逆序对*/
                //增加的一行代码，用来统计逆序对个数
                count=count+(mid-p1+1);
                temp[k++]=a[p2++];
            }
        }
        //左右还有剩余的就直接拼接上
        while(p1<=mid){
            temp[k++]=a[p1++];
        }
        while(p2<=right){
            temp[k++]=a[p2++];
        }
        //存放回原数组
        for(int i=left;i<=right;i++){
            a[i]=temp[i];
        }
    }
    
}

```