---
title: springCloud→Gateway： 跨域配置和限流
date: 2021-11-25 21:53:24
tags: zookeeper 分布式 云原生
categories: SpringCloud
---

<!--more-->

### Gateway 跨域配置和限流

- [跨域配置](#_2)
- [限流](#_40)
- - [令牌算法讲解](#_43)
  - [限流案例](#_45)

# 跨域配置

出于浏览器的同源策略限制。同源策略（Sameoriginpolicy）是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，则浏览器的正常功能可能都会受到影响。可以说Web是构建在同源策略基础之上的，浏览器只是针对同源策略的一种实现。同源策略会阻止一个域的javascript脚本和另外一个域的内容进行交互。所谓同源（即指在同一个域）就是两个页面具有相同的协议（protocol），主机（host）和端口号（port）。

在Spring Cloud Gateway中配置跨域是非常简单的，如下面`application.yml`所示：\(配置在网关服务的配置文件中\)

```yml
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods:
              - GET
              - POST
              - PUT
```

但如果涉及到Cookie跨域，上面的配置就不生效了，如果涉及到Cookie跨域，需要创建`CorsWebFilter`过滤器，代码如下：（**代码在网关服务的主启动类中**）

```java
    /**
     * 配置跨域
     * @return
     */
    @Bean
    public CorsWebFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // cookie跨域
        config.setAllowCredentials(Boolean.TRUE);
        config.addAllowedMethod("*");
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        // 配置前端js允许访问的自定义响应头
        config.addExposedHeader("Authorization");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(new PathPatternParser());
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
```

# 限流

网关可以做很多的事情，比如，限流，当我们的系统 被频繁的请求的时候，就有可能 将系统压垮，所以为了解决这个问题，需要在每一个微服务中做限流操作，但是如果有了网关，那么就可以在网关系统做限流，因为所有的请求都需要先通过网关系统才能路由到微服务中。

## 令牌算法讲解

![请添加图片描述](https://img-blog.csdnimg.cn/48486d9e6ade4e39b3803bd7cd6380a2.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 限流案例

**注意：所有改动都在网关服务中**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d8ad9ae2813841b994131c029eacd103.png)

**1\)引入依赖**  
spring cloud gateway 默认使用redis的RateLimter限流算法来实现。所以我们要使用首先需要引入redis的依赖：

```yml

<!--redis-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
    <version>2.2.1.RELEASE</version>
</dependency>
```

同时不要忘记Redis配置：

```yml
  redis:
    host: 127.0.0.1
    port: 6379
```

**2\)定义KeyResolver**  
KeyResolver用于计算某一个类型的限流的KEY也就是说，可以通过KeyResolver来指定限流的Key。

我们可以根据IP来限流，比如每个IP每秒钟只能请求一次，在GatewayApplication\(**网关的主启动类**\)定义key的获取，获取客户端IP，将IP作为key，如下代码：

```java
    /***
     * IP限流
     * @return
     */
    @Bean(name="ipKeyResolver")
    public KeyResolver userKeyResolver() {
        return new KeyResolver() {
            @Override
            public Mono<String> resolve(ServerWebExchange exchange) {
                //获取远程客户端IP
                String hostName = exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
                System.out.println("hostName:"+hostName);
                return Mono.just(hostName);
            }
        };
    }

```

并且在ymml配置文件的路由中配置如下：

```yml

      routes:
      - id: hailtaxi-driver
        uri: lb://hailtaxi-driver
        predicates:
        - Path=/**
        filters:
          - name: RequestRateLimiter #请求数限流 名字不能随便写 ，使用默认的facatory
            args:
              key-resolver: "#{@ipKeyResolver}"
              redis-rate-limiter.replenishRate: 1
              redis-rate-limiter.burstCapacity: 1
```

参数说明：

> - redis-rate-limiter.replenishRate是您希望允许用户每秒执行多少请求，而不会丢弃任何请求。这是令牌桶填充的速率
> - redis-rate-limiter.burstCapacity是指令牌桶的容量，允许在一秒钟内完成的最大请求数,将此值设置为零将阻止所有请求。
> - key-resolver: “#\{\@ipKeyResolver\}” 用于通过SPEL表达式来指定使用哪一个KeyResolver.

如上配置：  
表示 一秒内，允许 一个请求通过，令牌桶的填充速率也是一秒钟添加一个令牌。最大突发状况 也只允许 一秒内有一次请求，可以根据业务来调整 。

我们快速请求`http://localhost:8001/driver/info/1`执行测试，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4c681f45220f4ade81731c9b5b206af4.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)