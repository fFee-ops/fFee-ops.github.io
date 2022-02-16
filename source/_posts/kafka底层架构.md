---
title: kafka底层架构
date: 2022-02-12 22:51:11
tags:
password:
categories: kafka
---

# 1. 存储架构
##	1.1 分段存储
kafka每个主题可以有多个分区，每个分区在它所在的broker上创建一个文件夹。
每个分区又分为多个段，每个段有两个文件，log文件里顺序存消息，index文件里存消息的索引。
段的命名直接以当前段的第一条消息的**offset**为名。
>**注意是偏移量，不是序号！ 第几条消息 = 偏移量 + 1。类似数组长度和下标。**


所以offset从0开始（可以开新队列新groupid消费第一条消息打印offset得到验证）
![在这里插入图片描述](https://img-blog.csdnimg.cn/fb4c25d1af3e4410844011a218f8216d.png)
例如：
![在这里插入图片描述](https://img-blog.csdnimg.cn/a4b59a6810cd459289ab3e1241b2200b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_19,color_FFFFFF,t_70,g_se,x_16)
## 1.2 日志索引
每个log文件配备一个索引文件 `*.index`
文件格式为： （offset , 内存偏移地址）

![在这里插入图片描述](https://img-blog.csdnimg.cn/4dd680b313024278be34db1c7576fb91.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
综合上述，来看一个消息的查找：
1. consumer发起请求要求从offset=6的消息开始消费
2. kafka直接根据文件名大小，发现6号消息在00000.log这个文件里
  > 文件名是offset命名格式，所以可以判断。
3. 那文件找到了，它在文件的哪个位置呢？
4. 根据index文件，发现` 6,9807`，说明消息藏在这里！
5. 从log文件的 9807 位置开始读取。
6. 那读多长呢？简单，读到下一条消息的偏移量停止就可以了

## 1.3 日志删除
Kafka作为消息中间件，数据需要按照一定的规则删除，否则数据量太大会把集群存储空间占满。

删除数据方式：
- 按照时间，超过一段时间后删除过期消息
- 按照消息大小，消息数量超过一定大小后删除最旧的数据

Kafka删除数据的最小单位：`segment（段）`，也就是直接干掉文件！一删就是一个log和index文件

## 1.4 存储验证
1、通过km新建一个test主题，加2个分区新建时，注意下面的选项：
- `segment.bytes = 1000` ，即：每个log文件到达1000byte时，开始创建新文件

删除策略：
- `retention.bytes = 2000`，即：超出2000byte的旧日志被删除
- `retention.ms = 60000`，即：超出1分钟后的旧日志被删除

以上任意一条满足，就会删除。

2、服务器上找到kafka存放两个分区文件的地方
![在这里插入图片描述](https://img-blog.csdnimg.cn/39bec329a660444696a092f8f5720729.png)

3、查看2个分区的日志文件清单，注意当前还没有任何消息写进来
![在这里插入图片描述](https://img-blog.csdnimg.cn/d4170aa53a1f4852bd95bbbfe7bdb1b2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
4、往里灌数据。启动项目通过swagger发送消息。注意边发送边查看上一步的文件列表信息！
![在这里插入图片描述](https://img-blog.csdnimg.cn/eed68b88466a432eaf6242a0af0cb502.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/457d993bea834e42bbf128132058756d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
继续逐条发送，返回再来看文件，大小为1000，到达边界！
![在这里插入图片描述](https://img-blog.csdnimg.cn/406d56cfaf454e0d9c8fed1fc9780e44.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
继续发送消息！1号分区的log文件开始分裂。说明第8条消息已经进入了第二个log
![在这里插入图片描述](https://img-blog.csdnimg.cn/6bca3642399a45f1bfde0cf61366fe13.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**持续发送，另一个分区也开始分离**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20b42a108b1e41b9a1850dcdf44201e5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
5、持续发送消息，分区越来越多。过一段时间后再来查看，清理任务将会执行，超出的日志被删除！（默认调度间隔5min）。通过`log.retention.check.interval.ms` 参数指定
![在这里插入图片描述](https://img-blog.csdnimg.cn/b4eb6f69d0424c55b66c441909a280a7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
# 2. 零拷贝
Kafka 在执行消息的写入和读取这么快，其中的一个原因是零拷贝（Zero-copy）技术。

关于零拷贝的内容请看我的[这篇博客](https://blog.csdn.net/qq_21040559/article/details/118120913?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522164467638016780366555234%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fblog.%2522%257D&request_id=164467638016780366555234&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~blog~first_rank_ecpm_v1~rank_v31_ecpm-1-118120913.nonecase&utm_term=%E9%9B%B6%E6%8B%B7%E8%B4%9D&spm=1018.2226.3001.4450)。

# 3. 分区一致性
## 3.1 水位值
**1）先回顾两个值：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/9a3e18b05c5e4c1b8cd31989e242d6e6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
LEO指向了当前已经写入的最大偏移量
HW指向了可以被消费的最高偏移量
LEO >= HW

**2）再看下几个值的存储位置：**
注意！分区是有leader和follower的，最新写的消息会进入leader，follower从leader不停的同步。
无论leader还是follower，都有自己的HW和LEO，存储在各自分区所在的磁盘上。
leader多一个`Remote LEO`，它表示针对各个follower的LEO，leader又额外记了一份！

**3）为什么这么做呢？**
leader会拿这些remote值里最小的来更新自己的hw，具体过程我们详细往下看

## 3.2 同步原理
![在这里插入图片描述](https://img-blog.csdnimg.cn/9c5a03c4ae8e49d988aa47c10464a10f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们来看这几个值是如何更新的：
**1）leader.LEO**
这个很简单，每次producer有新消息发过来，就会增加

**2）其他值**
另外的4个值初始化都是 0
他们的更新由follower的fetch（同步消息线程）得到的数据来决定！
如果把fetch看做是leader上提供的方法，由follower远程请求调用，那么它的伪代码大概是这个样子：
```java
//java伪代码！
//follower端的操作，不停的请求从leader获取最新数据
class Follower{
	private List<Message> messages;
	private HW hw;
	private LEO leo;
	@Schedule("不停的向leader发起同步请求")
	void execute(){
		//向leader发起fetch请求，将自己的leo传过去
		//leader返回leo之后最新的消息，以及leader的hw
		LeaderReturn lr = leader.fetch(this.leo) ;
		//存消息
		this.messages.addAll(lr.newMsg);
		//增加follower的leo值
		this.leo = this.leo + lr.newMsg.length;
		//比较自己的leo和leader的hw，取两者小的，作为follower的hw
		this.hw = min(this.leo , lr.leaderHW);
	}
}
//leader返回的报文
class LeaderReturn{
	//新增的消息
	List<Messages> newMsg;
	//leader的hw
	HW leaderHW;
}
```

```java
//leader在接到follower的fetch请求时，做的逻辑
class Leader{
	private List<Message> messages;
	private LEO leo;
	private HW hw;
	//Leader比follower多了个Remote!
	//注意！如果有多个副本，那么RemoteLEO也有多个，每个副本对应一个
	private RemoteLEO remoteLEO;
	//接到follower的fetch请求时，leader做的事情
	LeaderReturn fetch(LEO followerLEO){
		//根据follower传过来的leo，来更新leader的remote
		this.remoteLEO = followerLEO ;
		//然后取ISR（所有可用副本）的最小leo作为leader的hw
		this.hw = min(this.leo , this.remoteLEO) ;
		//从leader的消息列表里，查找大于follower的leo的所有新消息
		List<Message> newMsg = queryMsg(followerLEO) ;
		//将最新的消息（大于follower leo的那些），以及leader的hw返回给follower
		LeaderReturn lr = new LeaderReturn(newMsg , this.hw)
		return lr;
	}
}
```

## 3.3 Leader Epoch
**1）产生的背景**
0.11版本之前的kafka，完全借助hw作为消息的基准，不管leo。

发生故障后的规则：
follower故障再次恢复后，从磁盘读取hw的值并从hw开始剔除后面的消息，并同步leader消息。
leader故障后，新当选的leader的hw作为新的分区hw，其余节点按照此hw进行剔除数据，并重新同步。
上述根据hw进行数据恢复会出现数据丢失和不一致的情况，下面分开来看

假设：
我们有两个副本：leader（A），follower（B）

场景一：丢数据
![在这里插入图片描述](https://img-blog.csdnimg.cn/859b4728624e4c498905540f8bbf2517.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- 某个时间点B挂了。当它恢复后，以挂之前的hw为准，设置 leo = hw
- 这就造成一个问题：现实中，leo 很可能是 大于 hw的。leo被回退了！
- 如果这时候，恰恰A也挂掉了。kafka会重选leader，B被选中。
- 过段时间，A恢复后变成follower，从B开始同步数据。
- 问题来了！上面说了，B的数据是被回退过的，以它为基准会有问题
- 最终结果：两者的数据都发生丢失，没有地方可以找回！

场景二：数据不一致
![在这里插入图片描述](https://img-blog.csdnimg.cn/c958c414d95d4dff8b689892d3331c16.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- 这次假设AB全挂了。比较惨
- B先恢复。但是它的hw有可能挂之前没从A同步过来（原来A是leader）
- 我们假设，A.hw = 2 , B.hw = 1
- B恢复后，集群里只有它自己，所以被选为leader，开始接受新消息
- B.hw上涨，变成2
- 然后，A恢复，原来A.hw = 2 ，恢复后以B的hw，也就是2为基准开始同步。
  - 问题来了！B当leader后新接到的2号消息是不会同步给A的，A一直保留着它当leader时的旧数据
- 最终结果：数据不一致了！

**2）改进思路**
0.11之后，kafka改进了hw做主的规则，这就是`leader epoch`。

leader epoch**给leader节点带了一个版本号**，类似于乐观锁的设计。

它的思想是，一旦发生机器故障，重启之后，不再机械的将leo退回hw，
而是借助epoch的版本信息，去请求当前leader，让它去算一算leo应该是什么。


**3）实现原理**

① 对比上面丢数据的问题：
![在这里插入图片描述](https://img-blog.csdnimg.cn/c64c3e36418c4db7a9adacd57bee8e36.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- A为（leo=2 , hw=2），B为（leo=2 , hw=1）
- B重启，但是B不再着急将leo打回hw，而是发起一个Epoch请求给当前leader，也就是A
- A收到LE=0后，发现和自己的LE一样，说明B在挂掉前后，leader没变，都是A自己
- 那么A就将自己的leo值返回给B，也就是数字2
- B收到2后和自己挂掉之前的leo比对取较小值，发现也是2，那么不再退回到hw的1
- 没有回退，也就是信息1的位置没有被覆盖，最大程度的保护了数据
- 如果和上面一样的场景，A挂掉，B被选为leader

![在这里插入图片描述](https://img-blog.csdnimg.cn/482817649af64fd4be1294e33dd75a98.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- 那么A再次启动时后，从B开始同步数据
- 因为B之前没有回退，1号信息得到了保留
- 同时，B的LE（epoch号码）开始增加，从0变成1，offset记录为B当leader时的位置，也就是2
- A传过来的epoch为0，B是1，不相等。那么取大于0的所有epoch里最小的（现实中可能发生了多次重新选主，有多条epoch）
- 其实就是LE=1的那条。现实中可能有多条。并找到它对应的offset（也就是2）给A返回去
- 最终A得到了B同步过来的数据


②再来看一致性问题的解决
![在这里插入图片描述](https://img-blog.csdnimg.cn/b554212a0bfe4336ba3b029e7bd82964.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- 还是上面的场景，AB同时挂掉，但是hw还没同步，那么A.hw=2 , B.hw=1
- B先启动被选成了leader，新leader选举后，epoch加了一条记录（参考下图，LE=1，这时候offset=1）
- 表示B从1开始往后继续写数据，新来了条信息，内容为m3，写到1号位
- A启动前，集群只有B自己，消息被确认，hw上涨到2，变成下面的样子
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/c719fdcc77fb440a844c5c6dfc1468e3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- A开始恢复，启动后向B发送epoch请求，将自己的LE=0告诉leader，也就是B
- B发现自己的LE不同，同样去大于0的LE里最小的那条，也就是1 , 对应的offset也是1，返回给A
- A从1开始同步数据，将自己本地的数据截断、覆盖，hw上升到2
- 那么最新的写入的m3从B给同步到了A，并覆盖了A上之前的旧数据m2
- 结果：数据保持了一致


**epochRequest的详细流程图**
![在这里插入图片描述](https://img-blog.csdnimg.cn/b6b1945269a7434b9aa4115141e91567.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)