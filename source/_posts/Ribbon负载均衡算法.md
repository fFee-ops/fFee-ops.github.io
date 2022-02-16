---
title: Ribbon负载均衡算法
date: 2020-10-19 17:10:28
tags: 
categories: 
---

<!--more-->

### Ribbon负载均衡算法

- [原理](#_2)
- [手写一个本地负载均衡器](#_6)

# 原理

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019170941326.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 手写一个本地负载均衡器

1、给8001、8002的Controller加一个方法

```java
@GetMapping(value = "/payment/lb")
public String getPaymentLB(){
    return serverPort;
}
 
```

2、80订单微服务改造

①1.ApplicationContextBean去掉\@LoadBalanced\(为了确保之后80是使用的我们自己写的负载均衡算法\)

②![在这里插入图片描述](https://img-blog.csdnimg.cn/20201020130749777.png#pic_center)  
**LoadBalancer接口**

```java
public interface LoadBalancer {
    //收集服务器总共有多少台能够提供服务的机器，并放到list里面
    ServiceInstance instances(List<ServiceInstance> serviceInstances);

}
```

**MyLB**

```java
@Component
public class MyLB implements LoadBalancer {

    private AtomicInteger atomicInteger = new AtomicInteger(0);

    //坐标
    private final int getAndIncrement(){
        int current;
        int next;
        do {
            current = this.atomicInteger.get();
            next = current >= 2147483647 ? 0 : current + 1;
        }while (!this.atomicInteger.compareAndSet(current,next));  //第一个参数是期望值，第二个参数是修改值
        System.out.println("*******第几次访问，次数next: "+next);
        return next;
    }

    @Override
    public ServiceInstance instances(List<ServiceInstance> serviceInstances) {  //得到机器的列表
        int index = getAndIncrement() % serviceInstances.size(); //得到服务器的下标位置
        return serviceInstances.get(index);//返回所得到的微服务
    }
}

```

③往原有的OrderController添加以下内容

```java

    @Resource
    private RestTemplate restTemplate;//利用restTemplate去调用8001服务

    @Resource
    private LoadBalancer loadBalancer;//我们自己写的

    @Resource
    private DiscoveryClient discoveryClient;

    @GetMapping(value = "/consumer/payment/lb")
    public String getPaymentLB(){
        List<ServiceInstance> instances = discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");//在注册中心中根据这个名字，找到所有符合的微服务实例
        if (instances == null || instances.size() <= 0){
            return null;
        }
        //将拿到的实例传入instances(),会得到根据我们自己写的轮询算法所得到的具体的某台机器
        ServiceInstance serviceInstance = loadBalancer.instances(instances);
        URI uri = serviceInstance.getUri();//然后拿到这台机器的uri
        return restTemplate.getForObject(uri+"/payment/lb",String.class);//去访问被分配到的那个机器的Controller
    }

```

---

**测试**  
1、7001/7002集群启动  
2、8001/8002启动  
3、http://localhost/consumer/payment/lb（正常情况我们该看到端口在轮询）