---
title: RabbitMQ延时队列
date: 2022-01-23 15:05:06
tags:
password:
categories: RabbitMQ
---

# 延时队列
## 1.1  什么是延时队列
在开发中，往往会遇到一些关于延时任务的需求。例如
- 生成订单30分钟未支付，则自动取消
- 生成订单60秒后,给用户发短信
- 滴滴打车订单完成后，如果用户一直不评价，48小时后会将自动评价为5星。

**和定时任务区别**
对上述的任务，我们给一个专业的名字来形容，那就是延时任务。那么这里就会产生一个问题，这个延时任务和定时任务的区别究竟在哪里呢？一共有如下几点区别
1. 定时任务有明确的触发时间，延时任务没有
2. 定时任务有执行周期，而延时任务在某事件触发后一段时间内执行，没有执行周期。（**可以将延时任务看作是基于事件驱动的**）
3. 定时任务一般执行的是批处理操作是多个任务，而延时任务一般是**单个任务**


**​ 简单来说，延时队列就是用来存放需要在指定时间被处理的元素的队列。**
## 1.2 延时队列使用场景
1. 订单在十分钟之内未支付则自动取消。
2. 新创建的店铺，如果在十天内都没有上传过商品，则自动发送消息提醒。
3. 账单在一周内未支付，则自动结算。
4. 用户注册成功后，如果三天内没有登陆则进行短信提醒。
5. 用户发起退款，如果三天内没有得到处理则通知相关运营人员。
6. 预定会议后，需要在预定的时间点前十分钟通知各个与会人员参加会议

## 1.3 常见的延时任务的解决方案
### 1.3.1 数据库轮询
该方案通常是在小型项目中使用，即通过一个线程定时的去扫描数据库，通过订单时间来判断是否有超时的订单，然后进行update或delete等操作

**优点：**
简单易行，支持集群操作

**缺点：**
1. 对服务器内存消耗大
2. 存在延迟，比如你每隔3分钟扫描一次，那最坏的延迟时间就是3分钟
3. 假设你的订单有几千万条，每隔几分钟这样扫描一次，数据库损耗极大

###  1.3.2 JDK的延迟队列
该方案是利用JDK自带的DelayQueue来实现，这是一个无界阻塞队列，该队列只有在延迟期满的时候才能从中获取元素，放入DelayQueue中的对象，是必须实现Delayed接口的。
![在这里插入图片描述](https://img-blog.csdnimg.cn/b9ec5a6e142b427288e725e907fc1182.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**优点**
效率高,任务触发时间延迟低

**缺点**
1. 服务器重启后，数据全部消失，怕宕机
2. 集群扩展相当麻烦
3. 因为内存条件限制的原因，比如下单未付款的订单数太多，那么很容易就出现OOM异常
4. 代码复杂度较高

### 1.3.3 netty时间轮算法
![在这里插入图片描述](https://img-blog.csdnimg.cn/9d2bbed37235401aba2fdaae48df809b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)
时间轮算法可以类比于时钟，如上图箭头（指针）按某一个方向按固定频率轮动，每一次跳动称为一个 tick。这样可以看出定时轮由个3个重要的属性参数，ticksPerWheel（一轮的tick数），tickDuration（一个tick的持续时间）以及 timeUnit（时间单位），例如当ticksPerWheel=60，tickDuration=1，timeUnit=秒，这就和现实中的始终的秒针走动完全类似了。

如果当前指针指在1上面，我有一个任务需要4秒以后执行，那么这个执行的线程回调或者消息将会被放在5上。那如果需要在20秒之后执行怎么办，由于这个环形结构槽数只到8，如果要20秒，指针需要多转2圈。位置是在2圈之后的5上面（20 % 8 + 1）

**优点**
效率高,任务触发时间延迟时间比delayQueue低，代码复杂度比delayQueue低。

**缺点**
1. 服务器重启后，数据全部消失，怕宕机
2. 集群扩展相当麻烦
3. 因为内存条件限制的原因，比如下单未付款的订单数太多，那么很容易就出现OOM异常

### 1.3.4 使用消息队列
![在这里插入图片描述](https://img-blog.csdnimg.cn/c0a09a5764a14d9093cb17502c489e99.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
我们可以采用rabbitMQ的延时队列。RabbitMQ具有以下两个特性，可以实现延迟队列
1. RabbitMQ可以针对Queue和Message设置` x-message-tt`，来控制消息的生存时间，如果超时，则消息变为`dead letter`
2. RabbitMQ的Queue可以配置`x-dead-letter-exchange `和`x-dead-letter-routing-key（可选）`两个参数，用来控制队列内出现的`dead letter`，`dead letter`到达死信队列交换机后则按照这两个参数重新路由。、

**优点**
高效,可以利用rabbitmq的分布式特性轻易的进行横向扩展,消息支持持久化增加了可靠性。

**缺点**
本身的易用度要依赖于rabbitMq的运维.因为要引用rabbitMq,所以复杂度和成本变高 



# rabbitMQ中的延时队列
RabbitMQ中没有对消息延迟进行实现，但是我们可以通过TTL以及死信路由来实现消息延迟。
![在这里插入图片描述](https://img-blog.csdnimg.cn/90db84b9d3b54c97acddead24e7c5d03.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
##  TTL(消息过期时间)
在介绍延时队列之前，还需要先介绍一下RabbitMQ中的一个高级特性—— TTL（Time ToLive） 。

TTL 是RabbitMQ中一个消息或者队列的属性，表明 一条消息或者该队列中的所有消息的最大存活时间 ，单位是毫秒。换句话说，如果一条消息设置了TTL属性或者进入了设置TTL属性的队列，那么这条消息如果在TTL设置的时间内没有被消费，则会成为“死信”，如果不设置TTL，表示消息永远不会过期，如果将TTL设置为0，则表示除非此时可以直接投递该消息到消费者，否则该消息将会被丢弃。

**配置队列TTL：**

一种是在创建队列的时候设置队列的`“x-message-ttl”`属性
```java
@Bean
public Queue taxiOverQueue() {
	Map<String, Object> args = new HashMap<>(2);
	args.put("x-message-ttl", 30000);
	return QueueBuilder.durable(TAXI_OVER_QUEUE).withArguments(args).build();
}
```
这样所有被投递到该队列的消息都最多不会存活超过30s，但是消息会到哪里呢，如果没有任何处理，消息会被丢弃，如果配置有死信队列，超时的消息会被投递到死信队列
另一种方式便是针对每条消息设置TTL，代码如下：
```java
AMQP.BasicProperties.Builder builder = new AMQP.BasicProperties.Builder();
builder.expiration("6000");
AMQP.BasicProperties properties = builder.build();
channel.basicPublish(exchangeName, routingKey, mandatory, properties, "msg body".getBytes());
```

>但这两种方式是有区别的，如果设置了队列的TTL属性，那么一旦消息过期，就会被队列丢弃，而第二种方式，消息即使过期，也不一定会被马上丢弃，因为消息是否过期是在即将投递到消费者之前判定的，如果当前队列有严重的消息积压情况，则已过期的消息也许还能存活较长时间。


## 实现延时队列
我们现在知道了死信队列、TTL，只要把二者相融合，就能实现延时队列了。

`延时队列`，不就是想要消息延迟多久被处理吗，TTL则刚好能让消息在延迟多久之后成为死信，另一方面，成为死信的消息都会被投递到死信队列里，这样只需要消费者一直消费死信队列里的消息就万事大吉了，因为里面的消息都是希望被立即处理的消息。
![消息的流向](https://img-blog.csdnimg.cn/788ce989b087457980cdfb578aa7006f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
生产者生产一条延时消息，根据需要延时时间的不同，利用不同的routingkey将消息路由到不同的延时队列，每个队列都设置了不同的TTL属性，并绑定在同一个死信交换机中，消息过期后，根据routingkey的不同，又会被路由到不同的死信队列中，消费者只需要监听对应的死信队列进行处理即可。


### 配置文件
```yml
server:
  port: 8080

spring:
  rabbitmq:
    host: 192.168.64.133
    port: 5672
    username: root
    password: root
    ###开启消息确认机制 confirms
    virtual-host: /
    publisher-returns: true
    #采用手动应答
    listener:
      simple:
        acknowledge-mode: manual
```


###  配置类
**交换器配置：**
>先声明交换机、队列以及他们的绑定关系：
```java
@Configuration
public class RabbitMQConfig {

    public static final String DELAY_EXCHANGE_NAME = "delay.queue.demo.business.exchange";
    public static final String DELAY_QUEUE_A_NAME = "delay.queue.demo.business.queuea";
    public static final String DELAY_QUEUE_B_NAME = "delay.queue.demo.business.queueb";
    public static final String DELAY_QUEUE_A_ROUTING_KEY = "delay.queue.demo.business.queuea.routingkey";
    public static final String DELAY_QUEUE_B_ROUTING_KEY = "delay.queue.demo.business.queueb.routingkey";
    public static final String DEAD_LETTER_EXCHANGE = "delay.queue.demo.deadletter.exchange";
    public static final String DEAD_LETTER_QUEUE_A_ROUTING_KEY = "delay.queue.demo.deadletter.delay_10s.routingkey";
    public static final String DEAD_LETTER_QUEUE_B_ROUTING_KEY = "delay.queue.demo.deadletter.delay_60s.routingkey";
    public static final String DEAD_LETTER_QUEUE_A_NAME = "delay.queue.demo.deadletter.queuea";
    public static final String DEAD_LETTER_QUEUE_B_NAME = "delay.queue.demo.deadletter.queueb";

    // 声明延时Exchange
    @Bean("delayExchange")
    public DirectExchange delayExchange() {
        return new DirectExchange(DELAY_EXCHANGE_NAME);
    }

    // 声明死信Exchange
    @Bean("deadLetterExchange")
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DEAD_LETTER_EXCHANGE);
    }

    // 声明延时队列A 延时10s
    // 并绑定到对应的死信交换机
    @Bean("delayQueueA")
    public Queue delayQueueA() {
        Map<String, Object> args = new HashMap<>(2);
        // x-dead-letter-exchange    这里声明当前队列绑定的死信交换机
        args.put("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE);
        // x-dead-letter-routing-key  这里声明当前队列的死信路由key
        args.put("x-dead-letter-routing-key", DEAD_LETTER_QUEUE_A_ROUTING_KEY);
        // x-message-ttl  声明队列的TTL
        args.put("x-message-ttl", 1000 * 10);
        return QueueBuilder.durable(DELAY_QUEUE_A_NAME).withArguments(args).build();
    }

    // 声明延时队列B 延时 60s
    // 并绑定到对应的死信交换机
    @Bean("delayQueueB")
    public Queue delayQueueB() {
        Map<String, Object> args = new HashMap<>(2);
        // x-dead-letter-exchange    这里声明当前队列绑定的死信交换机
        args.put("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE);
        // x-dead-letter-routing-key  这里声明当前队列的死信路由key
        args.put("x-dead-letter-routing-key", DEAD_LETTER_QUEUE_B_ROUTING_KEY);
        // x-message-ttl  声明队列的TTL
        args.put("x-message-ttl", 1888 * 60);
        return QueueBuilder.durable(DELAY_QUEUE_B_NAME).withArguments(args).build();
    }

    // 声明死信队列A 用于接收延时10s处理的消息
    @Bean("deadLetterQueueA")
    public Queue deadLetterQueueA() {
        return new Queue(DEAD_LETTER_QUEUE_A_NAME);
    }

    // 声明死信队列B 用于接收延时60s处理的消息
    @Bean("deadLetterQueueB")
    public Queue deadLetterQueueB() {
        return new Queue(DEAD_LETTER_QUEUE_B_NAME);
    }

    // 声明延时队列A绑定关系
    @Bean
    public Binding delayBindingA(@Qualifier("delayQueueA") Queue queue,
                                 @Qualifier("delayExchange") DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(DELAY_QUEUE_A_ROUTING_KEY);
    }

    // 声明业务队列B绑定关系
    @Bean
    public Binding delayBindingB(@Qualifier("delayQueueB") Queue queue,
                                 @Qualifier("delayExchange") DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(DELAY_QUEUE_B_ROUTING_KEY);
    }

    // 声明死信队列A绑定关系
    @Bean
    public Binding deadLetterBindingA(@Qualifier("deadLetterQueueA") Queue queue,
                                      @Qualifier("deadLetterExchange") DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(DEAD_LETTER_QUEUE_A_ROUTING_KEY);
    }

    // 声明死信队列B绑定关系
    @Bean
    public Binding deadLetterBindingB(@Qualifier("deadLetterQueueB") Queue queue,
                                      @Qualifier("deadLetterExchange") DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(DEAD_LETTER_QUEUE_B_ROUTING_KEY);
    }
}
```

**枚举类**
>定义相关枚举属性
```java

public enum DelayTypeEnum {
    DELAY_10s(10), DELAY_60s(60);

    private int duration = 0;

    DelayTypeEnum(int duration) {
        this.duration = duration;
    }

    public int getDuration() {
        return duration;
    }

    public static DelayTypeEnum getType(int duration) {
        return Stream.of(DelayTypeEnum.values()).filter((type) -> type.duration == duration).findFirst().get();
    }
}
```

###  消费者
接下来，创建两个消费者，分别对两个死信队列的消息进行消费：
```java
@Component
public class DeadLetterQueueConsumer {

    private static final Logger logger = LoggerFactory.getLogger(DeadLetterQueueConsumer.class);

    @RabbitListener(queues = RabbitMQConfig.DEAD_LETTER_QUEUE_A_NAME)
    public void receiveA(Message message, Channel channel) throws IOException {
        String msg = new String(message.getBody());
        logger.info("当前时间：{},死信队列A收到消息：{}", System.currentTimeMillis(), msg);
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }

    @RabbitListener(queues = RabbitMQConfig.DEAD_LETTER_QUEUE_B_NAME)
    public void receiveB(Message message, Channel channel) throws IOException {
        String msg = new String(message.getBody());
        logger.info("当前时间：{},死信队列B收到消息：{}", new Date().toString(), msg);
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }
}
```

### 	  生产者
```java
@Component
public class DelayMessageSender {

    private static final Logger logger = LoggerFactory.getLogger(DelayMessageSender.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMsg(String msg, DelayTypeEnum type) {
        logger.info("发送延时消息，message:{}, duration:{}，当前时间：", msg, type.getDuration(), System.currentTimeMillis());
        switch (type) {
            case DELAY_10s:
                rabbitTemplate.convertAndSend(RabbitMQConfig.DELAY_EXCHANGE_NAME, RabbitMQConfig.DELAY_QUEUE_A_ROUTING_KEY, msg);
                break;
            case DELAY_60s:
                rabbitTemplate.convertAndSend(RabbitMQConfig.DELAY_EXCHANGE_NAME, RabbitMQConfig.DELAY_QUEUE_B_ROUTING_KEY, msg);
                break;
            default:
                rabbitTemplate.convertAndSend(RabbitMQConfig.DELAY_EXCHANGE_NAME, RabbitMQConfig.DELAY_QUEUE_A_ROUTING_KEY, msg);
                break;
        }
    }
}
```

### 请求接口
接下来，我们暴露一个web接口来生产消息
```java
RestController
@RequestMapping("/rabbitmq")
public class RabbitmqController {

    @Autowired
    private DelayMessageSender msgProducer;

    /**
     * 发送测试数据
     *
     * @param type    交换器类型
     * @param message
     * @return
     */
    @RequestMapping("/send")
    public String send(String message, int type) {
        msgProducer.sendMsg(message, DelayTypeEnum.getType(type));
        return "OK";
    }
}
```

### RabbitMQ控制台
打开rabbitMQ的管理后台，可以看到我们刚才创建的交换机和队列信息：
![在这里插入图片描述](https://img-blog.csdnimg.cn/f754f85dfc624f7187dc9e9617739b54.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/43fe08c2bb454f28add78d85db293375.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
### 测试
接下来，我们来发送几条消息
![在这里插入图片描述](https://img-blog.csdnimg.cn/c21744a3c92b4e33868c9635d8db8a60.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)


```
2020-09-22 16:55:40.977  INFO 452 --- [nio-8080-exec-1] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:xxxxxxx, duration:60，当前时间：
2020-09-22 16:55:45.716  INFO 452 --- [nio-8080-exec-2] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:xxxxxxx, duration:10，当前时间：
2020-09-22 16:55:53.164  INFO 452 --- [nio-8080-exec-3] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:延时10s, duration:10，当前时间：
2020-09-22 16:55:55.746  INFO 452 --- [ntContainer#1-1] c.h.r.consumer.DeadLetterQueueConsumer   : 当前时间：1600764955745,死信队列A收到消息：xxxxxxx
2020-09-22 16:56:01.333  INFO 452 --- [nio-8080-exec-4] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:延时60s, duration:60，当前时间：
2020-09-22 16:56:03.170  INFO 452 --- [ntContainer#1-2] c.h.r.consumer.DeadLetterQueueConsumer   : 当前时间：1600764963170,死信队列A收到消息：延时10s
2020-09-22 16:57:34.268  INFO 452 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 当前时间：Tue Sep 22 16:57:34 CST 2020,死信队列B收到消息：xxxxxxx
2020-09-22 16:57:54.619  INFO 452 --- [ntContainer#0-2] c.h.r.consumer.DeadLetterQueueConsumer   : 当前时间：Tue Sep 22 16:57:54 CST 2020,死信队列B收到消息：延时60s
```

第一条消息在6s后变成了死信消息，然后被消费者消费掉，第二条消息在60s之后变成了死信消息，然后被消费掉，这样，一个还算ok的延时队列就打造完成了。



不过如果这样使用的话每增加一个新的时间需求，就要新增一个队列，所以还需要优化一下。



## RabbitMQ延时队列优化
将TTL设置在消息属性里

### 配置类
增加一个延时队列，用于接收设置为任意延时时长的消息，增加一个相应的死信队列和routingkey：
```java
@Configuration
public class RabbitMQConfig {

    public static final String DELAY_EXCHANGE_NAME = "delay.queue.demo.business.exchange";
    public static final String DELAY_QUEUEC_NAME = "delay.queue.demo.business.queuec";
    public static final String DELAY_QUEUEC_ROUTING_KEY = "delay.queue.demo.business.queuec.routingkey";
    public static final String DEAD_LETTER_EXCHANGE = "delay.queue.demo.deadletter.exchange";
    public static final String DEAD_LETTER_QUEUEC_ROUTING_KEY = "delay.queue.demo.deadletter.delay_anytime.routingkey";
    public static final String DEAD_LETTER_QUEUEC_NAME = "delay.queue.demo.deadletter.queuec";

    // 声明延时Exchange
    @Bean("delayExchange")
    public DirectExchange delayExchange(){
        return new DirectExchange(DELAY_EXCHANGE_NAME);
    }

    // 声明死信Exchange
    @Bean("deadLetterExchange")
    public DirectExchange deadLetterExchange(){
        return new DirectExchange(DEAD_LETTER_EXCHANGE);
    }

    // 声明延时队列C 不设置TTL
    // 并绑定到对应的死信交换机
    @Bean("delayQueueC")
    public Queue delayQueueC(){
        Map<String, Object> args = new HashMap<>(3);
        // x-dead-letter-exchange    这里声明当前队列绑定的死信交换机
        args.put("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE);
        // x-dead-letter-routing-key  这里声明当前队列的死信路由key
        args.put("x-dead-letter-routing-key", DEAD_LETTER_QUEUEC_ROUTING_KEY);
        return QueueBuilder.durable(DELAY_QUEUEC_NAME).withArguments(args).build();
    }

    // 声明死信队列C 用于接收延时任意时长处理的消息
    @Bean("deadLetterQueueC")
    public Queue deadLetterQueueC(){
        return new Queue(DEAD_LETTER_QUEUEC_NAME);
    }

    // 声明延时列C绑定关系
    @Bean
    public Binding delayBindingC(@Qualifier("delayQueueC") Queue queue,
                                 @Qualifier("delayExchange") DirectExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(DELAY_QUEUEC_ROUTING_KEY);
    }

    // 声明死信队列C绑定关系
    @Bean
    public Binding deadLetterBindingC(@Qualifier("deadLetterQueueC") Queue queue,
                                      @Qualifier("deadLetterExchange") DirectExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(DEAD_LETTER_QUEUEC_ROUTING_KEY);
    }
}
```

###  消费者
```java
@Component
public class DeadLetterQueueConsumer {

    private static final Logger logger = LoggerFactory.getLogger(DeadLetterQueueConsumer.class);
    DateFormat dateFormat = DateFormat.getDateTimeInstance();

    @RabbitListener(queues = RabbitMQConfig.DEAD_LETTER_QUEUEC_NAME)
    public void receiveC(Message message, Channel channel) throws IOException {
        String msg = new String(message.getBody());
        Date sendDate = message.getMessageProperties().getTimestamp();
        //延迟的秒数
        long durationSec = (System.currentTimeMillis() - sendDate.getTime()) / 1000;
        logger.info("接收到延时消息，消息：{}，延时秒数：{}，当前时间：{}", msg, durationSec, dateFormat.format(new Date()));
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }
}
```

##  生产者
使用spring的setExpiration方法来设置消息的过期时间
```java
@Component
public class DelayMessageSender {

    private static final Logger logger = LoggerFactory.getLogger(DelayMessageSender.class);
    DateFormat dateFormat = DateFormat.getDateTimeInstance();

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMsg(String msg, int delayTime) {
        logger.info("发送延时消息，message:{}, duration:{}，当前时间：{}", msg, delayTime, dateFormat.format(new Date()));
        rabbitTemplate.convertAndSend(RabbitMQConfig.DELAY_EXCHANGE_NAME, RabbitMQConfig.DELAY_QUEUEC_ROUTING_KEY, msg, x -> {
            MessageProperties messageProperties = x.getMessageProperties();
            messageProperties.setExpiration(String.valueOf(delayTime));
            messageProperties.setTimestamp(new Date());
            return x;
        });
    }
}
```

### 请求接口
这个接口可以传递延迟任意时间消息
```java
@RestController
@RequestMapping("/rabbitmq")
public class RabbitmqController {

    @Autowired
    private DelayMessageSender msgProducer;

    /**
     * 发送测试数据
     *
     * @param delayTime 交换器类型
     * @param message
     * @return
     */
    @RequestMapping("/send")
    public String send(String message, int delayTime) {
        msgProducer.sendMsg(message, delayTime);
        return "OK";
    }
}
```

###  测试
**正常测试**
请求地址
```
http://localhost:8080/rabbitmq/send?message=test30s&delayTime=30000
http://localhost:8080/rabbitmq/send?message=test60s&delayTime=60000
```
测试数据
```
2020-09-23 10:17:41.397  INFO 17924 --- [nio-8080-exec-4] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:test30s, duration:30000，当前时间：2020-9-23 10:17:41
2020-09-23 10:17:47.317  INFO 17924 --- [nio-8080-exec-7] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:test60s, duration:60000，当前时间：2020-9-23 10:17:47
2020-09-23 10:18:11.402  INFO 17924 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 接收到延时消息，消息：test30s，延时秒数：30，当前时间：2020-9-23 10:18:11
2020-09-23 10:18:47.321  INFO 17924 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 接收到延时消息，消息：test60s，延时秒数：60，当前时间：2020-9-23 10:18:47
```


**非正常测试**

请求地址:
```
http://localhost:8080/rabbitmq/send?message=test60s&delayTime=60000
http://localhost:8080/rabbitmq/send?message=test30s&delayTime=30000
```

测试数据
```
2020-09-23 10:19:30.793  INFO 17924 --- [io-8080-exec-10] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:test60s, duration:60000，当前时间：2020-9-23 10:19:30
2020-09-23 10:19:36.694  INFO 17924 --- [nio-8080-exec-1] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:test30s, duration:30000，当前时间：2020-9-23 10:19:36
2020-09-23 10:20:30.797  INFO 17924 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 接收到延时消息，消息：test60s，延时秒数：60，当前时间：2020-9-23 10:20:30
2020-09-23 10:20:30.797  INFO 17924 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 接收到延时消息，消息：test30s，延时秒数：54，当前时间：2020-9-23 10:20:30
```

我们先发了一个延时时长为60s的消息，然后发了一个延时时长为30s的消息，结果显示，第二个消息会在等第一个消息成为死信后才会“死亡“。



##  利用RabbitMQ插件实现延迟队列

**①下载插件**
为了解决上面的问题，我们安装一个mq的插件。[https://www.rabbitmq.com/community-plugins.html](https://www.rabbitmq.com/community-plugins.html)，下载`rabbitmq_delayed_message_exchange`插件，然后解压放置到RabbitMQ的插件目录。
![在这里插入图片描述](https://img-blog.csdnimg.cn/14a1418baf59484fbcf8713b7811f55a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
或者直接
```shell
wget https://dl.bintray.com/rabbitmq/community-plugins/3.7.x/rabbitmq_delayed_message_exchange/rabbitmq_delayed_message_exchange-20171201-3.7.x.zip
```

**②安装插件：**
直接解压就行

**③启用插件**
```shell
rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c72637e4ec394291aa6b5dad9257a5ef.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
rabbitmq-plugins list 命令查看已安装插件
![在这里插入图片描述](https://img-blog.csdnimg.cn/b95d240e34574135b9c49d1276990bd6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

###  配置类
```java
@Configuration
public class RabbitMQConfig {
    public static final String DELAYED_QUEUE_NAME = "delay.queue.demo.delay.queue";
    public static final String DELAYED_EXCHANGE_NAME = "delay.queue.demo.delay.exchange";
    public static final String DELAYED_ROUTING_KEY = "delay.queue.demo.delay.routingkey";

    @Bean
    public Queue immediateQueue() {
        return new Queue(DELAYED_QUEUE_NAME);
    }

    @Bean
    public CustomExchange customExchange() {
        Map<String, Object> args = new HashMap<>();
        args.put("x-delayed-type", "direct");
        return new CustomExchange(DELAYED_EXCHANGE_NAME, "x-delayed-message", true, false, args);
    }

    @Bean
    public Binding bindingNotify(@Qualifier("immediateQueue") Queue queue,
                                 @Qualifier("customExchange") CustomExchange customExchange) {
        return BindingBuilder.bind(queue).to(customExchange).with(DELAYED_ROUTING_KEY).noargs();
    }
}
```

### 消费者
```java
@Component
public class DeadLetterQueueConsumer {

    private static final Logger logger = LoggerFactory.getLogger(DeadLetterQueueConsumer.class);
    DateFormat dateFormat = DateFormat.getDateTimeInstance();

    @RabbitListener(queues = RabbitMQConfig.DELAYED_QUEUE_NAME)
    public void receiveDelay(Message message, Channel channel) throws IOException {
        String msg = new String(message.getBody());
        Date sendDate = message.getMessageProperties().getTimestamp();
        //延迟的秒数
        long durationSec = (System.currentTimeMillis() - sendDate.getTime()) / 1000;
        logger.info("接收到延时消息，消息：{}，延时秒数：{}，当前时间：{}", msg, durationSec, dateFormat.format(new Date()));
        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }
}
```


### 生产者
使用spring的setDelay方法来设置消息的过期时间
```java
@Component
public class DelayMessageSender {

    private static final Logger logger = LoggerFactory.getLogger(DelayMessageSender.class);
    DateFormat dateFormat = DateFormat.getDateTimeInstance();

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMsg(String msg, int delayTime) {
        logger.info("发送延时消息，message:{}, duration:{}，当前时间：{}", msg, delayTime, dateFormat.format(new Date()));
        rabbitTemplate.convertAndSend(RabbitMQConfig.DELAYED_EXCHANGE_NAME, RabbitMQConfig.DELAYED_ROUTING_KEY, msg, x -> {
            MessageProperties messageProperties = x.getMessageProperties();
            messageProperties.setDelay(delayTime);
            messageProperties.setTimestamp(new Date());
            return x;
        });
    }
}
```


###  请求接口
这个接口可以传递延迟任意时间消息
```java
@RestController
@RequestMapping("/rabbitmq")
public class RabbitmqController {

    @Autowired
    private DelayMessageSender msgProducer;

    /**
     * 发送测试数据
     *
     * @param delayTime 交换器类型
     * @param message
     * @return
     */
    @RequestMapping("/send")
    public String send(String message, int delayTime) {
        msgProducer.sendMsg(message, delayTime);
        return "OK";
    }
}
```

###  测试
**正常测试：**
访问：
```
http://localhost:8080/rabbitmq/send?message=test30s&delayTime=30000
http://localhost:8080/rabbitmq/send?message=test60s&delayTime=60000
```
结果：
```
2020-09-23 11:06:15.676  INFO 11072 --- [nio-8080-exec-5] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:test60s, duration:60000，当前时间：2020-9-23 11:06:15
2020-09-23 11:06:17.308  INFO 11072 --- [nio-8080-exec-6] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:test60s, duration:60000，当前时间：2020-9-23 11:06:17
2020-09-23 11:07:15.680  INFO 11072 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 接收到延时消息，消息：test60s，延时秒数：60，当前时间：2020-9-23 11:07:15
2020-09-23 11:07:17.312  INFO 11072 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 接收到延时消息，消息：test60s，延时秒数：60，当前时间：2020-9-23 11:07:17
```


**非正常测试：**
访问：
```
http://localhost:8080/rabbitmq/send?message=test60s&delayTime=60000
http://localhost:8080/rabbitmq/send?message=test30s&delayTime=30000
```
结果：
```
2020-09-23 11:09:45.823  INFO 11072 --- [nio-8080-exec-4] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:test60s, duration:60000，当前时间：2020-9-23 11:09:45
2020-09-23 11:09:47.402  INFO 11072 --- [nio-8080-exec-5] c.h.r.consumer.DelayMessageSender        : 发送延时消息，message:test30s, duration:30000，当前时间：2020-9-23 11:09:47
2020-09-23 11:10:17.408  INFO 11072 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 接收到延时消息，消息：test30s，延时秒数：30，当前时间：2020-9-23 11:10:17
2020-09-23 11:10:45.826  INFO 11072 --- [ntContainer#0-1] c.h.r.consumer.DeadLetterQueueConsumer   : 接收到延时消息，消息：test60s，延时秒数：60，当前时间：2020-9-23 11:10:45
```

可以看到第二个消息被先消费掉了，符合预期。