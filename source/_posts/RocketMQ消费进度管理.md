---
title: RocketMQ消费进度管理
date: 2022-02-03 13:47:19
tags:
password:
categories: RocketMQ
---

业务实现消费回调的时候，当且仅当此回调函数返回`ConsumeConcurrentlyStatus.CONSUME_SUCCESS` ，RocketMQ才会认为这批消息（默认是1条）是消费完成的

如果这时候消息消费失败，例如数据库异常，余额不足扣款失败等一切业务认为消息需要重试的场景，只要返回`ConsumeConcurrentlyStatus.RECONSUME_LATER`，RocketMQ就会认为这批消息消费失败了。

为了保证消息是肯定被至少消费成功一次，RocketMQ会把这批消费失败的消息重发回Broker（topic不是原topic而是这个消费租的RETRY topic），在延迟的某个时间点（默认是10秒，业务可设置）后，再次投递到这个ConsumerGroup。而如果一直这样重复消费都持续失败到一定次数（默
认16次），就会投递到DLQ死信队列。应用可以监控死信队列来做人工干预。

# 从哪里开始消费
当新实例启动的时候，PushConsumer会拿到本消费组broker已经记录好的消费进度，如果这个消费进度在Broker并没有存储起来，证明这个是一个全新的消费组，这时候客户端有几个策略可以选择：
```
CONSUME_FROM_LAST_OFFSET //默认策略，从该队列最尾开始消费，即跳过历史消息
CONSUME_FROM_FIRST_OFFSET //从队列最开始开始消费，即历史消息（还储存在broker的）全部消费一
遍
CONSUME_FROM_TIMESTAMP//从某个时间点开始消费，和setConsumeTimestamp()配合使用，默认是半
个小时以前
```

# 消息ACK机制
RocketMQ是以consumer group+queue为单位是管理消费进度的，以一个consumer offset标记这个消费组在这条queue上的消费进度。

每次消息成功后，**本地的消费进度会被更新，然后由定时器定时同步到broker(<font color=gray>即，不是立刻同步到broker，有一段时间消费进度只会存在于本地，此时如果宕机，那么未提交的消费进度就会被重新消费</font>)**，以此持久化消费进度。但是每次记录消费进度的时候，只会把一批消息中最小的offset值为消费进度值，如下图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/16395968a179428fbb1992aa5f62a58e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
>比如2消费失败，rocketmq跳过2消费到了8，8消费成功了，但是提交的时候只会提交【消费到了1】，因为2失败了，所以会提交最小成功点

# 重复消费问题
由于消费进度只是记录了一个下标，就可能出现拉取了100条消息如 2101-2200的消息，后面99条都消费结束了，只有2101消费一直没有结束的情况。
![在这里插入图片描述](https://img-blog.csdnimg.cn/bc5d19b6341840adb5e191818cb13e7f.png)
在这种情况下，RocketMQ为了保证消息肯定被消费成功，消费进度职能维持在2101，直到2101也消费结束了，本地的消费进度才能标记2200消费结束了（注：consumerOffset=2201）。
在这种设计下，就有消费大量重复的风险。如2101在还没有消费完成的时候消费实例突然退出（机器断电，或者被kill）。这条queue的消费进度还是维持在2101，当queue重新分配给新的实例的时候，新的实例从broker上拿到的消费进度还是维持在2101，这时候就会又从2101开始消费，2102-2200这批消息实际上已经被消费过还是会投递一次。


**对于这个场景，RocketMQ暂时无能为力，所以业务必须要保证消息消费的幂等性，这也是RocketMQ官方多次强调的态度。**


# 重复消费验证
## 查看当前消费进度
检查队列消费的当前进度。
查看RocketMQ 的config文件夹下的`consumerOffset.json`
```shell
cat consumerOffset.json
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c24716156237492a80d22c7a1b302cfc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
通过consumerOffset.json我们可以知道当前`topicTest`主题的`rocket_test_consumer_group`组的`queue2`消费到偏移量为32


## 消费者发送消息
消费者发送消息，并查看各个队列消息的偏移量
![在这里插入图片描述](https://img-blog.csdnimg.cn/423b7808e9504e85a4ea61d2f958590e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们发现队列2的偏移量最小为32
消费的时候最小偏移量不提交，其他都正常
```java
//队列2的偏移量为32的数据在等待
if (ext.getQueueId() == 2 && ext.getQueueOffset() == 32) {
System.out.println("消息消费耗时较厂接收queueId:[" + ext.getQueueId() + "],偏移量
offset:[" + ext.getQueueOffset() + "]");
//等待 模拟假死状态
try {
Thread.sleep(Integer.MAX_VALUE);
} catch (InterruptedException e) {
e.printStackTrace();
}
}
```
运行查看日志
![在这里插入图片描述](https://img-blog.csdnimg.cn/a4b2095bf117400b8c0c73bfc3c3022e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们发现只有队列2的偏移量为32的消息消费超时，其他都已经正常消费
我们再查看下consumerOffset.json
```shell
cat consumerOffset.json
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/94ba93f014a0415e80d31974be347980.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们发现因为rocketMQ 整个消费记录都没有被提交，所以下次消费会全部再次消费。 这里模拟出了整个消费进度都在本地，没来得及提交给broker。

还有一种情况就是，进度成功提交给broker了，queue0、1、3的消费进度都改变了。但是queue2的消费进度还是32，因为消费32的时候超时了，rocketmq只能提交最小成功offset！



# 再次消费
去掉延时代码继续消费

![在这里插入图片描述](https://img-blog.csdnimg.cn/7ecba378434448bd951cc49c68997d50.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们发现消息被重复消费了一遍