---
title: BIO、NIO、AIO
date: 2021-06-22 23:56:49
tags: 
categories: Netty
---

<!--more-->

### BIO、NIO、AIO

- [BIO](#BIO_8)
- - [基本概念](#_10)
- [NIO](#NIO_16)
- - [基本概念](#_18)
  - [为什么说是非阻塞的？](#_30)
  - [三大核心组件](#_35)
  - - [Buffer](#Buffer_36)
    - - [buffer中核心的四个参数](#buffer_41)
    - [Channel](#Channel_52)
    - [关于 Buffer 和 Channel 的注意事项和细节](#_Buffer__Channel__64)
    - [Selector](#Selector_73)
  - [NIO 非阻塞 网络编程原理](#NIO___105)
- [AIO（目前并未广泛应用）](#AIO_125)
- [零拷贝](#_131)
- - [mmap 和 sendFile 的区别](#mmap__sendFile__155)
  - [netty中的零拷贝](#netty_162)
  - - [1、buffer层面](#1buffer_165)
    - [2.操作系统层面](#2_177)

**关于三种IO的一些细节可以看看[Linux的IO模型](https://blog.csdn.net/qq_21040559/article/details/113782884?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522162437358916780262562720%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=162437358916780262562720&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_v2~rank_v29-2-113782884.nonecase&utm_term=IO&spm=1018.2226.3001.4450)这篇文章，有些内容更加详细，这两篇文章加起来学习三种IO更好\~**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210627153150951.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# BIO

## 基本概念

同步并阻塞\(传统阻塞型\)，客户端的每一个请求服务端都要开一个线程来对应它，如果这个连接不做任何事情会造成不必要的线程开销。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210622225552134.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# NIO

## 基本概念

同步非阻塞：服务器会开启一个线程，线程会维护一个`Selector`，一个`Selector`可以处理多个连接，它会在内部不断轮循，然后去处理那些有IO请求的连接（因为每个连接不是时刻都在发起IO请求，肯定会有空闲时间）。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210622225900346.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

> 本张图其实是个简化以后的\~

其实NIO 有三大核心部分：**Channel\(通道\)，Buffer\(缓冲区\), Selector\(选择器\)**。  
上面简化图给细化一下其实是下面这个样子：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210623221949452.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

> selector会和一个通道直接相连，并且监听通道里面发生的事件，比如Read/Write等，而通道又会和一个Buffer相互关联，它们可以相互传输数据，这个时候socket就是直接和Buffer打交道了\~**`Buffer的底层是一个数组`**

## 为什么说是非阻塞的？

因为selector监控的通道如果有活动，那就去处理哪些有活动的通道\~如果都没有活动那么这个线程也不会阻塞，它甚至可以干一些自己的事情

## 三大核心组件

### Buffer

缓冲区（Buffer）：缓冲区本质上是一个可以读写数据的内存块，底层是一个**数组**。

Buffer是一个父类，它拥有七个子类（也就是八大数据类型，除了boolean）；  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210623225513444.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

#### buffer中核心的四个参数

看一下buffer的源码可以发现有四个参数是非常核心的。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210623225601691.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210623225631787.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

> 每次在读取数据的时候其实是`positon`在改变，而且要注意`limit`是指无法到达的极限。举个例子来说：  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210623225753961.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
> 现在我们往buffer中放5个元素，然后正常读取，正常情况是5个都可以读取出来。然后我们再设置一下limit:`intBuffer.limit(3);`再进行读取，可以发现只能读取到`position`为2的数据了，也就是无法到达limit  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210623225920290.png)

### Channel

**基本概念**

NIO 的通道类似于流，但通道可以同时进行读写，而流只能读或者只能写。

常 用 的 Channel 类 有 ：`FileChannel 、 DatagramChannel 、 ServerSocketChannel 和 SocketChannel`

> FileChannel 用于文件的数据读写，DatagramChannel 用于 UDP 的数据读写，ServerSocketChannel 和 SocketChannel 用于 TCP 的数据读写。

### 关于 Buffer 和 Channel 的注意事项和细节

1.  ByteBuffer 支持类型化的 put 和 get, put 放入的是什么数据类型，get 就应该使用相应的数据类型来取出，否 则可能有 BufferUnderflowException 异常。
2.  可以将一个普通 Buffer 转成只读 Buffer
3.  NIO 还提供了 `MappedByteBuffer` ， 可以让文件直接在内存（堆外的内存）中进行修改， 而如何同步到文件 由 NIO 来完成
4.  前面我们讲的读写操作，都是通过一个 Buffer 完成的，NIO 还支持 通过多个 Buffer \(即 Buffer 数组\) 完成读 写操作，即 Scattering 和 Gathering

> **Scattering**：将数据写入到 buffer 时，可以采用 buffer 数组，依次写入  
> **Gathering**: 从 buffer 读取数据时，可以采用 buffer 数组，依次读

### Selector

1.  Java 的 NIO，用非阻塞的 IO 方式。可以用一个线程，处理多个的客户端连接，就会使用到 Selector\(选择器\)
2.  Selector 能够检测多个注册的通道上是否有事件发生，然后针对发生事件的通道进行处理。
3.  它只有在真正有事件发生的时候才会去处理，能极大的减少系统开销，并且避免了多线程之间的上下文切换导致的开销。

---

**selector 相关方法说明**

```java
/*
至少要获取一个通道的事件，如果没有一个通道发生事件，那么它会一直
阻塞，知道获取到一个以上
*/
selector.select()//阻塞 

/*
等待一定时间后就会自动返回，不管有没有捕获到事件
*/
selector.select(1000);//阻塞 1000 毫秒，在 1000 毫秒后返回 

/*
如果一个线程在调用select()或select(long)方法时被阻塞，调用
wakeup()会使线程立即从阻塞中唤醒；
*/
selector.wakeup();//唤醒

/*
获取通道事件，有就返回，没有也立即返回，不回阻塞
*/
selector selector.selectNow();//不阻塞，立马返还
```

## NIO 非阻塞 网络编程原理

Selector、SelectionKey、ServerScoketChannel 和 SocketChannel关系梳理图  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210626152630948.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

> **对上图的说明：**
> 
> 1.  服务端会维护一个`ServerScoketChannel`，用来监听客户端（注意`ServerScoketChannel`也要注册到`Selector`），当客户端产生连接的时候，就可以通过`ServerScoketChannel`产生一个`SocketChannel`，这个`SocketChannel`就是客户端用来和服务端进行通讯的
> 2.  `SocketChannel`通过`register()`注册到`Selector`上
> 3.  注册后会返回一个`SelectionKey`，这就是其与`Selector`产生关联的标志
> 4.  `Selector`可以用`select()`来监听，返回有事件发生的通道的个数以及它们的`SelectionKey`
> 5.  然后可以通过`SelectionKey`反向获取到`SocketChannel`，进一步完成业务处理

SelectionKey，表示 Selector 和网络通道的注册关系, 共四种:

> int OP\_ACCEPT：有新的网络连接可以 accept，值为 16  
> int OP\_CONNECT：代表连接已经建立，值为 8  
> int OP\_READ：代表读操作，值为 1  
> int OP\_WRITE：代表写操作，值为 4

# AIO（目前并未广泛应用）

异步非阻塞：它的特点是先由操作系统完成后才通知服务端程序启动线程去处理，一般适用于连接数较多且连接时间较长的应用。详细概念见文章开头的链接。

# 零拷贝

在 Java 程序中，常用的零拷贝有 mmap\(内存映射\) 和 sendFile。

> 零拷贝从操作系统角度，是没有 cpu 拷贝

**传统io拷贝模型**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210627152350801.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

> DMA: direct memory access 直接内存拷贝\(不使用 CPU\)

**mmap 优化：**  
mmap 通过内存映射，将文件映射到内核缓冲区，同时，用户空间可以**共享内核空间的数据**。这样，在进行网络传输时，就可以减少内核空间到用户空间的拷贝次数。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210627152517716.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**sendFile 优化：**  
Linux 2.1 版本 提供了 sendFile 函数：数据根本不经过用户态，直接从内核缓冲区进入到`Socket Buffer`，同时，由于和用户态完全无关，就减少了一次上下文切换。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210627152640288.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

Linux 2.4 版本中，做了一些修改，避免了从内核缓冲区拷贝到 Socket buffer 的操作，直接拷贝到协议栈，从而再一次减少了数据拷贝。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210627152831777.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

> 这里其实有 一次 cpu 拷贝kernel buffer \-> socket buffer。但是，拷贝的信息很少 , 消耗低，可以忽略

## mmap 和 sendFile 的区别

1.  mmap 适合小数据量读写，sendFile 适合大文件传输。
2.  mmap 需要 3 次上下文切换，3 次数据拷贝；sendFile 需要 2次上下文切换，最少 2 次数据拷贝。
3.  sendFile 可以利用 DMA 方式，减少 CPU 拷贝，mmap 则不能（必须从内核拷贝到 Socket 缓冲区）。

## netty中的零拷贝

Netty的零拷贝体现在两个个方面：

### 1、buffer层面

**1.1：**  
netty支持直接在`直接内存分配`而不是在`堆内存`分配，这样的话就将`从堆内存拷贝到直接内存，然后再由直接内存拷贝到网卡接口层`这个步骤变成了，`直接由直接内存拷贝到网卡接口层`。这样实现了零拷贝

**1.2：**  
Netty提供了组合Buffer对象，即Composite Buffers，可以聚合多个ByteBuffer对象成一个大的buffer对象。  
传统的ByteBuffer，如果需要将两个ByteBuffer中的数据组合到一起，我们需要首先创建一个size=size1+size2大小的新的数组，然后将两个数组中的数据拷贝到新的数组中。

但是使用Netty提供的组合ByteBuf，就可以避免这样的操作，因为CompositeByteBuf并没有真正将多个Buffer组合起来，而是保存了它们的引用，从而避免了数据的拷贝，实现了零拷贝

### 2.操作系统层面

Netty的文件传输采用了transferTo方法，它可以直接将文件缓冲区的数据发送到目标Channel，避免了传统通过循环write方式导致的内存拷贝问题。  
就是和sendFile 2.4一样