---
title: Ribbon核心组件IRule
date: 2020-10-19 14:07:47
tags: 
categories: 
---

<!--more-->

### Ribbon核心组件IRule

- [IRule:根据特定算法从服务列表中选取一个要访问的服务](#IRule_2)
- [如何替换 默认的轮询算法](#__7)

# IRule:根据特定算法从服务列表中选取一个要访问的服务

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019140224315.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
总共有这么多类型。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019140245936.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 如何替换 默认的轮询算法

1、修改cloud-consumer-order80  
2、注意配置细节\(不能放在启动类的包及其子包下\)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019140426770.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

3、新建package  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201019140603703.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

4、上面包下新建MySelfRule规则类

```java
@Configuration
public class MySelfRule {

    @Bean
    public IRule myRule(){
        return new RandomRule();//定义为随机
    }
}


```

5、主启动类添加\@RibbonClient

```java
@EnableEurekaClient
@SpringBootApplication
@RibbonClient(name = "CLOUD-PAYMENT-SERVICE",configuration = MySelfRule.class)
public class OrderMain80 {
    public static void main(String[] args) {
        SpringApplication.run(OrderMain80.class,args);
    }
}

```

6、测试：http://localhost/consumer/payment/get/31