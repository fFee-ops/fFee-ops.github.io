---
title: SpringBoot中使用RabbitMQ
date: 2020-10-14 14:38:01
tags: 
categories: RabbitMQ
---

<!--more-->



### SpringBoot中使用RabbitMQ

# 整合
## 添加RabbitMQ依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

## 配置application.yml
```yml
spring:
  rabbitmq:
    host: 127.0.0.1
    port: 5672
    username: test
    password: 123456
#    virtual-host: /
```
## 新建RabbitConfig
```java

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


/**
 * 类功能描述：<br>
 * Broker:它提供一种传输服务,它的角色就是维护一条从生产者到消费者的路线，保证数据能按照指定的方式进行传输,
 * Exchange：消息交换机,它指定消息按什么规则,路由到哪个队列。
 * Queue:消息的载体,每个消息都会被投到一个或多个队列。
 * Binding:绑定，它的作用就是把exchange和queue按照路由规则绑定起来.
 * Routing Key:路由关键字,exchange根据这个关键字进行消息投递。
 * vhost:虚拟主机,一个broker里可以有多个vhost，用作不同用户的权限分离。
 * Producer:消息生产者,就是投递消息的程序.
 * Consumer:消息消费者,就是接受消息的程序.
 * Channel:消息通道,在客户端的每个连接里,可建立多个channel.
 * <ul>
 * <li>类功能描述1<br>
 * <li>类功能描述2<br>
 * <li>类功能描述3<br>
 * </ul>
 * 修改记录：<br>
 * <ul>
 * <li>修改记录描述1<br>
 * <li>修改记录描述2<br>
 * <li>修改记录描述3<br>
 * </ul>
 */
@Configuration
public class RabbitConfig {
    //扇形交换器类型
    public static final String FANOUT_TYPE = "FANOUT";
    //扇形交换器测试队列
    public static final String FANOUT_QUEUE_NAME = "test_fanout_queue";
    public static final String FANOUT_QUEUE_NAME1 = "test_fanout_queue1";
    //扇形交换器
    public static final String TEST_FANOUT_EXCHANGE = "testFanoutExchange";

    //直接交换器类型
    public static final String DIRECT_TYPE = "DIRECT";
    //直接交换器测试队列
    public static final String DIRECT_QUEUE_NAME = "test_direct_queue";
    //直接交换器
    public static final String TEST_DIRECT_EXCHANGE = "testDirectExchange";
    //直接交换器ROUTINGKEY
    public static final String DIRECT_ROUTINGKEY = "test";

    //主题交换器类型
    public static final String TOPIC_TYPE = "TOPIC";
    //主题交换器队列
    public static final String TOPIC_QUEUE_NAME = "test_topic_queue";
    public static final String TOPIC_QUEUE_NAME1 = "test_topic_queue1";
    //主题交换器
    public static final String TEST_TOPIC_EXCHANGE = "testTopicExchange";
    //主题交换器ROUTINGKEY
    public static final String TOPIC_ROUTINGKEY = "test.#";

    //创建扇形交换器测试队列
    @Bean
    public Queue createFanoutQueue() {
        return new Queue(FANOUT_QUEUE_NAME);
    }

    //创建扇形交换器测试队列1
    @Bean
    public Queue createFanoutQueue1() {
        return new Queue(FANOUT_QUEUE_NAME1);
    }

    //创建直接交换器测试队列
    @Bean
    public Queue createDirectQueue() {
        return new Queue(DIRECT_QUEUE_NAME);
    }

    //创建主题交换器测试队列
    @Bean
    public Queue createTopicQueue() {
        return new Queue(TOPIC_QUEUE_NAME);
    }

    //创建主题交换器测试队列1
    @Bean
    public Queue createTopicQueue1() {
        return new Queue(TOPIC_QUEUE_NAME1);
    }

    //创建扇形交换器
    @Bean
    public FanoutExchange defFanoutExchange() {
        return new FanoutExchange(TEST_FANOUT_EXCHANGE);
    }

    //扇形交换器和扇形队列绑定
    @Bean
    Binding bindingFanout() {
        return BindingBuilder.bind(createFanoutQueue()).
                to(defFanoutExchange());
    }

    //扇形交换器和扇形队列绑定
    @Bean
    Binding bindingFanout1() {
        return BindingBuilder.bind(createFanoutQueue1()).
                to(defFanoutExchange());
    }

    //创建直接交换器
    @Bean
    DirectExchange directExchange() {
        return new DirectExchange(TEST_DIRECT_EXCHANGE);
    }

    //直接交换器和直接队列绑定
    @Bean
    Binding bindingDirect() {
        return BindingBuilder.bind(createDirectQueue()).
                to(directExchange()).
                with(DIRECT_ROUTINGKEY);
    }

    //创建主题交换器
    @Bean
    TopicExchange defTopicExchange() {
        return new TopicExchange(TEST_TOPIC_EXCHANGE);
    }

    //主题交换器和主题队列绑定
    @Bean
    Binding bindingTopic() {
        return BindingBuilder.bind(createTopicQueue()).
                to(defTopicExchange()).
                with(TOPIC_ROUTINGKEY);
    }

    //主题交换器和主题队列绑定
    @Bean
    Binding bindingTopic1() {
        return BindingBuilder.bind(createTopicQueue1()).
                to(defTopicExchange()).
                with(TOPIC_ROUTINGKEY);
    }
}
```
## 新建生产者(producer)
```java
import com.heima.rabbitmq.config.RabbitConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class MsgProducer {

    //使用RabbitTemplate进行操作
    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * 向扇形交换器发送数据
     *
     * @param routingKey
     * @param massage
     */
    public void send2FanoutTestQueue(String routingKey, String massage) {
        rabbitTemplate.convertAndSend(RabbitConfig.TEST_FANOUT_EXCHANGE,
                routingKey, massage);
    }

    /**
     * 向直接交换器发送数据
     *
     * @param routingKey
     * @param massage
     */
    public void send2DirectTestQueue(String routingKey, String massage) {
        rabbitTemplate.convertAndSend(RabbitConfig.TEST_DIRECT_EXCHANGE,
                routingKey, massage);
    }

    /**
     * 向主题交换器发送数据
     *
     * @param routingKey
     * @param massage
     */
    public void send2TopicTestAQueue(String routingKey, String massage) {
        rabbitTemplate.convertAndSend(RabbitConfig.TEST_TOPIC_EXCHANGE,
                routingKey, massage);
    }
    
}
```

##  新建消费者(consumer)
```java
import com.heima.rabbitmq.config.RabbitConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.*;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class MsgConsumer {

    private static final Logger logger = LoggerFactory.getLogger(MsgConsumer.class);

    /**
     * 监听扇形测试队列数据
     * @param massage
     */
    @RabbitListener(
            bindings =
                    {
                            @QueueBinding(value = @Queue(value = RabbitConfig.FANOUT_QUEUE_NAME, durable = "true"),
                                    exchange = @Exchange(value = RabbitConfig.TEST_FANOUT_EXCHANGE, type = "fanout"))
                    })
    @RabbitHandler
    public void processFanoutMsg(Message massage) {
        String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
        logger.info("接收到FANOUT消息 : " + msg);
    }

    /**
     * 监听扇形测试队列1数据
     * @param massage
     */
    @RabbitListener(
            bindings =
                    {
                            @QueueBinding(value = @Queue(value = RabbitConfig.FANOUT_QUEUE_NAME1, durable = "true"),
                                    exchange = @Exchange(value = RabbitConfig.TEST_FANOUT_EXCHANGE, type = "fanout"))
                    })
    @RabbitHandler
    public void processFanout1Msg(Message massage) {
        String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
        logger.info("接收到FANOUT1消息 : " + msg);
    }

    /**
     * 监听直接测试队列数据
     * @param massage
     */
    @RabbitListener(
            bindings =
                    {
                            @QueueBinding(value = @Queue(value = RabbitConfig.DIRECT_QUEUE_NAME, durable = "true"),
                                    exchange = @Exchange(value = RabbitConfig.TEST_DIRECT_EXCHANGE),
                                    key = RabbitConfig.DIRECT_ROUTINGKEY)
                    })
    @RabbitHandler
    public void processDirectMsg(Message massage) {
        String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
        logger.info("接收到DIRECT消息 : " + msg);
    }

    /**
     * 监听主题测试队列数据
     * @param massage
     */
    @RabbitListener(
            bindings =
                    {
                            @QueueBinding(value = @Queue(value = RabbitConfig.TOPIC_QUEUE_NAME, durable = "true"),
                                    exchange = @Exchange(value = RabbitConfig.TEST_TOPIC_EXCHANGE, type = "topic"),
                                    key = RabbitConfig.TOPIC_ROUTINGKEY)
                    })
    @RabbitHandler
    public void processTopicMsg(Message massage) {
        String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
        logger.info("接收到TOPIC消息 : " + msg);
    }

    /**
     * 监听主题测试1队列数据
     * @param massage
     */
    @RabbitListener(
            bindings =
                    {
                            @QueueBinding(value = @Queue(value = RabbitConfig.TOPIC_QUEUE_NAME1, durable = "true"),
                                    exchange = @Exchange(value = RabbitConfig.TEST_TOPIC_EXCHANGE, type = "topic"),
                                    key = RabbitConfig.TOPIC_ROUTINGKEY)
                    })
    @RabbitHandler
    public void processTopic1Msg(Message massage) {
        String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
        logger.info("接收到TOPIC1消息 : " + msg);
    }

}
```


## 编写controller测试
```java
@RestController
@RequestMapping("/rabbitmq")
public class RabbitmqController {

    @Autowired
    private MsgProducer msgProducer;

    /**
     * 发送测试数据
     *
     * @param type       交换器类型
     * @param routingKey
     * @param message
     * @return
     */
    @RequestMapping("/send")
    public String send(String type, String routingKey, String message) {

        if (RabbitConfig.DIRECT_TYPE.equals(type)) {
            //发送直接交换器
            msgProducer.send2DirectTestQueue(routingKey, message);
        } else if (RabbitConfig.TOPIC_TYPE.equals(type)) {
            //发送主题交换器
            msgProducer.send2TopicTestAQueue(routingKey, message);
        } else if (RabbitConfig.FANOUT_TYPE.equals(type)) {
            //发送扇形交换器
            msgProducer.send2FanoutTestQueue(routingKey, message);
        }
        return "OK";
    }
}
```

# 测试
## 直接交换器测试
### 单队列绑定
绑定代码(在`RabbitConfig`中写的)
```java
//创建直接交换器测试队列
@Bean
public Queue createDirectQueue() {
    return new Queue("test_direct_queue");
}
//创建直接交换器
@Bean
DirectExchange directExchange() {
    return new DirectExchange("testDirectExchange");
}
//直接交换器和直接队列绑定
@Bean
Binding bindingDirect() {
    return BindingBuilder.bind(createDirectQueue()).
        to(directExchange()).
        with("test");
}
```

postman发送测试请求
```
http://127.0.0.1:8080/rabbitmq/send?type=DIRECT&routingKey=test&message=测试直接交换器
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c968e4016ad545029152b732ccb10752.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
```
2020-08-28 10:36:27.014  INFO 16164 --- [ntContainer#0-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到DIRECT消息 : 测试直接交换器
```
### 多队列绑定不同主题
我们正在用的广播模式的交换器并不够灵活，它只是不加思索地进行广播。因此，需要使用direct exchange来代替。直连交换器的路由算法非常简单：将消息推送到binding key与该消息的routing key相同的队列。
![在这里插入图片描述](https://img-blog.csdnimg.cn/44c326fc940d4d55a927a757638801c2.png)
在该图中，直连交换器X上绑定了两个队列。第一个队列绑定了绑定键orange，第二个队列有两个绑定键：black和green。在这种场景下，一个消息在布时指定了路由键为orange将会只被路由到队列Q1，路由键为black和green的消息都将被路由到队列Q2。其他的消息都将被丢失。

绑定代码
```java
//创建直接交换器测试队列
@Bean
public Queue createDirectQueue() {
    return new Queue("test_direct_queue");
}

//创建直接交换器测试队列1
@Bean
public Queue createDirectQueue1() {
    return new Queue("test_direct_queue1");
}

//创建直接交换器
@Bean
DirectExchange directExchange() {
    return new DirectExchange("testDirectExchange");
}

//直接交换器和直接队列绑定
@Bean
Binding bindingDirectOrange() {
    return BindingBuilder.bind(createDirectQueue()).
        to(directExchange()).
        with("orange");
}

//直接交换器和直接队列绑定
@Bean
Binding bindingDirectBlack() {
    return BindingBuilder.bind(createDirectQueue1()).
        to(directExchange()).
        with("black");
}

//直接交换器和直接队列绑定
@Bean
Binding bindingDirectGreen() {
    return BindingBuilder.bind(createDirectQueue1()).
        to(directExchange()).
        with("green");
}

/**
 * 监听直接测试队列数据
 *
 * @param massage
 */
@RabbitListener(
    bindings =
    {
        @QueueBinding(value = @Queue(value = "test_direct_queue", durable = "true"),
                      exchange = @Exchange(value = "testDirectExchange"))
    })
@RabbitHandler
public void processDirectMsg(Message massage) {
    String routingkey = massage.getMessageProperties().getReceivedRoutingKey();
    String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
    logger.info("接收到direct消息,ROUTINGKEY:{},message: {}", routingkey, msg);
}


/**
 * 监听直接测试队列数据
 *
 * @param massage
 */
@RabbitListener(
    bindings =
    {
        @QueueBinding(value = @Queue(value = "test_direct_queue1", durable = "true"),
                      exchange = @Exchange(value = "testDirectExchange"))
    })
@RabbitHandler
public void processDirectMsg1(Message massage) {
    String routingkey = massage.getMessageProperties().getReceivedRoutingKey();
    String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
    logger.info("接收到direct1消息,ROUTINGKEY:{},message: {}", routingkey, msg);
}
```

postman测试
```
http://127.0.0.1:8080/rabbitmq/send?type=DIRECT&routingKey=orange&message=测试直接交换器orange
http://127.0.0.1:8080/rabbitmq/send?type=DIRECT&routingKey=black&message=测试直接交换器black
http://127.0.0.1:8080/rabbitmq/send?type=DIRECT&routingKey=green&message=测试直接交换器green
```


```
2020-08-28 11:10:28.684  INFO 8284 --- [ntContainer#3-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到direct消息,ROUTINGKEY:orange,message: 测试直接交换器orange
2020-08-28 11:10:52.903  INFO 8284 --- [ntContainer#5-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到direct1消息,ROUTINGKEY:black,message: 测试直接交换器black
2020-08-28 11:11:14.820  INFO 8284 --- [ntContainer#5-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到direct1消息,ROUTINGKEY:green,message: 测试直接交换器green
```

### 多队列绑定相同主题
同一个绑定键可以绑定到不同的队列上去，在下图中，我们也可以增加一个交换器X与队列Q2的绑定键，在这种情况下，直连交换器将会和广播交换器有着相同的行为，将消息推送到所有匹配的队列。一个路由键为black的消息将会同时被推送到队列Q1和Q2。
![在这里插入图片描述](https://img-blog.csdnimg.cn/2016b8d976ac40f4869cc37c28651a2d.png)
绑定代码
```java
//创建直接交换器测试队列
@Bean
public Queue createDirectQueue() {
    return new Queue("test_direct_queue");
}

//创建直接交换器测试队列1
@Bean
public Queue createDirectQueue1() {
    return new Queue("test_direct_queue1");
}

//创建直接交换器
@Bean
DirectExchange directExchange() {
    return new DirectExchange("testDirectExchange");
}
//直接交换器和直接队列绑定
@Bean
Binding bindingDirectBlack() {
    return BindingBuilder.bind(createDirectQueue()).
        to(directExchange()).
        with("black");
}

//直接交换器和直接队列绑定
@Bean
Binding bindingDirectBlack1() {
    return BindingBuilder.bind(createDirectQueue1()).
        to(directExchange()).
        with("black");
}


/**
 * 监听直接测试队列数据
 *
 * @param massage
 */
@RabbitListener(
    bindings =
    {
        @QueueBinding(value = @Queue(value = "test_direct_queue", durable = "true"),
                      exchange = @Exchange(value = "testDirectExchange"))
    })
@RabbitHandler
public void processDirectMsg(Message massage) {
    String routingkey = massage.getMessageProperties().getReceivedRoutingKey();
    String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
    logger.info("接收到direct消息,ROUTINGKEY:{},message: {}", routingkey, msg);
}


/**
 * 监听直接测试队列数据
 *
 * @param massage
 */
@RabbitListener(
    bindings =
    {
        @QueueBinding(value = @Queue(value = "test_direct_queue1", durable = "true"),
                      exchange = @Exchange(value = "testDirectExchange"))
    })
@RabbitHandler
public void processDirectMsg1(Message massage) {
    String routingkey = massage.getMessageProperties().getReceivedRoutingKey();
    String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
    logger.info("接收到direct1消息,ROUTINGKEY:{},message: {}", routingkey, msg);
}
```
postman测试
```
http://127.0.0.1:8080/rabbitmq/send?type=DIRECT&routingKey=black&message=测试直接交换器black
```

```
2020-08-28 11:18:00.069  INFO 5904 --- [ntContainer#2-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到direct消息,ROUTINGKEY:black,message: 测试直接交换器black
2020-08-28 11:18:00.069  INFO 5904 --- [ntContainer#1-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到direct1消息,ROUTINGKEY:black,message: 测试直接交换器black
```

## 扇形交换器测试
​ 扇形交换机是最基本的交换机类型，它所能做的事情非常简单———广播消息。扇形交换机会把能接收到的消息全部发送给绑定在自己身上的队列。因为广播不需要“思考”，所以扇形交换机处理消息的速度也是所有的交换机类型里面最快的。

绑定代码
```java
//创建扇形交换器测试队列
@Bean
public Queue createFanoutQueue() {
    return new Queue("test_fanout_queue");
}

//创建扇形交换器测试队列1
@Bean
public Queue createFanoutQueue1() {
    return new Queue("test_fanout_queue1");
}

//创建扇形交换器
@Bean
public FanoutExchange defFanoutExchange() {
    return new FanoutExchange("testFanoutExchange");
}

//扇形交换器和扇形队列绑定
@Bean
Binding bindingFanout() {
    return BindingBuilder.bind(createFanoutQueue()).
        to(defFanoutExchange());
}

//扇形交换器和扇形队列绑定
@Bean
Binding bindingFanout1() {
    return BindingBuilder.bind(createFanoutQueue1()).
        to(defFanoutExchange());
}

/**
 * 监听扇形测试队列数据
 *
 * @param massage
 */
@RabbitListener(
    bindings =
    {
        @QueueBinding(value = @Queue(value = "test_fanout_queue", durable = "true"),
                      exchange = @Exchange(value = "testFanoutExchange", type = "fanout"))
    })
@RabbitHandler
public void processFanoutMsg(Message massage) {
    String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
    logger.info("接收到FANOUT消息 : " + msg);
}

/**
 * 监听扇形测试队列1数据
 *
 * @param massage
 */
@RabbitListener(
    bindings =
    {
        @QueueBinding(value = @Queue(value = "test_fanout_queue1", durable = "true"),
                      exchange = @Exchange(value = "testFanoutExchange", type = "fanout"))
    })
@RabbitHandler
public void processFanout1Msg(Message massage) {
    String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
    logger.info("接收到FANOUT1消息 : " + msg);
}
```

postman测试
```
http://127.0.0.1:8080/rabbitmq/send?type=FANOUT&routingKey=anykey&message=测试扇形交换器
```

```
2020-08-28 13:46:54.391  INFO 17556 --- [ntContainer#1-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到FANOUT1消息 : 测试扇形交换器
2020-08-28 13:46:54.391  INFO 17556 --- [ntContainer#5-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到FANOUT消息 : 测试扇形交换器
```


## 主题交换器测试
发送到主题交换器的消息不能有任意的routing key，必须是由点号分开的一串单词，这些单词可以是任意的，但通常是与消息相关的一些特征。比如以下是几个有效的routing key： “stock.usd.nyse”, “nyse.vmw”,“quick.orange.rabbit”，routing key的单词可以有很多，最大限制是255 bytes。

binding key必须与routing key模式一样。Topic交换器的逻辑与direct交换器有点相似：使用特定路由键发送的消息将被发送到所有使用匹配绑定键绑定的队列，然而，绑定键有两个特殊的情况，如下：

1.  `* `表示匹配任意一个单词
2.  `# `表示匹配任意一个或多个单词

![在这里插入图片描述](https://img-blog.csdnimg.cn/2d80f7ab27324e639c2c87db99ac289c.png)
在这个例子中，我们将发送所有跟动物有关的消息，这些消息将会发送到由三个单词，两个点号组成的routing key，第一个单词了表示的是速度，第二个单词表示颜色，第三个单词表示种类：

`“<speed>.<colour>.<species>”`。

我们创建三个绑定关系：队列Q1绑定到绑定键*.orange.* ，队列Q2绑定到*.*.rabbit和lazy.#。

绑定代码
```java
//创建主题交换器测试队列
@Bean
public Queue createTopicQueue() {
    return new Queue("test_topic_queue");
}

//创建主题交换器测试队列1
@Bean
public Queue createTopicQueue1() {
    return new Queue("test_topic_queue1");
}

//创建主题交换器
@Bean
TopicExchange defTopicExchange() {
    return new TopicExchange("testTopicExchange");
}

//主题交换器和主题队列绑定
@Bean
Binding bindingTopic() {
    return BindingBuilder.bind(createTopicQueue()).
        to(defTopicExchange()).
        with("*.orange.*");
}

//主题交换器和主题队列绑定
@Bean
Binding bindingTopic1() {
    return BindingBuilder.bind(createTopicQueue1()).
        to(defTopicExchange()).
        with("*.*.rabbit");
}

//主题交换器和主题队列绑定
@Bean
Binding bindingTopic2() {
    return BindingBuilder.bind(createTopicQueue1()).
        to(defTopicExchange()).
        with("lazy.#");
}

/**
 * 监听主题测试队列数据
 *
 * @param massage
 */
@RabbitListener(
    bindings =
    {
        @QueueBinding(value = @Queue(value = "test_topic_queue", durable = "true"),
                      exchange = @Exchange(value = "testTopicExchange", type = "topic"))
    })
@RabbitHandler
public void processTopicMsg(Message massage) {
    String routingkey = massage.getMessageProperties().getReceivedRoutingKey();
    String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
    logger.info("接收到TOPIC消息,ROUTINGKEY:{},message: {}", routingkey, msg);
}

/**
 * 监听主题测试1队列数据
 *
 * @param massage
 */
@RabbitListener(
    bindings =
    {
        @QueueBinding(value = @Queue(value = "test_topic_queue1", durable = "true"),
                      exchange = @Exchange(value = "testTopicExchange", type = "topic"))
    })
@RabbitHandler
public void processTopic1Msg(Message massage) {
    String routingkey = massage.getMessageProperties().getReceivedRoutingKey();
    String msg = new String(massage.getBody(), StandardCharsets.UTF_8);
    logger.info("接收到TOPIC1消息,ROUTINGKEY:{},message: {}", routingkey, msg);
}
```

postman测试
```
http://127.0.0.1:8080/rabbitmq/send?type=TOPIC&routingKey=quick.orange.rabbit&message=测试主题交换器
http://127.0.0.1:8080/rabbitmq/send?type=TOPIC&routingKey=lazy.orange.elephant&message=测试主题交换器
http://127.0.0.1:8080/rabbitmq/send?type=TOPIC&routingKey=quick.orange.fox&message=测试主题交换器
http://127.0.0.1:8080/rabbitmq/send?type=TOPIC&routingKey=lazy.brown.fox&message=测试主题交换器
http://127.0.0.1:8080/rabbitmq/send?type=TOPIC&routingKey=lazy.pink.rabbit&message=测试主题交换器
http://127.0.0.1:8080/rabbitmq/send?type=TOPIC&routingKey=quick.orangle.male.rabbit&message=测试主题交换器
```

```
2020-08-28 11:53:31.585  INFO 5624 --- [ntContainer#3-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到TOPIC1消息,ROUTINGKEY:quick.orange.rabbit,message: 测试主题交换器
2020-08-28 11:53:31.585  INFO 5624 --- [ntContainer#2-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到TOPIC消息,ROUTINGKEY:quick.orange.rabbit,message: 测试主题交换器
2020-08-28 11:56:07.981  INFO 5624 --- [ntContainer#3-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到TOPIC1消息,ROUTINGKEY:lazy.orange.elephant,message: 测试主题交换器
2020-08-28 11:56:07.981  INFO 5624 --- [ntContainer#2-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到TOPIC消息,ROUTINGKEY:lazy.orange.elephant,message: 测试主题交换器
2020-08-28 11:56:34.729  INFO 5624 --- [ntContainer#2-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到TOPIC消息,ROUTINGKEY:quick.orange.fox,message: 测试主题交换器
2020-08-28 11:57:14.123  INFO 5624 --- [ntContainer#3-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到TOPIC1消息,ROUTINGKEY:lazy.brown.fox,message: 测试主题交换器
2020-08-28 12:46:00.455  INFO 5624 --- [ntContainer#3-1] com.heima.rabbitmq.consumer.MsgConsumer  : 接收到TOPIC1消息,ROUTINGKEY:lazy.pink.rabbit,message: 测试主题交换器
```