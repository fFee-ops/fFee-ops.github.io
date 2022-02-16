---
title: Java笔试的各种输入情况
date: 2021-03-18 23:17:45
tags: 
categories: 踩坑
---

<!--more-->

### Java笔试的各种输入情况

- - [1、行数不确定，每行的值是确定的，比如每行只有两个数](#1_2)
  - [2、行数确定，每一行的元素个数不确定](#2_18)
  - [3、单行输入多个参数](#3_46)
  - [4、多行输入多个参数，每行参数个数不定](#4_62)

  
如果要是需要的是字符串简单多了，主要是有时候输入的是字符串，要转为int

## 1、行数不确定，每行的值是确定的，比如每行只有两个数

> 2  
> 1 2  
> 3 4

```java
Scanner sc = new Scanner(System.in);
	 int N = sc.nextInt();
	 int[][] swap = new int[K][2];
        for (int i = 0; i < N; i++) {
            swap[i][0] = sc.nextInt();
            swap[i][1] = sc.nextInt();
        }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/456c9d72ffb14a7e8d78dbc8aba68b14.png)

## 2、行数确定，每一行的元素个数不确定

`第一行输入两个数字m，n，分别表示数组num1和num2的长度，第二行和第三行输入num1和num2的元素`

> // 输入如下  
> 3 4  
> 10 2 3  
> 11 4 5 6

```java
Scanner sc = new Scanner(System.in);
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[] n1=new int[m];
        int[] n2=new int[n];
        for (int i = 0; i < m; i++) {
            n1[i]=sc.nextInt();
        }
        for (int i = 0; i < n; i++) {
            n2[i]=sc.nextInt();
        }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/f0ef6072e8444b1ca6f797e28cc5e74f.png)

## 3、单行输入多个参数

> 1 2 3 4 5 6

```java
Scanner sc = new Scanner(System.in);
        String s = "";
        s = sc.nextLine();
        String[] s1 = s.trim().split(" ");//一般都是以空格分割
        int[] nums = new int[s1.length];
        for (int i = 0; i < s1.length; i++) {
            nums[i]=Integer.parseInt(s1[i]);
        }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/84d26ef503aa40499bac2bc0ea954572.png)

## 4、多行输入多个参数，每行参数个数不定

`假设第一行输入m,m表示后面有m行，每一行的元素个数不确定`

> // 输入如下  
> 3  
> 1 2 3 4  
> 2 3  
> 1

```java
public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt();
        sc.nextLine();
        String[] s = new String[m];
        for (int i = 0; i < m; i++) {
            s[i] = sc.nextLine();
        }
        List<String[]> list = new ArrayList<>();
        for (int i = 0; i < s.length; i++) {
            String[] s1 = s[i].split(" ");
            list.add(s1);
        }

        List[] res = new List[list.size()];
        for (int i = 0; i < list.size(); i++) {
            String[] strings = list.get(i);
            res[i] = new ArrayList();
            for (String c : strings) {
                res[i].add(Integer.parseInt(c));
            }
        }

        System.out.println(Arrays.deepToString(res));
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/978b362f34d44c359b980234e2bde1f8.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)