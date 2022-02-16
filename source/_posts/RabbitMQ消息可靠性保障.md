---
title: RabbitMQ消息可靠性保障
date: 2022-01-23 18:54:37
tags:
password:
categories: RabbitMQ
---



![在这里插入图片描述](https://img-blog.csdnimg.cn/debb669d1f9f4576aa6d702a3b268dfd.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
从上面的图可以看到，消息的投递有三个对象参与：生产者、broker、消费者
#  生产者保证
生产者发送消息到broker时，要保证消息的可靠性，主要的方案有以下2种
1. 发送发确认
2. 失败通知

在不做任何配置的情况下，生产者是不知道消息是否真正到达RabbitMQ，也就是说消息发布操作不返回任何消息给生产者。

##  失败通知
如果出现消息无法投递到队列会出现失败通知

那么怎么保证我们消息发布的可靠性？这里我们就可以启动失败通知，在原生编程中在发送消息时设置 `mandatory `标志，即可开启故障检测模式。
![在这里插入图片描述](https://img-blog.csdnimg.cn/08f3f0aa011e4f7ea8fc94f041562762.png)
注意：它只会让 RabbitMQ 向你通知失败，而不会通知成功。如果消息正确路由到队列，则发布者不会受到任何通知。带来的问题是无法确保发布消息一定是成功的，投递到队列的消息可能会没来得及持久化就宕机丢失了。

**实现方式**
spring配置:
![在这里插入图片描述](https://img-blog.csdnimg.cn/a74d55a94bf14390a9d4b7e74a2c4bbe.png)
关键代码，注意需要发送者实现 `ReturnCallback` 接口方可实现失败通知
```java
/**
* 失败通知
* 队列投递错误应答
* 只有投递队列错误才会应答
*/
@Override
public void returnedMessage(Message message, int replyCode, String replyText,
String exchange, String routingKey) {
	//消息体为空直接返回
	if (null == message) {
		return;
	}
	TaxiBO taxiBO = JSON.parseObject(message.getBody(), TaxiBO.class);
	if (null != taxiBO) {
		//删除rediskey
		redisHelper.handelAccountTaxi(taxiBO.getAccountId());
		//记录错误日志
		recordErrorMessage(taxiBO, replyText, exchange, routingKey, message,
		replyCode);
	}
}
```

**遇到的问题**
如果消息正确路由到队列，则发布者不会受到任何通知。带来的问题是无法确保发布消息一定是成功的，我们可以使用RabbitMQ的发送方确认来实现，它不仅仅在路由失败的时候给我们发送消息，并且能够在消息路由成功的时候也给我们发送消息。


##  发送方确认
发送方确认是指生产者投递消息后，如果 Broker 接收到消息，则会给生产者一个应答。生产者进行接收应答，用来确认这条消息是否正常的发送到 Broker，这种方式也是消息可靠性投递的核心保障
rabbitmq消息发送分为两个阶段：
1. 将消息发送到broker，即发送到exchage交换机
2. 消息通过交换机exchange被路由到队列queue

一旦消息投递到队列，队列则会向生产者发送一个通知，如果设置了消息持久化到磁盘，则会等待消息持久化到磁盘之后再发送通知

**注意：发送发确认只有出现RabbitMQ内部错误无法投递才会出现发送发确认失败。**

发送方确认模式需要分两种情况下列来看
**①不可路由**
当前消息到达交换器后对于发送者确认是成功的
![在这里插入图片描述](https://img-blog.csdnimg.cn/43a92e3f9c404ecc995242c3632c5b8b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
首先当RabbitMQ交换器不可路由时，消息也根本不会投递到队列中，所以这里只管到交换器的路径，当消息成功送到交换器后，就会进行确认操作。

另外在这过程中，生产者收到了确认消息后，那么因为消息无法路由，所以该消息也是无效的，无法投递到队列，所以一般情况下这里会结合失败通知来一同使用，这里一般会进行设置 `mandatory `模式，失败则会调用`addReturnListener`监听器来进行处理。


**②可以路由**
只要消息能够到达队列即可进行确认，一般是RabbitMQ发生内部错误才会出现失败
![在这里插入图片描述](https://img-blog.csdnimg.cn/2ac3f132e5e5466b873834cf988d53d9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
可以路由的消息，要等到消息被投递到所有匹配的队列之后，broker会发送一个确认给生产者(包含消息的唯一ID)，这就使得生产者知道消息已经正确到达目的队列了。

如果消息和队列是可持久化的，那么确认消息会在将消息写入磁盘之后发出，broker回传给生产者的确认消息中delivery-tag域包含了确认消息的序列号。

### 使用方式
**spring配置**
```yml
spring:
	rabbitmq:
		# 开启消息确认机制
		publisher-confirm-type: correlated
```

**关键代码，注意需要发送者实现 ConfirmCallback 接口方可实现失败通知**
```java
/**
* 发送发确认
* 交换器投递后的应答
* 正常异常都会进行调用
*
* @param correlationData
* @param ack
* @param cause
*/
@Override
public void confirm(CorrelationData correlationData, Boolean ack, String cause)
{
	//只有异常的数据才需要处理
	if (!ack) {
		//关联数据为空直接返回
		if (correlationData == null) {
			return;
		}
		//检查返回消息是否为null
		if (null != correlationData.getReturnedMessage()) {
			TaxiBO taxiBO =
			JSON.parseObject(correlationData.getReturnedMessage().getBody(), TaxiBO.class);
			//处理消息还原用户未打车状态
			redisHelper.handelAccountTaxi(taxiBO.getAccountId());
			//获取交换器
			String exchange =
			correlationData.getReturnedMessage().getMessageProperties().getHeader("SEND_EXCH
ANGE");
			//获取队列信息
			String routingKey =
			correlationData.getReturnedMessage().getMessageProperties().getHeader("SEND_ROUT
ING_KEY");
			//获取当前的消息体
			Message message = correlationData.getReturnedMessage();
			//记录错误日志
			recordErrorMessage(taxiBO, cause, exchange, routingKey, message,
			-1);
		}
	}
}
```

##  Broker丢失消息
前面我们从生产者的角度分析了消息可靠性传输的原理和实现，这一部分我们从broker的角度来看一下如何能保证消息的可靠性传输。

假设有现在一种情况，生产者已经成功将消息发送到了交换机，并且交换机也成功的将消息路由到了队列中，但是在消费者还未进行消费时，mq挂掉了，那么重启mq之后消息还会存在吗？如果消息不存在，那就造成了消息的丢失，也就不能保证消息的可靠性传输了。

也就是现在的问题变成了如何在mq挂掉重启之后还能保证消息是存在的？
>开启RabbitMQ的持久化，也即消息写入后会持久化到磁盘，此时即使mq挂掉了，重启之后也会自动读取之前存储的额数据

**①持久化队列：**
```java
@Bean
public Queue queue(){
	return new Queue(queueName,true);
}
```

**②持久化交换器:**
```java
@Bean
DirectExchange directExchange() {
	return new DirectExchange(exchangeName,true,false);
}
```

**③发送持久化消息**
发送消息时，设置消息的`deliveryMode=2`。如果使用SpringBoot的话，发送消息时自动设置`deliveryMode=2`，不需要人工再去设置


**Broker总结:**
通过以上方式，可以保证大部分消息在broker不会丢失，但是还是有很小的概率会丢失消息，什么情况下会丢失呢？

假如消息到达队列之后，还未保存到磁盘mq就挂掉了，此时还是有很小的几率会导致消息丢失的。

这就要mq的持久化和前面的confirm进行配合使用，只有当消息写入磁盘后才返回ack，那么就是在持久化之前mq挂掉了，但是由于生产者没有接收到ack信号，此时可以进行消息重发。


#  消费者保证
##  消费者手动确认
消费者接收到消息，但是还未处理或者还未处理完，此时消费者进程挂掉了，比如重启或者异常断电等，此时mq认为消费者已经完成消息消费，就会从队列中删除消息，从而导致消息丢失。


那该如何避免这种情况呢？这就要用到RabbitMQ提供的ack机制，RabbitMQ默认是自动ack的，此时需要将其修改为手动ack，也即自己的程序确定消息已经处理完成后，手动提交ack，此时如果再遇到消息未处理进程就挂掉的情况，由于没有提交ack，RabbitMQ就不会删除这条消息，而是会把这条消息发送给其他消费者处理，但是消息是不会丢的。


**配置文件:**
![在这里插入图片描述](https://img-blog.csdnimg.cn/a326d6c19ce84f62823c1b47c7d5d972.png)
**参数介绍**
`acknowledge-mode: manual`就表示开启手动ack，该配置项的其他两个值分别是none和auto

- auto：消费者根据程序执行正常或者抛出异常来决定是提交ack或者nack，不要把none和auto搞混了
- manual: 手动ack，用户必须手动提交ack或者nack
- none: 没有ack机制

**消费者实现**
```java
@RabbitListener(
bindings =
{
@QueueBinding(value = @Queue(value =
RabbitConfig.TAXI_DEAD_QUEUE, durable = "true"),
exchange = @Exchange(value =
RabbitConfig.TAXI_DEAD_QUEUE_EXCHANGE), key = RabbitConfig.TAXI_DEAD_KEY)
}
)
@RabbitHandler
public void processOrder(Message massage, Channel channel,
@Header(AmqpHeaders.DELIVERY_TAG) long tag) {
TaxiBO taxiBO = JSON.parseObject(massage.getBody(), TaxiBO.class);
try {
	//开始处理订单
	logger.info("处理超时订单，订单详细信息：" + taxiBO.toString());
	taxiService.taxiTimeout(taxiBO);
	//手动确认机制
	channel.basicAck(tag, false);
}
catch (Exception e) {
	e.printStackTrace();
}
}
```