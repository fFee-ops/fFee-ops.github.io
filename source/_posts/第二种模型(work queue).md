---
title: 第二种模型(work queue)
date: 2020-10-13 13:49:25
tags: 
categories: RabbitMQ
---

<!--more-->

### 第二种模型\< work queue >

- [开发生产者](#_10)
- [开发消费者-1](#1_31)
- [开发消费者-2](#2_57)
- [消息自动确认机制](#_92)

> Work queues，也被称为（Task queues），任务模型。当消息处理比较耗时的时候，可能生产消息的速度会远远大于消息的消费速度。长此以往，消息就会堆积越来越多，无法及时处理。此时就可以使用work 模型：让多个消费者绑定到一个队列，共同消费队列中的消息。队列中的消息一旦消费，就会消失，因此任务是不会被重复执行的。  
> 角色：

- P：生产者：任务的发布者
- C1：消费者-1，领取任务并且完成任务，假设完成速度快
- C2：消费者-2：领取任务并完成任务，假设完成速度较慢  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201013133700497.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 开发生产者

```java
public class Work_Provider {
    public static void main(String[] args) throws IOException {
        Connection connection = RabbitMqUtils.getConnection();
//        获取通道对象
        Channel channel=connection.createChannel();

//        绑定队列
        channel.queueDeclare("work",true,false,false,null);
        for (int i = 0; i < 10; i++) {
//            MessageProperties.MINIMAL_PERSISTENT_BASIC让消息持久化
            channel.basicPublish("", "work", MessageProperties.MINIMAL_PERSISTENT_BASIC, (i+"====>:我是消息").getBytes());
        }

        RabbitMqUtils.close(channel,connection);
    }
}

```

# 开发消费者-1

```java
public class Work_Consumer {

    public static void main(String[] args) throws IOException {

        //使用工具类创建连接
        Connection connection = RabbitMqUtils.getConnection();

        Channel channel=connection.createChannel();
        channel.queueDeclare("work",true,false,false,null);
//消费者一次只接受一条未确认的消息
        channel.basicQos(1);

        channel.basicConsume("work",false,new DefaultConsumer(channel){//autoAck：false关闭自动提交
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                System.out.println("=====消费者1："+new String(body));
                channel.basicAck(envelope.getDeliveryTag(),false);//手动确认消息
            }
        });

    }
}
```

# 开发消费者-2

```java
 public static void main(String[] args) throws IOException {

        //使用工具类创建连接
        Connection connection = RabbitMqUtils.getConnection();

        Channel channel=connection.createChannel();
        channel.queueDeclare("work",true,false,false,null);

        channel.basicQos(1);

        channel.basicConsume("work",false,new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                try {
                    Thread.sleep(1000);//模拟处理消息比较慢 1S处理一个消息
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("=====消费者2："+new String(body));
                channel.basicAck(envelope.getDeliveryTag(),false);//参数2：是否开启多个消息同时确认
            }
        });

    }
}

```

---

默认情况下，RabbitMQ将按顺序将每个消息发送给下一个使用者。平均而言，每个消费者都会收到相同数量的消息。这种分发消息的方式称为循环。  
要实现能者多劳的模式，就要开启channel.basicQos\(1\);然后关闭自动确认，这样每次两个消费者都只从队列中拿一个，处理速度快的处理完了马上就去拿第二个。这样就实现了能者多劳

# 消息自动确认机制

> Doing a task can take a few seconds. You may wonder what happens if one of the consumers starts a long task and dies with it only partly done. With our current code, once RabbitMQ delivers a message to the consumer it immediately marks it for deletion. In this case, if you kill a worker we will lose the message it was just processing. We’ll also lose all the messages that were dispatched to this particular worker but were not yet handled.  
>   
> But we don’t want to lose any tasks. If a worker dies, we’d like the task to be delivered to another worker.

```java
channel.basicQos(1);//一次只接受一条未确认的消息
//参数2:关闭自动确认消息
channel.basicConsume("hello",false,new DefaultConsumer(channel){
  @Override
  public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
    System.out.println("消费者1: "+new String(body));
    channel.basicAck(envelope.getDeliveryTag(),false);//手动确认消息
  }
});
```

- 设置通道一次只能消费一个消息
- 关闭消息的自动确认,开启手动确认消息