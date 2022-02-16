---
title: ReentrantReadWriteLock 读写锁
date: 2020-10-06 22:46:09
tags: 
categories: JUC
---

<!--more-->

### ReentrantReadWriteLock读写锁

- [示例](#_4)

**虽然平常的加锁能保证数据一致性，但是呢，效率很低，你写的时候是加锁了，但是加的太死了：就比如你在写，你不准别人来写没问题，但是如果别人不是来写的只是来读的，你一次只准一个人读，那么效率就会很低下，于是读写锁\(允许多个线程同时读，但是如果有一个线程来写共享资源，那么此时其它的读、写线程都应该被阻塞\)便出来了**。

# 示例

```java
package cduck.cn;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;


//如果不加读写锁会发生  还没有写入成功就进行读取的效果。。。
class MyCache{//资源类

//    volatile的作用就是当一个线程更新某个volatile声明的变量时，会通知其他的cpu使缓存失效，从而其他cpu想要做更新操作时，需要从内存重新读取数据。
    private volatile Map<String,Object> map=new HashMap<>();


    private ReadWriteLock readWriteLock=new ReentrantReadWriteLock();

    public void  put(String key,Object value) throws InterruptedException {
        readWriteLock.writeLock().lock();//写锁
              try{
                  System.out.println(Thread.currentThread().getName()+"\t 开始写入"+key);
                  TimeUnit.MICROSECONDS.sleep(3);
                  map.put(key, value);
                  System.out.println(Thread.currentThread().getName()+"\t 写入完成");

              }catch (Exception e){

              }finally {
                  readWriteLock.writeLock().unlock();
              }
    }
    public void get(String key) throws InterruptedException {

        readWriteLock.readLock() .lock();//读锁
               try{
                   System.out.println(Thread.currentThread().getName()+"\t 开始读取");
                   TimeUnit.MICROSECONDS.sleep(3);
                   Object result = map.get(key);
                   System.out.println(Thread.currentThread().getName()+"\t 读取完成"+result);

               }catch (Exception e){

               }finally {
                   readWriteLock.readLock().unlock();
               }


    }
}


public class ReadWriteLockDemo {
    /**
     * 读写锁，只能一个人写，但是可以同时读。
     */

    public static void main(String[] args) {
        MyCache myCache=new MyCache();

        for (int i=0;i<5;i++){
            final  int tempInt=i;
            new Thread(()->{
                try {
                    myCache.put(tempInt+"",tempInt+"");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            },String.valueOf(i)).start();
        }


        for (int i=0;i<5;i++){
            final  int tempInt=i;
            new Thread(()->{
                try {
                    myCache.get(tempInt+"");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            },String.valueOf(i)).start();
        }
    }
}

```