---
title: Nginx、ES、Docker、Shiro、RabbitMQ
date: 2022-01-21 20:00:47
tags:
categories: 私密文章
password: f0c3a40bc7adb2998a8ee70350e5d74ce7fa33f303f2b60f5e9ed13998af2d3d
---

@[toc](Nginx、ES、Docker、Shiro、RabbitMQ)

#  Nginx👇👇👇

## 1、什么是Nginx?
Nginx 是一个 轻量级/高性能的反向代理Web服务器，他实现非常高效的反向代理、负载均衡

## 2、为什么Nginx性能这么高？
因为他的事件处理机制：异步非阻塞事件处理机制：运用了epoll模型，提供了一个队列，排队解决

##  3、Nginx怎么处理请求的？
nginx接收一个请求后，首先由listen和server_name指令匹配server模块，再匹配server模块里的location，location里面有个`proxy_pass`就是真实的服务器地址
![在这里插入图片描述](https://img-blog.csdnimg.cn/1e57ada9595a4a5087d3cc96649a7ec2.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)


##  4、Nginx的优缺点？
**优点：**
1. 占内存小，可实现高并发连接，处理响应快
2. 可实现http服务器、虚拟主机、方向代理、负载均衡
3. Nginx配置简单
4. 可以不暴露真实的服务器IP地址

**缺点：**
动态处理差：nginx处理静态文件好,耗费内存少，但是处理动态页面则很鸡肋，现在一般前端用nginx作为反向代理抗住压力


##  5、如何用Nginx解决前端跨域问题？
使用Nginx转发请求。把跨域的接口写成调本域的接口，然后将这些接口转发到真正的请求地址。	

##  6、Nginx限流怎么做的？
Nginx的限流都是基于**漏桶流算法**

Nginx限流就是限制用户请求速度，防止服务器受不了
**限流有3种：**
正常限制访问频率（正常流量）
突发限制访问频率（突发流量）
限制并发连接数

##  7、漏桶算法和令牌桶算法说说？
**漏桶算法：**
突发流量会进入到一个漏桶，漏桶会按照我们定义的速率依次处理请求，如果水流过大也就是突发流量过大就会直接溢出，则多余的请求会被拒绝。所以漏桶算法能控制数据的传输速率。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210404225943390.png)
**令牌桶算法：**
令牌桶算法的机制如下：存在一个大小固定的令牌桶，会以恒定的速率源源不断产生令牌。如果令牌消耗速率小于生产令牌的速度，令牌就会一直产生直至装满整个令牌桶。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210404230038579.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

##  8、为什么要做动静分离？
- 动静分离是让动态网站里的动态网页根据一定规则把不变的资源和经常变的资源区分开来，动静资源做好了拆分以后，我们则根据静态资源的特点将其做缓存操作。


- 让静态的资源只走静态资源服务器，动态的走动态的服务器


- Nginx的静态处理能力很强，但是动态处理能力不足，因此，在企业中常用动静分离技术。


- 对于静态资源比如图片，js，css等文件，我们则在反向代理服务器nginx中进行缓存。这样浏览器在请求一个静态资源时，代理服务器nginx就可以直接处理，无需将请求转发给后端服务器tomcat。
  若用户请求的动态文件，比如servlet,jsp则转发给Tomcat服务器处理，从而实现动静分离。这也是反向代理服务器的一个重要的作用。

##   9、Nginx怎么做的动静分离？
只需要指定路径对应的目录。location/可以使用正则表达式匹配。并指定对应的硬盘中的目录
例如
```java
        location /image/ {
            root   /usr/local/static/;
            autoindex on;
        }

```
>打开浏览器 输入 server_name/image/1.jpg 就可以访问该静态图片了


##  10、Nginx负载均衡的算法怎么实现的?策略有哪些?
Nginx负载均衡实现的策略主要有以下三种：

**1 轮询(默认)**

每个请求按时间顺序逐一分配到不同的后端服务器，如果后端某个服务器宕机，能自动剔除故障系统。
```
upstream backserver { 
 server 192.168.0.12; 
 server 192.168.0.13; 
} 
```

**2 权重 weight**


weight的值越大,分配到的访问概率越高，主要用于后端每台服务器性能不均衡的情况下。其次是为在主从的情况下设置不同的权值，达到合理有效的地利用主机资源。

```
upstream backserver { 
 server 192.168.0.12 weight=2; 
 server 192.168.0.13 weight=8; 
} 
```
权重越高，在被访问的概率越大，如上例，分别是20%，80%。

**3 ip_hash( IP绑定)**

每个请求按访问IP的哈希结果分配，使来自同一个IP的访客固定访问一台后端服务器，并且可以有效解决动态网页存在的session共享问题
```
upstream backserver { 
 ip_hash; 
 server 192.168.0.12:88; 
 server 192.168.0.13:80; 
} 
```

## 11、请解释 Nginx 服务器上的 Master 和 Worker 进程分别是什么?
- Master 进程：负责管理worker进程，并负责读取配置文件和判断文件语法的工作；是主进程，且只有一个
- Worker 进程：处理请求

#   ES👇👇👇

![在这里插入图片描述](https://img-blog.csdnimg.cn/77d5856438354ab793b38e2c0067fa3c.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 1、elasticsearch 的倒排索引是什么？
传统的我们的检索是通过文章，逐个遍历找到对应关键词的位置。

而倒排索引，是通过分词策略，形成了词和文章的映射关系表，这种词典+映射表即为倒排索引。
##  2、elasticsearch 索引数据多了怎么办，如何调优，部署？
**1 动态索引层面**

基于模板+时间+rollover api 滚动创建索引
**举例：**
设计阶段定义：blog 索引的模板格式为：blog_index_时间戳的形式，每天递增数据。
这样做的好处：不至于数据量激增导致单个索引数据量非常大。一旦单个索引很大，存储等各种风险也随之而来，所以要提前考虑+及早避免。



**2 存储层面**

冷热数据分离存储，热数据（比如最近 3 天或者一周的数据），其余为冷数据。

对于冷数据不会再写入新数据，可以考虑定期强制合并索引，节省存储空间和提高检索效率。



**3 部署层面**

一旦之前没有规划，这里就属于应急策略。结合 ES 自身的支持动态扩展的特点，动态新增机器的方式可以缓解集群压力，注意：如果之前主节点等规划合理，不需要重启集群也能完成动态新增的。

##  3、elasticsearch 是如何实现 master 选举的？
前置前提：

1、只有候选主节点（master：true）的节点才能成为主节点。

2、最小主节点数（min_master_nodes）的目的是防止脑裂。

---

1.Elasticsearch的选主是ZenDiscovery模块负责的，主要包含Ping（节点之间通过这个RPC来发现彼此）和Unicast（单播模块包含一个主机列表以控制哪些节点需要ping通）这两部分；

2.对所有可以成为master的节点（node.master: true）根据nodeId字典排序，每次选举每个节点都把自己所知道节点排一次序，然后选出第一个（第0位）节点，暂且认为它是master节点。

3.如果对某个节点的投票数达到一定的值（可以成为master节点数n/2+1）并且该节点自己也选举自己，那这个节点就是master。否则重新选举一直到满足上述条件。


##  4、Elasticsearch是如何避免脑裂现象的？
当集群中master候选的个数不小于3个（node.master: true）。可以通过`discovery.zen.minimum_master_nodes`这个参数的设置来避免脑裂，设置为(N/2)+1。

这里node.master : true 是说明你是有资格成为master，并不是指你就是master。是皇子，不是皇帝。假如有10个皇子，这里应该设置为（10/2）+1=6，这6个皇子合谋做决策，选出新的皇帝。另外的4个皇子，即使他们全聚一起也才四个人，不足合谋的最低人数限制，他们不能选出新皇帝。

假如discovery.zen.minimum_master_nodes 设置的个数为5，有恰好有10个master备选节点，会出现什么情况呢？5个皇子组成一波，选一个皇帝出来，另外5个皇子也够了人数限制，他们也能选出一个皇帝来。此时一个天下两个皇帝，在es中就是脑裂。

##  5、详细描述一下 Elasticsearch 索引文档的过程？
**这里的索引文档应该理解为文档写入 ES，创建索引的过程。**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210405225651972.png)
**第一步：** 客户向集群某节点写入数据，发送请求。（如果没有指定路由节点，请求的节点扮演路由节点的角色。）


**第二步：** 节点 1 接受到请求后，使用文档_id 来确定文档属于分片 0。请求会被转到另外的节点，假定分片0属于节点 3


**第三步：** 节点 3 在主分片上执行写操作，如果成功，则将请求并行转发到节点 1和节点 2 的副本分片上，等待结果返回。所有的副本分片都报告成功，节点 3 将向协调节点（节点 1）报告成功，节点 1 向请求客户端报告写入成功。

---
如果面试官再问：第二步中的文档获取分片的过程？

回答：借助路由算法获取，路由算法就是根据路由和文档 id 计算目标的分片 id 的过程。

##  6、详细描述一下 Elasticsearch 搜索的过程？
搜索拆解为“`query then fetch`” 两个阶段。

**query 阶段的目的：定位到位置，但不取。**

步骤拆解如下：

1、假设一个索引数据有 5 主+1 副本 共 10 分片，一次请求会命中（主或者副本分片中）的一个。



2、每个分片在本地进行查询，结果返回到本地有序的优先队列中。



3、第 （2）步骤的结果发送到协调节点，协调节点产生一个全局的排序列表。


**fetch 阶段的目的：取数据。**

路由节点获取所有文档，返回给客户端。


## 7、 解释一下 Elasticsearch 的 分片？

![在这里插入图片描述](https://img-blog.csdnimg.cn/3479267bb4b843cb9709d341d4850726.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

当文档数量增加，硬盘容量和处理能力不足时，对客户端请求的响应将延迟。

在这种情况下，将索引数据分成小块的过程称为分片，可改善数据搜索结果的获取。

##  8、定义副本、创建副本的好处是什么？
副本是 分片的对应副本，用在极端负载条件下提高查询吞吐量或实现高可用性。

所谓高可用主要指：如果某主分片1出了问题，对应的副本分片1会提升为主分片，保证集群的高可用。

##  9、倒排索引的数据结构
1. 倒排表：存储了包含某个词项的所有id集合
2. 词项字典：当前所有词项字段的集合

##  10、如何保证ES数据一致性？
ES 数据并发冲突控制是基于的乐观锁和版本号的机制

一个document第一次创建的时候，它的_version内部版本号就是1；以后，每次对这个document执行修改或者删除操作，都会对这个_version版本号自动加1；哪怕是删除，也会对这条数据的版本号加1(假删除)。

客户端对es数据做更新的时候，如果带上了版本号，那带的版本号与es中文档的版本号一致才能修改成功，否则抛出异常。如果客户端没有带上版本号，首先会读取最新版本号才做更新尝试，这个尝试类似于CAS操作，可能需要尝试很多次才能成功。乐观锁的好处是不需要互斥锁的参与。

es节点更新之后会向副本节点同步更新数据(同步写入)，直到所有副本都更新了才返回成功。

## 11、elasticsearch 为什么查询比mysql快？
其实要分两种情况：
1. 基于分词后的全文检索：
  >这种情况是es的强项，而对于mysql关系型数据库而言完全是灾难。因为es分词后，每个字都可以利用FST高速找到倒排索引的位置，并迅速获取文档id列表，但是对于mysql检索中间的词只能全表扫

2. 精确检索：
  >我认为这种情况二者速度差不多，如果mysql的非聚合索引用上了覆盖索引，无需回表，则速度可能更快
#  Shiro👇👇👇

##  1、Shiro的四个主要组件？
Authentication（认证）：用户身份识别，通常被称为用户“登录”

Authorization（授权）：访问控制。比如某个用户是否具有某个操作的使用权限。

Session Management（会话管理）：会话管理，即用户登录后就是一次会话，在没有退出之前，它的所有信息都在会话中；会话可以是普通 JavaSE 环境的，也可以是如 Web 环境的。

Cryptography（加密）：加密，保护数据的安全性，如密码加密存储到数据库，而不是明文存储。


##  2、讲讲Shiro的认证过程？
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210406225748142.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
①Subject：主体，代表了当前“用户”。
这个用户不一定是一个具体的人，与当前应用交互的任何东西都是 Subject，如网络爬虫，机器人等。所有 Subject 都绑定到 SecurityManager，与 Subject 的所有交互都会委托给 SecurityManager。我们可以把 Subject 认为是一个门面，SecurityManager 才是实际的执行者。

②SecurityManager：安全管理器。
即所有与安全有关的操作都会与 SecurityManager 交互，且它管理着所有 Subject。可以看出它是 Shiro 的核心，它负责与后边介绍的其他组件进行交互，如果学习过 SpringMVC，我们可以把它看成 DispatcherServlet 前端控制器。

③Realm：域。
Shiro 从 Realm 获取安全数据（如用户、角色、权限），就是说 SecurityManager 要验证用户身份，那么它需要从 Realm 获取相应的用户进行比较以确定用户身份是否合法，也需要从 Realm 得到用户相应的角色/权限进行验证用户是否能进行操作。我们可以把 Realm 看成 DataSource，即安全数据源。

##  3、Shiro靠什么做认证与授权的？
Shiro可以利用HttpSession或者Redis存储用户的登陆凭证，以及角色或者身份信息。然后利用过滤器（Filter），对每个Http请求过滤，检查请求对应的HttpSession或者Redis中的认证与授权信息。如果用户没有登陆，或者权限不够，那么Shiro会向客户端返回错误信息。



#  RabbitMQ👇👇👇
##	1、为什么使用MQ？MQ的优点？
主要就三点：解耦、异步、削峰。 


## 	2、如何解决消息的顺序问题 ？
消息有序指的是可以按照消息的发送顺序来消费。 
假如生产者产生了 2 条消息：M1、M2，假定 M1 发送到 S1，M2 发送到  S2，如果要保证 M1 先于 M2 被消费，怎么做？
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210702171519551.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)


**解决方案：** 
1. 保证生产者 - MQServer - 消费者是一对一对一的关系
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210702171724712.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>但是太容易出现故障了，而且并发度不高

2. 拆分多个 queue，每个 queue 对应一个 consumer，就是多一些 queue 而已；
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210702172910447.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
3. 一个queue对应一个consumer，然后这个consumer内部用内存队列做排队，然后分发给底层不同的worker来处理
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210702174133552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)


## 	3、如何解决消息的重复问题 ？
**造成消息重复的根本原因是：网络不可达。**

所以我们只需要建立一张日志表，每条消息给定一个唯一的id，当它被消费成功后就记录在日志表中，下次来消费先查一下表，如果表中有记录那就代表已经被消费过了。


##	4、消息是基于什么传输？
由于 TCP 连接的创建和销毁开销较大，且并发数受系统资源限制，会造成性能瓶颈。RabbitMQ 使用**信道**的方式来传输数据。信道是**建立在真实的 TCP 连接内的虚拟连接**，且每条 TCP 连接上的信道数量没有限制。

##	5、如何确保消息正确地发送至 RabbitMQ？
1. 发送方确认模式将信道设置成 `confirm `模式（发送方确认模式），则所有在信道上发布的消息都会被指派一个唯一的 ID。

2. 一旦消息被投递到目的队列后，或者消息被写入磁盘后（可持久化的消息），信道会发送一个确认给生产者（包含消息唯一 ID）。

3. 如果 RabbitMQ 发生内部错误从而导致消息丢失，会发送一条 nack（notacknowledged，未确认）消息。


##  6、如何确保消息接收方消费了消息？
采用手动确认模式，也就是当消费者成功收到消息后会发送一条确认信号，这样消息队列才可以删除消息

##	7、有几百万消息持续积压几小时，说说怎么解决？
**消息积压处理办法：临时紧急扩容：**


1. 先修复 consumer 的问题，确保其恢复消费速度，然后将现有 cnosumer 都停掉。并且临时建立好原先 10 倍的 queue 数量。

2. 然后写临时程序用来消费积压的数据，消费之后直接均匀轮询写入临时建立好的 10 倍数量的 queue。

3. 接着临时征用 10 倍的机器来部署 consumer然后去消费一临时 queue 的数据。这种做法相当于是以正常的 10 倍速度来消费数据。

4. 等快速消费完积压数据之后，得恢复原先部署的架构，重新用原先的 consumer 机器来消费消息。


## 	8、MQ中消息失效怎么办？

RabbitMQ 是可以设置过期时间的，也就是 TTL。如果消息在 queue 中积压超过一定的时间就会被 RabbitMQ 给清理掉，这个数据就没了。就只能**批量重导**，也就是等用户不活跃的时候重新写程序将丢失的数据查出来再灌入到mq中去