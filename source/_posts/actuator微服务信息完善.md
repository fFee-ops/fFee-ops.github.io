---
title: actuator微服务信息完善
date: 2020-10-18 12:40:22
tags: 
categories: Eureka
---

<!--more-->

### actuator微服务信息完善

- [主机名称：服务名称修改](#_2)
- [访问信息有ip信息提示](#ip_24)

# 主机名称：服务名称修改

修改cloud-provider-payment8001/8002的yml  
**8001:**

```yml
只要添加一个这个
instance:
    instance-id: payment8001
```

**8002:**

```yml
只要添加一个这个
instance:
    instance-id: payment8002
```

修改之后的效果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201018123743105.png#pic_center)  
可以看到这里是我们配置的ID了。方便查看

# 访问信息有ip信息提示

**当前问题**：没有ip提示

1、修改cloud-provider-payment8001/8002的yml  
**8001:**

```yml
添加
prefer-ip-address: true 
```

Eureka部分的完整yml

```yml
eureka:
  client:
    register-with-eureka: true
    fetchRegistry: true
    service-url:
      #单机版http://localhost:7001/eureka
      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka  #集群版
  instance:
    instance-id: payment8001
    prefer-ip-address: true
```

---

**8002同理**

---

修改之后的效果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201018124010541.png#pic_center)