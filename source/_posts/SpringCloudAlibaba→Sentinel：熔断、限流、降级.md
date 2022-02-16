---
title: SpringCloudAlibaba→Sentinel：熔断、限流、降级
date: 2021-12-14 15:39:47
tags: spring boot java 微服务
categories: SpringCloudAlibaba
---

<!--more-->

### Sentinel熔断、限流、降级

- [1 SpringBoot集成](#1_SpringBoot_9)
- - [1.1 \@SentinelResource注解](#11_SentinelResource_20)
  - [1.2 blockHandler](#12_blockHandler_24)
  - [1.3 fallback](#13_fallback_68)
  - [1.4 defaultFallback](#14_defaultFallback_81)
- [2 限流、熔断规则](#2__92)
- - [2.1 流量控制](#21__103)
  - [2.2 熔断](#22__140)
  - [2.3 系统自我保护](#23__178)
  - [2.4 热点数据](#24__216)
- [3 OpenFeign支持](#3_OpenFeign_300)
- - [3.1 fallback](#31_fallback_330)
  - [3.2 fallbackFactory](#32_fallbackFactory_366)

![在这里插入图片描述](https://img-blog.csdnimg.cn/ca12b91aab2249dea9f0784622b6ba8f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e57620519546487c84fb6a82cecdebf0.png)

工程简介：  
在我们项目中，用户请求通过 `hailtaxi-gateway`路由到 `hailtaxi-driver` 或者 `hailtaxi-order`，还有可能在 hailtaxi-order 中使用feign调用 hailtaxi-driver ，所以我们有可能在单个服务中实现熔断限流，也有可能要集成feign调用实现熔断限流，还有可能在微服务网关中实现熔断限流。我们接下来一步一步实现每一种熔断限流操作。

# 1 SpringBoot集成

如果在SpringBoot项目中使用Sentinel，首先需要引入 spring-cloud-starter-alibaba-sentinel 依赖，并使用 `@SentinelResource`标识资源。

```xml
<!--sentinel-->
<dependency>
	<groupId>com.alibaba.cloud</groupId>
	<artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
	<version>2.2.5.RELEASE</version>
</dependency>
```

## 1.1 \@SentinelResource注解

`@SentinelResource` 用于定义资源，并提供可选的异常处理和 fallback 配置项。  
\@SentinelResource 注解包含以下属性：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7aa0b00e7bab4c49b1e7f2dc04ee9ba9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2 blockHandler

用户在打车的时候，会查询司机信息，如果司机不存在，此时会报错，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/dfc7014f83014950b851c6e8779e6e30.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如果此时访问 `http://localhost:18081/driver/info/3` 查询司机信息，如果没有ID为3的司机信息，会报如下错误，这种体验非常差，我们可以集成Sentinel使用 \@SentinelResource 的blockHandler 返回默认错误信息。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/dd42a4a970494db1b34ff8d6b5c88eab.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

①在 `hailtaxi-driver`工程中引入 spring-cloud-starter-alibaba-sentinel 依赖，依赖如下：

```xml
        <!--sentinel-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
            <version>2.2.5.RELEASE</version>
        </dependency>
```

我们先添加一个方法 `blockExHandler ()`用来处理程序发生 BlockException 异常的时候（该方法和需要降级的方法在一个类），执行默认操作，代码如下：

```java

    /***
     * BlockException异常处理
     */
    public Driver blockExHandler(String id, BlockException ex) {
        Driver driver = new Driver();
        driver.setId(id);
        driver.setName("系统繁忙，请稍后再试！");
        return driver;
    }
```

②我们为 `info()`方法添加一个 `@SentinelResource`注解，用来标注资源，表示当前方法需要执行限流、降级。在注解中添加`value`属性，用来标注资源，说白了就是给当前资源起个名字。  
`blockHandler`用来表示当前方法发生 `BlockException` 异常的时候，将处理流程交给指定的方法 `blockExHandler()`处理,此时 blockExHandler\(\) 方法**必须和抛出异常的方法在同一个类中**，这是一种降级操作，代码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/3420cf837d644cf9857e7ba9b0e3e17a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如果此时不在同一个类中，我们可以在 \@SentinelResource 中添加 `blockHandlerClass` 属性，指定降级处理类的方法所在的类，代码如下：

```java
@SentinelResource(
value = "info",
blockHandler ="blockExHandler",
blockHandlerClass = "xxx.xxx.Xxxx")
```

此时再访问访问`http://localhost:18081/driver/info/3`测试出错效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0ccc8be3a58549e799ce96f8136d492c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.3 fallback

如果我们希望抛出任何异常都能处理，都能调用默认处理方法，而并非只是 BlockException 异常才调用，此时可以使用 \@SentinelResource 的 `fallback`属性，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0633799152e0485e815d575b20401bfa.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
访问 `http://localhost:18081/driver/info/3`测试出错效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/56090f749a09464d99d8b036dbb11c16.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如果发生异常执行的方法和当前发生异常的方法不在同一个类中，可以使用 \@SentinelResource 注解的 fallbackClass 实现，代码如下：

```java
@SentinelResource(
value = "info",
fallback ="exHandler" ,
fallbackClass ="xx.xxx.xxx.xx.Xxx")
```

## 1.4 defaultFallback

上面无论是 blockHandler 还是 fallback ，每个方法发生异常，都要为方法独立创建一个处理异常的方法，效率非常低，我们可以使用\@SentinelResource 注解的 defaultFallback 属性，为一个类指定一个全局的处理错误的方法，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8bddc15179124d7e8a08b8b0e6a502d7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时需要注意

1.  defaultFallback 属性指定的方法入参**必须为空**，最多可以增加一个异常对象。
2.  返回值要和被降级方法保持一致。
3.  虽然是全局的，但是类中的方法需要标注`@SentinelResource(value = "xxx")`，这样才能被识别

我们访问 `http://localhost:18081/driver/info/3`效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bff934b6f89745b4a157321a80c697ef.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2 限流、熔断规则

上面的`@SentinelResource`里的一些属性指定了发生了异常的时候的兜底方法，也就是降级。下面的限流、熔断同样可以降级。  
简单理解：`@SentinelResource`指定属性是 发生异常后降级。  
限流是达到设置的限流阈值后进行降级走兜底方法处理。  
熔断是达到熔断阈值后进行降级处理。  

Sentinel支持多种限流规则，规则我们可以在代码中直接定义，规则属性如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8dc11a6c08ab4f419727c2fc27b5190c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.1 流量控制

理解上面规则的定义之后，我们可以通过调用`FlowRuleManager.loadRules()`方法来用硬编码的方式定义流量控制规则。  
**1\)QPS流量控制**  
我们先实现流量基于QPS控制，在`hailtaxi-driver` 的 DriverApplication 启动类上添加如下方法加载限流规则，当 DriverApplication 初始化完成之后加载规则，代码如下：

```java
    /***
     * 初始化规则
     */
    @PostConstruct
    private void initFlowQpsRule() {
        //规则集合
        List<FlowRule> rules = new ArrayList<FlowRule>();
        //定义一个规则
        FlowRule rule = new FlowRule("info");
        // 设置阈值
        rule.setCount(2);
        //设置限流阈值类型
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        //default，代表不区分调用来源
        rule.setLimitApp("default");
        //将定义的规则添加到集合中
        rules.add(rule);
        //加载规则
        FlowRuleManager.loadRules(rules);
    }
```

我们访问 `http://localhost:18081/driver/info/1`此时不会抛出异常，但是频繁刷新，则会调用降级方法，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/71ea4441b4d8475d89cb041e2a295a0a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**2\)线程数流量控制**  
我们修改限流阈值类型，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4d01f3e288524197aad275135516a099.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时再来访问`http://localhost:18081/driver/info/1` 我们发现用浏览器无论怎么访问都不会出现降级现象，但是如果用Jmeter模拟多个线程，效果就不一样了,效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6a24470cfbea49e9a41b7be13271b467.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.2 熔断

熔断规则包含下面几个重要的属性：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/eb2b4ab2bf414cc886fd8ced7b835a69.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
同一个资源可以同时有多个降级规则。理解上面规则的定义之后，我们可以通过调用`DegradeRuleManager.loadRules()`方法来用硬编码的方式定义流量控制规则，在Driver主启动类中的规则定义如下：

```java
    /***
     * 熔断降级规则
     */
    @PostConstruct
    private void initDegradeRule() {
        //降级规则集合
        List<DegradeRule> rules = new ArrayList<DegradeRule>();
        //降级规则对象
        DegradeRule rule = new DegradeRule();
        //设置资源
        rule.setResource("info");
        //设置触发降级阈值
        rule.setCount(2);
        //熔断降级策略，支持慢调用比例/异常比例/异常数策略
        //DEGRADE_GRADE_RT:平均响应时间
        //DEGRADE_GRADE_EXCEPTION_RATIO:异常比例数量
        //DEGRADE_GRADE_EXCEPTION_COUNT:异常数
        rule.setGrade(RuleConstant.DEGRADE_GRADE_RT);
        //熔断窗口时长，单位为 s
        rule.setTimeWindow(10);
        //将规则添加到集合中
        rules.add(rule);
        //加载规则
        DegradeRuleManager.loadRules(rules);
    }
```

我们来测试一下平均响应时间,在程序中休眠10秒中，再执行访问，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4e077f592e2e48c4beddf9b98ccd8707.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
测试效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a9015d7cdc904dd58f312ae044511060.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b16ff4eebb73481db1504ab33bc54c33.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们可以发现只有2个访问是成功的，并且熔断降级10秒钟之后才可接着访问该方法。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2f66f432d66b447da5ca2418a9cb4621.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.3 系统自我保护

Sentinel 系统自适应限流从整体维度对应用入口流量进行控制，结合应用的 Load、CPU 使用率、总体平均 RT、入口 QPS 和并发线程数等几个维度的监控指标，通过自适应的流控策略，让系统的入口流量和系统的负载达到一个平衡，让系统尽可能跑在最大吞吐量的同时保证系统整体的稳定性。

系统规则包含下面几个重要的属性：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0b75342d8b0f490092d230bb7af05a4c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
理解上面规则的定义之后，我们可以通过调用`SystemRuleManager.loadRules()` 方法来用硬编码的方式定义流量控制规则。

在`hailtaxi-driver`的 主启动类中创建如下方法，代码如下：

```java
    /***
     * 系统自我保护
     */
    @PostConstruct
    private void initSystemRule() {
        //系统自我保护集合
        List<SystemRule> rules = new ArrayList<>();
        //创建系统自我保护规则
        SystemRule rule = new SystemRule();
        //CPU使用率 值为0-1,-1 (不生效)
        rule.setHighestCpuUsage(0.2);
        //所有入口资源的 QPS,-1 (不生效)
        rule.setQps(10);
        //入口流量的最大并发数,-1 (不生效)
        rule.setMaxThread(5);
        //所有入口流量的平均响应时间,单位：秒,-1 (不生效)
        rule.setAvgRt(5);
        //load1 触发值，用于触发自适应控制阶段,系统最高负载，建议取值 CPU cores * 2.5
        rule.setHighestSystemLoad(20);
        //将规则加入到集合
        rules.add(rule);
        SystemRuleManager.loadRules(rules);
    }
```

我们可以测试CPU使用率自我保护，如下效果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/391fdcb48fef4e4783a496f0386d3070.png)

## 2.4 热点数据

何为热点？热点即经常访问的数据。很多时候我们希望统计某个热点数据中访问频次最高的 Top K 数据，并对其访问进行限制。比如：  
1:商品 ID 为参数，统计一段时间内最常购买的商品 ID 并进行限制  
2:用户 ID 为参数，针对一段时间内频繁访问的用户 ID 进行限制

热点参数限流会统计传入参数中的热点参数，并根据配置的限流阈值与模式，对包含热点参数的资源调用进行限流。热点参数限流可以看做是一种特殊的流量控制，**仅对包含热点参数的资源调用生效**。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b52444fa74ed4cb8bf39b8a2a86d0972.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

Sentinel 利用 **LRU** 策略统计最近最常访问的热点参数，结合令牌桶算法来进行参数级别的流控。热点参数限流支持集群模式。

要使用热点参数限流功能，需要引入以下依赖：

```xml
<!--热点参数-->
<dependency>
	<groupId>com.alibaba.csp</groupId>
	<artifactId>sentinel-parameter-flow-control</artifactId>
	<version>1.8.1</version>
</dependency>
```

然后为对应的资源配置热点参数限流规则，并在 entry 的时候传入相应的参数，即可使热点参数限流生效。

热点参数规则（ ParamFlowRule ）类似于流量控制规则（ FlowRule ）：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4b3a46acdd7e44f2b2b39ebb07db6480.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们可以创建一个司机筛选方法，比如根据城市来筛选，在 `DriverController`中创建一个方法：

```java
    /***
     * 搜素指定城市的司机
     */
    @SentinelResource(value = "search")
    @GetMapping(value = "/search/{city}")
    public Driver search(@PathVariable(value = "city") String city) {
        System.out.println("查询的司机所在城市：" + city);
        //假设查询到了一个司机信息
        Driver driver = new Driver();
        driver.setName("张三");
        driver.setId("No.1");
        return driver;
    }
```

我们可以对热门参数比如`下标为0`的参数流量进行控制，对热点数据执行特殊限流，比如参数值为`tj`的时候执行限流，在 Driver的主启动类中创建限流配置，代码如下：

```java
    /***
     * 热点参数初始化
     */
    @PostConstruct
    private static void initParamFlowRules() {
        ParamFlowRule rule = new ParamFlowRule("search")
        //参数下标为0
                .setParamIdx(0)
        //限流模式为QPS
                .setGrade(RuleConstant.FLOW_GRADE_QPS)
        //统计窗口时间长度（单位为秒）
                .setDurationInSec(10)
        //流控效果（支持快速失败和匀速排队模式）
        //CONTROL_BEHAVIOR_DEFAULT：限流行为，直接拒绝
        //CONTROL_BEHAVIOR_WARM_UP:限流行为，匀速排队
        //CONTROL_BEHAVIOR_RATE_LIMITER：限流行为，匀速排队
                .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT)
        //最大排队等待时长（仅在匀速排队模式生效 CONTROL_BEHAVIOR_RATE_LIMITER）
        //.setMaxQueueingTimeMs(600)
        //最大阈值为5
                .setCount(5);
        // 为特定参数单独设置阈值.
        //如下配置：当下标为0的参数值为tj的时候，阈值到达2的时候则执行限流
        ParamFlowItem item = new ParamFlowItem()
        //参数类型为int类型
                .setClassType(String.class.getName())
        //设置阈值为2
                .setCount(2)
        //需要统计的值
                .setObject(String.valueOf("tj"));
        rule.setParamFlowItemList(Collections.singletonList(item));
        //加载热点数据
        ParamFlowRuleManager.loadRules(Collections.singletonList(rule));
    }
```

我们访问 `http://localhost:18081/driver/search/shenzhen` 的时候，连续执行5次，才会限流，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e5914e40834747d1af2e0b03439d3f24.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们访问 http://localhost:18081/driver/search/tj 的时候，连续执行2次，就会限流，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7c75dc62035a4456a010ce1c24c1a71f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3 OpenFeign支持

![在这里插入图片描述](https://img-blog.csdnimg.cn/aeecdf926bb74ad1991fff91231ab4d1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)

Sentinel 适配了 Feign 组件。如果想使用，除了引入 `spring-cloud-starter-alibaba-sentinel`的依赖外还需要 2 个步骤：

1.  配置文件打开 Sentinel 对 Feign 的支持：`feign.sentinel.enabled=true`
2.  加入 `spring-cloud-starter-openfeign`依赖使 Sentinel starter 中的自动化配置类生效

![在这里插入图片描述](https://img-blog.csdnimg.cn/66f57a7b9d5f450e8618622c90a18758.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在上面案例中，我们可以实现用户打车成功调用`hailtaxi-order`执行下单，并且通过feign调用`hailtaxi-driver`修改司机状态，此时我们可以使用Sentinel实现Feign调用降级、限流。

我们把之前的案例中 `@SentinelResource`相关注解全部注释掉，再实现Feign集成。

①在 `hailtaxi-driver`、`hailtaxi-order`中引入 OpenFeign 依赖，配置如下：

```xml
        <!--sentinel-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
            <version>2.2.5.RELEASE</version>
        </dependency>
        <!--Openfeign-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
```

②还需要在Feign调用客户端（也就是 `hailtaxi-order` ）中开启Feign的支持，配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/145c835f28084122bd2cda2b47c95eb6.png)  
③为了测试程序异常能实现降级操作，我们在`hailtaxi-order`中将 `OrderInfoController.add()` 方法的司机ID改成一个不存在的司机ID，让程序报错，测试降级处理，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c291e158b38a4305b6258323b1722dba.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.1 fallback

![在这里插入图片描述](https://img-blog.csdnimg.cn/3b6799868784486a8483cd086d0b95d2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)

①我们可以为Feign接口创建一个实现类，在实现类中处理程序异常降级处理方法，代码如下：

```java
@Component
public class DriverFeignFallback implements DriverFeign {
    /**
     * status()降级处理方法
     */
    @Override
    public Driver status(String id, Integer status) {
        Driver driver = new Driver();
        driver.setId(id);
        driver.setStatus(status);
        driver.setName("系统比较繁忙，请您稍后再试！");
        return driver;
    }
}
```

②我们还需要在Feign接口上添加 fallback 属性指定讲解处理的类，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/eed903a26d40420f90e34bdcdf43c2fd.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**注意：**  
此时运行，会发生如下问题：`parseAndValidatateMetadata(Ljava/lang/Class;)Ljava/util/List;`  
出现上面问题的主要原因是当前SpringCloud版本存在问题。

> `Hoxton.SR1`中， fegin.context 接口方法的定义为`parseAndValidatateMetadata`  
>   
> `Hoxton.SR3`中， fegin.context 接口方法的定义为`parseAndValidateMetadata`

我们现在需要把 Hoxton.SR1 换成 Hoxton.SR3 ，因此需要在`hailtaxi-parent`修改SpringCloud版本：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4129e46882944b319a4421f7e5e761c8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时我们测试，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/72f49043655248c5b7f8d69cddcfd188.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.2 fallbackFactory

![在这里插入图片描述](https://img-blog.csdnimg.cn/d478b9451a2f409998658ecb4bf2b78e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_18,color_FFFFFF,t_70,g_se,x_16)

①我们可以为Feign接口创建一个降级处理的工厂对象，在工厂对象中处理程序异常降级处理方法，代码如下：

```java
@Component
public class DriverFeignFallback implements FallbackFactory<DriverFeign> {
    @Override
    public DriverFeign create(Throwable throwable) {
        return new DriverFeign() {
            /**
             * status()降级处理方法
             */
            @Override
            public Driver status(String id, Integer status) {
                Driver driver = new Driver();
                driver.setId(id);
                driver.setStatus(status);
                driver.setName("系统比较繁忙，请您稍后再试！");
                return driver;
            }
        };
    }
}
```

②我们还需要在Feign接口上添加 fallbackFactory 属性指定讲解处理的类，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a1ebc90f399741cc9c983d1abbad1bfb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
③此时我们测试，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/05d48075b80547ccaccac46218e1e576.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)