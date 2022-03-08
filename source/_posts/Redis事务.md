---
title: Redis事务
date: 2020-09-06 09:49:11
tags: 
categories: Redis
---

#  1. 简介

Redis 事务的本质是一组命令的集合
- Redis的事务是通过multi、exec、discard和watch这四个命令来完成的。
- Redis的单个命令都是原子性的，所以这里需要确保事务性的对象是命令集合。
- Redis将命令集合序列化并确保处于同一事务的命令集合连续且不被打断的执行
- Redis不能保障失败回滚


redis的事务远远弱于mysql，严格意义上，它不能叫做事务，只是一个命令打包的批处理，不能保障失败回滚。

**常用命令**
```sql
DISCARD
:取消事务，放弃执行事务块内的所有命令。
EXEC
:执行所有事务块内的命令。
MULTI
:标记一个事务块的开始。
UNWATCH
:取消 WATCH 命令对所有 key 的监视。
WATCH key [key ...]
:监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令所改动，那么事务将被打断。
```

---
一个事务从开始到结束会经历以下3个阶段（开始事务。命令入队。执行事务。），以下为示例：

## 示例
**示例1、 MULTI EXEC**
转帐功能，A向B帐号转帐50元 一个事务的例子，它先以 MULTI 开始一个事务，然后将多个命令入队到事务中，最后由 EXEC 命令触发事务。
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020090609420649.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)
**①输入Multi命令开始，输入的命令都会依次进入命令队列中，但不会执行 
②直到输入Exec后，Redis会将之前的命令队列中的命令依次执行**



---
**示例2 、DISCARD放弃队列运行**

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020090609441462.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**③命令队列的过程中可以通过discard来放弃队列运行**

---
**示例3、事务的错误处理**
事务的错误处理：
① 如果<font color=red>执行的某个命令</font>报出了错误，则只有报错的命令不会被执行，而其它的命令都会执行，不会回滚。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906094614475.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)


**②<font color=red>队列中的某个命令</font>出现了报告错误，执行时整个的所有队列都会被取消。**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906094736113.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---
**示例5、事务的WATCH**
```sql
WATCH key [key ...]
:监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令
所改动，那么事务将被打断。
```


需求：某一帐户在一事务内进行操作，在提交事务前，另一个进程对该帐户进行操作。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200906094852122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)


# 2. 原理分析
- 调用multi指令后，redis其实是开启了一个命令队列，后续的命令被提交到队列（还没有执行）
- 期间出现问题了（比如down机），终止操作，队列清空
- 到exec命令后，批量提交，事务完成

# 3. 关于回滚
注意！回滚要看两种情况：
- 直接语法错误，redis完全无法执行，Redis 2.6.5之前的版本不会回滚，之后版本整个事务回滚
- 执行期的错误，redis不会回滚，其他正确的指令会照样执行

## 验证：错误的命令，导致回滚（版本：6.0）
```shell
#旧value是a
127.0.0.1:9010> set a a
OK
127.0.0.1:9010> get a
"a"
#开启事务
127.0.0.1:9010> multi
OK
#设置成b，语法没问题，进入队列
127.0.0.1:9010> set a b
QUEUED
#语法错误！
127.0.0.1:9010> set a
(error) ERR wrong number of arguments for 'set' command
#提交事务：失败，操作被回滚
127.0.0.1:9010> exec
(error) EXECABORT Transaction discarded because of previous errors.
#最终结果：a没有被修改
127.0.0.1:9010> get a
"a"
```

## 验证：命令语法对，但是数据类型不对，执行期间才会被发现！
```shell
#旧值a
127.0.0.1:9010> get a
"a"
#开启事务
127.0.0.1:9010> multi
OK
#正确的语法，没毛病！
127.0.0.1:9010> set a b
QUEUED
#语法也对，但是类型肯定是不对的，这不是一个list！
#会进入队列，执行期才会发现这个问题
127.0.0.1:9010> lpush a 1
QUEUED
#提交事务！
#发现正确的1号命令执行ok，2号错误
127.0.0.1:9010> exec
1) OK
2) (error) WRONGTYPE Operation against a key holding the wrong kind of value
#最终结果，a被修改，事务没有回滚！
127.0.0.1:9010> get a
"b"
```

# 4. watch
Redis Watch 命令用于监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令所改动，那么事务将被打断。
主要应用于高并发的正常业务场景下，处理并发协调。

## 使用语法
```shell
watch key
...
multi
...do somethings...
exec
```

## 例子
**key无变动时**
```shell
#初始化，a=a , b=1
127.0.0.1:9010> set balance 80
OK
127.0.0.1:9010> set name zimu
OK
#监控a的变动
127.0.0.1:9010> watch balance
OK
#开启事务，内部对b进行操作
127.0.0.1:9010> multi
OK
127.0.0.1:9010> set name zimulaoshi
QUEUED
127.0.0.1:9010> exec
1) OK
#提交事务后，b正常被改写
127.0.0.1:9010> get name
"zimulaoshi"
```


**如果watch的key发生了变化**
```shell
#开启两个终端 T1， T2
#T1执行过程与上面一致

#以下是T1的操作过程：
#初始化，a=a , b=1
127.0.0.1:9010> set balance 80
OK
127.0.0.1:9010> set name zimu
OK
#监控a的变动
127.0.0.1:9010> watch balance
OK
#开启事务，内部对b进行操作
127.0.0.1:9010> multi
OK
127.0.0.1:9010> set name zimu
QUEUED
# !!!这一步注意切换到T2：
#在T1的watch和exec之间执行一个 set a 123，a的值被别的终端修改了！！！


#再切回T1，注意！exec得不到ok，得到了一个nil，说明队列被清空了！
127.0.0.1:9010> exec
(nil)
#来查看b的值，没有被改为2，事务回滚了！
127.0.0.1:9010> get b
"1"
```
## 原理剖析
在exec执行事务的一瞬间，判断监控的key是否变动
变动则取消事务队列，直接不执行
无变动则执行，提交事务，参考流程图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/a15796d179a444e8ab0a29c41d28e3eb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_19,color_FFFFFF,t_70,g_se,x_16)

# 5. 应用场景
秒杀