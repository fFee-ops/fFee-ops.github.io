---
title: SpringBoot整合RocketMQ
date: 2022-01-31 22:12:17
tags:
password:
categories: RocketMQ
---

## 0. 启动Name Server与 Broker

## 1. 引入依赖
添加 RocketMQ 客户端访问支持，具体版本和安装的 RocketMQ 版本一致即可。
```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-client</artifactId>
    <version>4.7.1</version>
</dependency>
```
## 2. 消息生产者
```java
public class Producer {

    public static void main(String[] args) throws Exception {
        //创建一个消息生产者，并设置一个消息生产者组
        DefaultMQProducer producer = new DefaultMQProducer("rocket_test_consumer_group");

        //指定 NameServer 地址
        producer.setNamesrvAddr("127.0.0.1:9876");
		//指定最大超时时间，用默认的会报错
		producer.setSendMsgTimeout(60000);
        //初始化 Producer，整个应用生命周期内只需要初始化一次
        producer.start();

        for (int i = 0; i < 100; i++) {
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

            System.out.printf("%s%n", sendResult);
        }

        // 一旦生产者实例不再被使用则将其关闭，包括清理资源，关闭网络连接等
        producer.shutdown();
    }
}
```

使用`DefaultMQProducer `类来创建了一个消息生产者，该类构造函数入参 producerGroup 是消息生产者组的名字，无论生产者还是消费者都必须给出 GroupName ，并保证该名字的唯一性。

接下来指定 NameServer 地址和调用 start 方法初始化，在整个应用生命周期内只需要调用一次 start 方法。

初始化完成后，调用 send 方法发送消息，示例中只是简单的构造了100条同样的消息发送，其实一个 Producer 对象可以发送多个主题多个标签的消息，消息对象的标签可以为空。send 方法是同步调用，只要不抛异常就标识成功。

最后应用退出时调用 shutdown 方法清理资源、关闭网络连接，从服务器上注销自己，通常建议应用在 JBOSS、Tomcat 等容器的退出钩子里调用 shutdown 方法。

## 3. 消息消费者
```java
public class Consumer {

    public static void main(String[] args) throws Exception {
        //创建一个消息消费者，并设置一个消息消费者组
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("rocket_test_consumer_group");
        //指定 NameServer 地址
        consumer.setNamesrvAddr("127.0.0.1:9876");
        //设置 Consumer 第一次启动时从队列头部开始消费还是队列尾部开始消费
        consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
        //订阅指定 Topic 下的所有消息
        consumer.subscribe("topicTest", "*");

        //注册消息监听器
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext context) {
                //默认 list 里只有一条消息，可以通过设置参数来批量接收消息
                if (list != null) {
                    for (MessageExt ext : list) {
                        try {
                            System.out.println(new Date() + new String(ext.getBody(), RemotingHelper.DEFAULT_CHARSET));
                        } catch (UnsupportedEncodingException e) {
                            e.printStackTrace();
                        }
                    }
                }
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });

        // 消费者对象在使用之前必须要调用 start 初始化
        consumer.start();
        System.out.println("消息消费者已启动");
    }
}
```
用 DefaultMQPushConsumer 类来创建一个消息消费者,该类构造函数入参 consumerGroup 是消息消费者组的名字，需要保证该名字的唯一性。

​ 接下来指定 NameServer 地址和设置消费者应用程序第一次启动时从队列头部开始消费还是队列尾部开始消费。

 接着调用 subscribe 方法给消费者对象订阅指定主题下的消息，该方法第一个参数是主题名，第二个参数是标签名，示例表示订阅了主题名 `topic_example_java `下所有标签的消息。

最主要的是注册消息监听器才能消费消息，示例中用的是` Consumer Push `的方式，即设置监听器回调的方式消费消息，默认监听回调方法中 `List<MessageExt> `里只有一条消息，可以通过设置参数来批量接收消息。

​ 最后调用 start 方法初始化，在整个应用生命周期内只需要调用一次 start 方法。

## 4. 测试
先来运行生产者
![在这里插入图片描述](https://img-blog.csdnimg.cn/d79c553ac3c24237a33ef54185ceaf75.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
再运行消费者
![在这里插入图片描述](https://img-blog.csdnimg.cn/d0085da450894d87999c3206b5215483.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)