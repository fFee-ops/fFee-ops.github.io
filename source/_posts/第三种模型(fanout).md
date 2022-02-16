---
title: 第三种模型(fanout)
date: 2020-10-14 11:02:18
tags: 
categories: RabbitMQ
---

<!--more-->

### 第三种模型\< fanout >

- [开发生产者](#_14)
- [开发消费者1](#1_36)
- [开发消费者2](#2_75)
- [开发消费者3](#3_113)
- [结果](#_153)

  
fanout 扇出 也称为广播

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201014105852108.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
在广播模式下，消息发送流程是这样的：

- 可以有多个消费者
- 每个消费者有自己的queue（队列）
- 每个队列都要绑定到Exchange（交换机）
- 生产者发送的消息，只能发送到交换机，交换机来决定要发给哪个队列，生产者无法决定。
- 交换机把消息发送给绑定过的所有队列
- 队列的消费者都能拿到消息。实现一条消息被多个消费者消费

# 开发生产者

```java

public class Provider {
    public static void main(String[] args) throws IOException {
//        获取连接对象
        Connection connection = RabbitMqUtils.getConnection();
//        获取通道
        Channel channel=connection.createChannel();

//        用通道声明指定交换机。 参数1：交换机名称 参数2：交换机类型
        channel.exchangeDeclare("logs","fanout");

//        发送消息
        channel.basicPublish("logs","",null,"Test fanout".getBytes());

//        释放资源
        RabbitMqUtils.close(channel,connection);
    }
}

```

# 开发消费者1

```java
package cn.duck.fanout;

import cn.duck.Utils.RabbitMqUtils;
import com.rabbitmq.client.*;

import java.io.IOException;

public class Consumer1 {
    public static void main(String[] args) throws IOException {

    //        获取连接对象
    Connection connection = RabbitMqUtils.getConnection();
    //        获取通道
    Channel channel=connection.createChannel();

//    通道绑定交换机
        channel.exchangeDeclare("logs","fanout");

//        临时队列
        String TempQueueName = channel.queueDeclare().getQueue();

//        绑定交换机和临时队列
        channel.queueBind(TempQueueName,"logs","");

//        消费消息
        channel.basicConsume(TempQueueName,true,new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                System.out.println("消费者1："+new String(body));

            }
        });
    }
}

```

# 开发消费者2

```java
package cn.duck.fanout;

import cn.duck.Utils.RabbitMqUtils;
import com.rabbitmq.client.*;

import java.io.IOException;

public class Consumer2 {
    public static void main(String[] args) throws IOException {

    //        获取连接对象
    Connection connection = RabbitMqUtils.getConnection();
    //        获取通道
    Channel channel=connection.createChannel();

//    通道绑定交换机
        channel.exchangeDeclare("logs","fanout");

//        临时队列
        String TempQueueName = channel.queueDeclare().getQueue();

//        绑定交换机和临时队列
        channel.queueBind(TempQueueName,"logs","");

//        消费消息
        channel.basicConsume(TempQueueName,true,new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                System.out.println("消费者2："+new String(body));

            }
        });
    }
}

```

# 开发消费者3

```java
package cn.duck.fanout;

import cn.duck.Utils.RabbitMqUtils;
import com.rabbitmq.client.*;

import java.io.IOException;

public class Consumer3 {
    public static void main(String[] args) throws IOException {

    //        获取连接对象
    Connection connection = RabbitMqUtils.getConnection();
    //        获取通道
    Channel channel=connection.createChannel();

//    通道绑定交换机
        channel.exchangeDeclare("logs","fanout");

//        临时队列
        String TempQueueName = channel.queueDeclare().getQueue();

//        绑定交换机和临时队列
        channel.queueBind(TempQueueName,"logs","");

//        消费消息
        channel.basicConsume(TempQueueName,true,new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                System.out.println("消费者3："+new String(body));

            }
        });
    }
}

```

# 结果

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201014110156669.png#pic_center)  
三个消费者都能拿到生产者生产的消息。