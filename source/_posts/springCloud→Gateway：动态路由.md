---
title: springCloud→Gateway：动态路由
date: 2021-11-25 21:40:16
tags: zk zookeeper 分布式
categories: SpringCloud
---

<!--more-->

### Gateway动态路由

- [业务说明](#_4)
- [基于配置路由设置](#_10)
- - [测试](#_32)
- [基于代码路由配置](#_40)
- [Gateway-Predicate](#GatewayPredicate_61)

  
Gateway路由配置分为 **基于配置**的静态路由设置和 **基于代码**动态路由配置，静态路由是指在application.yml中把路由信息配置好了，而动态路由则是从数据库中加载而来，我们接下来把这2种路由操作都实现一次。

# 业务说明

![请添加图片描述](https://img-blog.csdnimg.cn/c92cda689be8488994cb496c08021b25.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

1.  用户所有请求以/order开始的请求，都路由到 hailtaxi-order服务
2.  用户所有请求以/driver开始的请求，都路由到 hailtaxi-driver服务
3.  用户所有请求以/pay开始的请求，都路由到 hailtaxi-pay服务

# 基于配置路由设置

网关服务的**application.yml：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5a1fdcb019174588874ce372d0cde129.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_19,color_FFFFFF,t_70,g_se,x_16)

如上图所示，正是Gateway静态路由配置：  
1:用户所有请求以/order开始的请求，都路由到 hailtaxi-order服务  
2:用户所有请求以/driver开始的请求，都路由到 hailtaxi-driver服务  
3:用户所有请求以/pay开始的请求，都路由到 hailtaxi-pay服务

**配置参数说明：**

```
routes:路由配置

- id:唯一标识符

uri:路由地址，可以是 lb://IP:端口     也可以是   lb://${spring.application.name}

predicates:断言，是指路由条件

- Path=/driver/**:路由条件。Predicate 接受一个输入参数，返回一个布尔值结果。这里表示匹配所有以driver开始的请求。
```

## 测试

![在这里插入图片描述](https://img-blog.csdnimg.cn/e61dd8af26064317ad4c1898c5c7b97d.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4a53478e80734636b40e891b35ed78ab.png)

此时去访问网关的服务地址就能访问到driver的方法  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4ec609425ee343588451a7fca693ee10.png)

# 基于代码路由配置

我们同样实现上面的功能，但这里基于代码方式实现。所有路由规则我们可以从数据库中读取并加载到程序中。基于代码的路由配置我们只需要创建`RouteLocator`并添加路由配置即可，代码如下：（**代码是写在网关服务的主启动类中**）

```java
    /***
     * 路由配置
     * @param builder
     * @return
     */
    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route(r -> r.path("/driver/**").uri("lb://hailtaxi-driver"))
                .route(r -> r.path("/order/**").uri("lb://hailtaxi-order"))
                //使用GatewayFilter过滤器
                .route(r -> r.path("/pay/**").uri("lb://hailtaxi-pay").filter(new PayFilter()))
                .build();
    }

```

在真实场景中，基于配置文件的方式更直观、简介，但代码的路由配置是更强大，可以实现很丰富的功能，可以把路由规则存在数据库中，每次直接从数据库中加载规则，这样的好处是可以动态刷新路由规则，通常应用于权限系统动态配置新系统。

# Gateway-Predicate

上面路由匹配规则中我们都用了`- Path`方式，其实就是路径匹配方式，除了路径匹配方式，Gateway还支持很多丰富的匹配方式，我们对这些方式分别进行讲解。

关于`Predicate`学习地址，可以参考官网<https://docs.spring.io/spring-cloud-gateway/docs/2.2.5.RELEASE/reference/html/#gateway-request-predicates-factories>

routes下面的属性含义如下：

> - id：我们自定义的路由 ID，保持唯一
> - uri：目标服务地址
> - predicates：路由条件，Predicate 接受一个输入参数，返回一个布尔值结果。该属性包含多种默认方法来将 Predicate 组合成其他复杂的逻辑（比如：与，或，非）

在 Spring Cloud Gateway 中 Spring 利用 Predicate 的特性实现了各种路由匹配规则，通过 Header、请求参数等不同的条件来作为条件匹配到对应的路由。

下面的一张图总结了 Spring Cloud 内置的几种 Predicate 的实现:  
![请添加图片描述](https://img-blog.csdnimg.cn/763de453d9414b30b9dbadb00dd555d4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们在这里讲解几个断言匹配 方式。  
**Cookie：**  
Gateway的Cookie匹配接收两个参数：一个是 Cookie name ,一个是正则表达式。路由规则就是通过获取对应的 Cookie name 值和正则表达式去匹配，如果匹配上就会执行路由，如果没有匹配上则不执行。如下配置：\(**还是网关服务的application.yml中来写配置**\)

```yml
    gateway:
      routes:
      - id: hailtaxi-driver
        uri: lb://hailtaxi-driver
        predicates:
        - Path=/driver/**
		#这里表示请求携带了cookie为username的数据，并且值为itheima，就允许通过。
        - Cookie=username,itheima
```

**Header 匹配：**

Header 匹配 和 Cookie 匹配 一样，也是接收两个参数，一个 header 中属性名称和一个正则表达式，这个属性值和正则表达式匹配则执行。配置如下：\(**还是网关服务的application.yml中来写配置**\)

```yml
  gateway:
      routes:
      - id: hailtaxi-driver
        uri: lb://hailtaxi-driver
        predicates:
        - Path=/driver/**
        - Header=token,^(?!\d+$)[\da-zA-Z]+$
```

上面的匹配规则，就是请求头要有token属性，并且值必须为数字和字母组合的正则表达式，例如携带token=`19and30`就可以通过访问。

**请求方式匹配：**

通过请求的方式是 POST、GET、PUT、DELETE 等进行路由。配置如下：  
\(**还是网关服务的application.yml中来写配置**\)

```yml
gateway:
      routes:
      - id: hailtaxi-driver
        uri: lb://hailtaxi-driver
        predicates:
        - Path=/driver/**
		#只允许get方法的请求通过
        - Method=GET
```