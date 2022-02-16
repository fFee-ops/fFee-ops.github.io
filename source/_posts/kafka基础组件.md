---
title: kafka基础组件
date: 2022-02-05 12:03:00
tags:
password:
categories: kafka
---

# 角色
![在这里插入图片描述](https://img-blog.csdnimg.cn/6d77b39222da4129bcb2d5b9194f08f5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- broker：节点，就是你看到的机器，也就是一个kafka服务
- provider：生产者，发消息的
- consumer：消费者，读消息的
- zookeeper：信息/注册中心，记录kafka的各种信息的地方
- controller：其中的一个broker，作为leader身份来负责管理整个集群。如果挂掉，借助zk重新选主。

# 逻辑组件
![在这里插入图片描述](https://img-blog.csdnimg.cn/1867e1f1f0ea4023b7e40bc5d5e46401.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
>上图中topic1有三个partition，每个partition有3个副本。注意：三个其实都是副本，只不过有leadr、follower的区别。



- topic：主题，一个消息的通道，收发总得知道消息往哪投。类似于RocketMQ的topic
- partition：分区，每个主题可以有多个分区分担数据的传递，多条路并行，吞吐量大。类似于RocktMQ的queue
- Replicas：副本，每个分区可以设置多个副本，副本之间数据一致。相当于备份，有备胎更可靠
- leader & follower：主从，上面的这些副本里有1个身份为leader，其他的为follower。leader处理partition的所有读写请求。follower副本仅有一个功能，那就是从leader副本拉取消息，尽量让自己跟leader副本的内容一致。


![在这里插入图片描述](https://img-blog.csdnimg.cn/e660d750e316481b948cc7aa11eda505.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
像上图所示：topic只是一个逻辑的概念，多个broker上的partition可能组成一个topic。我们针对于topic的时候就把broker集群看成一个服务，因为topic是横跨多个broker的。


![在这里插入图片描述](https://img-blog.csdnimg.cn/c707ee51389f4208a8e1ae35e8c1707e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
如上图所示：每个partition都会有多个副本，为了方便我就只画了一个副本。
比如partition0、partition0副本。他们俩中partition0为leader，partition0副本为follower。如果还有partition0还有别的副本，那么都是follower。
**注意：partition0、partition1、partition2也是副本，不过是leader副本而已。图中总共有6个副本**


# 副本集合
- AR：所有副本的统称，AR=ISR+OSR
- ISR：同步中的副本，可以参与leader选主。一旦落后太多（数量滞后和时间滞后两个维度）会被踢到OSR。【**需要明确一点。ISR不只是追随者副本集合，它必然包括Leader副本。甚至在某些情况下，ISR只有Leader这一个副本。**】
- OSR：踢出同步的副本，一直追赶leader，追上后会进入ISR

![在这里插入图片描述](https://img-blog.csdnimg.cn/9399609cf38a4327b4586e3c326ae90e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
> 上图AR有6个。全都是副本。我们现在假设partition0副本由于出现网络波动导致数据同步过慢。
> 所以我们的OSR=1，也就是partition0副本。
> 剩下的副本都在正常同步中，也就是ISR。

#  消息标记
![在这里插入图片描述](https://img-blog.csdnimg.cn/c79520c3a48d474e9527d70a2b475c16.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/82d1180aa448448196a5be6aec8f1323.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- offset：偏移量，消息消费到哪一条了？每个消费者都有自己的偏移量
- HW：(high watermark）：副本的高水印值，**客户端最多能消费到的位置**，HW值为8，代表offset为[0,8]的9条消息都可以被消费到，它们是对消费者可见的，而[9,12]这4条消息由于未提交，对消费者是不可见的。
- LEO：(log end offset）：日志末端位移，代表日志文件中下一条**待写入**消息的offset，这个offset上**实际是没有消息的**。不管是leader副本还是follower副本，都有这个值。


那么这三者有什么关系呢？
比如在副本数等于3的情况下，消息发送到Leader A之后会更新LEO的值，Follower B和Follower C也会实时拉取Leader A中的消息来更新自己，HW就表示A、B、C三者同时达到的日志位移，也就是选取A、B、C三者中LEO最小的那个值作为现在的HW。由于B、C拉取A消息之间延时问题，所以HW一般会小于LEO，即`LEO>=HW>OFFSET`。