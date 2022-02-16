---
title: kafka顺序消息
date: 2022-02-13 12:50:54
tags:
password:
categories: kafka
---

# 场景概述
假设我们要传输一批订单到另一个系统，那么订单对应状态的演变是有顺序性要求的。
**已下单 → 已支付 → 已确认**
不允许错乱！

# 顺序级别
1）全局有序：
串行化。每条经过kafka的消息必须严格保障有序性。这就要求kafka单通道，每个groupid下单消费者极大的影响性能，现实业务下几乎没必要。


2）局部有序：
业务局部有序。同一条订单有序即可，不同订单可以并行处理。不同订单的顺序前后无所谓。

充分利用kafka多分区的并发性，只需要想办法让**需要顺序的一批数据进同一分区即可。**（和RocketMQ的解决思路很相似）


# 实现方案
**1）发送端：**
指定key发送，key=order.id即可。
![在这里插入图片描述](https://img-blog.csdnimg.cn/3cc57a5ad1a04e16ad24f7842bdfeee9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
**2）发送中：**
给队列配置多分区保障并发性。


**3）读取端：**

单消费者：显然不合理
吞吐量显然上不去，kafka开多个分区还有何意义？
所以开多个消费者指定分区消费，理想状况下，每个分区配一个。
但是，这个吞吐量依然有限，那如何处理呢？


方案：多线程
在每个消费者上再开多线程，是个解决办法。但是，要警惕顺序性被打破！
参考下图：thread处理后，会将data变成 2-1-3。因为即使线程A先拿到1.线程B再拿到2。也不能确保A能先消费1。
![在这里插入图片描述](https://img-blog.csdnimg.cn/60728a2d990745d4ae9b057d5a2be45c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)


**改进：接收后分发二级内存队列**

消费者取到消息后不做处理，根据key二次分发到多个阻塞队列。
再开启多个线程，每个队列分配一个线程处理（1对1的关系）。提升吞吐量

![在这里插入图片描述](https://img-blog.csdnimg.cn/33ddfca3e6d04300880efc2933c596dd.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 代码验证
**1）新建一个sort队列，2个分区**

**2）编写代码**
SortedProducer（顺序性发送端）
```java
@RestController
public class SortedProducer {
    @Resource
    private KafkaTemplate<String, Object> kafkaTemplate;

    @GetMapping("/kafka/test/{id}/{status}")
    public void sendSortedMsg(@PathVariable("id") int id ,@PathVariable("status") int status ) {
        Order order = new Order();
        order.setId(id);
        order.setStatus(status);
//        以订单号做key发送
        kafkaTemplate.send("sorted",String.valueOf(id), JSON.toJSONString(order));
    }
}
```


SortedConsumer（顺序性消费端 - 阻塞队列实现，方便大家理解设计思路）：
```java
/*
* 顺序性消费
* 阻塞队列 + 多线程实现
* */
@Component
public class SortedConsumer {
    private final Logger logger = LoggerFactory.getLogger(SortedConsumer.class);
    //队列数量，根据业务情况决定
    //本案例，队列=4，线程=4，一一对应
    LinkedBlockingQueue[] queues = new LinkedBlockingQueue[4];

    @PostConstruct
    void execute(){
        //遍历队列数组，初始化每一个元素，同时让线程启动
        for (int i = 0; i < 4; i++) {
            logger.info("thread started , index = {}", i);
            final int current = i;
            queues[current] = new LinkedBlockingQueue();
            new Thread( () -> {
                try {
                    //循环4次，起4个线程一直监听自己的队列，不停获取数据
                    //取到就执行打印log，取不到阻塞等待
                    while (true) {
                        Order order = (Order) queues[current].take();
                        logger.info("get from queue, queue:{},order:[id={},status={}]",
                                current,
                                order.getId(),
                                order.getStatus());
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }

    @KafkaListener(topics = {"sorted"},topicPattern = "0",groupId = "sorted-group-1")
    public void onMessage(ConsumerRecord<?, ?> consumerRecord) throws InterruptedException {
        Optional<?> optional = Optional.ofNullable(consumerRecord.value());
        if (optional.isPresent()) {
            Object msg = optional.get();
//            从kafka里获取到消息
//            注意分发方式，kafka有两个分区0和1，对应两个消费者
//            当前分区是0，也就是偶数的id，0、2、4、6会在这里被消费
            Order order = JSON.parseObject(String.valueOf(msg),Order.class);


//            而队列是4个。也就是每个消费者再分到两个队列里去
//            队列另一端分别对应4个线程在等待
//            所以，按4取余数
            int index = order.getId() % 4;
//            logger.info("put to queue,queue={},order:[id={},status={}]",index,order.getId(),order.getStatus());
            queues[index].put(order);
        }
    }

    @KafkaListener(topics = {"sorted"},topicPattern = "1",groupId = "sorted-group-1")
    public void onMessage1(ConsumerRecord<?, ?> consumerRecord) throws InterruptedException {
        //相同的实现，现实中为另一台机器，这里用两个listener模拟
        //奇数的id会被分到这里，也就是1、3、5、7
        onMessage(consumerRecord);
    }
}
```

SortedConsumer2（顺序性消费端 - 线程池实现，现实中推荐这种方式！）:
```java
/*
* 顺序性消费
* 线程池实现：
* 比较上面的SortedConsumer，其实就是只有一个线程的线程池模型
* */
//@Component
public class SortedConsumer2 {
    private final Logger logger = LoggerFactory.getLogger(SortedConsumer2.class);
    //队列数量，根据业务情况决定
    //本案例，队列=4，线程=4，一一对应
    ExecutorService[] queues = new ExecutorService[4];

    @PostConstruct
    void execute(){
        //遍历队列数组，初始化每一个元素，同时让线程启动
        for (int i = 0; i < 4; i++) {
            logger.info("thread started , index = {}", i);
            final int current = i;
            queues[current] = Executors.newSingleThreadExecutor();
        }
    }

    @KafkaListener(topics = {"sorted"},topicPattern = "0",groupId = "sorted-group-2")
    public void onMessage(ConsumerRecord<?, ?> consumerRecord) throws InterruptedException {
        Optional<?> optional = Optional.ofNullable(consumerRecord.value());
        if (optional.isPresent()) {
            Object msg = optional.get();
//            从kafka里获取到消息
//            注意分发方式，kafka有两个分区0和1，对应两个消费者
//            当前分区是0，也就是偶数的id，0、2、4、6会在这里被消费
            Order order = JSON.parseObject(String.valueOf(msg),Order.class);


//            而队列是4个。也就是每个消费者再分到两个队列里去
//            队列另一端分别对应4个线程在等待
//            所以，按4取余数
            int index = order.getId() % 4;
//            logger.info("put to queue,queue={},order:[id={},status={}]",index,order.getId(),order.getStatus());

            queues[index].execute(()->{
                logger.info("get from queue, queue:{},order:[id={},status={}]",
                        index,
                        order.getId(),
                        order.getStatus());
            });

        }
    }

    @KafkaListener(topics = {"sorted"},topicPattern = "1",groupId = "sorted-group-2")
    public void onMessage1(ConsumerRecord<?, ?> consumerRecord) throws InterruptedException {
        //相同的实现，现实中为另一台机器，这里用两个listener模拟
        //奇数的id会被分到这里，也就是1、3、5、7
        onMessage(consumerRecord);
    }
}
```


**3）通过swagger请求**
![在这里插入图片描述](https://img-blog.csdnimg.cn/a856eaeb5094486ab61a4c6e8f58d6f9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
先按不同的id发送，查看控制台日志，id被正确分发到对应的队列
![在这里插入图片描述](https://img-blog.csdnimg.cn/551224f821964dc785b53c36a4d46beb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
同一个key分配到同一个queue，顺序性得到保障
![在这里插入图片描述](https://img-blog.csdnimg.cn/e55ee406c97d49998ec60e80f7d5af26.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)