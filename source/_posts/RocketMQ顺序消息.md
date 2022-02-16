---
title: RocketMQ顺序消息
date: 2022-02-01 13:19:03
tags:
password:
categories: RocketMQ
---

# 顺序类型
## 无序消息
无序消息也指普通的消息，Producer 只管发送消息，Consumer 只管接收消息，至于消息和消息之间的顺序并没有保证。

-  Producer 依次发送 orderId 为 1、2、3 的消息
-  Consumer 接到的消息顺序有可能是 1、2、3，也有可能是 2、1、3 等情况，这就是普通消息。
## 全局顺序
对于指定的一个 Topic，所有消息按照严格的先入先出（FIFO）的顺序进行发布和消费。
 比如 Producer 发送orderId 1,3,2 的消息, 那么 Consumer 也必须要按照 1,3,2 的顺序进行消费。
 ![在这里插入图片描述](https://img-blog.csdnimg.cn/e1fb01d9f7314c65a499359501384dfb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 局部顺序
在实际开发有些场景中，我并不需要消息完全按照完全按的先进先出，而是某些消息保证先进先出就可以了。

​ 就好比一个订单涉及 订单生成，订单支付、订单完成。我不用管其它的订单，只保证同样订单ID能保证这个顺序就可以了。
![在这里插入图片描述](https://img-blog.csdnimg.cn/3cb532038e76444c843f630fdcf5952d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)


# Rocket顺序消息
RocketMQ可以严格的保证消息有序。但这个顺序，不是全局顺序，只是分区（queue）顺序。要实现全局顺序只能有一个分区。
因为发送消息的时候，消息发送默认是会采用轮询的方式发送到不通的queue（分区）。


## 实现原理
我们知道 生产的message最终会存放在Queue中，如果一个Topic关联了4个Queue,如果我们不指定消息往哪个队列里放，那么默认是平均分配消息到4个queue。


好比有10条消息，那么这10条消息会平均分配在这4个Queue上，那么每个Queue大概放2个左右。这里有一点很重的是：**同一个queue，存储在里面的message 是按照先进先出的原则**
![在这里插入图片描述](https://img-blog.csdnimg.cn/99dbdfc61eab4ec3b7393ad05b09e7a9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
这个时候思路就来了，我们让不同的地区用不同的queue。只要保证同一个地区的订单把他们放到同一个Queue那就保证消费者先进先出了。

![在这里插入图片描述](https://img-blog.csdnimg.cn/abe548dff1984cd4b051e9fc509057f2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
这就保证局部顺序了，即同一订单按照先后顺序放到同一Queue,那么取消息的时候就可以保证先进先取出。


## 如何保证集群有序
这里还有很关键的一点，在一个消费者集群的情况下，消费者1先去Queue拿消息，它拿到了 北京订单1，它拿完后，消费者2去queue拿到的是 北京订单2。


拿的顺序是没毛病了，但关键是**先拿到不代表先消费完它**。会存在虽然你消费者1先拿到北京订单1，但由于网络等原因，消费者2比你真正的先消费消息。这是不是很尴尬了。


这里解决就用到了分布式锁：
**​ Rocker采用的是分段锁，它不是锁整个Broker而是锁里面的单个Queue**，因为只要锁单个Queue就可以保证局部顺序消费了。
所以最终的消费者这边的逻辑就是这样：
- 消费者1去Queue拿 订单生成，它就锁住了整个Queue，只有它消费完成并返回成功后，这个锁才会释放。
- 然后下一个消费者去拿到 订单支付 同样锁住当前Queue,这样的一个过程来真正保证对同一个Queue能够真正意义上的顺序消费，而不仅仅是顺序取出。

##  消息类型对比
![在这里插入图片描述](https://img-blog.csdnimg.cn/1789641aeea048d9930f9bf77e066df2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**发送方式对比**
![在这里插入图片描述](https://img-blog.csdnimg.cn/a6e074e30ad1457eaab3f46a6f050e9a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 注意事项
1. 顺序消息暂不支持广播模式。
2. 顺序消息不支持异步发送方式，否则将无法严格保证顺序。
3. 建议同一个 Group ID 只对应一种类型的 Topic，即不同时用于顺序消息和无序消息的收发。
4. 对于全局顺序消息，建议创建broker个数 >=2。


# 代码示例
主要实现两点：
1. 生产端 同一orderID的订单放到同一个queue。
2. 消费端 同一个queue取出消息的时候锁住整个queue,直到消费后再解锁。

##  实体类
```java
public class ProductOrder {
    private String orderId;
    private String orderName;

    public ProductOrder(String orderId, String orderName) {
        this.orderId = orderId;
        this.orderName = orderName;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderName() {
        return orderName;
    }

    public void setOrderName(String orderName) {
        this.orderName = orderName;
    }
}
```

## Product（生产者）
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
        producer.setNamesrvAddr("127.0.0.1:9876");
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

            //发送消息并返回结果
            SendResult sendResult = producer.send(message, new MessageQueueSelector() {
                @Override
                /**
                 * hash队列选择，简化来说就是用index%一个 固定的值，使得同一tag的消息能发送到同一个queue
                 */
                public MessageQueue select(List<MessageQueue> mqs, Message msg, Object args) {
                    //arg的值其实就是下面传入 orderId
                    String orderid = (String) args;
                    //因为订单是String类型，所以通过hashCode转成int类型
                    int hashCode = orderid.hashCode();
                    //因为hashCode可能为负数 所以取绝对值
                    hashCode = Math.abs(hashCode);
                    //保证同一个订单号 一定分配在同一个queue上
                    long index = hashCode % mqs.size();
                    //根据索引选择不同的队列
                    return mqs.get((int) index);
                }
            }, order.getOrderId());

            System.out.println("product: 发送状态:" + sendResult.getSendStatus() + ",存储queue:" + sendResult.getMessageQueue().getQueueId() + ",orderID:" + order.getOrderId() + ",type:" + order.getOrderName());
        }

        // 一旦生产者实例不再被使用则将其关闭，包括清理资源，关闭网络连接等
        producer.shutdown();
    }
}
```

## Consumer（消费者）
上面说过，消费者真正要达到消费顺序，需要分布式锁，所以这里需要用`MessageListenerOrderly`替换之前的`MessageListenerConcurrently`，因为它里面实现了分布式锁。
```java
public class OrderConsumer {
    private static final Random random = new Random();

    public static void main(String[] args) throws Exception {
        //创建一个消息消费者，并设置一个消息消费者组
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("rocket_test_consumer_group");
        //指定 NameServer 地址
        consumer.setNamesrvAddr("127.0.0.1:9876");
        //设置 Consumer 第一次启动时从队列头部开始消费还是队列尾部开始消费
        consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
        //订阅指定 Topic 下的所有消息
        consumer.subscribe("topicTest", "*");

        //注册消费的监听 这里注意顺序消费为MessageListenerOrderly 之前并发为ConsumeConcurrentlyContext
        consumer.registerMessageListener(new MessageListenerOrderly() {
            public ConsumeOrderlyStatus consumeMessage(List<MessageExt> list, ConsumeOrderlyContext context) {
                //默认 list 里只有一条消息，可以通过设置参数来批量接收消息
                if (list != null) {
                    for (MessageExt ext : list) {
                        try {
                            try {
                                //模拟业务逻辑处理中...
                                TimeUnit.SECONDS.sleep(random.nextInt(10));
                            } catch (Exception e) {
                                e.printStackTrace();
                            }

                            //获取接收到的消息
                            String message = new String(ext.getBody(), RemotingHelper.DEFAULT_CHARSET);
                            //获取队列ID
                            int queueId = context.getMessageQueue().getQueueId();
                            //打印消息
                            System.out.println("Consumer-线程名称=[" + Thread.currentThread().getId() + "],接收queueId:[" + queueId + "],接收时间:[" + new Date().getTime() + "],消息=[" + message + "]");

                        } catch (UnsupportedEncodingException e) {
                            e.printStackTrace();
                        }
                    }
                }
                //消费成功提交偏移量
                return ConsumeOrderlyStatus.SUCCESS;
            }
        });

        // 消费者对象在使用之前必须要调用 start 初始化
        consumer.start();
        System.out.println("消息消费者已启动");
    }
}
```


## 测试
### 生产者发送消息
看看生产者有没有把相同订单指定到同一个queue
![在这里插入图片描述](https://img-blog.csdnimg.cn/058826f526684856b495a7838bbe31c0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
通过测试结果可以看出：相同订单已经存到同一queue中了。

## 消费者消费消息
**单消费者**
看看消费结果是不是我们需要的结果
![在这里插入图片描述](https://img-blog.csdnimg.cn/545924aa3a4a47e4a3d6312c23b885f4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
MessageListenerOrderly能够保证顺序消费，从图中我们也看到了期望的结果。


**消费异常**
如果出现消费异常返回`ConsumeOrderlyStatus.SUSPEND_CURRENT_QUEUE_A_MOMENT`后面的消息将无法消费。


**多消费者**
如果启动2个消费者: 那么其中一个消费者对应消费2个队列，另一个消费者对应消费剩下的1个队列。
>因为


如果启动3个消费者: 那么每个消费者都对应消费1个队列，订单号就区分开了。输出变为这样：
![在这里插入图片描述](https://img-blog.csdnimg.cn/b2eb083bf119429786d574dd1846aeca.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/cd7c709b68624efa839c898ab65f291f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/bba554c0893543258a2e5380543e6715.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)