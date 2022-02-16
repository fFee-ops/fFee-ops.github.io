---
title: Filter的使用
date: 2020-10-22 10:43:30
tags: 
categories: 
---

<!--more-->

### Filter的使用

- [是什么](#_2)
- [Spring Cloud Gateway的Filter](#Spring_Cloud_GatewayFilter_6)
- - [常用的GatewayFilter](#GatewayFilter_15)
- [自定义过滤器](#_21)
- - [测试](#_61)

# 是什么

- 路由过滤器可用于修改进入的HTTP请求和返回的HTTP响应,路由过滤器只能指定路由进行使用。
- Spring Cloud Gateway内置了多种路由过滤器,他们由 Gateway Filter的工厂类来产生

# Spring Cloud Gateway的Filter

**生命周期只有pre\(在业务逻辑之前\)、post\(在业务逻辑之后\)**

**种类只有GatewayFilter\(单一\)、GlobalFilter\(全局\)**

## 常用的GatewayFilter

因为有31种之多，并且一般都是用的自定义的filter，所以这里只举例怎么去使用。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020102210400883.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

# 自定义过滤器

**主要是要实现两个接口 GlobalFilter ，Ordered**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201022104117714.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

```java

/**
 * 自定义全局GlobalFilter
 */
@Component
@Slf4j
public class MyLogGateWayFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        log.info("*********come in MyLogGateWayFilter: "+new Date());
        /**
         * 要求请求必须带有参数username且值不能为空
         * 例如：http://localhost:9527/payment/lb?username=w（这是正确的）
         */
        String username = exchange.getRequest().getQueryParams().getFirst("username");
        if(StringUtils.isEmpty(username)){
            log.info("*****用户名为Null 非法用户,(┬＿┬)");
            exchange.getResponse().setStatusCode(HttpStatus.NOT_ACCEPTABLE);//给人家一个回应
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return 0;//过滤链顺序  数字越小 越先
    }
}


```

## 测试

1、启动![在这里插入图片描述](https://img-blog.csdnimg.cn/20201022104200818.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

2、访问http://localhost:9527/payment/lb\?username=z3这是正确的

3、http://localhost:9527/payment/lb\?me=z3这是错误的，因为没有username。