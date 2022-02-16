---
title: RocketMQ消息投递策略
date: 2022-02-01 15:03:59
tags:
password:
categories: RocketMQ
---

​ RocketMQ的消息投递分分为两种：一种是生产者往MQ Broker中投递；另外一种则是MQ broker 往消费者 投递(这种投递的说法是从消息传递的角度阐述的，实际上底层是消费者从MQ broker 中Pull拉取的)。

# RocketMQ的消息模型
![在这里插入图片描述](https://img-blog.csdnimg.cn/e7521fe3e58440e98853d25aafed33c5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**一个Topic(消息主题)可能对应多个实际的消息队列(MessgeQueue)**
​ 在底层实现上，为了提高MQ的可用性和灵活性，一个Topic在实际存储的过程中，采用了多队列的方式，具体形式如上图所示。每个消息队列在使用中应当保证先入先出（FIFO,First In First Out）的方式进行消费。

那么，基于这种模型，就会引申出两个问题：

- 生产者 在发送相同Topic的消息时，消息体应当被放置到哪一个消息队列(MessageQueue)中？
- 消费者 在消费消息时，应当从哪些消息队列中拉取消息？

# 生产者投递策略
## 轮询算法投递
默认投递方式：基于Queue队列轮询算法投递.
​ 默认情况下，采用了最简单的轮询算法，这种算法有个很好的特性就是，保证每一个Queue队列的消息投递数量尽可能均匀，算法如下图所示：
```java
/**
*  根据 TopicPublishInfo Topic发布信息对象中维护的index，每次选择队列时，都会递增
*  然后根据 index % queueSize 进行取余，达到轮询的效果
*
*/
public MessageQueue selectOneMessageQueue(final TopicPublishInfo tpInfo, final String lastBrokerName) {
        return tpInfo.selectOneMessageQueue(lastBrokerName);
}

/**
*  TopicPublishInfo Topic发布信息对象中
*/
public class TopicPublishInfo {
    //基于线程上下文的计数递增，用于轮询目的
    private volatile ThreadLocalIndex sendWhichQueue = new ThreadLocalIndex();
   

    public MessageQueue selectOneMessageQueue(final String lastBrokerName) {
        if (lastBrokerName == null) {
            return selectOneMessageQueue();
        } else {
            int index = this.sendWhichQueue.getAndIncrement();
            for (int i = 0; i < this.messageQueueList.size(); i++) {
                //轮询计算
                int pos = Math.abs(index++) % this.messageQueueList.size();
                if (pos < 0)
                    pos = 0;
                MessageQueue mq = this.messageQueueList.get(pos);
                if (!mq.getBrokerName().equals(lastBrokerName)) {
                    return mq;
                }
            }
            return selectOneMessageQueue();
        }
    }

    public MessageQueue selectOneMessageQueue() {
        int index = this.sendWhichQueue.getAndIncrement();
        int pos = Math.abs(index) % this.messageQueueList.size();
        if (pos < 0)
            pos = 0;
        return this.messageQueueList.get(pos);
    }
}
```


**代码示例**
RocketMQ默认采用轮询投递策略
```java
/**
 * 轮询投递策略
 */
public class PollingProducer {

    public static void main(String[] args) throws Exception {
        //创建一个消息生产者，并设置一个消息生产者组
        DefaultMQProducer producer = new DefaultMQProducer("rocket_test_consumer_group");

        //指定 NameServer 地址
        producer.setNamesrvAddr("127.0.0.1:9876");

        //初始化 Producer，整个应用生命周期内只需要初始化一次
        producer.start();

        for (int i = 0; i < 10; i++) {
            //创建一条消息对象，指定其主题、标签和消息内容
            Message msg = new Message(
                    /* 消息主题名 */
                    "topicTest",
                    /* 消息标签 */
                    "TagA",
                    /* 消息内容 */
                    ("Hello Java demo RocketMQ " + i).getBytes(RemotingHelper.DEFAULT_CHARSET)
            );

            //发送消息并返回结果
            SendResult sendResult = producer.send(msg);

            System.out.println("product: 发送状态:" + sendResult.getSendStatus() + ",存储queue:" + sendResult.getMessageQueue().getQueueId() + ",消息索引:" + i);
        }

        // 一旦生产者实例不再被使用则将其关闭，包括清理资源，关闭网络连接等
        producer.shutdown();
    }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/8d8601a282514ab889b62b721b22a063.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 消息投递延迟最小策略
默认投递方式的增强：基于**Queue队列轮询算法**和**消息投递延迟最小**的策略投递

​ 默认的投递方式比较简单，但是也暴露了一个问题，就是有些Queue队列可能由于自身数量积压等原因，可能在投递的过程比较长，对于这样的Queue队列会影响后续投递的效果。

基于这种现象，RocketMQ在每发送一个MQ消息后，都会统计一下消息投递的时间延迟，根据这个时间延迟，可以知道往哪些Queue队列投递的速度快。

在这种场景下，会优先使用消息投递延迟最小的策略，如果没有生效，再使用Queue队列轮询的方式。
```java
public class MQFaultStrategy {
    /**
     * 根据 TopicPublishInfo 内部维护的index,在每次操作时，都会递增，
     * 然后根据 index % queueList.size(),使用了轮询的基础算法
     *
     */
    public MessageQueue selectOneMessageQueue(final TopicPublishInfo tpInfo, final String lastBrokerName) {
        if (this.sendLatencyFaultEnable) {
            try {
                // 从queueid 为 0 开始，依次验证broker 是否有效，如果有效
                int index = tpInfo.getSendWhichQueue().getAndIncrement();
                for (int i = 0; i < tpInfo.getMessageQueueList().size(); i++) {
                    //基于index和队列数量取余，确定位置
                    int pos = Math.abs(index++) % tpInfo.getMessageQueueList().size();
                    if (pos < 0)
                        pos = 0;
                    MessageQueue mq = tpInfo.getMessageQueueList().get(pos);
                    if (latencyFaultTolerance.isAvailable(mq.getBrokerName())) {
                        if (null == lastBrokerName || mq.getBrokerName().equals(lastBrokerName))
                            return mq;
                    }
                }
                
                // 从延迟容错broker列表中挑选一个容错性最好的一个 broker
                final String notBestBroker = latencyFaultTolerance.pickOneAtLeast();
                int writeQueueNums = tpInfo.getQueueIdByBroker(notBestBroker);
                if (writeQueueNums > 0) {
                     // 取余挑选其中一个队列
                    final MessageQueue mq = tpInfo.selectOneMessageQueue();
                    if (notBestBroker != null) {
                        mq.setBrokerName(notBestBroker);
                        mq.setQueueId(tpInfo.getSendWhichQueue().getAndIncrement() % writeQueueNums);
                    }
                    return mq;
                } else {
                    latencyFaultTolerance.remove(notBestBroker);
                }
            } catch (Exception e) {
                log.error("Error occurred when selecting message queue", e);
            }
          // 取余挑选其中一个队列
            return tpInfo.selectOneMessageQueue();
        }

        return tpInfo.selectOneMessageQueue(lastBrokerName);
    }
}
```

## 顺序投递策略
上述两种投递方式属于对消息投递的时序性没有要求的场景，这种投递的速度和效率比较高。而在有些场景下，需要保证同类型消息投递和消费的顺序性。
 例如，假设现在有TOPIC` topicTest`,该 Topic下有4个Queue队列，该Topic用于传递订单的状态变迁，假设订单有状态：`未支付`、`已支付`、`发货中(处理中)`、`发货成功`、`发货失败`。
在时序上，生产者从时序上可以生成如下几个消息：
```shell
订单T0000001:未支付 --> 订单T0000001:已支付 --> 订单T0000001:发货中(处理中) --> 订单T0000001:发货失败
```

消息发送到MQ中之后，可能由于轮询投递的原因，消息在MQ的存储可能如下：
![在这里插入图片描述](https://img-blog.csdnimg.cn/9e6734e041304868bff2a5bc3ec21357.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
这种情况下，我们希望消费者消费消息的顺序和我们发送是一致的，然而，有上述MQ的投递和消费机制，我们无法保证顺序是正确的，对于顺序异常的消息，消费者 即使有一定的状态容错，也不能完全处理好这么多种随机出现组合情况。


 基于上述的情况，RockeMQ采用了这种实现方案：对于相同订单号的消息，通过一定的策略，将其放置在一个 queue队列中，然后消费者再采用一定的策略(一个线程独立处理一个queue,保证处理消息的顺序性)，能够保证消费的顺序性
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/5a7c9f3557f84ae9aacae0bbed0106f8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们先看生产者是如何能将相同订单号的消息发送到同一个queue队列的：

​ 生产者在消息投递的过程中，使用了 `MessageQueueSelector` 作为队列选择的策略接口，其定义如下：
```java
public interface MessageQueueSelector {
        /**
         * 根据消息体和参数，从一批消息队列中挑选出一个合适的消息队列
         * @param mqs  待选择的MQ队列选择列表
         * @param msg  待发送的消息体
         * @param arg  附加参数
         * @return  选择后的队列
         */
        MessageQueue select(final List<MessageQueue> mqs, final Message msg, final Object arg);
}
```
目前RocketMQ提供了如下几种实现：
![在这里插入图片描述](https://img-blog.csdnimg.cn/4b65457c4a2a40708e18308022ddea86.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/2498a6fedb4c4b8ba07aa90f7959596e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
主要看一下`基于Hash分配策略`的源码
```java
public class SelectMessageQueueByHash implements MessageQueueSelector {

    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        int value = arg.hashCode();
        if (value < 0) {
            value = Math.abs(value);
        }

        value = value % mqs.size();
        return mqs.get(value);
    }
}
```

**代码示例**
实际的操作代码样例如下，通过订单号作为hash运算对象，就能保证相同订单号的消息能够落在相同的queue队列上。
```java
public class OrderProducer {
    private static final List<ProductOrder> orderList = new ArrayList<>();

    static {
        orderList.add(new ProductOrder("XXX001", "订单创建"));
        orderList.add(new ProductOrder("XXX001", "订单付款"));
        orderList.add(new ProductOrder("XXX001", "订单完成"));
        orderList.add(new ProductOrder("XXX002", "订单创建"));
        orderList.add(new ProductOrder("XXX002", "订单付款"));
        orderList.add(new ProductOrder("XXX002", "订单完成"));
        orderList.add(new ProductOrder("XXX003", "订单创建"));
        orderList.add(new ProductOrder("XXX003", "订单付款"));
        orderList.add(new ProductOrder("XXX003", "订单完成"));
    }

    public static void main(String[] args) throws Exception {
        //创建一个消息生产者，并设置一个消息生产者组
        DefaultMQProducer producer = new DefaultMQProducer("rocket_test_consumer_group");

        //指定 NameServer 地址
        producer.setNamesrvAddr("192.168.80.16:9876");
        //初始化 Producer，整个应用生命周期内只需要初始化一次
        producer.start();

        for (int i = 0; i < orderList.size(); i++) {
            //获取当前order
            ProductOrder order = orderList.get(i);
            //创建一条消息对象，指定其主题、标签和消息内容
            Message message = new Message(
                    /* 消息主题名 */
                    "topicTest",
                    /* 消息标签 */
                    order.getOrderId(),
                    /* 消息内容 */
                    (order.toString()).getBytes(RemotingHelper.DEFAULT_CHARSET)
            );

            //发送消息并返回结果 使用hash选择策略
            SendResult sendResult = producer.send(message, new SelectMessageQueueByHash(), order.getOrderId());

            System.out.println("product: 发送状态:" + sendResult.getSendStatus() + ",存储queue:" + sendResult.getMessageQueue().getQueueId() + ",orderID:" + order.getOrderId() + ",type:" + order.getOrderName());
        }

        // 一旦生产者实例不再被使用则将其关闭，包括清理资源，关闭网络连接等
        producer.shutdown();
    }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/32701e43604c4c3bb2d1243e1d5edc58.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 消费者分配策略
RocketMQ对于消费者消费消息有两种形式：
- BROADCASTING:广播式消费，这种模式下，一个消息会被通知到每一个消费者
- CLUSTERING: 集群式消费，这种模式下，一个消息最多只会被投递到一个消费者上进行消费

模式如下：
![在这里插入图片描述](https://img-blog.csdnimg.cn/92823655248b4c2e9ccaa735702b8ec5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

广播模式比较简单，所以主要讲集群消费。
对于使用了消费模式为`MessageModel.CLUSTERING`进行消费时，需要保证一个消息在整个集群中只需要被消费一次。实际上，在RoketMQ底层，消息指定分配给消费者的实现，**是通过queue队列分配给消费者**的方式完成的：也就是说，**消息分配的单位是消息所在的queue队列**。即：**将queue队列指定给特定的消费者后，queue队列内的所有消息将会被指定到消费者进行消费。**

RocketMQ定义了策略接口`AllocateMessageQueueStrategy`，对于给定的消费者分组,和消息队列列表、消费者列表，当前消费者应当被分配到哪些queue队列，定义如下：
```java
/**
 * 为消费者分配queue的策略算法接口
 */
public interface AllocateMessageQueueStrategy {

    /**
     * Allocating by consumer id
     *
     * @param consumerGroup 当前 consumer群组
     * @param currentCID 当前consumer id
     * @param mqAll 当前topic的所有queue实例引用
     * @param cidAll 当前 consumer群组下所有的consumer id set集合
     * @return 根据策略给当前consumer分配的queue列表
     */
    List<MessageQueue> allocate(
        final String consumerGroup,
        final String currentCID,
        final List<MessageQueue> mqAll,
        final List<String> cidAll
    );

    /**
     * 算法名称
     *
     * @return The strategy name
     */
    String getName();
}
```
RocketMQ提供了如下几种实现：
![在这里插入图片描述](https://img-blog.csdnimg.cn/aae0a0350de941a582ce7f2867e263e4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/e0bce7c73fab44ea9f7465e593ac4c2b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

<font color=red> 假设一个例子，下面所有的算法将基于这个例子讲解。</font>
**假设当前同一个topic下有queue队列 10个，消费者共有4个**



## *使用方式
默认消费者使用使用了 `AllocateMessageQueueAveragely `平均分配策略。如果需要使用其他分配策略，使用方式如下
```java
//创建一个消息消费者，并设置一个消息消费者组，并指定使用一致性hash算法的分配策略
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer(null,"rocket_test_consumer_group",null,new AllocateMessageQueueConsistentHash());
.....
```

## 平均分配算法
​ 这里所谓的平均分配算法，并不是指的严格意义上的完全平均，如上面的例子中，10个queue，而消费者只有4个，无法是整除关系，除了整除之外的多出来的queue,将依次根据消费者的顺序均摊。


按照上述例子来看，10/4=2，即表示每个消费者平均均摊2个queue；而10%4=2，即除了均摊之外，多出来2个queue还没有分配，那么，根据消费者的顺序`consumer-1`、`consumer-2`、`consumer-3`、`consumer-4`,则多出来的2个queue将分别给`consumer-1`和`consumer-2`。
最终，分摊关系如下：
- consumer-1:3个
- consumer-2:3个
- consumer-3:2个
- consumer-4:2个

![在这里插入图片描述](https://img-blog.csdnimg.cn/f93e7a212b7a4049b5f09a1f81bffd58.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
其代码实现非常简单：
```java
public class AllocateMessageQueueAveragely implements AllocateMessageQueueStrategy {
    private final InternalLogger log = ClientLogger.getLog();

    @Override
    public List<MessageQueue> allocate(String consumerGroup, String currentCID, List<MessageQueue> mqAll,
        List<String> cidAll) {
        if (currentCID == null || currentCID.length() < 1) {
            throw new IllegalArgumentException("currentCID is empty");
        }
        if (mqAll == null || mqAll.isEmpty()) {
            throw new IllegalArgumentException("mqAll is null or mqAll empty");
        }
        if (cidAll == null || cidAll.isEmpty()) {
            throw new IllegalArgumentException("cidAll is null or cidAll empty");
        }

        List<MessageQueue> result = new ArrayList<MessageQueue>();
        if (!cidAll.contains(currentCID)) {
            log.info("[BUG] ConsumerGroup: {} The consumerId: {} not in cidAll: {}",
                consumerGroup,
                currentCID,
                cidAll);
            return result;
        }

        int index = cidAll.indexOf(currentCID);
        int mod = mqAll.size() % cidAll.size();
        int averageSize =
            mqAll.size() <= cidAll.size() ? 1 : (mod > 0 && index < mod ? mqAll.size() / cidAll.size()
                + 1 : mqAll.size() / cidAll.size());
        int startIndex = (mod > 0 && index < mod) ? index * averageSize : index * averageSize + mod;
        int range = Math.min(averageSize, mqAll.size() - startIndex);
        for (int i = 0; i < range; i++) {
            result.add(mqAll.get((startIndex + i) % mqAll.size()));
        }
        return result;
    }

    @Override
    public String getName() {
        return "AVG";
    }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/8a74700a20404b5181e6390b99e47ecb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/d535d8f50c23489f8fa135ea8226e1e8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/758f8e9c25414b53bbddb115531dbe3e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/ee84fbc6ad9744b19bcd1a87773c736c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 基于环形平均算法
环形平均算法，是指根据消费者的顺序，依次在由queue队列组成的环形图中逐个分配。具体流程如下所示:
![在这里插入图片描述](https://img-blog.csdnimg.cn/2897e74fd8cf4569876817f507232e64.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)
这种算法最终分配的结果是：
![在这里插入图片描述](https://img-blog.csdnimg.cn/839d48f25fda49618997b53429282008.png)
其代码实现如下所示：
```java
/**
 * Cycle average Hashing queue algorithm
 */
public class AllocateMessageQueueAveragelyByCircle implements AllocateMessageQueueStrategy {
    private final InternalLogger log = ClientLogger.getLog();

    @Override
    public List<MessageQueue> allocate(String consumerGroup, String currentCID, List<MessageQueue> mqAll,
        List<String> cidAll) {
        if (currentCID == null || currentCID.length() < 1) {
            throw new IllegalArgumentException("currentCID is empty");
        }
        if (mqAll == null || mqAll.isEmpty()) {
            throw new IllegalArgumentException("mqAll is null or mqAll empty");
        }
        if (cidAll == null || cidAll.isEmpty()) {
            throw new IllegalArgumentException("cidAll is null or cidAll empty");
        }

        List<MessageQueue> result = new ArrayList<MessageQueue>();
        if (!cidAll.contains(currentCID)) {
            log.info("[BUG] ConsumerGroup: {} The consumerId: {} not in cidAll: {}",
                consumerGroup,
                currentCID,
                cidAll);
            return result;
        }

        int index = cidAll.indexOf(currentCID);
        for (int i = index; i < mqAll.size(); i++) {
            if (i % cidAll.size() == index) {
                result.add(mqAll.get(i));
            }
        }
        return result;
    }

    @Override
    public String getName() {
        return "AVG_BY_CIRCLE";
    }
}
```

**演示效果**
首先设置算法
```java
//设置使用环形hash算法
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer(null, "rocket_test_consumer_group", null, new AllocateMessageQueueAveragelyByCircle());
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/842af505986e41db9d38357f5f26d07f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 一致性hash分配算法
 使用这种算法，会将consumer消费者作为Node节点构造成一个hash环，然后queue队列通过这个hash环来决定被分配给哪个consumer消费者。
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/eaf99e790b054ad0938d51fd4986cfc9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)
一致性hash算法用于在分布式系统中，保证数据的一致性而提出的一种基于hash环实现的算法,算法实现上也不复杂：
```java
public List<MessageQueue> allocate(String consumerGroup, String currentCID, List<MessageQueue> mqAll,
                                   List<String> cidAll) {
    //省略部分代码
    List<MessageQueue> result = new ArrayList<MessageQueue>();
    if (!cidAll.contains(currentCID)) {
        log.info("[BUG] ConsumerGroup: {} The consumerId: {} not in cidAll: {}",
                 consumerGroup,
                 currentCID,
                 cidAll);
        return result;
    }

    Collection<ClientNode> cidNodes = new ArrayList<ClientNode>();
    for (String cid : cidAll) {
        cidNodes.add(new ClientNode(cid));
    }
    //使用consumer id 构造hash环
    final ConsistentHashRouter<ClientNode> router; //for building hash ring
    if (customHashFunction != null) {
        router = new ConsistentHashRouter<ClientNode>(cidNodes, virtualNodeCnt, customHashFunction);
    } else {
        router = new ConsistentHashRouter<ClientNode>(cidNodes, virtualNodeCnt);
    }
    //依次为 队列分配 consumer
    List<MessageQueue> results = new ArrayList<MessageQueue>();
    for (MessageQueue mq : mqAll) {
        ClientNode clientNode = router.routeNode(mq.toString());
        if (clientNode != null && currentCID.equals(clientNode.getKey())) {
            results.add(mq);
        }
    }

    return results;

}
```


**演示效果**
首先设置算法
```java
//设置使用环形hash算法
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer(null, "rocket_test_consumer_group", null, new AllocateMessageQueueConsistentHash());
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/6ae6336ad3fc44418864f0e8e5d24677.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 机房临近分配算法
该算法使用了装饰者设计模式，对分配策略进行了增强。一般在生产环境，如果是微服务架构下，RocketMQ集群的部署可能是在不同的机房中部署，其基本结构可能如下图所示：
![在这里插入图片描述](https://img-blog.csdnimg.cn/05ddabbe36ad4edf92ddf2132a3b7551.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
对于跨机房的场景，会存在网络、稳定性和隔离心的原因，该算法会根据queue的部署机房位置和消费者consumer的位置，过滤出当前消费者consumer相同机房的queue队列，然后再结合上述的算法，如基于平均分配算法在queue队列子集的基础上再挑选。相关代码实现如下：
```java
@Override
public List<MessageQueue> allocate(String consumerGroup, String currentCID, List<MessageQueue> mqAll,
                                   List<String> cidAll) {
    //省略部分代码
    List<MessageQueue> result = new ArrayList<MessageQueue>();

    //将MQ按照 机房进行分组
    Map<String/*machine room */, List<MessageQueue>> mr2Mq = new TreeMap<String, List<MessageQueue>>();
    for (MessageQueue mq : mqAll) {
        String brokerMachineRoom = machineRoomResolver.brokerDeployIn(mq);
        if (StringUtils.isNoneEmpty(brokerMachineRoom)) {
            if (mr2Mq.get(brokerMachineRoom) == null) {
                mr2Mq.put(brokerMachineRoom, new ArrayList<MessageQueue>());
            }
            mr2Mq.get(brokerMachineRoom).add(mq);
        } else {
            throw new IllegalArgumentException("Machine room is null for mq " + mq);
        }
    }

    //将消费者 按照机房进行分组
    Map<String/*machine room */, List<String/*clientId*/>> mr2c = new TreeMap<String, List<String>>();
    for (String cid : cidAll) {
        String consumerMachineRoom = machineRoomResolver.consumerDeployIn(cid);
        if (StringUtils.isNoneEmpty(consumerMachineRoom)) {
            if (mr2c.get(consumerMachineRoom) == null) {
                mr2c.put(consumerMachineRoom, new ArrayList<String>());
            }
            mr2c.get(consumerMachineRoom).add(cid);
        } else {
            throw new IllegalArgumentException("Machine room is null for consumer id " + cid);
        }
    }

    List<MessageQueue> allocateResults = new ArrayList<MessageQueue>();

    //1.过滤出当前机房内的MQ队列子集，在此基础上使用分配算法挑选
    String currentMachineRoom = machineRoomResolver.consumerDeployIn(currentCID);
    List<MessageQueue> mqInThisMachineRoom = mr2Mq.remove(currentMachineRoom);
    List<String> consumerInThisMachineRoom = mr2c.get(currentMachineRoom);
    if (mqInThisMachineRoom != null && !mqInThisMachineRoom.isEmpty()) {
        allocateResults.addAll(allocateMessageQueueStrategy.allocate(consumerGroup, currentCID, mqInThisMachineRoom, consumerInThisMachineRoom));
    }

    //2.不在同一机房，按照一般策略进行操作
    for (String machineRoom : mr2Mq.keySet()) {
        if (!mr2c.containsKey(machineRoom)) { // no alive consumer in the corresponding machine room, so all consumers share these queues
            allocateResults.addAll(allocateMessageQueueStrategy.allocate(consumerGroup, currentCID, mr2Mq.get(machineRoom), cidAll));
        }
    }

    return allocateResults;
}
```

## 基于机房分配算法
该算法适用于属于同一个机房内部的消息，去分配queue。这种方式非常明确，基于上面的机房临近分配算法的场景，这种更彻底，直接指定基于机房消费的策略。这种方式具有强约定性，比如broker名称按照机房的名称进行拼接，在算法中通过约定解析进行分配。
```java
/**
 * Computer room Hashing queue algorithm, such as Alipay logic room
 */
public class AllocateMessageQueueByMachineRoom implements AllocateMessageQueueStrategy {
    private Set<String> consumeridcs;

    @Override
    public List<MessageQueue> allocate(String consumerGroup, String currentCID, List<MessageQueue> mqAll,
        List<String> cidAll) {
        List<MessageQueue> result = new ArrayList<MessageQueue>();
        int currentIndex = cidAll.indexOf(currentCID);
        if (currentIndex < 0) {
            return result;
        }
        List<MessageQueue> premqAll = new ArrayList<MessageQueue>();
        for (MessageQueue mq : mqAll) {
            String[] temp = mq.getBrokerName().split("@");
            if (temp.length == 2 && consumeridcs.contains(temp[0])) {
                premqAll.add(mq);
            }
        }

        int mod = premqAll.size() / cidAll.size();
        int rem = premqAll.size() % cidAll.size();
        int startIndex = mod * currentIndex;
        int endIndex = startIndex + mod;
        for (int i = startIndex; i < endIndex; i++) {
            result.add(mqAll.get(i));
        }
        if (rem > currentIndex) {
            result.add(premqAll.get(currentIndex + mod * cidAll.size()));
        }
        return result;
    }

    @Override
    public String getName() {
        return "MACHINE_ROOM";
    }

    public Set<String> getConsumeridcs() {
        return consumeridcs;
    }

    public void setConsumeridcs(Set<String> consumeridcs) {
        this.consumeridcs = consumeridcs;
    }
}
```