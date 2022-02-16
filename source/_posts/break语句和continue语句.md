---
title: break语句和continue语句
date: 2020-11-09 23:41:45
tags: 
categories: java
---

<!--more-->

### break语句和continue语句

- [break](#break_3)
- [continue](#continue_26)

# break

在任何循环语句的主体部分，均可用break控制循环的流程。break用于强行**退出循环**，**不执行循环中剩余的语句**。

```java
public class Test16 {
    public static void main(String[] args) {
        int total = 0;//定义计数器
        System.out.println("Begin");
        while (true) {
            total++;//每循环一次计数器加1
            int i = (int) Math.round(100 * Math.random());
            //当i等于88时，退出循环
            if (i == 88) {
                break;
            }
        }
        //输出循环的次数
        System.out.println("Game over， used " + total + " times.");
    }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201109233942850.png#pic_center)

# continue

continue 语句用在循环语句体中，用于终止**某次**循环过程，即跳过循环体中尚未执行的语句，**接着进行下一次**是否执行循环的判定。

**注意：**

1.  continue用在while，do-while中，continue 语句立刻跳到循环首部，越过了当前循环的其余部分。

2.  continue用在for循环中，跳到for循环的迭代因子部分。

**示例：把100\~150之间不能被3整除的数输出，并且每行输出5个**

```java
public class Test17 {
    public static void main(String[] args) {
        int count = 0;//定义计数器
        for (int i = 100; i < 150; i++) {
            //如果是3的倍数，则跳过本次循环，继续进行下一次循环
            if (i % 3 == 0){
                continue;
            }
            //否则（不是3的倍数），输出该数
            System.out.print(i + "、");
            count++;//没输出一个数，计数器加1
            //根据计数器判断每行是否已经输出了5个数
            if (count % 5 == 0) {
                System.out.println();
            }
        }
    }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201109234137528.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)