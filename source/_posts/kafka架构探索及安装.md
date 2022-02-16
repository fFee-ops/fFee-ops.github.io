---
title: kafka架构探索及安装
date: 2022-02-05 18:28:08
tags:
password:
categories: kafka
---

# 1. 发展历程
[https://kafka.apache.org/downloads](https://kafka.apache.org/downloads)
![在这里插入图片描述](https://img-blog.csdnimg.cn/e8da4f687d444fb0ac27d04009abe3f9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 1.1 版本命名
Kafka在1.0.0版本前的命名规则是4位，比如0.8.2.1，0.8是大版本号，2是小版本号，1表示打过1个补丁。

现在的版本号命名规则是3位，格式是“大版本号”+“小版本号”+“修订补丁数”，比如2.5.0，前面的2代表的是大版本号，中间的5代表的是小版本号，0表示没有打过补丁。

我们所看到的下载包，前面是scala编译器的版本，后面才是真正的kafka版本。比如
![在这里插入图片描述](https://img-blog.csdnimg.cn/be244c9ad3bd477b895b45eb3bb801b3.png)
## 1.2 演进历史
0.7版本 只提供了最基础的消息队列功能。

0.8版本 引入了副本机制，至此Kafka成为了一个真正意义上完备的分布式高可靠消息队列解决方案。

0.9版本 增加权限和认证，使用Java重写了新的consumer API，Kafka Connect功能；不建议使用consumer API；

0.10版本 引入Kafka Streams功能，正式升级成分布式流处理平台；建议版本0.10.2.2；建议使用新版consumer API

0.11版本 producer API幂等，事务API，消息格式重构；建议版本0.11.0.3；谨慎对待消息格式变化

1.0和2.0版本 Kafka Streams改进；建议版本2.0；

# 2. 单机安装
前提是zookeeper已经安装并启动了。


**本次安装kafka的版本为2.8.0**
## 2.1 下载 kafka
地址: [http://kafka.apache.org/downloads.html](http://kafka.apache.org/downloads.html)

```shell
 Source download: kafka-2.5.0-src.tgz (asc, sha512)  # 此为源代码, 需要自己编译
Binary downloads:
    Scala 2.12  - kafka_2.12-2.5.0.tgz (asc, sha512)  # 已编译好的, 前面的2.12为 Scala版本
    Scala 2.13  - kafka_2.13-2.5.0.tgz (asc, sha512)
```

## 2.2 解压安装包
```shell
tar -zxvf kafka_2.13-2.5.0.tgz
```

## 2.3 修改配置文件
进入到kafka的`config`目录下
```shell
vim server.properties
```
其实主要就修改zookeeper的链接配置，和启用监听器。其余都不用动
![在这里插入图片描述](https://img-blog.csdnimg.cn/574577e9ff454433a419af78ed54d87e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/cef4ef9cc586499db29bf06eda225460.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.4 启动 kafka
在kafka根目录下执行以下命令来后台运行kafka
```shell
nohup ./bin/kafka-server-start.sh config/server.properties &
```

如果启动的时候出现错误：
![在这里插入图片描述](https://img-blog.csdnimg.cn/ca45976d57c6424bad4416dc8f370707.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
也就是找不到你的jdk。
这个时候去修改`bin/kafka-run-class.sh`。
```shell
vim ./bin/kafka-run-class.sh
```
搜索JAVA_HOME，并且将红色框内容替换为JDK的绝对路径。
![在这里插入图片描述](https://img-blog.csdnimg.cn/ecb33eb6756542958df7069b04712217.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)



## 2.5 验证
使用jps命令可以看到是否启动成功：
![在这里插入图片描述](https://img-blog.csdnimg.cn/fe8ae556669142b58cffb8669f3013c3.png)



# 3. 组件使用

## 3.1 创建 topic
### 2.x版本
在kafka根目录下执行：
```shell
# 创建 1个分区 1个副本的 topic
./bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic hello
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/6c6b4ff5b5ca44528e5f8cc62eb30553.png)

###  3.x版本
在kafka根目录下执行：
```shell
# 创建 1个分区 1个副本的 topic
./bin/kafka-topics.sh --create --bootstrap-server 192.168.80.16:9092 --replication-factor 1 --partitions 1 --topic testTopic(主题名称)
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/b2010b593a3c4459850e0867771f65d8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)



**注意的点：`--bootstrap-server`后不能使用localhost，必须填写ip**

而且还需要注意：
```
对于版本 2.*，您必须使用 Zookeper 创建主题，并使用默认端口 2181 作为参数。

对于版本 3.*，zookeeper 不再是参数，您应该使用 --bootstrap-server 使用 localhost 或服务器的 IP 地址和默认端口 9092
```

## 3.2 查看 topic
```shell
./bin/kafka-topics.sh --list --zookeeper localhost:2181
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/65d1e6c186b44c06a87eaf7a7554f177.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.3 发送消息
发送消息默认使用的是 9092 端口, kafka 链接 zookeeper 默认端口是 2181 这两个是不一样的, 要注意.
```shell
./bin/kafka-console-producer.sh --broker-list  192.168.80.16:9092 --topic hello
```
> 不能用localhost

![在这里插入图片描述](https://img-blog.csdnimg.cn/c93dcb22bbbd463199349c1196933750.png)

## 3.4 消费消息
复制一个新的窗口进行消息消费。
```shell
./bin/kafka-console-consumer.sh --bootstrap-server  192.168.80.16:9092 --topic hello
```
> 不能用localhost

此时在发送端进行发送，再来看接收端
![在这里插入图片描述](https://img-blog.csdnimg.cn/9b3b9ef1cb8d4a5d98104b69b660c356.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.5 删除 topic
```shell
./bin/kafka-topics.sh --delete --zookeeper localhost:2181 --topic hello
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/6cefafa9ddad482c933d2534b42e27f2.png)
再来看看topic列表发现hello已经被删除了
![在这里插入图片描述](https://img-blog.csdnimg.cn/f52d3891cb664a6aa1119b931eac77fc.png)

## 3.6 主题详情
```shell
./bin/kafka-topics.sh --zookeeper localhost:2181 --describe --topic testTopic
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/72577250a8d8450db344679526a72c96.png)

## 3.7 分组消费
启动两个consumer时，如果不指定group信息，消息被广播
![在这里插入图片描述](https://img-blog.csdnimg.cn/ef3fbd97f20f48c8b6b894e1ea9a7cef.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
指定相同的group，发现只有一个消费者可以获得消息
![在这里插入图片描述](https://img-blog.csdnimg.cn/bfc949920e9a49529c30f6c1e323ac58.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

注意，此时的testTopic的分区数为：1个，所以同一group的2个消费者会有一个闲置。
![在这里插入图片描述](https://img-blog.csdnimg.cn/b924e12dde7c45b08872d777076b6e2a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

---
新创建一个主题hi，分区为2
![在这里插入图片描述](https://img-blog.csdnimg.cn/e1ade30128b24bd8bda40ad9a2c698ba.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
此时可以看到两个消费者是交替进行消费的
![在这里插入图片描述](https://img-blog.csdnimg.cn/e563dbeaa3f94cf292dd6a11b5436b89.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**总结：如果同一group下的 （ 消费者数量 > 分区数量 ） 那么就会有消费者闲置。**

## 3.8 指定分区
指定消费者消费分区通过参数` --partition`，注意！需要去掉group。
指定分区的意义在于，保障消息传输的顺序性。
```shell
./bin/kafka-console-consumer.sh --bootstrap-server  192.168.80.16:9092 --topic hi --partition 0

./bin/kafka-console-consumer.sh --bootstrap-server  192.168.80.16:9092 --topic hi --partition 1
```



![在这里插入图片描述](https://img-blog.csdnimg.cn/26d089cfaf3b4b45bbf589044732034d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**发送1-4条消息，交替出现。说明消息被均分到各个分区中投递**

---
默认的发送是没有指定key的,要指定分区发送，就需要定义key。那么相同的key被路由到同一个分区。

```shell
./bin/kafka-console-producer.sh --broker-list  192.168.80.16:9092 --topic hi --property parese.key=true
```

**携带key再发送，注意key和value之间用tab分割**
![在这里插入图片描述](https://img-blog.csdnimg.cn/24919f35f6c947af8fde57f7c1c917c9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**结果：相同的key被同一个consumer消费掉**


## 3.9  偏移量
偏移量决定了消息从哪开始消费，支持：开头，还是末尾。
-  **earliest**：当各分区下有已提交的offset时，从提交的offset开始消费；无提交的offset时，从头开始消费
-  **latest**：当各分区下有已提交的offset时，从提交的offset开始消费；无提交的offset时，消费新产生的该分区下的数据
-  **none**：topic各分区都存在已提交的offset时，从offset后开始消费；只要有一个分区不存在已提交的offset，则抛出异常

```shell
./bin/kafka-console-consumer.sh --bootstrap-server  192.168.80.16:9092 --topic hi --partition 0 --offset earliest
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/7ef5609c5e7648e8aae4b7cf824ef04c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**结果：之前发送的消息，从头又消费了一遍**



# 4. zookeeper分析
zk存储了kafka集群的相关信息，本节来探索内部的秘密。
在zk客户端输入命令
```shell
ls /
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/eb069aa179da4458ad0bdd1318cbc93a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
得到以下配置信息
![在这里插入图片描述](https://img-blog.csdnimg.cn/f9eb8a9a10dc4454a97fa14b44d40fb7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 4.1 broker信息
![在这里插入图片描述](https://img-blog.csdnimg.cn/caaca2f32acb46edbe2af1f17bc134a9.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/464cc81646c14b3a89d9834e6c0a936e.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/f31844df83874afe846d68f0bdb2623b.png)
## 4.2  主题与分区
分区节点路径
![在这里插入图片描述](https://img-blog.csdnimg.cn/3014aa53595a457c8f40aa10e34d135e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
分区信息，leader所在的机器id，isr列表等
![在这里插入图片描述](https://img-blog.csdnimg.cn/0d876f1b04e24af3ace7b91a7b2f4f8c.png)
## 4.3 消费者与偏移量
![在这里插入图片描述](https://img-blog.csdnimg.cn/c183b422b71947c8bf22a0f015a88c4c.png)
居然是空的？？原来现在kafka已经自身去维护 group 的消费 偏移量了。

**查看方式：**
上面的消费用的是控制台工具，这个工具使用--bootstrap-server，不经过zk，也就不会记录到/consumers下。

其消费者的offset会更新到一个kafka自带的topic【__consumer_offsets】下面。

消费消息后，查看TOPIC可以发现多了一个`__consumer_offsets`
![在这里插入图片描述](https://img-blog.csdnimg.cn/779b93b92ad34f029065ffcf71403142.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们之前用过一个group：aaa

输入命令查看消费者及偏移量情况：
```shell
./bin/kafka-consumer-groups.sh --bootstrap-server 192.168.80.16:9092 --list
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/ff72c7b6dcfd4d1aa37defd8bc1ee9e5.png)
查看偏移量详情:
```shell
./bin/kafka-consumer-groups.sh --bootstrap-server 192.168.80.16:9092 --describe --group aaa
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/e4f380e1ac1f45ba9a07e4df8e2ff54e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

---
如果当前与LEO保持一致，说明消息都完整的被消费过:
![在这里插入图片描述](https://img-blog.csdnimg.cn/44f93f58ec474570a42264331ea3cab9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
停掉consumer后，往provider中再发几条记录，offset开始滞后：
![在这里插入图片描述](https://img-blog.csdnimg.cn/5989cfced51d4b9eadd232d4c0b033f5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
重新启动consumer，消费到最新的消息，同时再返回看偏移量，消息得到同步：
![在这里插入图片描述](https://img-blog.csdnimg.cn/561d5098a83f4c62b132abc3387b6e41.png)
## 4.4 controller
当前集群中的主控节点是谁
![在这里插入图片描述](https://img-blog.csdnimg.cn/8187e461dc6b4299b8513ee321aa993d.png)