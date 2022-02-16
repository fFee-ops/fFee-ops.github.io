---
title: 服务发现Discovery
date: 2020-10-18 12:55:45
tags: 
categories: Eureka
---

<!--more-->

### 服务发现Discovery

- [自测](#_31)

**作用：** 对于注册进eureka里面的微服务，可以通过服务发现来获得该服务的信息。

1、修改cloud-provider-payment8001的Controller（8002同理，这里就不讲8002了）

```java
@Resource
private DiscoveryClient discoveryClient;//注意包不要导错了，不是网飞的包
 
 
@GetMapping(value = "/payment/discovery")
public Object discovery(){
    List<String> services = discoveryClient.getServices();
    for (String element : services) {
        log.info("***** element:"+element);
    }
    List<ServiceInstance> instances = discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");
    for (ServiceInstance instance : instances) {
        log.info(instance.getServiceId()+"\t"+instance.getHost()+"\t"+instance.getPort()+"\t"+instance.getUri());
    }
    return this.discoveryClient;
}
 
 
 
 

```

2、8001主启动类添加注解\@EnableDiscoveryClient

# 自测

1、先要启动EurekaServer，7001/7002服务  
2、再启动8001主启动类，需要稍等一会  
3、http://localhost:8001/payment/discovery