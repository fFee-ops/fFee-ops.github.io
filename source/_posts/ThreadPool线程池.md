---
title: ThreadPool线程池
date: 2020-10-07 13:15:15
tags: 
categories: JUC
---

<!--more-->

### ThreadPool线程池

- [为什么要用线程池](#_2)
- [线程池如何使用](#_13)
- - [编码实现:](#_19)
- [线程池7大重要参数](#7_91)
- - [线程池底层工作原理](#_138)
- [线程池用哪个？生产中如设置合理参数](#_161)
- - [线程池的拒绝策略](#_163)
  - [在工作中单一的/固定数的/可变的三种创建线程池的方法哪个用的多？超级大坑](#_177)
- [代码](#_188)

# 为什么要用线程池

**例子**：10年前单核CPU电脑，假的多线程，像马戏团小丑玩多个球，CPU需要来回切换。现在是多核电脑，多个线程各自跑在独立的CPU上，不用切换，效率高。

**线程池的优势：** 线程池做的工作只要是控制运行的线程数量，处理过程中将任务放入队列，然后在线程创建后启动这些任务，如果线程数量超过了最大数量，超出数量的线程排队等候，等其他线程执行完毕，再从队列中取出任务来执行。

它的主要特点为：**线程复用;控制最大并发数;管理线程。**

**第一：** 降低资源消耗。通过重复利用已创建的线程降低线程创建和销毁造成的销耗。  
**第二：** 提高响应速度。当任务到达时，任务可以不需要等待线程创建就能立即执行。  
**第三：** 提高线程的可管理性。线程是稀缺资源，如果无限制的创建，不仅会销耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配，调优和监控。

# 线程池如何使用

**架构说明：**  
Java中的线程池是通过Executor框架实现的，该框架中用到了Executor，Executors，ExecutorService，ThreadPoolExecutor这几个类。

## 编码实现:

**①**

```java
Executors.newFixedThreadPool(int)
```

> 执行长期任务性能好，创建一个线程池，  
> 一池有N个固定的线程，有固定线程数的线程

> newFixedThreadPool创建的线程池corePoolSize和maximumPoolSize值是相等的，它使用的是LinkedBlockingQueue

```java

public static ExecutorService newFixedThreadPool (int nThreads){

            return new ThreadPoolExecutor(nThreads,
             nThreads,
              0L, 
              TimeUnit.MILLISECONDS,
               new LinkedBlockingQueue<Runnable>());
       
        }
        
```

---

**②**

```java
Executors.newSingleThreadExecutor()
```

> 一个任务一个任务的执行，一池一线程

> newSingleThreadExecutor 创建的线程池corePoolSize和maximumPoolSize值都是1，它使用的是LinkedBlockingQueue

```java

public static ExecutorService newSingleThreadExecutor () {

     return new FinalizableDelegatedExecutorService(new ThreadPoolExecutor(
     1, 
     1, 
     0L, 
     TimeUnit.MILLISECONDS,
     new LinkedBlockingQueue<Runnable>()));
        
}
```

---

**③**

```java
Executors.newCachedThreadPool()
```

> 执行很多短期异步任务，线程池根据需要创建新线程，  
> 但在先前构建的线程可用时将重用它们。可扩容，遇强则强

> newCachedThreadPool创建的线程池将corePoolSize设置为0，将maximumPoolSize设置为Integer.MAX\_VALUE，它使用的是SynchronousQueue，也就是说来了任务就创建线程运行，当线程空闲超过60秒，就销毁线程。

```java
    public static ExecutorService newCachedThreadPool () {
            return new ThreadPoolExecutor(
            0, 
            Integer.MAX_VALUE, 
            60L,
            TimeUnit.SECONDS, 
            new SynchronousQueue<Runnable>());

        }
```

# 线程池7大重要参数

**部分源代码：**

```java
    public ThreadPoolExecutor(int corePoolSize, 
                              int maximumPoolSize, 
                              long keepAliveTime,
                              TimeUnit unit, 
                              BlockingQueue<Runnable> workQueue, 
                              ThreadFactory threadFactory, 
                              RejectedExecutionHandler handler) {
        if (corePoolSize < 0 || maximumPoolSize <= 0 || maximumPoolSize < corePoolSize || keepAliveTime < 0)
            throw new IllegalArgumentException();
        if (workQueue == null || threadFactory == null || handler == null) throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    } 
```

---

1、**corePoolSize**：线程池中的常驻核心线程数

2、**maximumPoolSize**：线程池中能够容纳同时  
执行的最大线程数，此值必须大于等于1

3、**keepAliveTime**：多余的空闲线程的存活时间  
当前池中线程数量超过corePoolSize时，当空闲时间  
达到keepAliveTime时，多余线程会被销毁直到  
只剩下corePoolSize个线程为止

4、**unit**：keepAliveTime的单位

5、**workQueue**：任务队列，被提交但尚未被执行的任务

6、**threadFactory**：表示生成线程池中工作线程的线程工厂，  
用于创建线程，一般默认的即可

7、**handler**：拒绝策略，表示当队列满了，并且工作线程大于  
等于线程池的最大线程数（maximumPoolSize）时如何来拒绝  
请求执行的runnable的策略

## 线程池底层工作原理

> 1、在创建了线程池后，开始等待请求。  
> 2、当调用execute\(\)方法添加一个请求任务时，线程池会做出如下判断：  
>        2.1如果正在运行的线程数量小于corePoolSize，那么马上创建线程运行这个任务；  
>         2.2如果正在运行的线程数量大于或等于corePoolSize，那么将这个任务放入队列；  
>         2.3如果这个时候队列满了且正在运行的线程数量还小于maximumPoolSize，那么还是要创建非核心线程立刻运行这个任务；  
>        2.4如果队列满了且正在运行的线程数量大于或等于maximumPoolSize，那么线程池会启动饱和拒绝策略来执行。  
> 3、当一个线程完成任务时，它会从队列中取下一个任务来执行。  
> 4、当一个线程无事可做超过一定的时间（keepAliveTime）时，线程会判断： 如果当前运行的线程数大于corePoolSize，那么这个线程就被停掉。 所以线程池的所有任务完成后，它最终会收缩到corePoolSize的大小。

验证从core扩容到maximum后，立即运行当前到达的任务，而不是队列中的

**图解示例：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201007130720728.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

> corePoolSize:当天上班的人  
> maximumPoolSize：加班的人  
> keepAliveTime：如果客流量下去了，在该时间内没多余的人来，加班的人就可以溜了  
> unit：上面时间的单位  
> workQueue：等候区  
> threadFactory：一些默认配置，比如每个银行都会有一个大堂经理，饮水机等等  
> handler：加班窗口和核心窗口都有人在办理业务，等候区也满了，大堂经理就会拒绝你进入，handler就是拒绝你的方式，是叫你滚，还是给你叫你约个时间再过来

# 线程池用哪个？生产中如设置合理参数

## 线程池的拒绝策略

**是什么**  
等待队列已经排满了，再也塞不下新任务了同时，线程池中的max线程也达到了，无法继续为新任务服务。这个是时候我们就需要拒绝策略机制合理的处理这个问题。

**JDK内置的拒绝策略**

| AbortPolicy\(默认\) | CallerRunsPolicy | DiscardOldestPolicy | DiscardPolicy |
| --- | --- | --- | --- |
| 直接抛出RejectedExecutionException异常阻止系统正常运行 | “调用者运行”一种调节机制，该策略既不会抛弃任务，也不会抛出异常，而是将某些任务回退到调用者，从而降低新任务的流量。 | 抛弃队列中等待最久的任务，然后把当前任务加人队列中尝试再次提交当前任务。 | 该策略默默地丢弃无法处理的任务，不予任何处理也不抛出异常。如果允许任务丢失，这是最好的一种策略。 |

**以上内置拒绝策略均实现了RejectedExecutionHandle接口**

## 在工作中单一的/固定数的/可变的三种创建线程池的方法哪个用的多？超级大坑

答案是一个都不用，我们工作中只能使用自定义的

**Executors中JDK已经给你提供了，为什么不用？**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201007131315949.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
**如何自定义 见下面的代码**

# 代码

```java
package cduck.cn;

import java.util.concurrent.*;

public class MyThreadPoolDemo {

    public static void main(String[] args) {
        //电脑CPU数量
        System.out.println(Runtime.getRuntime().availableProcessors());



        //一池5个工作线程。类似一个银行有5个受理窗口
//        ExecutorService  threadPool= Executors.newFixedThreadPool(5);

//        一池1个工作线程，类似一个银行有1个受理窗口
//        ExecutorService  threadPool= Executors.newSingleThreadExecutor();


        //一池N个工作线程，类似一个银行N个窗口--自动扩容
//        ExecutorService  threadPool= Executors.newCachedThreadPool();


//自定义的线程池
        ExecutorService  threadPool= new ThreadPoolExecutor(
                2,
                5,
                2L,
                TimeUnit.SECONDS,
                new LinkedBlockingDeque<>(3),
                Executors.defaultThreadFactory(),
                new ThreadPoolExecutor.AbortPolicy()
        );




        try{
//模拟银行有10个顾客来办理银行业务，目前池子里有5个工作人员提供服务
                    for (int i=0;i<20;i++){
                        threadPool.execute(()->{
                            System.out.println(Thread.currentThread().getName()+"\t 办理业务");
                        });
//                    TimeUnit.SECONDS.sleep(1);
                    }
                }catch (Exception e){
                      e.printStackTrace();
                }finally {
                        threadPool.shutdown();
                }

    }
}


```