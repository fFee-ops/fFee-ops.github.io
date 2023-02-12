---
title: CompletableFuture
date: 2020-10-08 14:45:04
tags: 
categories: JUC
---

<!--more-->
# 1. 概念
CompletableFuture实现了Future接口，Future是Java5新加的一个接口，它提供了一种异步并行计算的功能。如果主线程需要执行一个很耗时的计算任务，我们就可以通过future把这个任务放到异步线程中执行。主线程继续处理其他任务，处理完成后，再通过Future获取计算结果。

可以发现，future+线程池异步配合，提高了程序的执行效率。
但是Future对于结果的获取，不是很友好，只能通过阻塞或者轮询的方式得到任务的结果。
- Future.get() 就是阻塞调用，在线程获取结果之前get方法会一直阻塞。
- Future提供了一个isDone方法，可以在程序中轮询这个方法查询执行结果。


阻塞的方式和异步编程的设计理念相违背，而轮询的方式会耗费无谓的CPU资源。因此，JDK8设计出CompletableFuture。CompletableFuture提供了一种观察者模式类似的机制，可以让任务执行完成后通知监听的一方。

# 2. 使用姿势
CompletableFuture提供了几十种方法，下面将介绍一下几种常见的方法使用。


## 2.1 创建异步任务
![在这里插入图片描述](https://img-blog.csdnimg.cn/f1995b9c80fa406f9d9f809415ae08f4.png)

CompletableFuture创建异步任务，一般有supplyAsync和runAsync两个方法
- supplyAsync执行CompletableFuture任务，支持返回值
- runAsync执行CompletableFuture任务，没有返回值。

```java
private static void t1() throws InterruptedException, ExecutionException {
        CompletableFuture<Integer> supplyAsync = CompletableFuture.supplyAsync(() -> {
            try {
                System.out.println("我是supplyAsync");
                TimeUnit.SECONDS.sleep(2);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return 1;
        });

        CompletableFuture<Void> runAsync = CompletableFuture.runAsync(() -> {
            System.out.println("我是runAsync");
        });
        System.out.println("获取supplyAsync异步任务的结果:" + supplyAsync.get());
        System.out.println("获取runAsync异步任务的结果:" + runAsync.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/1b7cc15b272743b2a105feda92f02905.png)

## 2.2 任务异步回调
![在这里插入图片描述](https://img-blog.csdnimg.cn/1c24102d286f4d3ea73f35c1c43f6503.png)

### 2.2.1 thenRun/thenRunAsync
CompletableFuture的thenRun方法，通俗点讲就是，做完某个任务后，再做第二个任务。某个任务执行完成后，执行回调方法；但是前后两个任务**没有参数传递**，第二个任务也**没有返回值**

```java
    private static void t2() throws InterruptedException, ExecutionException {
        CompletableFuture<String> supplyAsync = CompletableFuture.supplyAsync(() -> {
            System.out.println("我是supplyAsync");
            return "i am first method res!!!";
        });

        CompletableFuture<Void> thenRun = supplyAsync.thenRun(() -> {
            System.out.println("我是第二个任务");
        });
        System.out.println("获取supplyAsync异步任务的结果:" + supplyAsync.get());
        System.out.println("获取thenRun异步任务的结果:" + thenRun.get());
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/91a7101213f64ed4adc1b7f6561bb498.png)
**thenRun 和thenRunAsync的区别：**
可以先看下源码
```java
   private static final Executor asyncPool = useCommonPool ?
        ForkJoinPool.commonPool() : new ThreadPerTaskExecutor();
        
    public CompletableFuture<Void> thenRun(Runnable action) {
        return uniRunStage(null, action);
    }

    public CompletableFuture<Void> thenRunAsync(Runnable action) {
        return uniRunStage(asyncPool, action);
    }
```
如果你执行个任务的时候，传入了一个自定义线程池：

- 调用thenRun方法执行第二个任务时，则第二个任务和第一个任务是共用同一个线程池。
- 调用thenRunAsync执行第二个任务时，则第一个任务使用的是你自己传入的线程池，第二个任务使用的是ForkJoin线程池

后面的xxxRun和xxRunAsync也是这个区别

### 2.2.2 thenAccept/thenAcceptAsync
CompletableFuture的thenAccept方法表示，第一个任务执行完成后，执行第二个回调方法任务，会将第一个任务的执行结果，作为入参，传递到回调方法中，但是**回调方法是没有返回值的**。
```java
private static void t3() throws InterruptedException, ExecutionException {
        CompletableFuture<String> supplyAsync = CompletableFuture.supplyAsync(() -> {
            System.out.println("我是supplyAsync");
            return "i am first method res!!!";
        });

        CompletableFuture<Void> thenAccept = supplyAsync.thenAccept((arg) -> {
            System.out.println("第一个任务的参数：" + arg);
        });
        System.out.println("获取supplyAsync异步任务的结果:" + supplyAsync.get());
        System.out.println("获取thenAccept异步任务的结果:" + thenAccept.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/d58653d133b74195adf3f473baa4f9b0.png)

### 2.2.3 thenApply/thenApplyAsync
CompletableFuture的thenApply方法表示，第一个任务执行完成后，执行第二个回调方法任务，会将第一个任务的执行结果，作为入参，传递到回调方法中，并且**回调方法是有返回值的**。

```java
private static void t4() throws InterruptedException, ExecutionException {
        CompletableFuture<String> supplyAsync = CompletableFuture.supplyAsync(() -> {
            System.out.println("我是supplyAsync");
            return "i am first method res!!!";
        });

        CompletableFuture<String> thenApply = supplyAsync.thenApply((arg) -> {
            System.out.println("第一个任务的参数：" + arg);
            return "gggg";
        });
        System.out.println("获取supplyAsync异步任务的结果:" + supplyAsync.get());
        System.out.println("thenApply异步任务的结果:" + thenApply.get());
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/2158eebe38684d90bc4fd99ea272541c.png)

### 2.2.24 exceptionally
CompletableFuture的exceptionally方法表示，某个任务执行异常时，执行的回调方法;并且有**抛出异常作为参数**，传递到回调方法。
```java
    private static void t5() throws InterruptedException, ExecutionException {
        CompletableFuture<String> supplyAsync = CompletableFuture.supplyAsync(() -> {
            System.out.println("当前线程名称：" + Thread.currentThread().getContextClassLoader());
            throw new RuntimeException();
        });

        CompletableFuture<String> exceptionally = supplyAsync.exceptionally((e) -> {
            System.out.println("程序异常参数：" + e);
            return "gggg";
        });
        System.out.println("exceptionally异步任务的结果:" + exceptionally.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/bb24fb07590046d494b0dbd39c22ccd5.png)

### 2.2.5 whenComplete
CompletableFuture的whenComplete方法表示，某个任务执行完成后，执行的回调方法，**无返回值**；并且whenComplete方法返回的CompletableFuture的result是**上个任务的结果**。
```java
    private static void t6() throws InterruptedException, ExecutionException {
        CompletableFuture<String> supplyAsync = CompletableFuture.supplyAsync(() -> {
            System.out.println("我是supplyAsync");
            return "i am first method res!!!";
        });

        CompletableFuture<String> whenComplete = supplyAsync.whenComplete((arg, throwable) -> {
            System.out.println("第一个任务的参数：" + arg);
        });
        System.out.println("获取supplyAsync异步任务的结果:" + supplyAsync.get());
        System.out.println("whenComplete异步任务的结果:" + whenComplete.get());
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/10a46e627b1446feb5d9116049f5bd0a.png)

### 2.2.6 handle
CompletableFuture的handle方法表示，某个任务执行完成后，执行回调方法，并且是**有返回值的**;并且handle方法返回的CompletableFuture的result是**回调方法执行的结果**。

```java
 private static void t7() throws InterruptedException, ExecutionException {
        CompletableFuture<String> supplyAsync = CompletableFuture.supplyAsync(() -> {
            System.out.println("我是supplyAsync");
            return "i am first method res!!!";
        });

        CompletableFuture<String> handle = supplyAsync.handle((arg, throwable) -> {
            System.out.println("第一个任务的参数：" + arg);
            return "i am second method res!!!";
        });
        System.out.println("获取supplyAsync异步任务的结果:" + supplyAsync.get());
        System.out.println("handle异步任务的结果:" + handle.get());
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/833fc37a1ff341caabc835fe15742f83.png)

## 2.3 多个任务组合处理
![在这里插入图片描述](https://img-blog.csdnimg.cn/c0b7c907856c40d89bae890dbd8d2599.png)

### 2.3.1 AND组合
 thenCombine / thenAcceptBoth / runAfterBoth都表示：将两个CompletableFuture组合起来，**只有这两个都正常执行完了，才会执行某个任务。**

 区别在于：
- thenCombine：会将两个任务的执行结果**作为方法入参**，传递到指定方法中，**且有返回值**
- thenAcceptBoth: 会将两个任务的执行结果**作为方法入参**，传递到指定方法中，**且无返回值**
- runAfterBoth **不会把执行结果当做方法入参**，且没有返回值。

thenCombine
```java
private static void t8() throws InterruptedException, ExecutionException {
        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> {
            return "i am first method res!!!";
        });

        CompletableFuture<String> second = CompletableFuture.supplyAsync(() -> {
            return "i am second method res!!!";
        });

        CompletableFuture<String> combine = second.thenCombine(first, (arg1, arg2) -> {
            System.out.println("第一个方法的参数：" + arg1);
            System.out.println("第二个方法的参数：" + arg2);
            return "i am combine method res!!!";
        });


        System.out.println("获取first异步任务的结果:" + first.get());
        System.out.println("获取second异步任务的结果:" + second.get());
        System.out.println("combine异步任务的结果:" + combine.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/0228542896db4eaab424462df97d6779.png)


thenAcceptBoth
```java
private static void t9() throws InterruptedException, ExecutionException {
        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> {
            return "i am first method res!!!";
        });

        CompletableFuture<String> second = CompletableFuture.supplyAsync(() -> {
            return "i am second method res!!!";
        });

        CompletableFuture<Void> acceptBoth = second.thenAcceptBoth(first, (arg1, arg2) -> {
            System.out.println("第一个方法的参数：" + arg1);
            System.out.println("第二个方法的参数：" + arg2);
        });


        System.out.println("获取first异步任务的结果:" + first.get());
        System.out.println("获取second异步任务的结果:" + second.get());
        System.out.println("acceptBoth异步任务的结果:" + acceptBoth.get());
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/63055cb3bdbb4f4fa23f4c0dc6b2128a.png)

runAfterBoth
```java
private static void t10() throws InterruptedException, ExecutionException {
        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> {
            return "i am first method res!!!";
        });

        CompletableFuture<String> second = CompletableFuture.supplyAsync(() -> {
            return "i am second method res!!!";
        });

        CompletableFuture<Void> runAfterBoth = second.runAfterBoth(first, () -> {
            System.out.println("我没有返回值，也没有入参");
        });


        System.out.println("获取first异步任务的结果:" + first.get());
        System.out.println("获取second异步任务的结果:" + second.get());
        System.out.println("runAfterBoth异步任务的结果:" + runAfterBoth.get());
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/e3acf3f339b84309832059f9a3e32aac.png)

### 2.3.2 OR 组合
applyToEither / acceptEither / runAfterEither 都表示：将两个CompletableFuture组合起来，**只要其中一个执行完了,就会执行某个任务。**

区别在于：
- applyToEither：会将已经执行完成的任务，作为方法入参，**传递到指定方法中，且有返回值**
- acceptEither: 会将已经执行完成的任务，作为方法入参，**传递到指定方法中，且无返回值**
- runAfterEither：**不会把执行结果当做方法入参**，且没有返回值。


applyToEither
```java
private static void t11() throws InterruptedException, ExecutionException {
        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(TimeUnit.SECONDS.toMillis(5));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "i am first method res!!!";
        });

        CompletableFuture<String> second = CompletableFuture.supplyAsync(() -> {
            return "i am second method res!!!";
        });

        CompletableFuture<String> applyToEither = second.applyToEither(first, (arg) -> {
            System.out.println("我是先执行完的方法的参数：" + arg);
            return "i am applyToEither method res!!!";
        });


        System.out.println("获取first异步任务的结果:" + first.get());
        System.out.println("获取second异步任务的结果:" + second.get());
        System.out.println("applyToEither异步任务的结果:" + applyToEither.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/679d72c0576948528e0570977f5aa09b.png)

acceptEither
```java
private static void t12() throws InterruptedException, ExecutionException {
        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(TimeUnit.SECONDS.toMillis(5));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "i am first method res!!!";
        });

        CompletableFuture<String> second = CompletableFuture.supplyAsync(() -> {
            return "i am second method res!!!";
        });

        CompletableFuture<Void> acceptEither = second.acceptEither(first, (arg) -> {
            System.out.println("我是先执行完的方法的参数：" + arg);
        });


        System.out.println("获取first异步任务的结果:" + first.get());
        System.out.println("获取second异步任务的结果:" + second.get());
        System.out.println("acceptEither异步任务的结果:" + acceptEither.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/702b3c54d8794cc497a56376c29fb5e1.png)

runAfterEither
```java
private static void t13() throws InterruptedException, ExecutionException {
        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(TimeUnit.SECONDS.toMillis(5));
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "i am first method res!!!";
        });

        CompletableFuture<String> second = CompletableFuture.supplyAsync(() -> {
            return "i am second method res!!!";
        });

        CompletableFuture<Void> runAfterEither = second.runAfterEither(first, () -> {
            System.out.println("我没有参数");
        });


        System.out.println("获取first异步任务的结果:" + first.get());
        System.out.println("获取second异步任务的结果:" + second.get());
        System.out.println("runAfterEither异步任务的结果:" + runAfterEither.get());
    }
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/06b0a229532245d391310bfc9b2bc885.png)

### 2.3.3 AllOf
所有任务都执行完成后，才执行 allOf返回的CompletableFuture。如果任意一个任务异常，allOf的CompletableFuture，执行get方法，**会抛出异常**
```java
private static void t14() throws Exception {
        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(3000L);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "i am first method res!!!";
        });

        CompletableFuture<String> second = CompletableFuture.supplyAsync(() -> {
            return "i am second method res!!!";
        });

        CompletableFuture<Void> allOf = CompletableFuture.allOf(first, second);


        System.out.println("allOf异步任务的结果:" + allOf.get());
        System.out.println("获取first异步任务的结果:" + first.get());
        System.out.println("获取second异步任务的结果:" + second.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/a88f9dc94aba45408565401463af023d.png)

### 2.3.4 AnyOf
任意一个任务执行完，就执行anyOf返回的CompletableFuture。如果执行的任务异常，anyOf的CompletableFuture，执行get方法，**会抛出异常**
```java
private static void t15() throws Exception {
        CompletableFuture<String> first = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(3000L);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "i am first method res!!!";
        });

        CompletableFuture<String> second = CompletableFuture.supplyAsync(() -> {
            return "i am second method res!!!";
        });

        CompletableFuture<Object> anyOf = CompletableFuture.anyOf(first, second);


        System.out.println("anyOf异步任务的结果:" + anyOf.get());
        System.out.println("获取first异步任务的结果:" + first.get());
        System.out.println("获取second异步任务的结果:" + second.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/b5158a7a52bd4e83bb1ba0757c075c32.png)

### 2.3.5 thenCompose
thenCompose方法会在某个任务执行完成后，将该任务的执行结果,作为方法入参,去执行指定的方法。该方法会返回一个新的CompletableFuture实例

- 如果该CompletableFuture实例的result不为null，则返回一个基于该result新的CompletableFuture实例；
- 如果该CompletableFuture实例为null，然后就执行这个新任务
```java
private static void t16() throws Exception {
        CompletableFuture<Integer> first = CompletableFuture.supplyAsync(() -> {
            return 10;
        });
        CompletableFuture<Integer> thenCompose = first.thenCompose((arg) ->
                CompletableFuture.supplyAsync(() -> {
                    return 10 * arg;
                })
        );
        System.out.println("获取thenCompose异步任务的结果:" + thenCompose.get());
    }
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/ba32f97fbccc41699baf3984eded7962.png)

# 3. 使用注意点
1、 CompletableFuture的get()方法是阻塞的
>CompletableFuture的get()方法是阻塞的，如果使用它来获取异步调用的返回值，需要添加超时时间
>```java
>//反例
> CompletableFuture.get();
>//正例
>CompletableFuture.get(5, TimeUnit.SECONDS);
>```

2、 一般要使用自定义线程池
>CompletableFuture代码中使用了默认的线程池，处理的线程个数是`电脑CPU核数-1`。在大量请求过来的时候，处理逻辑复杂的话，响应会很慢。一般建议使用自定义线程池，优化线程池配置参数。