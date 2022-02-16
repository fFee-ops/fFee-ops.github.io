---
title: Redis 安装、启动、关闭、配置详解
date: 2020-07-18 22:03:41
tags: 
categories: Redis
---

<!--more-->

### 文章目录

- [Redis安装](#Redis_1)
- [redis启动](#redis_51)
- - [简单启动](#_52)
  - [高级启动](#_88)
- [Redis配置详解](#Redis_102)
- - [自定义配置Redis](#Redis_146)
- [Redis中的内存维护策略](#Redis_166)
- [Redis关闭](#Redis_183)

# Redis安装

Redis是C语言开发，安装Redis需要先将官网下载的源码进行编译，编译依赖gcc环境，如果没有gcc环境，需要安装gcc

**安装gcc**

```shell
gcc的安装很简单，首先要确保root登录，其次就是Linux要能连外网
yum -y install gcc automake autoconf libtool make
```

**注意：运行yum时出现/var/run/yum.pid已被锁定,PID为xxxx的另一个程序正在运行的问题的解决办法：**

```shell
rm -f /var/run/yum.pid
```

---

**安装Redis**  
1、下载redis二进制安装包

```shell
 http://download.redis.io/releases/redis-5.0.0.tar.gz
 
 或者直接去官网下载
```

2、从WIN将压缩包传到LINUX

3、解压缩  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200718215728352.png)

4、编译

```shell
进入到redis目录中执行命令：
make MALLOC=libc
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200718215959597.png)

**注意：如果安装出现如下图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200718220139211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
则**进入redis下的deps**下的运行如下命令，再重新运行 编译命令即可

```shell
make lua hiredis linenoise
```

5、安装

```shell
（安装编译后的文件） 安装到指定目录：
make PREFIX=/usr/local/redis install
```

**注意：PREFIX必须大写、同时会自动为我们创建redis目录，并将结果安装此目录**

# redis启动

## 简单启动

**启动服务端：**

```shell
进入对应的安装目录
cd /usr/local/redis

执行命令：
cd /usr/local/redis
./bin/redis-server
```

---

**启动Redis客户端：**

```shell
进入Redis客服端（Clone Session克隆一个窗口来模拟） 进入对应的安装目录
cd /usr/local/redis
执行命令：
./bin/redis-cli
```

**启动Redis 客户端命令完整语法：**

```shell
redis-cli –h IP地址 –p 端口 //默认IP本机 端口6379
```

---

**检测是否服务端启动:**  
启动 redis 客户端，打开终端并输入命令 redis-cli。该命令会连接本地的 redis 服务。

```shell
$redis-cli
redis 127.0.0.1:6379>
redis 127.0.0.1:6379> PING
PONG
```

在以上例子中通过连接到本地的redis 服务并执行 PING 命令，该命令用于检测 redis 服务是否启动

## 高级启动

**服务端启动：**

```shell
./bin/redis-server ./redis.conf
```

**客户端登录： 用redis-cli 密码登陆（redis-cli \-a password）**

```shell
redis-cli -h host -p port -a password
 //redis-cli –h IP地址 –p 端口 –a 密码
```

# Redis配置详解

Redis 的配置文件位于 Redis 安装目录下，文件名为 redis.conf

1、解压目录下的redis.conf 配置文件复制 到安装文件的目录下

```shell
cp /apps/redis-5.0.0/redis.conf		 /usr/local/redis/
```

2、解析部分重要配置项,还有一些不太经常用到的就没贴出来。

```
1. Redis默认不是以守护进程的方式运行，可以通过该配置项修改，使用yes启用守护进程
	daemonize no

2. 指定Redis监听端口，默认端口为6379，作者在自己的一篇博文中解释了为什么选用6379作为默认端口，因为6379在手机按键上MERZ对应的号码，而MERZ取自意大利歌女Alessia Merz的名字
	port 6379

3. 绑定的主机地址
	bind 127.0.0.1

4. 设置数据库的数量，默认数据库为0，可以使用SELECT <dbid>命令在连接上指定数据库id
	databases 16

5. 指定在多长时间内，有多少次更新操作，就将数据同步到数据文件，可以多个条件配合
save <seconds> <changes>
Redis默认配置文件中提供了三个条件：
	save 900 1
	save 300 10
	save 60 10000
分别表示900秒（15分钟）内有1个更改，300秒（5分钟）内有10个更改以及60秒内有10000个更改。

6. 指定存储至本地数据库时是否压缩数据，默认为yes，Redis采用LZF(压缩算法）压缩，如果为了节省CPU时间，可以关闭该选项，但会导致数据库文件变的巨大
	rdbcompression yes

7. 指定本地数据库文件名，默认值为dump.rdb
	dbfilename dump.rdb

8. 指定本地数据库存放目录
	dir ./

9. 设置Redis连接密码，如果配置了连接密码，客户端在连接Redis时需要通过AUTH <password>命令提供密码，默认关闭
	requirepass foobared

```

## 自定义配置Redis

进入对应的安装目录 /usr/local/redis 修改 redis.conf 配置文件 vim redis.conf \(进入命令模式 通过/内容 查找相应字符串）

```shell
daemonize no 修改为 daemonize yes 守护进程启动

bind 127.0.01 注释掉 允许除本机外的机器访问Redis服务

requirepass 设置密码 设定数据库密码 
(保证服务安全/有些情况下不设定密码是无法进行远程连接访问的)
```

Redis采用的是单进程多线程的模式。当redis.conf中选项daemonize设置成yes时，代表开启守护进程模式。  
在该模式下，**redis会在后台运行**，并将进程pid号写入至redis.conf选项pidfile设置的文件中，此时**redis将一直运行，除非手动kill该进程**。但当daemonize选项设置成no时，当前界面将进入redis的命令行界面，exit强制退出或者关闭连接工具\(putty,xshell等\)都会导致redis进程退出。 服务端开发的大部分应用都是采用后台运行的模式

# Redis中的内存维护策略

redis作为优秀的中间缓存件，时常会存储大量的数据，即使采取了集群部署来动态扩容，也应该即时的**整理内存，维持系统性能**。

**方法一：为数据设置超时时间**

```shell
expire key time(以秒为单位)--这是最常用的方式
setex(String key, int seconds, String value)--字符串独有的方式
```

- 除了字符串自己独有设置过期时间的方法外，其他方法都需要依靠expire方法来设置时间
- 如果没有设置时间，那缓存就是永不过期
- 如果设置了过期时间，之后又想让缓存永不过期，使用persist key

**方法二： 采用LRU算法动态将不用的数据删除**  
内存管理的一种页面置换算法，对于在内存中但又不用的数据块（内存块）叫做LRU，操作系统会根据哪些数据属于LRU而将其移出内存而腾出空间来加载另外的数据。

![z](https://img-blog.csdnimg.cn/20200719123632668.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# Redis关闭

**第一种关闭方式：**  
（断电、非正常关闭。容易数据丢失） 查询redis进程id

```shell
ps -ef | grep -i redis

kill对 查询的id进行强制关闭服务端
kill -9 PID
```

**第二种关闭方式**  
（正常关闭、数据保存）关闭redis服务，通过客户端进行shutdown