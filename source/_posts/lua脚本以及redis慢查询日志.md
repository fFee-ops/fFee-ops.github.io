---
title: lua脚本以及redis慢查询日志
date: 2022-02-20 15:27:03
tags:
password:
categories: Redis
---

# lua脚本
lua是一种轻量小巧的脚本语言，用标准C语言编写并以源代码形式开放， 其设计目的是为了嵌入应用程序中，从而为应用程序提供灵活的扩展和定制功能。
Lua应用场景：
1. 游戏开发
2. 独立应用脚本
3. Web应用脚本
4. 扩展和数据库插件
5. Nginx + lua开发高性能web应用，限流、防止Sql注入..


## Redis使用lua脚本
版本：自2.6.0起可用，通过**内置的lua编译/解释器**，可以使用EVAL命令对lua脚本进行求值。
时间复杂度：取决于执行的脚本。

使用Lua脚本的好处：
- 减少网络开销。可以将多个请求通过脚本的形式一次发送，减少网络时延。
- 原子操作。redis会将整个脚本作为一个整体执行，中间不会被其他命令插入。因此在编写脚本的过程中无需担心会出现竞态条件，无需使用事务。
- 复用。客户端发送的脚本会永久存在redis中，这样，其他客户端可以复用这一脚本而不需要使用代码完成相同的逻辑。

## 如何使用 EVAL命令
命令格式：
```shell
EVAL script numkeys key [key ...] arg [arg ...]
```
命令说明：
- script ：是一段 Lua 5.1 脚本程序。
- numkeys ： key的个数。
- key [key ...] ，是要操作的键，可以指定多个，在lua脚本中通过 KEYS[1] , KEYS[2] 获取
- arg [arg ...] ，附加参数，在lua脚本中通过 ARGV[1] , ARGV[2] 获取。

示例
```lua
eval "return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}" 2 key1 key2 first second
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/75ed4e248c6a4ae58e69f9fcd2a06fdb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## lua脚本中调用Redis命令
**redis.call()：**
- 返回值就是redis命令执行的返回值
- 如果出错，则返回错误信息，不继续执行

**redis.pcall()：**
- 返回值就是redis命令执行的返回值
- 如果出错，则记录错误信息，继续执行

注意：在脚本中，使用return语句将返回值返回给客户端，如果没有return，则返回nil。

例如：
```shell
eval "return redis.call('set',KEYS[1],ARGV[1])" 1 n1 zhaoyun
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/1c32b20a4f8c4e1ca0852aed106a934e.png)

## 命令行里使用
如果直接使用 redis-cli 命令，格式会有点不一样：
```shell
redis-cli --eval lua_file key1 key2 , arg1 arg2 arg3
```
- eval 后面参数是lua脚本文件, .lua 后缀
- 不用写 numkeys ，而是使用 , 隔开。注意 , 前后有空格。

例如：
在redis根目录下有一个`incrbymul.lua`脚本。
```lua
local num = redis.call('GET', KEYS[1]);
if not num then
   return 0;
else
   local res = num * ARGV[1];
   redis.call('SET',KEYS[1], res);
   return res;
end
```

然后通过命令行运行：
```shell
$ redis-cli --eval incrbymul.lua lua:incrbymul , 8
(integer) 0
$ redis-cli incr lua:incrbymul
(integer) 1
$ redis-cli --eval incrbymul.lua lua:incrbymul , 8
(integer) 8
$ redis-cli --eval incrbymul.lua lua:incrbymul , 8
(integer) 64
$ redis-cli --eval incrbymul.lua lua:incrbymul , 2
(integer) 128
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/10198e9d697d44248205dd2f4bf6e88a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
redis没有提供命令可以实现将一个数原子性的乘以N倍，这里我们就用Lua脚本实现了，运行过程中确保不会被其它客户端打断。



# 慢查询日志
## 概述
**慢查询日志有什么用？**
> 慢查询日志是为了记录执行时间超过给定时长的redis命令请求

**日常在使用redis的时候为什么要用慢查询日志？**
> 让使用者更好地监视和找出在业务中一些慢redis操作，找到更好的优化方法


客户端请求的生命周期的完整生命周期，4个阶段
![在这里插入图片描述](https://img-blog.csdnimg.cn/fe6f0621b8784c5794356be66f6cb31f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
慢查询只统计步骤3的时间,所以没有慢查询并不代表客户端没有超时问题。换句话说。redis的慢查询记录时间指的是不包括像客户端响应、发送回复等IO操作，而单单是执行一个查询命令所耗费的时间。


## 设置和查看SLOWLOG
**慢查询配置相关的参数**
- `slowlog-log-slower-than` ：**选项指定执行时间超过多少微秒**（默认1秒=1,000,000微秒）的命令请求会被记录到日志上。
  例：如果这个选项的值为100，那么执行时间超过100微秒的命令就会被记录到慢查询日志； 如果这个选项的值为500 ， 那么执行时间超过500微秒的命令就会被记录到慢查询日志；

- `slowlog-max-len` ：选项指定服务器**最多保存多少条慢查询日志**。服务器使用先进先出的方式保存多条慢查询日志： 当服务器储存的慢查询日志数量等于slowlog-max-len选项的值时，服务器在添加一条新的慢查询日志之前，会先将最旧的一条慢查询日志删除。
  例：如果服务器slowlog-max-len的值为100，并且假设服务器已经储存了100条慢查询日志， 那么如果服务器打算添加一条新日志的话，它就必须先删除目前保存的最旧的那条日志， 然后再添加新日志。



**在Redis中有两种修改配置的方法,一种是修改配置文件,另一种是使用config set命令动态修改；**

**1、慢查询配置相关的命令**
```shell
config set slowlog-log-slower-than 20000
config set slowlog-max-len 1024
slowlog get # 查看慢查询日志
```


**2、慢查询日志的访问和管理**
```shell
slowlog get [n] # 获取[n条]慢查询队列
slowlog len # 获取慢查询队列的当前长度
slowlog reset # 清空慢查询队列
```

**3、慢查询日志的使用案例**
1. 设置慢查询时长: `config set slowlog-log-slower-than 0` # 0表示将所有命令都记录为慢查询
2. 设置最多保存多少条慢查询日志: `config set slowlog-max-len 3`
3. 获得慢查询日志: `slowlog get`
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/6ee36244efbf4057a01eba80491b8102.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)


**4、慢查询日志的组成**
慢查询日志由以下四个属性组成：
- 标识ID
- 发生时间戳，
- 命令耗时，
- 执行命令和参数


在生产环境中，慢查询功能可以有效地帮助我们找到Redis可能存在的瓶颈，但在实际使用过程中要注意以下几点:
1. `slowlog-max-len`：线上建议调大慢查询列表，记录慢查询时Redis会对长命令做阶段操作,并不会占用大量内存.增大慢查询列表可以减缓慢查询被剔除的可能，例如线上可设置为1000以上.
2. `slowlog-log-slower-than`：默认值超过10毫秒判定为慢查询,需要根据Redis并发量调整该值.
3. 慢查询只记录命令的执行时间,并不包括命令排队和网络传输时间.因此客户端执行命令的时间会大于命令的实际执行时间.因为命令执行排队机制,慢查询会导致其他命令级联阻塞,因此客户端出现请求超时时,需要检查该时间点是否有对应的慢查询,从而分析是否为慢查询导致的命令级联阻塞.
4. 由于慢查询日志是一个先进先出的队列,也就是说如果慢查询比较多的情况下,可能会丢失部分慢查询命令,为了防止这种情况发生,可以定期执行slowlog get命令将慢查询日志持久化到其他存储中(例如:MySQL等)，然后可以通过可视化工具进行查询.