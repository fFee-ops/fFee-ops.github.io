---
title: Java中nextInt()后，接nextLine() 会读到一个空行
date: 2021-07-26 18:15:06
tags: 
categories: 踩坑
---

<!--more-->

昨天pdd笔试一直卡在输入？  
就是这个问题：Java中nextInt\(\)后，接nextLine\(\) 会读到一个空行

**原因（太长可以忽略直接看解决）：**  
这是因为在调用nextLine\(\)函数前调用了Scanner的另一个函数nextInt\(\)（或是nextDouble\(\)）。出现这种情况的原因是两个函数的处理机制不同，nextInt\(\)函数在缓冲区中遇到“空格”、“回车符”等空白字符时会将空白字符前的数据读取走，但空白字符不会被处理掉，而nextLine\(\)函数是在缓冲区中读取一行数据，这行数据以“回车符”为结束标志，nextLine\(\)会把包括回车符在内的数据提走。所以nextInt\(\)后的nextLine\(\)函数并非读取不到数据，因为nextInt\(\)将“回车符”留在了缓冲区，nextLine\(\)读取时遇到的第一个字符便是“回车符”，所以直接结束了。

**解决：**

1.  在要使用nextLine\(\)前先调用一次nextLine\(\)
2.  或者都用nextLine\(\),再去转换格式