---
title: Redis持久化
date: 2020-09-06 21:47:51
tags: 
categories: Redis
---

<!--more-->

### Redis持久化

- [什么是Redis持久化](#Redis_2)
- [RDB](#RDB_11)
- [AOF](#AOF_33)

# 什么是Redis持久化

持久化就是把内存的数据写到磁盘中去，防止服务宕机了内存数据丢失。 Redis 提供了两种持久化方式:**RDB（默认）**和**AOF**  
RDB一定时间取存储文件，AOF默认每秒去存储历史命令  
  

数据存放于：  
**内存**：高效、断电（关机）内存数据会丢失  
**硬盘**：读写速度慢于内存，断电数据不会丢失

# RDB

rdb是Redis DataBase缩写 功能核心函数rdbSave\(生成RDB文件\)和rdbLoad（从文件加载内存）两个函数  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906212755673.png#pic_center)  
RDB：是redis的默认持久化机制。 快照是默认的持久化方式。这种方式是就是将内存中数据以快照的方式写入到二进制文件中,默认的文件名为 dump.rdb。

**优点**： 快照保存数据极快、还原数据极快 适用于灾难备份

**缺点**：小内存机器不适合使用,RDB机制符合要求就会照快照

**快照条件：**

```
1、服务器正常关闭时 ./bin/redis-cli shutdown
2、key满足一定条件，会进行快照
vim redis.conf搜索save
:/save
save 900 1 //每900秒（15分钟）至少1个key发生变化，产生快照
save 300 10 //每300秒（5分钟）至少10个key发生变化，产生快照
save 60 10000 //每60秒（1分钟）至少10000个key发生变化，产生快照
```

# AOF

快照方式是在一定间隔时间做一次的，所以redis意外down 掉的话，就会丢失最后一次快照后的所有修改。如果应用要求不能丢失任何修改的话，可以采用aof持久化方式。

  

**Append-only file**:aof 比快照方式有更好的持久化性，是由于在使用aof持久化方式时,redis会将每一个收到的写命令都通过write 函数追加到文件中\(默认是appendonly.aof\)。

当redis重启时会通过重新执行文件中保存的写命令来在内存中重建整个数据库的内容。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906214048626.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**①每当执行服务器\(定时\)任务或者函数时,flushAppendOnlyFile函数都会被调用，这个函数将执行 aof写入、保存这两个工作：**

**WRITE：** 根据条件，将aof\_buf中的缓存写入到 AOF 文件  
**SAVE：** 根据条件，调用fsync或fdatasync函数，将AOF 文件保存到磁盘中。

**②有三种方式如下（默认是：每秒fsync一次）**

• appendfsync always ：收到写命令就立即写入磁盘，最慢，但是保证完全的持久化

• appendfsynceverysec ：每秒钟写入磁盘一次，在性能和持久化方面做了很好的折中

• appendfsync no ：完全依赖os，性能最好,持久化没保证

**③产生的问题：** aof的方式也同时带来了另一个问题。持久化文件会变的越来越大。例如我们调用incr test命令 100次，文件中必须保存全部的 100 条命令，其实有 99 条都是多余的。