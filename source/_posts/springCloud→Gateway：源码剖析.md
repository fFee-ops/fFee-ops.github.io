---
title: springCloud→Gateway：源码剖析
date: 2021-11-28 22:49:18
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### Gateway源码剖析

- [Gateway工作流程源码剖析](#Gateway_5)
- - [1.1 Gateway工作流程分析](#11_Gateway_7)
  - [1.2 Gateway工作流程源码](#12_Gateway_11)
  - [1.3 请求处理](#13__38)
  - - [RouteToRequestUrlFilter](#RouteToRequestUrlFilter_50)
    - [ForwardRoutingFilter](#ForwardRoutingFilter_58)
- [Gateway负载均衡源码剖析](#Gateway_62)
- - [2.1 地址转换](#21__65)
  - [2.2 负载均衡服务选择](#22__68)

源码分析小技巧：可以自己先画一个思维导图，把大致步骤画出来，再根据思维导图去深入到源码里面去看，不容易迷路

# Gateway工作流程源码剖析

## 1.1 Gateway工作流程分析

![请添加图片描述](https://img-blog.csdnimg.cn/34f245efa9e4490e9db600ea1568d831.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
前面已经学习过Gateway的工作流程，如上工作流程图，我们回顾一下工作流程：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cc442a8f26eb46ad89e66bf52bceb46f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2 Gateway工作流程源码

分析源码的时候对应着1.1的步骤，比较容易理解

我们首先来看一下Gateway拦截处理所有请求的入口方法`HttpWebHandlerAdapter中`的handle\(\)：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2f3aa55a38904043b1e0b89c22dadf08.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面getDelegate\(\)方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b152d7af12b0405795bf496a127110f9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们进行Debug测试如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9dc948458ab84e17bd28194f7eb5fb56.png)  
当前返回的WebHandler是`ExceptionHandlingWebHandler`，而`ExceptionHandlingWebHandler`的delegate是`FilteringWebHandler`，而`FilteringWebHandler`的delegate是`delegate`是`DispatcherHandler`，所有的delegate的`handle()`方法都会依次执行，我们可以把断点放到`DispatcherHandler.handle()`方法上：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/23fcbf73c3174915b65c60d7e57fc881.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
handle\(\)方法会调用所有handlerMappings的`getHandler(exchange)`方法，而`getHandler(exchange)`方法会调用`getHandlerInternal(exchange)`方法：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/da4f3049b3324d179173ac3e64525cf6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`getHandlerInternal(exchange)`该方法由各个`HandlerMapping`自行实现，我们可以观察下断言处理的`RoutePredicateHandlerMapping`的`getHandlerInternal(exchange)`方法会调用lookupRoute方法，该方法用于返回对应的路由信息:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cb3cda41ed3d49528d2b78a10f5b2aa2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
这里的路由匹配其实就是我们项目中对应路由配置的一个一个服务的信息，这些服务信息可以帮我们找到我们要调用的真实服务：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0662aa2a5ec6404aae926b102ba9bd41.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
每个Route对象如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b5f31888b12f4194aa1028e130cbaafe.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Route的DEBUG数据如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/288436c447664e6bbb91312577ef8d6f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
找到对应Route后会返回指定的FilterWebHandler，如下代码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8e4509f36c28420ba2d54e66baa964d6.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
FilterWebHandler主要包含了所有的过滤器，过滤器按照一定顺序排序，主要是order值，越小越靠前排，过滤器中主要将请求交给指定真实服务处理了，debug测试如下：  
![请添加图片描述](https://img-blog.csdnimg.cn/7bb62ad39b44473ab71ee1de766ea320.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
这里有`RouteToRequestUrlFilter`和`ForwardRoutingFilter`以及`LoadBalancerClientFilter`等多个过滤器。

## 1.3 请求处理

这里讲的请求处理的源码并不是很完整，完整的请看[思维导图](https://github.com/fFee-ops/SomeCollection/blob/main/Gateway%E3%80%81openfeign%E3%80%81stream%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90.xmind)中的流程

在上面FilterWebHandler中有2个过滤器，分别为`RouteToRequestUrlFilter`和`ForwardRoutingFilter`。

`RouteToRequestUrlFilter`：根据**匹配**的 Route,计算请求地址得到 `lb://hailtaxi-order/order/list`

`ForwardRoutingFilter`:转发路由网关过滤器。其根据 forward:// 前缀\( Scheme \)过滤处理，将请求转发到当前网关实例本地接口。

### RouteToRequestUrlFilter

RouteToRequestUrlFilter源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/243c91e04d32401a972164e59024027e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
debug调试结果如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/1f5fe4b8d1924947b31268a68463d779.png)  
从上面调试结果我们可以看到所选择的Route以及uri和routeUri和mergedUrl，该过滤器其实就是将用户请求的地址换成服务地址，换成服务地址可以用来做负载均衡。

### ForwardRoutingFilter

转发路由网关过滤器。其根据 forward:// 前缀\( Scheme \)过滤处理，将请求转发到当前网关实例本地接口。我们调试该过滤器，可以发现执行了远程调用，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ac152a3c868044ffb0a1e85a411a0bc1.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# Gateway负载均衡源码剖析

前面源码剖析主要剖析了Gateway的工作流程，我们接下来剖析Gateway的负载均衡流程。在最后的过滤器集合中有`LoadBalancerClientFilter`过滤器，该过滤器是用于实现负载均衡。

## 2.1 地址转换

`LoadBalancerClientFilter`过滤器首先会将用户请求地址转换成真实服务地址，也就是IP:端口号，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a464fc5d542744fb8b49afadad671b51.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.2 负载均衡服务选择

上面代码的关键是`choose(exchange)`的调用，该方法调用其实就是选择指定服务，这里涉及到负载均衡服务轮询调用算法等，我们可以跟踪进去查看方法执行流程。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a61320774a2e4467a1864da5253cd6ef.png)  
Gateway自身已经集成Ribbon，所以看到的对象是RibbonLoadBalancerClient，我们跟踪进去接着查看：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c9aed78e873f4cbba561c8ee91e4e6e8.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面方法会依次调用到getInstance\(\)方法，该方法会返回所有可用实例，有可能有多个实例，如果有多个实例就涉及到负载均衡算法，方法调用如下图：  
![请添加图片描述](https://img-blog.csdnimg.cn/74d239c3976f48bf88876c38d0ca1c30.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时调用getServer\(\)方法，再调用`BaseLoadBalancer.chooseServer()`，这里是根据指定算法获取对应实例，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/81f73ec3e41840ab9f1b16115838ea0e.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`BaseLoadBalancer`是属于Ribbon的算法，我们可以通过如下依赖包了解，并且该算法默认用的是`RoundRobinRule`，也就是轮循算法，如下代码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/27db1b17de1e40e481f8a8dfa3a9cf21.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)