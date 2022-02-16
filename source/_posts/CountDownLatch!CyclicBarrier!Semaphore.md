---
title: CountDownLatch/CyclicBarrier/Semaphore
date: 2020-10-04 17:59:46
tags: 
categories: JUC
---

<!--more-->

### JUC强大的辅助类

- [CountDownLatch减少计数](#CountDownLatch_1)
- [CyclicBarrier循环栅栏](#CyclicBarrier_42)
- [Semaphore信号灯](#Semaphore_88)

# CountDownLatch减少计数

> 让一些线程阻塞，直到另一些线程完成一系列操作后才被唤醒  

**原理**

- CountDownLatch主要有两个方法，当一个或多个线程调用await方法时，这些线程会阻塞。
- 其它线程调用countDown方法会将计数器减1\(调用countDown方法的线程不会阻塞\)，
- 当计数器的值变为0时，因await方法阻塞的线程会被唤醒，继续执行。

**例子**

```java
package cduck.cn;

import java.util.concurrent.CountDownLatch;

/**
 * 有6个同学  一个班长，要求所有同学离开教室后班长才可以锁门。
 *
 */
public class CountDownLatchDemo {

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch countDownLatch=new CountDownLatch(6);//从6(基数)开始递减
        for (int i=0;i<6;i++){
            new Thread(()->{
                System.out.println(Thread.currentThread().getName()+"\t离开了教室");
                countDownLatch.countDown();//每次减少1

            },String.valueOf(i+1)).start();
        }

        countDownLatch.await();//当基数没为0之前都把线程给阻塞了
        System.out.println(Thread.currentThread().getName()+"\t班长关门走人");
    }


}

```

# CyclicBarrier循环栅栏

**原理**  
CyclicBarrier 的字面意思是可循环（Cyclic）使用的屏障\(Barrier\)  
它要做的事情是， 让一组线程到达一个屏障（也可以叫同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有 被屏障拦截的线程才会继续干活。 线程进入屏障通过CyclicBarrier的await\(\)方法。

**例子**

```java
package cduck.cn;

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

/**
 * 基数递增，到达阈值触发操作
 *
 * 一般用于  需要递增到多少进行xx操作的情况
 */
public class CyclicBarrierDemo {
    public static void main(String[] args) {
        CyclicBarrier cyclicBarrier=new CyclicBarrier(7,()->{//基数为7
            System.out.println("七龙珠已集齐，****召唤神龙****");
        });

        for (int i=0;i<7;i++){
            final int temp=i;
            new Thread(()->{
                System.out.println("收集到了第"+(temp+1)+"颗龙珠");

                try {
                    cyclicBarrier.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } catch (BrokenBarrierException e) {
                    e.printStackTrace();
                }

            },String.valueOf(i)).start();

        }
    }
}

```

# Semaphore信号灯

> 信号量主要用于两个目的，一个是用于多个共享资源的互斥使用，另一个用于并发线程数的控制

**原理**  
在信号量上我们定义两种操作：  
**acquire（获取）** 当一个线程调用acquire操作时，它要么通过成功获取信号量（信号量减1）， 要么一直等下去，直到有线程释放信号量，或超时。  
  
  
**release（释放）** 实际上会将信号量的值加1，然后唤醒等待的线程。 信号量主要用于两个目的，一个是用于多个共享资源的互斥使用，另一个用于并发线程数的控制。

**例子**

```java
package cduck.cn;

import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

public class SemaphoreDemo {
    public static void main(String[] args) {
        //将这里的参数设为1，可以实现给xx加锁多少秒的功能
        Semaphore semaphore=new Semaphore(3);//模拟资源类，有三个空车位

        for (int i=0;i<6;i++){
            new Thread(()->{
                try {
                    semaphore.acquire();//占用资源（运行到这里上面的基数3会减1），只要有线程一占用了，下一行代码就输出具体信息，
                    System.out.println(Thread.currentThread().getName()+"\t抢到了车位");

                     TimeUnit.SECONDS.sleep(3);//暂停一会线程，模拟车在车位上停留了4S
                    System.out.println(Thread.currentThread().getName()+"\t离开了车位");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }finally {
                    semaphore.release();//释放资源，基数+1；
                }
            },String.valueOf(i+1)).start();
        }

    }
}

```