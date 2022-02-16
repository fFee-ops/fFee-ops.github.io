---
title: OpenFeign超时控制
date: 2020-10-20 14:15:57
tags: 
categories: 
---

<!--more-->

### OpenFeign超时控制

- [超时设置，故意设置超时演示出错情况](#_3)
- [什么是超时控制](#_56)
- [YML文件里开启OpenFeign客户端超时控制](#YMLOpenFeign_66)

  
**为了方便只演示7001/8001，不使用集群，但是是同理的**

# 超时设置，故意设置超时演示出错情况

1、服务提供方8001故意写暂停程序

```java
@GetMapping(value = "/payment/feign/timeout")
public String paymentFeignTimeout(){
    try { TimeUnit.SECONDS.sleep(3); }catch (Exception e) {e.printStackTrace();}
    return serverPort;
}
 
```

2、服务消费方80添加超时方法PaymentFeignService

```java
@Component
@FeignClient(value = "CLOUD-PAYMENT-SERVICE")
public interface PaymentFeignService {
    /**
     * 相当于在消费者Controller和生产者Controller中加了一层Service
     *
     * Controller(consumer)--->Service(Feign)-->Controller(Provider)
     * @param id
     * @return
     */
    @GetMapping(value = "/payment/get/{id}")
    public CommonResult getPaymentById(@PathVariable("id") Long id);

	@GetMapping(value = "/payment/feign/timeout")
	public String paymentFeignTimeout();
 

}



```

3、服务消费方80添加超时方法OrderFeignController

```java
@GetMapping(value = "/consumer/payment/feign/timeout")
public String paymentFeignTimeout(){
   return paymentFeignService.paymentFeignTimeout();
}
 

```

4、http://localhost/consumer/payment/feign/timeout

错误页面  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201020140951965.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 什么是超时控制

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201020141355231.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**OpenFeign默认等待一秒钟，超过后报错**

---

**OpenFeign默认支持Ribbon**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020102014143837.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# YML文件里开启OpenFeign客户端超时控制

```yml
ribbon:
  ReadTimeout:  5000
  ConnectTimeout: 5000
```