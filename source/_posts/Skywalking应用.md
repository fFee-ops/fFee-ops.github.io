---
title: Skywalking应用
date: 2021-12-02 14:13:52
tags: zk zookeeper 分布式
categories: Skywalking
---

<!--more-->

### Skywalking应用

- [3.1 agent下载](#31_agent_7)
- [3.2 agent应用](#32_agent_22)
- - [3.2.1 应用名配置](#321__25)
  - [3.2.2 IDEA集成使用agent](#322_IDEAagent_56)
  - [3.3.3 生产环境使用agent](#333_agent_89)
- [3.3 Rocketbot](#33_Rocketbot_112)
- - [3.3.1 Rocketbot-仪表盘](#331_Rocketbot_120)
  - [3.3.2 Rocketbot-拓扑图](#332_Rocketbot_128)
  - [3.3.3 追踪](#333__132)
  - [3.3.4 性能分析](#334__141)
  - [3.3.5 告警](#335__159)
  - - [3.3.5.1 警告规则详解](#3351__160)
    - [3.3.5.2 Webhook规则](#3352_Webhook_176)
    - [3.3.5.3 自定义Webhook消息接收](#3353_Webhook_188)

相关术语：

> **skywalking-collector**：链路数据归集器，数据可以落地ElasticSearch/H2  
> **skywalking-ui** ：web可视化平台，用来展示落地的数据  
> **skywalking-agent** ：探针，用来收集和发送数据到归集器

# 3.1 agent下载

Skywalking-agent，它简称探针，用来收集和发送数据到归集器，我们先来学习下探针使用，探针对应的jar包在Skywalking源码中，我们需要先下载源码。  
Skywalking源码下载地址： [https://archive.apache.org/dist/skywalking/](https://archive.apache.org/dist/skywalking/) ，我们当前使用的版本是8.6.0 ，选择下载对应版本。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/860eb76e11c840fd93dbcf40e2a5f8e3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
agent目录结构如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f33129ac724842869bed8d0193d52406.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
目录结构说明：

- activations 当前skywalking正在使用的功能组件。
- agent.config 文件是 SkyWalking Agent 的唯一配置文件。
- plugins 目录存储了当前 Agent 生效的插件。
- optional-plugins 目录存储了一些可选的插件（这些插件可能会影响整个系统的性能或是有版权问题），如果需要使用这些插件，需将相应 jar 包移动到 plugins 目录下。
- skywalking-agent.jar 是 Agent 的核心 jar 包，由它负责读取 agent.config 配置文件，加载上述插件 jar 包，运行时收集到 的 Trace 和 Metrics 数据也是由它发送到 OAP 集群的。

我们在使用Skywalking的时候，整个过程中都会用到 `skywalking-agent.jar` ，而无论是RPC还是HTTP开发的项目，用法都一样，因此我们讲解当前主流的SpringBoot项目对agent的使用即可。

# 3.2 agent应用

项目使用agent，如果是开发环境，可以使用IDEA集成，如果是生产环境，需要将项目打包上传到服务器。为了使用agent，我们同时需要将下载的 `apache-skywalking-apm-bin`文件包上传到服务器上去。不过无论是开发环境还是生产环境使用agent，对项目都是无侵入式的。

## 3.2.1 应用名配置

我们需要用到 agent ，此时需要将 `agent/config/agent.config`配置文件拷贝到每个需要集成Skywalking工程的resource目录下，我们将 `agent.config`拷贝到 工程`\hailtaxi-parent`的每个子工程目录下，并修改其中的`agent.service_name`，修改如下：

```yml
hailtaxi-gateway: agent.service_name=${SW_AGENT_NAME:hailtaxi-gateway}
hailtaxi-driver: agent.service_name=${SW_AGENT_NAME:hailtaxi-driver}
hailtaxi-order: agent.service_name=${SW_AGENT_NAME:hailtaxi-order}
```

`agent.config` 是一个 KV 结构的配置文件，类似于 properties 文件，value 部分使用 `${}` 包裹，其中使用冒号 （`:`） 分为两部分，前半部分是可以覆盖该配置项的系统环境变量名称，后半部分为默认值。例如这里的agent.service\_name 配置项，如果系统环境变量中指定了 `SW_AGENT_NAME` 值（注意，全是大写），则优先使用环境变量中指定的值，如果环境变量未指定，则使用 `hailtaxi-driver`这个默认值。

**直接把配置修改好后放到项目的resource目录下\(或者其他路径\)是最不容易才出错的一种方式**，同时我们可以采用其他方式覆盖默认值：

1\)JVM覆盖配置  
例如这里的 agent.service\_name 配置项，如果在 JVM 启动之前，明确中指定了下面的 JVM 配置：

```shell
# "skywalking."是 Skywalking环境变量的默认前缀
-Dskywalking.agent.service_name = hailtaxi-driver
```

2\)探针配置覆盖  
将 Java Agent 配置为如下：

```shell
# 默认格式是 -javaagent:agent.jar=[option1]=[value1],[option2]=[value2]
-javaagent:/path/skywalking-agent.jar=agent.service_name=hailtaxi-driver
```

此时会使用该 Java Agent 配置值覆盖 agent.config 配置文件中 agent.service\_name 默认值。但是这些配置都有不同优先级，优先级如下：

**探针配置 > JVM配置 > 系统环境变量配置 > agent.config文件默认值**

## 3.2.2 IDEA集成使用agent

开发环境IDEA中使用探针配置即可集成使用agent，我们把 `apache-skywalking-apm-bin` 放到本地`D:/Softwares`目录下，此时我们使用探针配置为3个项目分别配置agent：

**1\)hailtaxi-driver:**

```shell
-javaagent:D:/Softwares/apache-skywalking-apm-bin/agent/skywalking-agent.jar
-Dskywalking_config=D:/IDEAworkspace/skywalking/hailtaxi-parent/hailtaxi-driver/src/main/resources/agent.config
-Dskywalking.collector.backend_service=192.168.80.16:11800
```

**注意：路径有一部分需要变更为自己存放文件的位置**  
将上面配置赋值到IDEA中：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/23981fff51ed458fb4af80b2a5271ce9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**2\)hailtaxi-order**

```shell
-javaagent:D:/Softwares/apache-skywalking-apm-bin/agent/skywalking-agent.jar
-Dskywalking_config=D:/IDEAworkspace/skywalking/hailtaxi-parent/hailtaxi-order/src/main/resources/agent.config
-Dskywalking.collector.backend_service=192.168.80.16:11800
```

将上面配置赋值到IDEA中：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/359eb81b2eb5438ea47fa5ed8f15447e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**3\)hailtaxi-gateway**

```shell
-javaagent:D:/Softwares/apache-skywalking-apm-bin/agent/skywalking-agent.jar
-Dskywalking_config=D:/IDEAworkspace/skywalking/hailtaxi-parent/hailtaxi-gateway/src/main/resources/agent.config
-Dskywalking.collector.backend_service=192.168.80.16:11800
```

将上面配置赋值到IDEA中：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/70fca9162d7c4c5b8c9fd8d50b50d12a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时启动IDEA，并访问 `http://192.168.80.16:8080/`效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/31fc26faab0c49cc9de76095d7642da9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ef27b7ffaa614b5e9f29ecfec3a667d8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.3.3 生产环境使用agent

生产环境使用，因此我们需要将agent和每个项目的jar包上传到服务器上，上传`apache-skywalking-apm-bin` 至`/softwares` ，再将 工程`\hailtaxi-parent`中的项目打包，并分别上传到服务器上，如下三个工程：

![在这里插入图片描述](https://img-blog.csdnimg.cn/389f49bbb3624c74b9667f57ac1957d4.png)  
**1\)启动hailtaxi-gateway**

```shell
java -javaagent:/softwares/apache-skywalking-apm-bin/agent/skywalking-agent.jar -Dskywalking.agent.service_name=hailtaxi-gateway -jar hailtaxi-gateway-1.0-SNAPSHOT.jar &
```

**2\)启动hailtaxi-driver**

```shell
java -javaagent:/softwares/apache-skywalking-apm-bin/agent/skywalking-agent.jar -Dskywalking.agent.service_name=hailtaxi-driver-jar hailtaxi-driver-1.0-SNAPSHOT.jar &
```

**3\)启动hailtaxi-order**

```shell
java -javaagent:/softwares/apache-skywalking-apm-bin/agent/skywalking-agent.jar -Dskywalking.agent.service_name=hailtaxi-order-jar hailtaxi-order-1.0-SNAPSHOT.jar &
```

可以发现skywalking还是能监控到应用  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b2466fe190ea4277a4d6b182700e7d08.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3.3 Rocketbot

**关于仪表盘的使用请见另一篇博客，这里只做一些大概的理论介绍**

前面我们已经完成了SkyWalking环境搭建和项目应用agent使用，我们来看如何使用 SkyWalking 提供的 UI 界面—— Skywalking Rocketbot。

OAP服务和Rocket（其实就是个web项目）均已启动  
![在这里插入图片描述](https://img-blog.csdnimg.cn/36731bbd1d83440b8e6596c1448e8373.png)

## 3.3.1 Rocketbot-仪表盘

![在这里插入图片描述](https://img-blog.csdnimg.cn/59b6b312d97947e4a450c0606d030022.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Rocketbot从多个方面展示了服务信息，我们分别从多个方面进行讲解。  
上图中的【仪表盘】、【拓扑图】、【追踪】、【性能剖析】、【日志】、【警告】属于功能菜单。仪表盘属于数据统计功能，分别从服务热度、响应水平、服务个数、节点信息等展示统计数据。

除了 SkyWalking Rocketbot 默认提供的这些面板，我们还可以点击锁型按钮，自定义 Global 面板。在ServiceInstance 面板中展示了很多ServiceInstance 相关的监控信息，例如，JVM 内存使用情况、GC次数、GC 耗时、CPU 使用率、ServiceInstance SLA 等等信息。

## 3.3.2 Rocketbot-拓扑图

![在这里插入图片描述](https://img-blog.csdnimg.cn/8e394ac60bb2442c82acd70c31f44b78.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
【拓扑图】展示当前整个业务服务的拓扑图。点击拓扑图中的任意节点，可以看到服务相应的状态信息，其中包括响应的平均耗时、SLA 等监控信息。点击拓扑图中任意一条边，还可以看到一条调用链路的监控信息，其中会分别从客户端（上游调用方）和服务端（下游接收方）来观测这条调用链路的状态，其中展示了该条链路的耗时、吞吐量、SLA 等信息。

## 3.3.3 追踪

【追踪】主要用来查询 Trace 信息。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e6c5947599384a34b318bdda45a1d637.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

在这里，我们不仅能看到调用链路信息，还能看到MySQL操作监控,如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1364c2c9b7c94a4baa94ba2adfce8b40.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
错误异常信息也能追踪,如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f4892c4d6e6c456599b7c1570a2abd3f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.3.4 性能分析

在传统的监控系统中，我们如果想要得知系统中的业务是否正常，会采用进程监控、日志收集分析等方式来对系统进行监控。当机器或者服务出现问题时，则会触发告警及时通知负责人。通过这种方式，我们可以得知具体哪些服务出现了问题。但是这时我们并不能得知具体的错误原因出在了哪里，开发人员或者运维人员需要到日志系统里面查看错误日志，甚至需要到真实的业务服务器上查看执行情况来解决问题

如此一来，仅仅是发现问题的阶段，可能就会耗费相当长的时间；另外，发现问题但是并不能追溯到问题产生具体原因的情况，也常有发生。这样反反复复极其耗费时间和精力，为此我们便有了基于分布式追踪的APM系统。

通过将业务系统接入分布式追踪中，我们就像是给程序增加了一个放大镜功能，可以清晰看到真实业务请求的整体链路，包括请求时间、请求路径，甚至是操作数据库的语句都可以看得一清二楚。通过这种方式，我们结合告警便可以快速追踪到真实用户请求的完整链路信息，并且这些数据信息完全是持久化的，可以随时进行查询，复盘错误的原因。

然而随着我们对服务监控理解的加深，我们发现事情并没有那么简单。在分布式链路追踪中我们有这样的两个流派：代码埋点和字节码增强。无论使用哪种方式，底层逻辑一定都逃不过面向切面这个基础逻辑。因为只有这样才可以做到大面积的使用。这也就决定了它只能做到框架级别和RPC粒度的监控。这时我们可能依旧会遇到程序执行缓慢或者响应时间不稳定等情况，但无法具体查询到原因。这时候，大家很自然的会考虑到增加埋点粒度，比如对所有的Spring Bean方法、甚至主要的业务层方法都加上埋点。但是这种思路会遇到不小的挑战：

1.  增加埋点时系统开销大，埋点覆盖不够全面。通过这种方式我们确实可以做到具体业务场景具体分析。但随着业务不断迭代上线，弊端也很明显：大量的埋点无疑会加大系统资源的开销，造成CPU、内存使用率增加，更有可能拖慢整个链路的执行效率。虽然每个埋点消耗的性能很小，在微秒级别，但是因为数量的增加，甚至因为业务代码重用造成重复埋点或者循环使用，此时的性能开销已经无法忽略。
2.  动态埋点作为一项埋点技术，和手动埋点的性能消耗上十分类似，只是减少的代码修改量，但是因为通用技术的特别，上一个挑战中提到的循环埋点和重复使用的场景甚至更为严重。比如选择所有方法或者特定包下的所有方法埋点，很可能造成系统性能彻底崩溃。
3.  即使我们通过合理设计和埋点，解决了上述问题，但是JDK函数是广泛使用的，我们很难限制对JDK API的使用场景。对JDK过多方法、特别是非RPC方法的监控会造成系统的巨大延迟风险。而且有一些基础类型和底层工具类，是很难通过字节码进行增强的。当我们的SDK使用不当或者出现bug时，我们无法具体得知真实的错误原因。

**Skywalking中可以使用性能剖析分析特定断点的性能，我们需要先创建一个监控任务：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/d6e97c7ab2fc478c9c104b054c25bc20.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
新建任务后，在右侧可以查看任务性能分析报表，还可以点击分析线程栈信息，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1f6c71b39e0b4a84aac972d956e2c534.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.3.5 告警

### 3.3.5.1 警告规则详解

Skywalking每隔一段时间根据收集到的链路追踪的数据和配置的告警规则（如服务响应时间、服务响应时间百分比）等，判断如果达到阈值则发送相应的告警信息。发送告警信息是通过调用webhook接口完成，具体的webhook接口可以使用者自行定义，从而开发者可以在指定的webhook接口中编写各种告警方式，比如邮件、短信等。告警的信息也可以在RocketBot中查看到。

我们可以进入到Skywalking容器中，再进入到config文件夹下就可以看到`alarm-settings.yml`，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c29a443d50694c19a2a9043e37c84793.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
警告规则配置有很多关键词,了解这些关键词后更容易理解警告配置，告警规则组成关键字段如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c56a2af210bb453e916a0e1f11e7a6f7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
alarm-settings.yml配置定义了默认的5种规则：

1.  最近3分钟内服务平均响应时间超过1秒。
2.  最近2分钟的服务成功率低于80％。
3.  最近3分钟的服务响应时间百分比超过1s。
4.  最近2分钟内服务实例的平均响应时间超过1秒。
5.  最近2分钟内端点平均响应时间超过1秒。

这些警告信息最终会在Skywalking-UI上展示，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8353ae0ba6e04ea89b3f1528b9b1e0a7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 3.3.5.2 Webhook规则

Webhook配置其实是警告消息接收**回调处理**，我们可以在程序中写一个方法接收警告信息，Skywalking会以`application/json`格式通过http请求发送，消息格式声明为：`List<org.apache.skywalking.oap.server.core.alarm.AlarmMessage`  
字段如下：

- **scopeId, scope:** 所有的scope实体在`org.apache.skywalking.oap.server.core.source.DefaultScopeDefine`里面声明。
- **name**： 目标scope实体名称。
- **id0**： scope实体ID，匹配名称。
- **id1**： 不使用。
- **ruleName**： 配置在 alarm-settings.yml 里面的规则名称.
- **alarmMessage**： 告警信息.
- **startTime**：触发告警的时间  
  示例：  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/271a0f866f1d43a59bffd48e3b94f788.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 3.3.5.3 自定义Webhook消息接收

我们按照如下步骤，可以在自己程序中接收警告信息：  
**工程结构图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3929afbe68ff4b2ea501ba8e4774f5e5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)

**1\)定义消息接收对象**  
在`hailtaxi-api`中创建 `com.itheima.skywalking.model.AlarmMessage` ，代码如下：

```java
@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class AlarmMessage {
    private int scopeId;
    private String name;
    private String id0;
    private String id1;
    private String alarmMessage;
    private long startTime;
    String ruleName;
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/40bb6e64dda34b0ab374f0cfe9e09f6f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)  
**2\)接收警告方法创建**  
在`hailtaxi-driver` 中创建`com.itheima.driver.controller.AlarmMessageController`用于接收警告消息，代码如下：

```java
@RestController
@RequestMapping(value = "/skywalking")
public class AlarmMessageController {

    /***
     * 接收警告信息
     * @param alarmMessageList
     */
    @PostMapping("/webhook")
    public void webhook(@RequestBody List<AlarmMessage> alarmMessageList) {
        for (AlarmMessage alarmMessage : alarmMessageList) {
            System.out.println("webhook:"+alarmMessage);
        }
    }
}

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/2ccc990e471b409a8785cbc93e18bae5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)

**3\)修改Webhook地址**

修改`skywalking\dist-material\alarm-settings.yml`中的webhook地址：

```yml
webhooks:
- http://192.168.80.16:18081/skywalking/webhook/
# - http://127.0.0.1/go-wechat/
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/cf4d84113a484c038bc6d2c6959e5c5b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)  
此时我们程序中就能接收警告信息了。