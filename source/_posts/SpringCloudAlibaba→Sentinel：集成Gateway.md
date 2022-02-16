---
title: SpringCloudAlibaba→Sentinel：集成Gateway
date: 2021-12-23 12:19:31
tags: gateway java 开发语言
categories: SpringCloudAlibaba
---

<!--more-->

### Sentinel集成Gateway

- [1、Sentinel对网关支持](#1Sentinel_2)
- [2、集成Sentinel](#2Sentinel_14)
- [3、配置/API定义](#3API_72)
- - [1\)API定义](#1API_74)
  - [2\)规则创建](#2_103)
  - [3\)配置/Api加载](#3Api_150)

# 1、Sentinel对网关支持

Sentinel 支持对 Spring Cloud Gateway、Zuul 等主流的 API Gateway 进行限流。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/43cebe768c4d447abbfbecf2ef14e46e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Sentinel 1.6.0 引入了`Sentinel API Gateway Adapter Common` 模块，此模块中包含网关限流的规则和自定义 API 的实体和管理逻辑：

- `GatewayFlowRule` ：网关限流规则，针对 API Gateway 的场景定制的限流规则，可以针对不同route 或自定义的 API 分组进行限流，支持针对请求中的参数、Header、来源 IP 等进行定制化的限流。
- `ApiDefinition` ：用户自定义的 API 定义分组，可以看做是一些 URL 匹配的组合。比如我们可以定义一个 API 叫 my\_api ，请求 path 模式为`/foo/**`和 `/baz/**`的都归到 my\_api 这个 API分组下面。限流的时候可以针对这个自定义的 API 分组维度进行限流

其中网关限流规则 `GatewayFlowRule`的一些属性解释如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/141a2b010b98448f9bef948172493e0b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2、集成Sentinel

项目结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f483610833374f60b306e51258e6780c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/11d28dc0d0374a859742c8d896168661.png)  
我们如果想要让微服务网关集成Sentinel，需要引入依赖包，使用时只需注入对应的`SentinelGatewayFilter` 实例以及`SentinelGatewayBlockExceptionHandler` 实例即可。

①首先在 `hailtaxi-gateway`中引入如下依赖:

```xml
        <!--Sentinel-->
        <dependency>
            <groupId>com.alibaba.csp</groupId>
            <artifactId>sentinel-spring-cloud-gateway-adapter</artifactId>
            <version>1.8.1</version>
        </dependency>
```

②实例引入：在gateway项目创建配置类 `com.itheima.config.GatewayConfiguration`:

```java

@Configuration
public class GatewayConfiguration {
    private final List<ViewResolver> viewResolvers;
    private final ServerCodecConfigurer serverCodecConfigurer;

    public GatewayConfiguration(ObjectProvider<List<ViewResolver>>
                                        viewResolversProvider,
                                ServerCodecConfigurer serverCodecConfigurer) {
        this.viewResolvers =
                viewResolversProvider.getIfAvailable(Collections::emptyList);
        this.serverCodecConfigurer = serverCodecConfigurer;
    }

    /**
     * 限流的异常处理器
     *
     * @return
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SentinelGatewayBlockExceptionHandler
    sentinelGatewayBlockExceptionHandler() {
        return new SentinelGatewayBlockExceptionHandler(viewResolvers,
                serverCodecConfigurer);
    }

    /***
     * Sentinel路由处理核心过滤器
     * @return
     */
    @Bean
    @Order(-1)
    public GlobalFilter sentinelGatewayFilter() {
        return new SentinelGatewayFilter();
    }
}
```

此时集成就完成了。

# 3、配置/API定义

## 1\)API定义

正如前面所说， `ApiDefinition` 用户自定义的 API 定义分组，可以看做是一些 URL 匹配的组合。比如我们可以定义一个 API 叫`my_api`，请求 path 模式为 `/foo/**` 和 `/baz/**`的都归到 my\_api 这个API 分组下面。限流的时候可以针对这个自定义的 API 分组维度进行限流。

我们在gateway项目的配置类 `com.itheima.config.GatewayConfiguration` 创建Api：

```java

    /***
     * Api定义
     */
    private void initCustomizedApis() {
        //Api集合
        Set<ApiDefinition> definitions = new HashSet<ApiDefinition>();
        ApiDefinition cartApi = new ApiDefinition("hailtaxi_driver_api")
                .setPredicateItems(new HashSet<ApiPredicateItem>() {{
                    add(new ApiPathPredicateItem().setPattern("/driver/**"));
                    add(new ApiPathPredicateItem().setPattern("/car/model/**"));
                    add(new ApiPathPredicateItem().setPattern("/trip/message")
        //参数值的匹配策略
        // 精确匹配（PARAM_MATCH_STRATEGY_EXACT）
        // 子串匹配（PARAM_MATCH_STRATEGY_CONTAINS）
        // 正则匹配（PARAM_MATCH_STRATEGY_REGEX）
                            .setMatchStrategy(SentinelGatewayConstants.URL_MATCH_STRATEGY_PREFIX));
                }});
        definitions.add(cartApi);
        //加载Api
        GatewayApiDefinitionManager.loadApiDefinitions(definitions);
    }
```

## 2\)规则创建

`GatewayFlowRule`网关限流规则，针对 API Gateway 的场景定制的限流规则，可以针对不同 route或自定义的 API 分组进行限流，支持针对请求中的参数、Header、来源 IP 等进行定制化的限流。

我们在gateway项目的配置类`com.itheima.config.GatewayConfiguration` 创建配置：

```java
    /**
     * 规则定义
     */
    private void initGatewayRules() {
        //网关限流规则
        Set<GatewayFlowRule> rules = new HashSet<GatewayFlowRule>();
        //商品微服务规则配置
        //资源名称，可以是网关中的 route 名称或者用户自定义的 API 分组名称
        rules.add(new GatewayFlowRule("hailtaxi-order")
                //限流阈值
                .setCount(2)
                //应对突发请求时额外允许的请求数目。
                .setBurst(2)
                //统计时间窗口，单位是秒，默认是 1 秒。
                .setIntervalSec(1)
                //限流行为
                //CONTROL_BEHAVIOR_RATE_LIMITER 匀速排队
                //CONTROL_BEHAVIOR_DEFAULT 快速失败(默认)
                .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER)
                //匀速排队模式下的最长排队时间，单位是毫秒，仅在匀速排队模式下生效。
                .setMaxQueueingTimeoutMs(1000)
        );
        //单独对API 【mall_cart_api】限流配置
        rules.add(new GatewayFlowRule("hailtaxi_driver_api")
                //限流阈值
                .setCount(3)
                //统计时间窗口，单位是秒，默认是 1 秒。
                .setIntervalSec(1)
        );
        //加载网关规则
        GatewayRuleManager.loadRules(rules);
    }
```

上述代码中的

```java
 rules.add(new GatewayFlowRule("hailtaxi-order")
```

就是指定了要拦截gateway中的哪些route来进行限流、熔断。比如上面那行代码。其实就对应了gateway配置文件中的  
![在这里插入图片描述](https://img-blog.csdnimg.cn/779f2c1c2a804a9bb4bd68290a74b09d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3\)配置/Api加载

上面两个步骤创建了API并且创建了配置，但并没有在程序启动加载，我们可以采用 `@PostConstruct`注解实现加载调用，在`com.itheima.config.GatewayConfiguration`中创建方法：

```java
    /***
     * 初始化加载Api和规则
     */
    @PostConstruct
    public void doInit() {
        initCustomizedApis();
        initGatewayRules();
    }
```