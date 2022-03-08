---
title: Redis持久化
date: 2020-09-06 21:47:51
tags: 
categories: Redis
---



#  1. 什么是Redis持久化
持久化就是把内存的数据写到磁盘中去，防止服务宕机了内存数据丢失。 Redis 提供了两种持久化方式:**RDB（默认）**和**AOF**
<font color=gray size=2>RDB一定时间取存储文件，AOF默认每秒去存储历史命令</font><br><br>

数据存放于：
**内存**：高效、断电（关机）内存数据会丢失
**硬盘**：读写速度慢于内存，断电数据不会丢失


#  2. RDB
## 2.1 概念
在指定的时间间隔能对你的数据进行快照存储。
RDB持久化是将当前进程中的数据生成快照保存到硬盘(因此也称作快照持久化)，保存的文件后缀是rdb；当Redis重新启动时，可以读取快照文件恢复数据。

## 2.2 触发&原理
在Redis中RDB持久化的触发分为两种：指令手动触发和 redis.conf 配置自动触发
### 2.2.1 指令手动触发
save命令和bgsave命令都可以生成RDB文件
- save：会阻塞当前Redis服务器，直到RDB文件创建完毕为止，线上应该禁止使用。
- bgsave：该触发方式会fork一个子进程，由子进程负责持久化过程，因此**阻塞只会发生在fork子进程的时候**

![在这里插入图片描述](https://img-blog.csdnimg.cn/ffb7bc6141224892987aad0b3f29444f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
###  2.2.2 自动触发
- 根据我们的 `save m n `配置规则自动触发；
- 从节点全量复制时，主节点发送rdb文件给从节点完成复制操作，主节点会触发 bgsave；
- 执行 debug reload 时；
- 客户端执行 shutdown时，如果没有开启aof，也会触发。

**redis.conf：**
```shell
# 时间策略
save 900 1 # 表示900 秒内如果至少有 1 个 key 的值变化，则触发RDB
save 300 10 # 表示300 秒内如果至少有 10 个 key 的值变化，则触发RDB
save 60 10000 # 表示60 秒内如果至少有 10000 个 key 的值变化，则触发RDB
# 文件名称
dbfilename dump.rdb
# 文件保存路径
dir /home/work/app/redis/data/
# 如果持久化出错，主进程是否停止写入
stop-writes-on-bgsave-error yes
# 是否压缩
rdbcompression yes
# 导入时是否检查
rdbchecksum yes
```
为什么需要配置这么多条规则呢？因为Redis每个时段的读写请求肯定不是均衡的，为了平衡性能与数据安全，我们可以自由定制什么情况下触发备份。所以这里就是根据自身Redis写入情况来进行合理配置。

- `stop-writes-on-bgsave-error yes` 这个配置也是非常重要的一项配置，这是当备份进程出错时，主进程就停止接受新的写入操作，是为了保护持久化的数据一致性问题。如果自己的业务有完善的监控系统，可以禁止此项配置， 否则请开启。
- 关于压缩的配置 `rdbcompression yes `，建议没有必要开启，毕竟Redis本身就属于CPU密集型服务器，再开启压缩会带来更多的CPU消耗，相比硬盘成本，CPU更值钱。
- 当然如果你想要禁用RDB配置，也是非常容易的，只需要在save的最后一行写上：`save ""`

## 2.3 示例
**手动触发bgsave方法**
![在这里插入图片描述](https://img-blog.csdnimg.cn/4ae1cac50ca54cd5aa3ec9271fb838d0.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/6b5b8c4509f943fb9a4ac9adfa09177b.png)
**自动触发**
![在这里插入图片描述](https://img-blog.csdnimg.cn/cdb99e41aea8459aa080d398044f6f46.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_14,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/5e1693d900204bbb9d39b14f5307c8b2.png)

## 2.4 RDB总结
**优势**
1、执行效率高，适用于大规模数据的备份恢复。自动备份不会影响主线程工作。
2、备份的文件占用空间小。其备份的是数据快照，相对于AOF来说文件大小要小一些。

**劣势**
1、可能会造成部分数据丢失。因为是自动备份，所以如果修改的数据量不足以触发自动备份，同时发生断电等异常导致redis不能正常关闭，所以也没有触发关闭的备份，那么在上一次备份到异常宕机过程中发生的写操作就会丢失。
2、自动备份通过fork进程来执行备份操作，而fork进程会将当前进程的内存数据完整的复制一份，所以这个过程占用的空间**是原来的2倍**，可能会导致内存不足


#  3. AOF
## 3.1 概念
AOF（append only file）：记录每次对服务器写的操作（命令）,当服务器重启的时候会重新执行这些命令来恢复原始的数据。

AOF特点：

1. 以日志的形式来记录用户请求的写操作，读操作不会记录，因为写操作才会存储
2. 文件以追加的形式而不是修改的形式
3. redis的aof恢复其实就是把追加的文件从开始到结尾读取 执行 写操作

## 3.2  AOF 持久化的实现
![在这里插入图片描述](https://img-blog.csdnimg.cn/ac8b03e4a2444a0a88a9fab007a976c6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
如上图所示，AOF 持久化功能的实现可以分为命令追加( append )、文件写入( write )、文件同步( sync)、文件重写(rewrite)和重启加载(load)。其流程如下

1. 所有的写命令会追加到 AOF 缓冲中。
2. AOF 缓冲区根据对应的策略向硬盘进行同步操作。
3. 随着 AOF 文件越来越大，需要定期对 AOF 文件进行重写，达到压缩的目的。
4. 当 Redis 重启时，可以加载 AOF 文件进行数据恢复。

## 3.3 开启
```shell
# 可以通过修改redis.conf配置文件中的appendonly参数开启
appendonly yes
# AOF文件的保存位置和RDB文件的位置相同，都是通过dir参数设置的。
dir ./
# 默认的文件名是appendonly.aof，可以通过appendfilename参数修改
appendfilename appendonly.aof
```

## 3.4 命令追加
当 AOF 持久化功能处于打开状态时，Redis 在执行完一个写命令之后，会以协议格式(也就是RESP，即Redis 客户端和服务器交互的通信协议 )将被执行的写命令追加到 Redis 服务端维护的 AOF 缓冲区末尾。

比如说 SET mykey myvalue 这条命令就以如下格式记录到 AOF 缓冲中。
`"*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$7\r\nmyvalue\r\n"`
Redis 协议格式本文不再赘述，AOF之所以直接采用文本协议格式，是因为所有写入命令都要进行追加操作，直接采用协议格式，避免了二次处理开销。

## 3.5 文件写入和同步（触发）
Redis 每次结束一个事件循环之前，它都会调用 flushAppendOnlyFile 函数，判断是否需要将 AOF 缓存区中的内容写入和同步到 AOF 文件中。

flushAppendOnlyFile 函数的行为由 redis.conf 配置中的 appendfsync 选项的值来决定。该选项有	三个可选值，分别是 always 、 everysec 和 no ：
![在这里插入图片描述](https://img-blog.csdnimg.cn/a9511026bf804c2cba823408d258de29.png)

- always ：每执行一个命令保存一次 高消耗,最安全
- everysec ：每一秒钟保存一次
- no ：只写入 不保存， AOF 或 Redis 关闭时执行，由操作系统决定何时触发刷新文件到磁盘

> 写入 和保存概念
> WRITE：根据条件，将 aof_buf 中的缓存写入到 AOF 文件。
> SAVE：根据条件，调用 fsync 或 fdatasync 函数，将 AOF 文件保存到磁盘中。

## 3.6 AOF 数据恢复
AOF 文件里边包含了重建 Redis 数据所需的所有写命令，所以 Redis 只要读入并重新执行一遍 AOF 文件里边保存的写命令，就可以还原 Redis 关闭之前的状态

![在这里插入图片描述](https://img-blog.csdnimg.cn/cb21c9f2d5084a7f845e4aae4523bc53.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
Redis 读取 AOF 文件并且还原数据库状态的详细步骤如下：
1. 创建一个不带网络连接的的伪客户端( fake client)，因为 Redis 的命令只能在客户端上下文中执行，而载入 AOF 文件时所使用的的命令直接来源于 AOF 文件而不是网络连接，所以服务器使用了一个没有网络连接的伪客户端来执行 AOF 文件保存的写命令，伪客户端执行命令的效果和带网络连接的客户端执行命令的效果完全一样的。
2. 从 AOF 文件中分析并取出一条写命令。
3. 使用伪客户端执行被读出的写命令。
4. 一直执行步骤 2 和步骤3，直到 AOF 文件中的所有写命令都被处理完毕为止。
5. 当完成以上步骤之后，AOF 文件所保存的数据库状态就会被完整还原出来。

## 3.8  AOF "重写"
AOF采用文件追加方式，随着Redis长时间运行会出现 AOF 文件体积膨胀的问题。Redis 提供了 AOF 文件重写( rewrite) 策略来解决这一问题。
![在这里插入图片描述](https://img-blog.csdnimg.cn/3c596ca8d8354375ac666cede8337976.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
如上图所示，重写前要记录名为 list 的键的状态，AOF 文件要保存五条命令，而重写后，则只需要保存一条命令。

AOF 文件重写并不需要对现有的 AOF 文件进行任何读取、分析或者写入操作，而是通过读取服务器当前的数据库状态来实现的。首先从数据库中读取键现在的值，然后用一条命令去记录键值对，代替之前记录这个键值对的多条命令，这就是 AOF 重写功能的实现原理。


**触发：**
rewrite的触发机制主要有：
- 手动调用` bgrewriteaof `命令，如果当前有正在运行的 rewrite 子进程，则本次rewrite 会推迟执行，否则，直接触发一次 rewrite
- 自动触发 就是根据配置规则来触发
```shell
# 重写机制：避免文件越来越大，自动优化压缩指令，会fork一个新的进程去完成重写动作，新进程里的内存数据会被重写，此时旧的aof文件不会被读取使用，类似rdb

# 当前AOF文件的大小是上次AOF大小的100% 并且文件体积达到64m，满足两者则触发重写
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```


## 3.9 AOF重写原理
AOF 重写函数会进行大量的写入操作，调用该函数的线程将被长时间阻塞，所以 Redis 在子进程中执行AOF 重写操作。
![在这里插入图片描述](https://img-blog.csdnimg.cn/96a94cdaed1a4a908567488e67f62fd6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
在整个 AOF 后台重写过程中，只有信号处理函数执行时会对 Redis 主进程造成阻塞，在其他时候，AOF后台重写都不会阻塞主进程。
![在这里插入图片描述](https://img-blog.csdnimg.cn/0b111f39a9d54daa84880d8f2ba5b765.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 4.  持久化优先级
如果一台服务器上有既有RDB文件，又有AOF文件，该加载谁呢？
![在这里插入图片描述](https://img-blog.csdnimg.cn/d62d26c7eb87495c8ed7a75138dbfc92.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 5. 性能与实践
通过上面的分析，我们都知道RDB的快照、AOF的重写都需要fork，这是一个重量级操作，会对Redis造成阻塞。因此为了不影响Redis主进程响应，我们需要尽可能降低阻塞。
1. 降低fork的频率，比如可以手动来触发RDB生成快照、与AOF重写；
2. 控制Redis最大使用内存，防止fork耗时过长；
3. 使用更牛逼的硬件；
4. 合理配置Linux的内存分配策略，避免因为物理内存不足导致fork失败