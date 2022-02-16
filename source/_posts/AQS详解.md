---
title: AQS详解
date: 2021-01-09 10:38:28
tags: 
categories: JUC
---

<!--more-->

### AQS详解

- [前置知识](#_2)
- - [可重入锁](#_3)
  - - [Synchronized的重入的实现机理](#Synchronized_41)
  - [LockSupport](#LockSupport_58)
  - - [线程等待唤醒机制\(wait/notify\)](#waitnotify_64)
    - [Object类中的wait和notify方法实现线程等待和唤醒](#Objectwaitnotify_73)
    - [Condition接口中的await后signal方法实现线程的等待和唤醒](#Conditionawaitsignal_103)
    - [LockSupport类中的park等待和unpark唤醒](#LockSupportparkunpark_143)
    - [重点说明](#_190)
    - [这块儿的面试题](#_208)
- [AQS](#AQS_220)
- - [是什么\?](#_221)
  - [AQS为什么是JUC内容中最重要的基石](#AQSJUC_228)
  - [能干嘛](#_236)
- [AQS初步](#AQS_246)
- - [AQS内部体系架构](#AQS_250)
  - - [AQS自身](#AQS_253)
    - [内部类Node（Node类在AQS类内部）](#NodeNodeAQS_270)
  - [AQS同步队列的基本结构](#AQS_282)
- [从ReentrantLock开始解读AQS](#ReentrantLockAQS_287)
- - [从最简单的lock方法开始看看公平和非公平](#lock_336)
  - [这次选择非公平锁，方法lock\(\)来一步一看](#lock_382)
  - - [①首先来看看非公平锁的\*\*lock\(\)\*\*](#lock_391)
    - [②B线程来 ，走\`acquire\(\)\`：](#B_acquire_393)
    - [③那我们就来走一下，先从\`tryAcquire\(arg\)\`开始\(\`agr=1\`可以第一步的代码中看到\)：](#tryAcquireargagr1_395)
    - [④假如B线程没有抢到锁，返回了false，那就来到\`addWaiter\(Node.EXCLUSIVE\)\`：](#BfalseaddWaiterNodeEXCLUSIVE_401)
    - [⑤到此为止B线程已经入队了](#B_413)
    - [⑥好了，B现在已经入队了，现在就该执行\`acquireQueued\(addWaiter\(Node.EXCLUSIVE\), arg\)\`：](#BacquireQueuedaddWaiterNodeEXCLUSIVE_arg_424)
    - [⑦至此A线程业务办理完了，要\`unlock\(\)\`了](#Aunlock_447)
    - [⑨现在B被唤醒了](#B_466)
- [AQS的考点](#AQS_494)

# 前置知识

## 可重入锁

可重入锁又名递归锁

是指在同一个线程在外层方法获取锁的时候，再进入该线程的内层方法会自动获取锁\(前提，锁对象得是同一个对象\)，不会因为之前已经获取过还没释放而阻塞。

Java中ReentrantLock和synchronized都是可重入锁，可重入锁的一个优点是可一定程度避免死锁。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010910042485.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**可重入锁种类**  
①隐式锁（即synchronized关键字使用的锁）默认是可重入锁

举个例子\(我们在之前演示了同步方法，这次演示一下同步块\)：

```java
    public static void main(String[] args) {
        Object objectLockA = new Object();

            new Thread(() -> {
                synchronized (objectLockA) {
                    System.out.println(Thread.currentThread().getName() + "\t" + "------外层调用");
                    synchronized (objectLockA) {
                        System.out.println(Thread.currentThread().getName() + "\t" + "------中层调用");
                        synchronized (objectLockA) {
                            System.out.println(Thread.currentThread().getName() + "\t" + "------内层调用");
                        }
                    }
                }
            }, "t1").start();

        }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109101016585.png)

②显式锁（即Lock）也有ReentrantLock这样的可重入锁。

### Synchronized的重入的实现机理

每个锁对象拥有一个锁计数器和一个指向持有该锁的线程的指针。

当执行monitorenter时，如果目标对象的计数器为零，那么说明它没有被其他线程所持有，Java虚拟机会将该锁对象的持有线程设置为当前线程，并且将其计数器加1。

在目标锁对象的计数器不为零的情况下，如果锁对象的持有线程是当前线程，那么Java虚拟机可以将其计数器加1，否则需要等待，直至持有线程释放该锁。

当执行monitorexit时，Java虚拟机则需将锁对象的计数器减1。计数器为零代表锁已被释放。

看字节码文件有两个monitorexit的原因是为了在有异常的情况下也能释放锁

## LockSupport

LockSupport是用来创建锁和其他同步类的基本线程阻塞原语。

LockSupport中的park\(\)和unpark\(\)的作用分别是阻塞线程和解除阻塞线程

### 线程等待唤醒机制\(wait/notify\)

**3种让线程等待和唤醒的方法：**  
方式1: 使用Object中的wait\(\)方法让线程等待， 使用Object中的notify\(\)方法唤醒线程

方式2: 使用JUC包中Condition的await\(\)方法让线程等待，使用signal\(\)方法唤醒线程

方式3: LockSupport类可以阻塞当前线程以及唤醒指定被阻塞的线程

### Object类中的wait和notify方法实现线程等待和唤醒

```java
        new Thread(() -> {
            synchronized (objectLock) {
                System.out.println(Thread.currentThread().getName() + "\t" + "------come in");
                try {
                    objectLock.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName() + "\t" + "------被唤醒");
            }
        }, "A").start();

        new Thread(() -> {
            synchronized (objectLock) {
                objectLock.notify();
                System.out.println(Thread.currentThread().getName() + "\t" + "------通知");
            }
        }, "B").start();
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109102004269.png)  
正常运行是没有问题的，但是  
①wait方法和notify方法，两个都去掉同步代码块会报异常  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109102051167.png)  
②将notify放在wait方法前面即先唤醒。  
会导致程序无法执行，无法唤醒

### Condition接口中的await后signal方法实现线程的等待和唤醒

```java
Object objectLock = new Object();
        Lock lock = new ReentrantLock();
        Condition condition = lock.newCondition();


        new Thread(() -> {
            lock.lock();
            try {
                System.out.println(Thread.currentThread().getName() + "\t" + "------come in");
                try {
                    condition.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName() + "\t" + "------被唤醒");
            } finally {
                lock.unlock();
            }
        }, "A").start();


        new Thread(() -> {
            lock.lock();
            try {
                condition.signal();
                System.out.println(Thread.currentThread().getName() + "\t" + "------通知");
            } finally {
                lock.unlock();
            }
        }, "B").start();
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109102254391.png)  
正常执行也没问题，但是还是有两个限制，这也即是传统的synchronized和Lock实现等待唤醒通知的约束：  
①线程先要获得并持有锁，必须在锁块（synchronized或lock）中  
②必须要先等待后唤醒，线程才能够被唤醒

### LockSupport类中的park等待和unpark唤醒

**通过park\(\)和unpark\(thread\)方法来实现阻塞和唤醒线程的操作**

> **官方解释：** LockSupport是用来创建锁和其他同步类的基本线程阻塞原语。  
>   
> LockSupport类使用了一种名为Permit\(许可）的概念来做到阻塞和唤醒线程的功能，每个线程都有一个许可\(permit\),  
> permit只有两个值1和零，默认是零。  
> 可以把许可看成是一种\(0,1\)信号量\(Semaphore），但与Semaphore不同的是，**许可的累加上限是1**。

**主要方法：**  
①阻塞：`park()/park(Object blocker)`。

> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109102851957.png)  
> permit默认是0，所以一开始调用park\(\)方法，当前线程就会阻塞，直到别的线程将当前线程的permit设置为1时,park方法会被唤醒，然后会将permit再次设置为0并返回。

②唤醒：`unpark(Thread thread)`

> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109102838434.png)  
> 调用unpark\(thread\)方法后，就会将thread线程的许可permit设置成1\(注意多次调用unpark方法，不会累加，permit值还是1\)会自动唤醒thread线程，  
> 即之前阻塞中的LockSupport.park\(\)方法会立即返回。

```java
Thread a = new Thread(() -> {

            System.out.println(Thread.currentThread().getName() + "\t ----Come in");
            LockSupport.park();//阻塞当前线程
            System.out.println(Thread.currentThread().getName() + "\t ----被唤醒" );
        }, "a");
        a.start();

        try { TimeUnit.SECONDS.sleep(3); } catch (InterruptedException e) { e.printStackTrace(); }

        Thread b = new Thread(() -> {

            LockSupport.unpark(a);//给a发放许可证
            System.out.println(Thread.currentThread().getName() + "\t 给a发放许可证并且通知a...");
        }, "b");
        b.start();
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109103250554.png)  
我们将顺序换一下，让b先给a发放许可证：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109103332435.png)  
可以看到照样没问题，这就解决了传统的等待/唤醒机制的痛点。

### 重点说明

- LockSupport是一个线程阻塞工具类，所有的方法都是静态方法，可以让线程在任意位置阻塞，阻塞之后也有对应的唤醒方法。归根结底，LockSupport调用的Unsafe中的native代码。

- LockSupport提供park\(\)和unpark\(\)方法实现阻塞线程和解除线程阻塞的过程。  
  LockSupport和每个使用它的线程都有一个许可\(permit\)关联。permit相当于1，0的开关，默认是0，

- 调用一次unpark就加1变成1，

- 调用一次park会消费permit，也就是将1变成o，同时park立即返回。  
  如再次调用park会变成阻塞\(因为permit为零了会阻塞在这里，一直到permit变为1\)，这时调用unpark会把permit置为1。

- 每个线程都有一个相关的permit, permit最多只有一个，重复调用unpark也不会积累凭证。

- 形象的理解  
  线程阻塞需要消耗凭证\(permit\)，这个凭证最多只有1个。

- 当调用park方法时

  - 如果有凭证，则会直接消耗掉这个凭证然后正常退出;
  - 如果无凭证，就必须阻塞等待凭证可用;

- 而unpark则相反，它会增加一个凭证，但凭证最多只能有1个，累加无效。

### 这块儿的面试题

**①为什么可以先唤醒线程后阻塞线程\?**  
因为unpark获得了一个凭证，之后再调用park方法，就可以名正言顺的凭证消费，故不会阻塞。

**②为什么唤醒两次后阻塞两次，但最终结果还会阻塞线程\?**  
因为凭证的数量最多为1，连续调用两次unpark和调用一次unpark效果一样，只会增加一个凭证;而调用两次park却需要消费两个凭证，证不够，不能放行。

# AQS

## 是什么\?

字面意思：抽象的队列同步器  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109134209477.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
通常地: AbstractQueuedSynchronizer简 称为AQS。

**技术翻译：** 是用来构建锁或者其它同步器组件的重量级基础框架及整个JUC体系的基石， 通过内置的FIFO队列来完成资源获取线程的排队工作，并通过一个int类变量 表示持有锁的状态。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109134357309.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## AQS为什么是JUC内容中最重要的基石

因为例如ReentrantLock、CountDownLatch、ReentrantReadWriteLock、Semaphore等等，底层都用到了AQS。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109134602747.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109134626830.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**进一步理解锁和同步器的关系**  
①**锁**，面向锁的使用者：定义了程序员和锁交互的使用层API，隐藏了实现细节，你调用即可。  
②同步器，面向锁的实现者：比如Java并发大神Douglee，提出统一规 范并简化了锁的实现，屏蔽了同步状态管理、阻塞线程排队和通知、唤醒机制等。

## 能干嘛

加锁会导致阻塞，有阻塞就需要排队，实现排队必然需要有某种形式的队列来进行管理。

> 抢到资源的线程直接使用办理业务，抢占不到资源的线程的必然涉及一种排队等候机制，抢占资源失败的线程继续去等待\(类似办理窗口都满了，暂时没有受理窗口的顾客只能去候客区排队等候\)，仍然保留获取锁的可能且获取锁流程仍在继续\(候客区的顾客也在等着叫号，轮到了再去受理窗口办理业务）。  
>   
> 既然说到了排队等候机制，那么就一定会有某种队列形成，这样的队列是什么数据结构呢\?  
>   
> 如果共享资源被占用，就需要一定的阻塞等待唤醒机制来保证锁分配。这个机制主要用的是CLH队列的变体实现的，将暂时获取不到锁的线程加入到队列中，这个队列就是AQS的抽象表现。它将请求共享资源的线程封装成队列的结点\(Node\) ，通过CAS、自旋以及LockSuport.park\(\)的方式，维护state变量的状态，使并发达到同步的效果。  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109134357309.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# AQS初步

![官网解释](https://img-blog.csdnimg.cn/20210109135127992.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
AQS使用一个volatile的int类型的成员变量来表示**同步状态**，通过内置的 FIFO队列来完成资源获取的排队工作将每条要去抢占资源的线程封装成 一个Node节点来实现锁的分配，通过CAS完成对State值的修改。

## AQS内部体系架构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109135320346.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### AQS自身

**①AQS的int变量**  
AQS的同步状态State成员变量，可以理解为银行办理业务的受理窗口状态，零就是没人，自由状态可以办理。大于等于1，有人占用窗口，就需要去排队等待。

```java
/**
 * The synchronization state.
 */
private volatile int state;
```

**②AQS的CLH队列**  
CLH队列（三个大牛的名字组成），为一个双向队列。可以理解为银行的候客区。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109135721177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**小总结：有阻塞就需要排队，实现排队必然需要队列。\(state变量+CLH双端Node队列\)**

### 内部类Node（Node类在AQS类内部）

**①Node的int变量**  
Node的等待状态waitState。可以理解为队列中每个排队的个体就是一个Node，这个变量就是等候区其它顾客\(其它线程\)的等待状态。

```java
volatile int waitStatus 
```

**②Node此类的讲解**  
![Node类中部分重要的东西的讲解](https://img-blog.csdnimg.cn/20210109140726286.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010914144879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## AQS同步队列的基本结构

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109141240162.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**注意：AQS底层是用LockSupport.pork\(\)来进行排队的**

# 从ReentrantLock开始解读AQS

```java
  public static void main(String[] args) {

        ReentrantLock lock = new ReentrantLock();
//带入一个银行办理业务的案例来模拟我们的AQS如何进行线程的管理和通知唤醒机制

//3个线程模拟3个来银行网点，受理窗口办理业务的顾客

//A顾客就是第一个顾客，此时受理窗口没有任何人，A可以直接去办理
        new Thread(() -> {
            lock.lock();
            try {
                System.out.println("-----A thread come in");

                try {
                    TimeUnit.MINUTES.sleep(20);//模拟办业务花的时间
                } catch (Exception e) {
                    e.printStackTrace();
                }
            } finally {
                lock.unlock();
            }
        }, "A").start();

//第二个顾客，第二个线程---》由于受理业务的窗口只有一个(只能一个线程持有锁)，此时B只能等待，
//进入候客区
        new Thread(() -> {
            lock.lock();
            try {
                System.out.println("-----B thread come in");
            } finally {
                lock.unlock();
            }
        }, "B").start();

//第三个顾客，第三个线程---》由于受理业务的窗口只有一个(只能一个线程持有锁)，此时C只能等待，
//进入候客区
        new Thread(() -> {
            lock.lock();
            try {
                System.out.println("-----C thread come in");
            } finally {
                lock.unlock();
            }
        }, "C").start();
    }
```

## 从最简单的lock方法开始看看公平和非公平

①我们进入到`ReentrantLock`中看一下，可以发现有公平锁和非公平锁的分别。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109142201334.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
②再分别查看一下它们的lock方法。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109142358757.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109142623235.png)  
即其实是通过tryAcquire来抢占锁的拥有权的。

---

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109142420322.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109142950230.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

对比公平锁和非公平锁的tryAcqure\(\)方法的实现代码， 其实差别就在于非公平锁获取锁时比公平锁中少了一个判断\!hasQueuedPredecessors\(\)\`

`hasQueuedPredecessors()`是公平锁加锁时判断等待队列中是否存在有效节点的方法。它判断了是否需要排队，导致公平锁和非公平锁的差异如下:

- 公平锁:公平锁讲究先来先到，线程在获取锁时，如果这个锁的等待队列中已经有线程在等待，那么当前线程就会进入等待队列中;
- 非公平锁:不管是否有等待队列，如果可以获取锁，则立刻占有锁对象。也就是说队列的第一 个排队线程在unpark\(\), 之后还是需要竞争锁\(存在线程竞争的情况下\)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109143212409.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

---

小总结一下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109143820100.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

再来捋一遍。以非公平锁为例。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109145047259.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109145110476.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109145126926.png)

可以看到最后会来到AQS，AQS会丢出一个异常。让继承它的子类来落地它们的tryAcquire方法。也就是我们要用非公平锁的话，就要在非公平锁中实现这个方法。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109145329708.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109145339345.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109145346274.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
可以看到非公平锁落地实现了这个tryAcquire方法。

总的来说，`lock-->acquire-->tryacquire`。  
底层还是用了`tryAcquire`来争夺锁的。

## 这次选择非公平锁，方法lock\(\)来一步一看

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010918064154.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

以这个例子来辅助理解源代码假设刚开始A线程抢到了资源，改state=1，现在来的是B线程了。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109180705473.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### ①首先来看看非公平锁的**lock\(\)**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109143949285.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### ②B线程来 ，走`acquire()`：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109174227860.png)

### ③那我们就来走一下，先从`tryAcquire(arg)`开始\(`agr=1`可以第一步的代码中看到\)：

- 如果方法`return false;`继续推进条件，就走下一步方法addWaiter
- 如果`return true;`，就结束。
- 因为返回的结果要取反  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109181107975.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

### ④假如B线程没有抢到锁，返回了false，那就来到`addWaiter(Node.EXCLUSIVE)`：

现在大概的示意图是这个样子：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109180556938.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109180418927.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109213919909.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

现在的示意图就会变成这样了：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/202101092140231.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### ⑤到此为止B线程已经入队了

其实现在应该进行`acquireQueued(addWaiter(Node.EXCLUSIVE), arg)`，**但是由于C线程入队和B线程不一样，我们就把C线程入队提前到这里来类比着讲。**

假设现在C线程也来了。首先也要进入`acquire()`然后进入`tryAcquire(arg)`，假设C也没有抢到，那么C现在也要执行`addWaiter(Node.EXCLUSIVE)`来入队。我们来看一下C线程是怎么入队的。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109214929526.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
现在的示意图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109214953825.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

至此我们可以总结一下：**双向链表中，第一个节点为虚节点\(也叫哨兵节点\)，其实并不存储任何信息，只是占位。 真正的第一个有数据的节点，是从第二个节点开始的。**

### ⑥好了，B现在已经入队了，现在就该执行`acquireQueued(addWaiter(Node.EXCLUSIVE), arg)`：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109220239442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
可以看到在循环里要先进入`predecessor()`然后再继续走：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109220437582.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
我们现在继续走：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109220831331.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
到这里我们发现又要进入`shouldParkAfterFailedAcquire(p, node)`：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109221313439.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
现在又回到了上层方法`acquireQueued`：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109221616654.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109221747771.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

至此我们又又又回到了`acquireQueued()`：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010922193033.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109222601887.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**如果是C来了也一样执行上面的过程 最终老老实实的被阻塞等待唤醒**

至此示意图变成了这样：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109222138278.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### ⑦至此A线程业务办理完了，要`unlock()`了

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109222825311.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109222842206.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109222859906.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109222938564.png)  
本次我们用的是ReentrantLock，所以去这里面找该模板方法的实现：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109223411454.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
到目前，示意图为：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109223529285.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

既然上面返回true了，那么我们又要回到`release()`：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010922395518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
现在进入`unparkSuccessor(h)`：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010922414678.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

### ⑨现在B被唤醒了

回到刚刚B被阻塞的位置`parkAndCheckInterrupt()`中：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109224354828.png)

然后返回`parkAndCheckInterrupt()`的上层方法`acquireQueued()`：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109224817721.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109225011681.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
现在的示意图:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109225131902.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

好，现在继续`acquireQueued()`：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109225306976.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021010922535748.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
然后继续`acquireQueued()`：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109225940466.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

现在的示意图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210109225720953.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# AQS的考点

①我相信你应该看过源码了，那么AQS里面有个变量叫State，它的值有几种？

> 3个状态：没占用是0，占用了是1，大于1是可重入锁

②如果AB两个线程进来了以后，请问这个总共有多少个Node节点？

> 答案是3个，除了A、B还有一个是傀儡节点

**至此本篇文章结束。终于写完了😵😵😵**