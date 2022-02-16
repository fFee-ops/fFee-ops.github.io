---
title: Java基础、集合篇
date: 2022-01-21 19:58:37
tags:
categories: 私密文章
password: f0c3a40bc7adb2998a8ee70350e5d74ce7fa33f303f2b60f5e9ed13998af2d3d
---

@[toc](Java基础、集合篇)


#  Java基础

##  1、关于自动装箱、拆箱
简单一点说，装箱就是  自动将基本数据类型转换为包装器类型；拆箱就是  自动将包装器类型转换为基本数据类型。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201212132417392.png)



**装箱和拆箱是如何实现的：**

用一句话来总结：　装箱过程是通过调用包装器的valueOf方法实现的，而拆箱过程是通过调用包装器的 xxxValue方法实现的。（xxx代表对应的基本数据类型）。

###  面试中相关的问题
**1.下面这段代码的输出结果是什么？**
```java
public class Main {
    public static void main(String[] args) {
         
        Integer i1 = 100;
        Integer i2 = 100;
        Integer i3 = 200;
        Integer i4 = 200;
         
        System.out.println(i1==i2);
        System.out.println(i3==i4);
    }
}
```
很多人以为答案是ture，true。但是正确的答案是**true，false**

为什么会出现这样的结果？输出结果表明i1和i2指向的是同一个对象，而i3和i4指向的是不同的对象。此时只需一看源码便知究竟，下面这段代码是Integer的valueOf方法的具体实现：
```java
public static Integer valueOf(int i) {
        if(i >= -128 && i <= IntegerCache.high)
            return IntegerCache.cache[i + 128];
        else
            return new Integer(i);
    }
```

而其中IntegerCache类的实现为：
```java
 private static class IntegerCache {
        static final int high;
        static final Integer cache[];

        static {
            final int low = -128;

            // high value may be configured by property
            int h = 127;
            if (integerCacheHighPropValue != null) {
                // Use Long.decode here to avoid invoking methods that
                // require Integer's autoboxing cache to be initialized
                int i = Long.decode(integerCacheHighPropValue).intValue();
                i = Math.max(i, 127);
                // Maximum array size is Integer.MAX_VALUE
                h = Math.min(i, Integer.MAX_VALUE - -low);
            }
            high = h;

            cache = new Integer[(high - low) + 1];
            int j = low;
            for(int k = 0; k < cache.length; k++)
                cache[k] = new Integer(j++);
        }

        private IntegerCache() {}
    }
```

从这2段代码可以看出，在通过valueOf方法创建**Integer对象**的时候，如果数值在[-128,127]之间，便返回指向IntegerCache.cache中已经存在的对象的引用；否则创建一个新的Integer对象。

上面的代码中i1和i2的数值为100，因此会直接从cache中取已经存在的对象，所以i1和i2指向的是同一个对象，而i3和i4则是分别指向不同的对象。



**2.下面这段代码的输出结果是什么？**
```java
public class Main {
    public static void main(String[] args) {
         
        Double i1 = 100.0;
        Double i2 = 100.0;
        Double i3 = 200.0;
        Double i4 = 200.0;
         
        System.out.println(i1==i2);
        System.out.println(i3==i4);
    }
}
```

**结果：false、false**
　　也许有的朋友会认为跟上面一道题目的输出结果相同，但是事实上却不是。
因为：Double类的valueOf方法会采用与Integer类的valueOf方法不同的实现。很简单：在某个范围内的整型数值的个数是有限的，而浮点数却不是。



<font color=red>注意
Integer、Short、Byte、Character、Long这几个类的valueOf方法的实现是类似的。
Double、Float的valueOf方法的实现是类似的。</font>

**3.下面这段代码输出结果是什么：**
```java
public class Main {
    public static void main(String[] args) {
         
        Boolean i1 = false;
        Boolean i2 = false;
        Boolean i3 = true;
        Boolean i4 = true;
         
        System.out.println(i1==i2);
        System.out.println(i3==i4);
    }
}
```
>true
>true

为什么是这个结果，同样地，看了Boolean类的源码也会一目了然。下面是Boolean的valueOf方法的具体实现：
```java
public static Boolean valueOf(boolean b) {
        return (b ? TRUE : FALSE);
    }
```

而其中的 TRUE 和FALSE又是什么呢？在Boolean中定义了2个<font color=red>**静态**</font>成员属性：
```java
public static final Boolean TRUE = new Boolean(true);

    /** 
     * The <code>Boolean</code> object corresponding to the primitive 
     * value <code>false</code>. 
     */
    public static final Boolean FALSE = new Boolean(false);
```


**4.谈谈Integer i = new Integer(xxx)和Integer i =xxx;这两种方式的区别。**
1）第一种方式不会触发自动装箱的过程；而第二种方式会触发；

　2）在执行效率和资源占用上的区别。第二种方式的执行效率和资源占用在一般性情况下要优于第一种情况（注意这并不是绝对的）。

<br><br>
有两点要注意的
1、当 "=="运算符的两个操作数都是 包装器类型的引用，则是比较指向的是否是同一个对象，而如果其中有一个操作数是表达式（即包含算术运算）则比较的是数值（即会触发自动拆箱的过程）。

2、对于包装器类型，equals方法并不会进行类型转换。

例如：
```java
public class Main {
    public static void main(String[] args) {
         
        Integer a = 1;
        Integer b = 2;
        Integer c = 3;
        Integer d = 3;
        Integer e = 321;
        Integer f = 321;
        Long g = 3L;
        Long h = 2L;
         
        System.out.println(c==d);
        System.out.println(e==f);
        System.out.println(c==(a+b));
        System.out.println(c.equals(a+b));
        System.out.println(g==(a+b));
        System.out.println(g.equals(a+b));
        System.out.println(g.equals(a+h));
    }
}
```
>true
>false
>true
>true
>true
>false
>true

第一个和第二个输出结果没有什么疑问。第三句由于  a+b包含了算术运算，因此会触发自动拆箱过程（会调用intValue方法），因此它们比较的是数值是否相等。而对于c.equals(a+b)会先触发自动拆箱过程，再触发自动装箱过程，也就是说a+b，会先各自调用intValue方法，得到了加法运算后的数值之后，便调用Integer.valueOf方法，再进行equals比较。同理对于后面的也是这样，不过要注意倒数第二个和最后一个输出的结果（如果数值是int类型的，装箱过程调用的是Integer.valueOf；如果是long类型的，装箱调用的Long.valueOf方法）。



##  equals()的若干问题解答


###  equals() 的作用是什么？
equals() 的作用是 用来判断两个对象是否相等。

equals() 定义在JDK的Object.java中。通过判断两个对象的地址是否相等(即，是否是同一个对象)来区分它们是否相等。源码如下：
```java
public boolean equals(Object obj) {
    return (this == obj);
}
```

使用**默认**的“equals()”方法，等价于“==”方法。因此，我们通常会**重写**equals()方法：若两个对象的内容相等，则equals()方法返回true；否则，返回fasle。  



下面根据“类是否覆盖equals()方法”，将它分为2类。
(01) 若某个类没有覆盖equals()方法，当它的通过equals()比较两个对象时，实际上是比较两个对象是不是同一个对象。这时，等价于通过“==”去比较这两个对象。

```java
import java.util.*;
import java.lang.Comparable;

/**
 * @desc equals()的测试程序。
 *
 * @author skywang
 * @emai kuiwu-wang@163.com
 */
public class EqualsTest1{

    public static void main(String[] args) {
        // 新建2个相同内容的Person对象，
        // 再用equals比较它们是否相等
        Person p1 = new Person("eee", 100);
        Person p2 = new Person("eee", 100);
        System.out.printf("%s\n", p1.equals(p2));
    }

    /**
     * @desc Person类。
     */
    private static class Person {
        int age;
        String name;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String toString() {
            return name + " - " +age;
        }
    }
}
```

>false
>我们通过 p1.equals(p2) 来“比较p1和p2是否相等时”。实际上，调用的Object.java的equals()方法，即等价于调用的 (p1==p2) 。它是比较“p1和p2是否是同一个对象”。<br>
       而由 p1 和 p2 的定义可知，它们虽然内容相同；但它们是两个不同的对象！因此，返回结果是false。
---
(02) 我们可以覆盖类的equals()方法，来让equals()通过其它方式比较两个对象是否相等。通常的做法是：若两个对象的内容相等，则equals()方法返回true；否则，返回fasle。
```java
import java.util.*;
import java.lang.Comparable;

/**
 * @desc equals()的测试程序。
 *
 * @author skywang
 * @emai kuiwu-wang@163.com
 */
public class EqualsTest2{

    public static void main(String[] args) {
        // 新建2个相同内容的Person对象，
        // 再用equals比较它们是否相等
        Person p1 = new Person("eee", 100);
        Person p2 = new Person("eee", 100);
        System.out.printf("%s\n", p1.equals(p2));
    }

    /**
     * @desc Person类。
     */
    private static class Person {
        int age;
        String name;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String toString() {
            return name + " - " +age;
        }

        /**
         * @desc 覆盖equals方法
         */
        @Override
        public boolean equals(Object obj){
            if(obj == null){
                return false;
            }

            //如果是同一个对象返回true，反之返回false
            if(this == obj){
                return true;
            }

            //判断是否类型相同
            if(this.getClass() != obj.getClass()){
                return false;
            }

            Person person = (Person)obj;
            return name.equals(person.name) && age==person.age;
        }
    }
}
```

>true
>我们在EqualsTest2.java 中重写了Person的equals()函数：当两个Person对象的 name 和 age 都相等，则返回true。
>因此，运行结果返回true。

###  equals() 与 == 的区别是什么？
**== :**  它的作用是判断两个对象的地址是不是相等。即，判断两个对象是不试同一个对象。

**equals() :** 它的作用也是判断两个对象是否相等。但它一般有两种使用情况(前面已详细介绍过)：
- 情况1，类没有覆盖equals()方法。则通过equals()比较该类的两个对象时，等价于通过“==”比较这两个对象。
- 情况2，类覆盖了equals()方法。一般，我们都覆盖equals()方法来两个对象的内容相等；若它们的内容相等，则返回true(即，认为这两个对象相等)。


##  2、hashCode() 的作用
hashCode() 的作用是**获取哈希码**，也称为散列码；它实际上是返回一个int整数。这个哈希码的作用是确定该对象在哈希表中的索引位置。


hashCode() 定义在JDK的Object.java中，这就意味着**Java中的任何类**都包含有hashCode() 函数。

 虽然，每个Java类都包含hashCode() 函数。但是，仅仅当创建并某个“类的散列表”时，该类的hashCode() 才有用(作用是：**确定该类的每一个对象在散列表中的位置**；
 其它情况下(例如，创建类的单个对象，或者创建类的对象数组等等)，类的hashCode() 没有作用。

上面的散列表，指的是：Java集合中本质是散列表的类，如HashMap，Hashtable，HashSet。

 也就是说：**hashCode() 在散列表中才有用，在其它情况下没用。在散列表中hashCode() 的作用是获取对象的散列码，进而确定该对象在散列表中的位置。**

>我们都知道，散列表存储的是键值对(key-value)，它的特点是：能根据“键”快速的检索出对应的“值”。这其中就利用到了散列码！
>散列表的本质是通过数组实现的。当我们要获取散列表中的某个“值”时，实际上是要获取数组中的某个位置的元素。而数组的位置，就是通过“键”来获取的；更进一步说，数组的位置，是通过“键”对应的散列码计算得到的。



###  举例说明hashcode()的作用
   假设，HashSet中已经有1000个元素。当插入第1001个元素时，需要怎么处理？

因为HashSet是Set集合，它不允许有重复元素。

将第1001个元素逐个的和前面1000个元素进行比较”？显然，这个效率是相等低下的。散列表很好的解决了这个问题，它根据元素的散列码计算出元素在散列表中的位置，然后将元素插入该位置即可。对于相同的元素，自然是只保存了一个。
> 由此可知，若两个元素相等，它们的散列码一定相等；但反过来却不一定。在散列表中，
                           1、如果两个对象相等，那么它们的hashCode()值一定要相同；
                           2、如果两个对象hashCode()相等，它们并不一定相等。
                           注意：这是在散列表中的情况。在非散列表中一定如此！


###  hashCode() 和 equals() 的关系
以“类的用途”来将“hashCode() 和 equals()的关系”分2种情况来说明。

**1. 第一种 不会创建“类对应的散列表”**

   这里所说的“不会创建类对应的散列表”是说：我们不会在HashSet, Hashtable, HashMap等等这些本质是散列表的数据结构中，用到该类。例如，不会创建该类的HashSet集合。
<font color=red> 在这种情况下，该类的“hashCode() 和 equals() ”没有半毛钱关系的！</font>
 这种情况下，equals() 用来比较该类的两个对象是否相等。而hashCode() 则根本没有任何作用<br><br>
**2. 第二种 会创建“类对应的散列表”**
这里所说的“会创建类对应的散列表”是说：我们会在HashSet, Hashtable, HashMap等等这些本质是散列表的数据结构中，用到该类。例如，会创建该类的HashSet集合。
<br>
 在这种情况下，该类的“hashCode() 和 equals() ”是有关系的：
- 1)、如果两个对象相等，那么它们的hashCode()值一定相同。
         这里的相等是指，通过equals()比较两个对象时返回true。
- 2)、如果两个对象hashCode()相等，它们并不一定相等。

 因为在散列表中，**hashCode()相等，即两个键值对的哈希值相等**。然而哈希值相等，并不一定能得出键值对相等。补充说一句：“两个不同的键值对，哈希值相等”，这就是**哈希冲突**。

在这种情况下。若要判断两个对象是否相等，**除了要覆盖equals()之外，也要覆盖hashCode()函数**。否则，equals()无效。
例如，创建Person类的HashSet集合，必须同时覆盖Person类的equals() 和 hashCode()方法。

如果单单只是覆盖equals()方法。我们会发现，equals()方法没有达到我们想要的效果。

```java
import java.util.*;
import java.lang.Comparable;

/**
 * @desc 比较equals() 返回true 以及 返回false时， hashCode()的值。
 *
 * @author skywang
 * @emai kuiwu-wang@163.com
 */
public class ConflictHashCodeTest1{

    public static void main(String[] args) {
        // 新建Person对象，
        Person p1 = new Person("eee", 100);
        Person p2 = new Person("eee", 100);
        Person p3 = new Person("aaa", 200);

        // 新建HashSet对象
        HashSet set = new HashSet();
        set.add(p1);
        set.add(p2);
        set.add(p3);

        // 比较p1 和 p2， 并打印它们的hashCode()
        System.out.printf("p1.equals(p2) : %s; p1(%d) p2(%d)\n", p1.equals(p2), p1.hashCode(), p2.hashCode());
        // 打印set
        System.out.printf("set:%s\n", set);
    }

    /**
     * @desc Person类。
     */
    private static class Person {
        int age;
        String name;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String toString() {
            return "("+name + ", " +age+")";
        }

        /**
         * @desc 覆盖equals方法
         */
        @Override
        public boolean equals(Object obj){
            if(obj == null){
                return false;
            }

            //如果是同一个对象返回true，反之返回false
            if(this == obj){
                return true;
            }

            //判断是否类型相同
            if(this.getClass() != obj.getClass()){
                return false;
            }

            Person person = (Person)obj;
            return name.equals(person.name) && age==person.age;
        }
    }
}
```

>p1.equals(p2) : true; p1(1169863946) p2(1690552137)
>set:[(eee, 100), (eee, 100), (aaa, 200)]<br>
>   我们重写了Person的equals()。但是，很奇怪的发现：HashSet中仍然有重复元素：p1 和 p2。为什么会出现这种情况呢？
>这是因为虽然p1 和 p2的内容相等，但是它们的hashCode()不等；所以，HashSet在添加p1和p2的时候，认为它们不相等。


 下面，我们同时覆盖equals() 和 hashCode()方法。
```java
import java.util.*;
import java.lang.Comparable;

/**
 * @desc 比较equals() 返回true 以及 返回false时， hashCode()的值。
 *
 * @author skywang
 * @emai kuiwu-wang@163.com
 */
public class ConflictHashCodeTest2{

    public static void main(String[] args) {
        // 新建Person对象，
        Person p1 = new Person("eee", 100);
        Person p2 = new Person("eee", 100);
        Person p3 = new Person("aaa", 200);
        Person p4 = new Person("EEE", 100);

        // 新建HashSet对象
        HashSet set = new HashSet();
        set.add(p1);
        set.add(p2);
        set.add(p3);

        // 比较p1 和 p2， 并打印它们的hashCode()
        System.out.printf("p1.equals(p2) : %s; p1(%d) p2(%d)\n", p1.equals(p2), p1.hashCode(), p2.hashCode());
        // 比较p1 和 p4， 并打印它们的hashCode()
        System.out.printf("p1.equals(p4) : %s; p1(%d) p4(%d)\n", p1.equals(p4), p1.hashCode(), p4.hashCode());
        // 打印set
        System.out.printf("set:%s\n", set);
    }

    /**
     * @desc Person类。
     */
    private static class Person {
        int age;
        String name;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String toString() {
            return name + " - " +age;
        }

        /**
         * @desc重写hashCode
         */
        @Override
        public int hashCode(){
            int nameHash =  name.toUpperCase().hashCode();
            return nameHash ^ age;
        }

        /**
         * @desc 覆盖equals方法
         */
        @Override
        public boolean equals(Object obj){
            if(obj == null){
                return false;
            }

            //如果是同一个对象返回true，反之返回false
            if(this == obj){
                return true;
            }

            //判断是否类型相同
            if(this.getClass() != obj.getClass()){
                return false;
            }

            Person person = (Person)obj;
            return name.equals(person.name) && age==person.age;
        }
    }
}
```
>p1.equals(p2) : true; p1(68545) p2(68545)
>p1.equals(p4) : false; p1(68545) p4(68545)
>set:[aaa - 200, eee - 100]<br>
>   这下，equals()生效了，HashSet中没有重复元素。
        比较p1和p2，我们发现：它们的hashCode()相等，通过equals()比较它们也返回true。所以，p1和p2被视为相等。
        比较p1和p4，我们发现：虽然它们的hashCode()相等；但是，通过equals()比较它们返回false。所以，p1和p4被视为不相等。



##  3、为什么 Java 中只有值传递？
首先搞清楚两个名词
**按值调用(call by value)：** 表示方法接收的是调用者提供的值
**按引用调用（call by reference)：** 表示方法接收的是调用者提供的变量地址。


Java **总是采用按值调用**。也就是说，方法得到的是所有参数值的一个**拷贝**，也就是说，方法不能修改传递给它的任何参数变量的内容。

###  example 1
```java
public static void main(String[] args) {
    int num1 = 10;
    int num2 = 20;

    swap(num1, num2);

    System.out.println("num1 = " + num1);
    System.out.println("num2 = " + num2);
}

public static void swap(int a, int b) {
    int temp = a;
    a = b;
    b = temp;

    System.out.println("a = " + a);
    System.out.println("b = " + b);
}
```

>a = 20
>b = 10
>num1 = 10
>num2 = 20

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213110741747.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
一个方法不能修改一个基本数据类型的参数，而对象引用作为参数就不一样，请看 example2.

###  example2.
```java
    public static void main(String[] args) {
        int[] arr = { 1, 2, 3, 4, 5 };
        System.out.println(arr[0]);
        change(arr);
        System.out.println(arr[0]);
    }

    public static void change(int[] array) {
        // 将数组的第一个元素变为0
        array[0] = 0;
    }
```
>1
>0

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213110829228.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
array 被初始化 arr 的拷贝也就是一个对象的引用，**也就是说 array 和 arr 指向的是同一个数组对象**。 因此，外部对引用对象的改变会反映到所对应的对象上。<font color=red>简单来说就是把引用拷贝了一份，这俩引用指向的是同一个对象。</font>


###  example3
很多程序设计语言（特别是，C++和 Pascal)提供了两种参数传递的方式：值调用和引用调用。有些程序员认为 Java 程序设计语言对对象采用的是引用调用，实际上，这种理解是不对的。由于这种误解具有一定的普遍性，所以下面给出一个反例来详细地阐述一下这个问题。

```java
public class Test {

    public static void main(String[] args) {
        // TODO Auto-generated method stub
        Student s1 = new Student("小张");
        Student s2 = new Student("小李");
        Test.swap(s1, s2);
        System.out.println("s1:" + s1.getName());
        System.out.println("s2:" + s2.getName());
    }

    public static void swap(Student x, Student y) {
        Student temp = x;
        x = y;
        y = temp;
        System.out.println("x:" + x.getName());
        System.out.println("y:" + y.getName());
    }
}
```

>s1:小张
>s2:小李
>x:小李
>y:小张


**交换前：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213111216658.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
**交换后**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201213111243565.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
即方法并没有改变存储在变量 s1 和 s2 中的对象引用。swap 方法的参数 x 和 y 被初始化为两个对象引用的拷贝，这个方法交换的是这两个拷贝。

###  总结
Java 对对象采用的不是引用调用，实际上，对象引用是按值传递的。


下面再总结一下 Java 中方法参数的使用情况：

- 一个方法不能修改一个基本数据类型的参数（即数值型或布尔型）。
- 一个方法可以改变一个对象参数的状态。
- 一个方法不能让对象参数引用一个新的对象。



##  4、自增变量
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201217164205341.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>i=4;
>j=1;
>k=11;
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20201217164342717.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20201217164445928.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20201217164835708.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20201217164651646.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
###  小结
- 赋值=,最后计算，先算等号右边的
- =右边的从左到右加载值依次压入操作数栈
- 实际先算哪个,看运算符优先级
- 自增、自减操作都是直接修改变量的值,不经过操作数栈
- 最后的赋值之前,临时结果也是存储在操作数栈中





##  5、类初始化和实例初始化等



**father.java**
```java
package com.atguigu.classLoader;

/**
 * 父类初始化<clinit>
 * 1、j = method()
 * 2、 父类的静态代码块
 *
 * 父类实例化方法:
 * 1、super()（最前）
 * 2、i = test() (9)
 * 3、子类的非静态代码块 (3)
 * 4、子类的无参构造（最后）(2)
 *
 *
 * 非静态方法前面其实有一个默认的对象this
 * this在构造器或<init> 他表示的是正在创建的对象，因为咱们这里是正在创建Son对象，所以
 * test()执行的就是子类重写的代码(面向对象多态)
 *
 * 这里i=test() 执行的就是子类重写的test()方法
 */
public class Father {
    private int i = test();
    private static int j = method();

    static{
        System.out.println("(1)");
    }
    Father() {
        System.out.println("(2)");
    }
    {
        System.out.println("(3)");
    }
    public int test(){
        System.out.println("(4)");
        return 1;
    }
    public static int method() {
        System.out.println("(5)");
        return 1;
    }
}

```

**Son.java**
```java
package com.atguigu.classLoader;

/**
 * 子类的初始化<clinit>
 * 1、j = method()
 * 2、子类的静态代码块
 *
 * 先初始化父类 (5)(1)
 * 初始化子类 (10) (6)
 *
 * 子类实例化方法:
 * 1、super()（最前)
 * 2、i = test() (9)
 * 3、子类的非静态代码块 (8)
 * 4、子类的无参构造（最后）(7)
 */
public class Son extends Father {
    private int i = test();
    private static int j = method();
    static {
        System.out.println("(6)");
    }
    Son() {
        super();
        System.out.println("(7)");
    }
    {
        System.out.println("(8)");
    }
    public int test(){
        System.out.println("(9)");
        return 1;
    }
    public static int method() {
        System.out.println("(10)");
        return 1;
    }

    public static void main(String[] args) {
        Son son = new Son();
        System.out.println();
        Son son1 = new Son();
    }
}

```
**执行结果**
```java
(5)
(1)
(10)
(6)
(9)
(3)
(2)
(9)
(8)
(7)

(9)
(3)
(2)
(9)
(8)
(7)

```

---

###  类初始化过程

①一个类要创建实例需要先加载并初始化该类
◆main方法所在的类需要先加载和初始化

②一个子类要初始化需要先初始化父类

③一个类初始化就是执行< clinit>()方法
◆< clinit>Q方法由**静态类变量显示赋值代码**和**静态代码块**组成
◆静态类变量显示赋值代码和静态代码块代码从上到下顺序执行
◆< cinit>Q方法只执行一次


###  实例初始化过程
①实例初始化就是执行< init>()方法
◆< init>()方法可能重载有多个,有几个构造器就有几个 < init>方法
◆< init>()方法由**非静态实例变量显示赋值代码**和**非静态代码块**、**对应构造器代码**组成
◆非静态实例变量显示赋值代码和非静态代码块代码从上到下顺序执行,而对应构造器的代码最后执行
◆每次创建实例对象,调用对应构造器,执行的就是对应的< init>方法
◆< init>方法的首行是 super(或 super(实参列表),即对应父类的< init>方法


###  方法的重写Override
①哪些方法不可以被重写
◆fina方法
◆静态方法
◆ private等子类中不可见方法

②对象的多态性
◆子类如果重写了父类的方法,通过子类对象调用的一定是子类重写过的代码
◆非静态方法默认的调用对象是this
◆this对象在构造器或者说<init>方法中就是正在创建的对象



##   6、成员变量和局部变量
成员变量又分为：
**类变量：**  有static修饰
**实例变量：** 没有static修饰
<font color=red>实例变量属于**某个对象**的属性，必须创建了实例对象，其中的实例变量才会被分配空间，才能使用这个实例变量。</font>
###  成员变量与局部变量的区别
**1、声明的位置**
​ 局部变量：方法体{}中，形参，代码块{}中

​ 成员变量：类中。方法外

**2、修饰符**
​ 局部变量：final

​ 成员变量：public protected,private,final ,static volatile,transient

**3、值存储位置**
​ 局部变量：栈

​ 实例变量：堆

​ 类变量：方法区
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201218163026315.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
**4、生命周期**
局部变量：每一个线程，每一次调用执行都是新的生命周期

实例变量：随着对象的创建而初始化，随着对象的被回收而消亡，每一个对象的实例变量都是独立的

类变量：随着类的初始化而初始化，随着类的卸载而消亡，该类的所有对象的**类变量是共享的**


**5、当局部变量与成员变量重名时，如何区分：**

1、局部变量与实例变量重名

- ​ 在实例变量前面加 `this .`

2、局部变量与类变量重名

- ​ 在类变量前面加 `“类名   .”`

###  举例
```java

public class Exam5 {
    static int s;// 5
    int i; // A-2  B-1
    int j;//A-1 B-1
    {
        int i = 1;
        i++; // 就近原则 
        j++;
        s++;
    }
    public void test(int j) {
        j++; // 就近原则 21
        i++; 
        s++;
    }
    public static void main(String[] args){
        Exam5 obj1 = new Exam5();
        Exam5 obj2 = new Exam5();
        obj1.test(10);
        obj1.test(20);
        obj2.test(30);
        // 2 1 5
        System.out.println(obj1.i + "," + obj1.j + "," + obj1.s);
        // 1 1 5
        System.out.println(obj2.i + "," + obj2.j + "," + obj2.s);
    }
}

```

>2，1，5
>1，1，5
>
>![图解一部分](https://img-blog.csdnimg.cn/20201218170128188.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>后面的代码执行也差不多，因为画图范围有限，只画了第一句的。

**主要注意就近原则， 看到底修改的是成员变量还是局部变量**
比如obj1.(10)
>它首先会在栈中生成一个test()的栈帧，局部变量表中存放着一个j，值为10，
>然后`j++` 就近原则，改的就是局部变量j。即`j=10+1--->11`。
>然后`i++`就近原则，找到的是代码行号为第5行的成员变量`i`，执行`i++`。
>把在堆中的实例变量`i`的值变为`1`。然后`s++`这是个类变量，整个类共享这一个变量，所以直接去方法区修改`s=1+1--->2`







##  7、58同城的java字符串常量池
```java
    public static void main(String[] args) {
        //"redis"在堆中，toString()的调用并不会在字符串常量池中生成"redis"
        String str1 = new StringBuilder("re").append("dis").toString();

        System.out.println(str1);
        System.out.println(str1.intern());
        /*因为现在是JDK8的情况下，现在字符串常量池没有"redis"，
        我们现在调用intern()，会在字符串常量池中建立一个引用，指向堆中的"redis"，
        所以str1.intern()这个引用是指向字符串常量池中的“redis引用”，而字符串常量池中的
        redis引用又是指向堆中的“redis”的，同时，str1的引用就是直接指向堆中的"redis的"
        综上，str1==str1.intern()结果为true，最后其实都是同一个对象
         */
        System.out.println(str1 == str1.intern());

        System.out.println();

        String str2 = new StringBuilder("ja").append("va").toString();//"java"在堆中


        System.out.println(str2);
        System.out.println(str2.intern());
        /*
           此部分因为在默认加载的时候字符串常量池中已经有一个java了。
           所以现在调用intern()会直接返回字符串常量池中java地址的引用，和我们在堆中创建的
           java的地址不同，所以是false
         */
        System.out.println(str2 == str2.intern());

    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210110113213272.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

##  8、对象创建的过程

用一张最简单的图来大概概括一下步骤：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210124140128323.png)
然后再详细解释一下：
1. 当虚拟机执行到new 关键字时，首先会去运行时常量池中查找该引用所指向的类有没有被虚拟机加载，如果没有被加载，那么会进行类的加载过程，如果已经被加载，那么进行下一步。

2. 当类元信息被加载之后，我们就可以从常量池找到对应的类元信息，通过类元信息来确定类型和后面需要申请的内存大小。

3. 对象的内存分配完成后（<font color=red>分配的内存位于堆中</font>），还需要将对象的内存空间都初始化为零值，这样能保证对象即使没有赋初值，也可以直接使用。（分配完内存后，需要对对象的字段进行零值初始化，对象头除外，零值初始化意思就是对对象的字段赋0值，或者null值，这也就解释了为什么这些字段在不需要进程初始化时候就能直接使用）

4. 分配完内存空间，初始化零值之后，虚拟机还需要对对象进行其他必要的设置，设置的地方都在对象头中，包括这个对象所属的类，类的元数据信息，对象的hashcode，GC分代年龄等信息
  >**对象头：**
  >对象头里主要包括几类信息，分别是锁状态标志、持有锁的线程ID、，GC分代年龄、对象HashCode，类元信息地址、数组长度，这里并没有对对象头里的每个信息都列出而是进行大致的分类，下面是对其中几类信息进行说明。
  >**锁状态标志：** 对象的加锁状态分为无锁、偏向锁、轻量级锁、重量级锁几种标记。
  >**持有锁的线程：**  持有当前对象锁定的线程ID。
  >**GC分代年龄：**  对象每经过一次GC还存活下来了，GC年龄就加1。
  >**类元信息地址：**  可通过对象找到类元信息，用于定位对象类型。
  >**数组长度：**  当对象是数组类型的时候会记录数组的长度。

5. 然后执行对象内部生成的init方法，初始化成员变量值，同时执行搜集到的{}代码块逻辑，最后执行对象构造方法。执行对象的构造方法，这里做的操作才是程序员真正想做的操作，例如初始化其他对象啊等等操作，至此，对象创建成功。


#  Java集合
##  1、通过源码分析ArrayList的扩容机制


**一、先从 ArrayList 的构造函数说起**
ArrayList有三种方式来初始化，构造方法源码如下：
```java
   /**
     * 默认初始容量大小
     */
    private static final int DEFAULT_CAPACITY = 10;
    

    private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};

    /**
     *默认构造函数，使用初始容量10构造一个空列表(无参数构造)
     */
    public ArrayList() {
        this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
    }
    
    /**
     * 带初始容量参数的构造函数。（用户自己指定容量）
     */
    public ArrayList(int initialCapacity) {
        if (initialCapacity > 0) {//初始容量大于0
            //创建initialCapacity大小的数组
            this.elementData = new Object[initialCapacity];
        } else if (initialCapacity == 0) {//初始容量等于0
            //创建空数组
            this.elementData = EMPTY_ELEMENTDATA;
        } else {//初始容量小于0，抛出异常
            throw new IllegalArgumentException("Illegal Capacity: "+
                                               initialCapacity);
        }
    }


   /**
    *构造包含指定collection元素的列表，这些元素利用该集合的迭代器按顺序返回
    *如果指定的集合为null，throws NullPointerException。 
    */
     public ArrayList(Collection<? extends E> c) {
        elementData = c.toArray();
        if ((size = elementData.length) != 0) {
            // c.toArray might (incorrectly) not return Object[] (see 6260652)
            if (elementData.getClass() != Object[].class)
                elementData = Arrays.copyOf(elementData, size, Object[].class);
        } else {
            // replace with empty array.
            this.elementData = EMPTY_ELEMENTDATA;
        }
    }
```


以无参数构造方法创建 ArrayList 时，实际上初始化赋值的是一个空数组。当真正对数组进行添加元素操作时，才真正分配容量。即向数组中添加第一个元素时，数组容量扩为10。


**二、一步一步分析 ArrayList 扩容机制**
以无参构造函数创建的 ArrayList 为例分析
**1. 先来看`add`方法**
```java
    /**
     * 将指定的元素追加到此列表的末尾。 
     */
    public boolean add(E e) {
   //添加元素之前，先调用ensureCapacityInternal方法
        ensureCapacityInternal(size + 1);  // Increments modCount!!
        //这里看到ArrayList添加元素的实质就相当于为数组赋值
        elementData[size++] = e;
        return true;
    }
```

**2. 再来看看`ensureCapacityInternal()`方法**
可以看到 add 方法 首先调用了`ensureCapacityInternal(size + 1)`
```java
   //得到最小扩容量
    private void ensureCapacityInternal(int minCapacity) {
        if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
              // 获取默认的容量和传入参数的较大值
            minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
        }

        ensureExplicitCapacity(minCapacity);
    }
```
当 要 add 进第1个元素时，minCapacity为1，在Math.max()方法比较后，minCapacity(<font color=gray size=3>最小容量</font>)为10。


**3.` ensureExplicitCapacity()`方法**
如果调用`ensureCapacityInternal()`方法就一定会进过（执行）这个方法
```java
  //判断是否需要扩容
    private void ensureExplicitCapacity(int minCapacity) {
        modCount++;

        // overflow-conscious code
        if (minCapacity - elementData.length > 0)
            //调用grow方法进行扩容，调用此方法代表已经开始扩容了
            grow(minCapacity);
    }
```
来仔细分析一下：

- 当我们要 add 进第1个元素到 ArrayList 时，elementData.length 为0 （因为还是一个空的 list），因为执行了`ensureCapacityInternal()`方法 ，所以 minCapacity 此时为10。此时，minCapacity - elementData.length > 0 成立，所以会进入`grow(minCapacity)`方法。
- 当add第2个元素时，minCapacity 为2，此时elementData.length(容量)在添加第一个元素后扩容成 10 了。此时，minCapacity - elementData.length > 0不成立，所以不会进入 （执行）`grow(minCapacity)`方法。
- 添加第3、4···到第10个元素时，依然不会执行grow方法，数组容量都为10。

直到添加第11个元素，minCapacity(为11)比elementData.length（为10）要大。进入grow方法进行扩容。

**4. `grow()` 方法**
```java
    /**
     * 要分配的最大数组大小
     */
    private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;

    /**
     * ArrayList扩容的核心方法。
     */
    private void grow(int minCapacity) {
        // oldCapacity为旧容量，newCapacity为新容量
        int oldCapacity = elementData.length;
        //将oldCapacity 右移一位，其效果相当于oldCapacity /2，
        //我们知道位运算的速度远远快于整除运算，整句运算式的结果就是将新容量更新为旧容量的1.5倍，
        int newCapacity = oldCapacity + (oldCapacity >> 1);
        //然后检查新容量是否大于最小需要容量，若还是小于最小需要容量，那么就把最小需要容量当作数组的新容量，
        if (newCapacity - minCapacity < 0)
            newCapacity = minCapacity;
       // 如果新容量大于 MAX_ARRAY_SIZE,进入(执行) `hugeCapacity()` 方法来比较 minCapacity 和 MAX_ARRAY_SIZE，
       //如果minCapacity大于最大容量，则新容量则为`Integer.MAX_VALUE`，否则，新容量大小则为 MAX_ARRAY_SIZE 即为 `Integer.MAX_VALUE - 8`。
        if (newCapacity - MAX_ARRAY_SIZE > 0)
            newCapacity = hugeCapacity(minCapacity);
        // minCapacity is usually close to size, so this is a win:
        elementData = Arrays.copyOf(elementData, newCapacity);
    }
```
<font color=red>`int newCapacity = oldCapacity + (oldCapacity >> 1)`,所以 ArrayList 每次扩容之后容量都会变为原来的 **1.5 倍**！</font>

>">>"（移位运算符）：>>1 右移一位相当于除2，右移n位相当于除以 2 的 n 次方。这里 oldCapacity 明显右移了1位所以相当于oldCapacity /2。对于大数据的2进制运算,位移运算符比那些普通运算符的运算要快很多,因为程序仅仅移动一下而已,不去计算,这样提高了效率,节省了资源


**通过例子探究一下grow() 方法：**
- 当add第1个元素时，oldCapacity(旧容量) 为0，经比较后第一个if判断成立，`newCapacity = minCapacity(为10)`。但是第二个if判断不会成立，即newCapacity 不比 MAX_ARRAY_SIZE大，则不会进入`hugeCapacity`方法。数组容量为10，add方法中 return true,size增为1。
- 当add第11个元素进入grow方法时，newCapacity为15，比minCapacity（为11）大，第一个if判断不成立。新容量没有大于数组最大size，不会进入hugeCapacity方法。数组容量扩为15，add方法中return true,size增为11。
- 以此类推······

**5. hugeCapacity() 方法。**
从上面grow()方法源码我们知道： 如果新容量大于 MAX_ARRAY_SIZE,进入(执行)`hugeCapacity()`方法来比较 minCapacity 和 MAX_ARRAY_SIZE，如果minCapacity大于最大容量，则新容量则为Integer.MAX_VALUE，否则，新容量大小则为 MAX_ARRAY_SIZE 即为Integer.MAX_VALUE - 8。


```java
    private static int hugeCapacity(int minCapacity) {
        if (minCapacity < 0) // overflow
            throw new OutOfMemoryError();
        //对minCapacity和MAX_ARRAY_SIZE进行比较
        //若minCapacity大，将Integer.MAX_VALUE作为新数组的大小
        //若MAX_ARRAY_SIZE大，将MAX_ARRAY_SIZE作为新数组的大小
        //MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;
        return (minCapacity > MAX_ARRAY_SIZE) ?
            Integer.MAX_VALUE :
            MAX_ARRAY_SIZE;
    }
```


##  2、System.arraycopy() 和Arrays.copyOf()方法
###  System.arraycopy() 方法
```java
    /**
     * 在此列表中的指定位置插入指定的元素。 
     *先调用 rangeCheckForAdd 对index进行界限检查；然后调用 ensureCapacityInternal 方法保证capacity足够大；
     *再将从index开始之后的所有成员后移一个位置；将element插入index位置；最后size加1。
     */
    public void add(int index, E element) {
        rangeCheckForAdd(index);

        ensureCapacityInternal(size + 1);  // Increments modCount!!
        //arraycopy()方法实现数组自己复制自己
        //elementData:源数组;index:源数组中的起始位置;elementData：目标数组；index + 1：目标数组中的起始位置； size - index：要复制的数组元素的数量；
        System.arraycopy(elementData, index, elementData, index + 1, size - index);
        elementData[index] = element;
        size++;
    }
```

###  Arrays.copyOf()方法
```java
   /**
     以正确的顺序返回一个包含此列表中所有元素的数组（从第一个到最后一个元素）; 返回的数组的运行时类型是指定数组的运行时类型。 
     */
    public Object[] toArray() {
    //elementData：要复制的数组；size：要复制的长度
        return Arrays.copyOf(elementData, size);
    }
```

###   两者联系和区别
**联系：** 看两者源代码可以发现 copyOf() 内部实际调用了System.arraycopy()方法

**区别：**

`arraycopy()`需要目标数组，将原数组拷贝到你自己定义的数组里或者原数组，而且可以选择拷贝的起点和长度以及放入新数组中的位置 
`copyOf()`是系统自动在内部新建一个数组，并返回该数组。
