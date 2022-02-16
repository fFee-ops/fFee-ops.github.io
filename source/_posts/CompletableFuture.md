---
title: CompletableFuture
date: 2020-10-08 14:45:04
tags: 
categories: JUC
---

<!--more-->

### CompletableFuture

- [是什么](#_1)
- [runAsync 和 supplyAsync方法](#runAsync__supplyAsync_11)
- [计算结果完成时的回调方法](#_27)
- [代码](#_42)

# 是什么

在Java中CompletableFuture用于异步编程，异步编程是编写非阻塞的代码，运行的任务在一个单独的线程，与主线程隔离，并且会通知主线程它的进度，成功或者失败。  
在这种方式中，主线程不会被阻塞，不需要一直等到子线程完成。主线程可以并行的执行其他任务。  
使用这种并行方式，可以极大的提高程序的性能。  
**Future vs CompletableFuture：**  
CompletableFuture 是 Future API的扩展。  
Future 被用于作为一个异步计算结果的引用。提供一个 isDone\(\) 方法来检查计算任务是否完成。当任务完成时，get\(\) 方法用来接收计算任务的结果。  
Future API 是非常好的 Java 异步编程进阶，但是它缺乏一些非常重要和有用的特性。

# runAsync 和 supplyAsync方法

CompletableFuture 提供了四个静态方法来创建一个异步操作。

```java
public static CompletableFuture<Void> runAsync(Runnable runnable)
public static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor)
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier)
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor)
```

没有指定Executor的方法会使用ForkJoinPool.commonPool\(\) 作为它的线程池执行异步代码。如果指定线程池，则使用指定的线程池运行。以下所有的方法都类同。

- runAsync方法不支持返回值。
- supplyAsync可以支持返回值。

# 计算结果完成时的回调方法

当CompletableFuture的计算结果完成，或者抛出异常的时候，可以执行特定的Action。主要是下面的方法：

```java
public CompletableFuture<T> whenComplete(BiConsumer<? super T,? super Throwable> action)
public CompletableFuture<T> whenCompleteAsync(BiConsumer<? super T,? super Throwable> action)
public CompletableFuture<T> whenCompleteAsync(BiConsumer<? super T,? super Throwable> action, Executor executor)
public CompletableFuture<T> exceptionally(Function<Throwable,? extends T> fn)
```

**whenComplete 和 whenCompleteAsync 的区别：**

- whenComplete：执行完成时，当前任务的线程执行继续执行 whenComplete 的任务。
- whenCompleteAsync：执行完成时，把whenCompleteAsync 这个任务提交给线程池来进行执行。

# 代码

```java
package cduck.cn;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

public class CompletableFutureDemo {

    public static void main(String[] args) throws ExecutionException, InterruptedException {
        CompletableFuture<Void> voidCompletableFuture = CompletableFuture.runAsync(() -> {
            System.out.println(Thread.currentThread().getName() + "我没有返回值");
        });
        voidCompletableFuture.get();

        //异步回调
        CompletableFuture<Integer> integerCompletableFuture = CompletableFuture.supplyAsync(() -> {
            System.out.println(Thread.currentThread().getName() + "\t 我有返回值");
            int i = 10 / 0;
            return 1024;
        });

        integerCompletableFuture.whenComplete((t,u)->{
            System.out.println("-----t="+t);//t是结果；；如果正常就会把t打印出来
            System.out.println("-----u="+u);//u是异常对象；；如果有异常就会把u打印出来
        }).exceptionally((f)->{
            System.out.println("-----exception="+f.getMessage());
            return 444;
        }).get();
    }
}

```