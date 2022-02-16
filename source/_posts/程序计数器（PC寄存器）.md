---
title: 程序计数器（PC寄存器）
date: 2020-09-13 12:37:54
tags: 
categories: JVM底层原理
---

<!--more-->

### 程序计数器（PC寄存器）

- [PC  Register介绍](#PC_nbspRegister_1)
- [举例说明](#_18)
- [三个常见的问题](#_37)

# PC  Register介绍

JVM中的程序计数寄存器\( Program Counter Register\)中, Register的命名源于CPU的寄存器,寄存器存储指令相关的现场信息。CPU只有把数据装载到寄存器才能够运行.  
  
  
这里,并非是广义上所指的物理寄存器,或许将其翻译为PC计数器\(或指令计数器\)会更加贴切\(也称为程序钩子\),并且也不容易引起一些不必要的误会。JVM中的PC寄存器是对物理PC寄存器的一种抽象模拟。

---

**作用**  
PC寄存器用来存储指向下一条指令的地址,也就是即将要执行的指令代码。由执行引擎读取下一条指令。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200913115653575.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

- 它是一块很小的内存空间,几乎可以忽略不记。也是运行速度最快的存储区域。（因为只存放了指向下一条指令的地址）
- 在JVM规范中,每个线程都有它自己的程序计数器,是线程私有的,生命周期与线程的生命周期保持一致。
- 任何时间一个线程都只有一个方法在执行,也就是所谓的当前方法。
- 字节码解释器工作时就是通过改变这个计数器的值来选取下一条需要执行的字节码指令。
- 它是唯一一个在Java虚拟机规范中没有规定任何OutOtMemoryError情况的区域。

# 举例说明

假如有以下JAVA代码

```java
public class jclassTest {
    public static void main(String[] args) {
        int i = 9;
        int j = 7;
        int k = i  + j;
    }
}
```

通过**jclasslib**插件反编译或者执行**javap**命令来执行这段代码，前提是该代码必须编译过  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200913121305813.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
在pc获取到指令地址2后，执行引擎会去读取pc寄存器中指令指向的语句，即：istore\_1，意思是保存局部变量表里索引为2的数据，再进入局部变量表：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200913121726347.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
然后执行引擎在执行后就在操作数栈中进行对应指令的入栈，相加，出栈的操作了，并且转化为机器指令，让cpu进行相应的运算。

# 三个常见的问题

**①使用PC寄存器存储字节码指令地址有什么用呢\?**  
JVM的字节码解释器就需要通过改变PC寄存器的值来明确下一条应该执行什么样的字节码指令。

**②为什么使用PC寄存器记录当前线程的执行地址呢\?**  
因为CPU需要不停的切换各个线程,这时候切换回来以后,就得知道接着从哪开始继续执行。可以理解为游标  
  
  
注意题目中的是**记录**当前线程的执行地址，PC寄存器存储的还是即将要执行的指令的地址。

**③PC寄存器为什么会被设定为线程私有？**  
多线程在一个特定的时间段内指挥执行其中某一个线程的方法，CPU会不停地做任务切换，这必然会导致经常中断或者恢复（**CPU时间片轮换机制**，宏观上我们可以打开多个应用程序同时运行，但在微观上单核情况下由于只有一个CPU，一次只能处理程序要求的一部分），如何保证CPU回到不同线程的时候能正确从上次工作点继续工作？**最好地办法自然是为每个线程都分配一个PC寄存器，这样一来各线程之间便可以进行独立计算，从而不会出现相互干扰的情况。**

---

小知识：**时间片**![在这里插入图片描述](https://img-blog.csdnimg.cn/20200913123152980.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)