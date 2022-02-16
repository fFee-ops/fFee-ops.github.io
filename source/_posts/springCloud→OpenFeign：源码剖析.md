---
title: springCloud→OpenFeign：源码剖析
date: 2021-11-28 23:09:12
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### OpenFeign源码剖析

- [1.1 注解处理](#11__4)
- [1.2 Feign代理注册](#12_Feign_15)
- [1.3 Builder对象](#13_Builder_20)
- [1.4 Feign代理创建](#14_Feign_25)
- [1.5 远程请求](#15__44)

feign的核心功能就是通过接口去访问网络资源，里面也是用动态代理来实现的，就跟Mybatis用接口去访问数据库一样，我们就来看下源码的处理，核心就一个包：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8d1498ffefb246d08eb49bdec7d51d18.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.1 注解处理

使用OpenFeign的时候会用到2个注解，分别是`@FeignClient(value = "hailtaxi-driver")`和`@EnableFeignClients(basePackages = "com.itheima.driver.feign")`，这两个注解其实就是学习OpenFeign的入口。

`@EnableFeignClients`这 个注解的作用其实就是开启了一个`FeignClient`的扫描，那么点击启动类的`@EnableFeignClients`注解看下他是怎么开启`FeignClient`的扫描的，进去后发现里面有个\@Import\(FeignClientsRegistrar.class\)这个FeignClientsRegistrar跟Bean的动态装载有关。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c90e03b4699d4735ad7bfb23a36b0a52.png)  
FeignClientsRegistrar类中有一个方法`registerBeanDefinitions`用于注入Bean的，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/88e03763d23b4d32a7a6fe0dc81f8f2f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们主要关注`registerFeignClients()`方法，该方法会通过解析`@EnableFeignClients`并解析`@FeignClient`实现Feign的注册，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c762c022c3f3408baf10a58e5fd17959.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面注解解析后，会调用`registerFeignClient()`注册客户端，我们来看下`registerFeignClient()`方法具体实现流程，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a024ce29195c48739e68696b030a4dff.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.2 Feign代理注册

上面方法中创建`BeanDefinitionBuilder`的时候传入了一个参数`FeignClientFactoryBean.class`，注册的Bean就是参数中自己传进来的beanClass是工厂Bean，可以用来创建Feign的代理对象，我们来看一下`FeignClientFactoryBean`源码,可以发现它实现了FactoryBean，所以它可以获取对象实例，同时也能创建对象的代理对象，部分源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b34bc833ed4d4da7b8955089122b0999.png)  
它里面有一个方法`getObject()`，该方法就是用于返回一个对象实例，而对象其实是代理对象，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d03b2d7f88cf4126a3370870a9462be6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.3 Builder对象

上面片段代码中`Feign.Builder builder = feign(context)`是用于构建Builder，关于Builder源码属性我们进行详细讲解，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/38f9cc9e119a4e5185af41c12e747f74.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
builder构建如下方法：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b917976cb22448dda00a0ca385ff684d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.4 Feign代理创建

上面的builder构造完后继续向下走，配置完Feign.Builder之后，再判断是否需要LoadBalance，如果需要，则通过loadBalance\(builder, context,new HardCodedTarget\<>\(this.type, this.name, this.url\)\);的方法来设置。实际上他们最终调用的是Target.target\(\)方法。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b3301b1e74924dd486b2130a003a53e4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面方法会调用`targeter.target(this, builder, context, target);`，它支持服务熔断降级，我们直接看默认的`DefaultTrageter`就可以了。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c8802fb1710442549f171b3ad24f6c34.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`DefaultTargeter`的`target()`方法是一个非常简单的调用，但开启了Feign代理对象创建的开始：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2fb97b3945324f2480d087905de6bf86.png)  
`target`方法调用了build\(\).newInstance\(\)，这个方法信息量比较大，我们要拆分这看`build()`和`newInstance(target)`：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4dc540ee12a946c99e82bb23453e19df.png)  
build\(\)方法是创建客户端对象`ReflectiveFeign`，看着名字就像代理的意思，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5bf6ace069ad4aadac1e0c4958681d1f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们再来看`ReflectiveFeign`，它继承了`Feign`同时也有一个属性`InvocationHandlerFactory`，该对象其实就是代理工厂对象,源码如下：

`ReflectiveFeign`源码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/aac7565bed3140d8900aea7ae55f0b21.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`InvocationHandlerFactory`源码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20a1e0a7a1744bae9479cb6b92c4ec3c.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们再来看`newInstance(Target<T> target)`方法，该方法就是用来创建Feign的代理对象，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0ebe79d6a607446489a604e1e715db09.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 1.5 远程请求

远程请求一定是要有IP和端口的，OpenFeign将IP和端口封装到RequestTemplate中了，我们来看一下RequestTemplate源码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/82fd0788543b4c2686a10567405e2bb5.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在`SynchronousMethodHandler`类中执行远程调用，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/dad34f864c2e46b38ddbb3dd2753be0d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面调用会调用`executeAndDecode()`方法，该方法是执行远程请求，同时解析响应数据，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9113833836154843a57440ca0fa3312e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)