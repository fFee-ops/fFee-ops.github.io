---
title: Skywalking部分源码剖析
date: 2021-12-05 14:15:20
tags: maven intellij-idea java
categories: Skywalking
---

<!--more-->

### Skywalking部分源码剖析

- [Skywalking源码导入](#Skywalking_2)
- - [1.1 源码环境搭建](#11__4)
  - [1.2 模块分析](#12__34)
- [Skywalking Agent启动流程剖析](#Skywalking_Agent_48)
- - [1.1 Skywalking Agent架构](#11_Skywalking_Agent_49)
  - [1.2 Skywalking Agent启动流程](#12_Skywalking_Agent_67)
- [Skywalking Agent源码剖析](#Skywalking_Agent_95)
- - [1.1 配置初始化](#11__97)
  - [2.2 插件加载](#22__115)
  - [1.3 解析插件](#13__141)
  - - [1.3.1 PluginResourcesResolver](#131_PluginResourcesResolver_142)
    - [1.3.2 PluginFinder](#132_PluginFinder_173)
    - [1.3.3 AgentBuilder](#133_AgentBuilder_179)

# Skywalking源码导入

## 1.1 源码环境搭建

我们本次选择的是**8.3.0**版本，然后下载并导入到IDEA，下载地址为：<https://github.com/apache/skywalking/tags>，我们直接用git克隆到本地。

**1\)下载工程**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/855b3e494e36413a91c1666f5519b388.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/6588be440f184724995f8343e7bf2fd3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
这个过程比较耗时间，需要大家耐心等待，如果想提升下载速度，可以把github仓库地址导入到码云中，再下载，速度将会变得非常快。

**2\)切换版本**  
将Skywalking工程加入到Maven工程中，我们用的是版本8.3.0,因此需要切换版本：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f9075ddfd30540278240fc4fc30d554f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
项目导入IDEA后，会从指定路径加载项目，我们需要在skywalking的pom.xml中配置项目路径，添加如下properties配置即可：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ac7aa366311447be96d69cae8338aa79.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
将xml中的`<repoToken>${COVERALLS_REPO_TOKEN}</repoToken>`注释掉，我们只用于本地测试，不需要提交相关报告。

我们接下来生成一些需要用到的类，需要在IDEA终端中执行如下命令：

```git
git submodule init
git submodule update
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/3fea4833eb3f43c6b0832e0782ca9fa2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时会生成一些类:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ed3204f01dc7475d987aec73422aaf77.png)  
接下来把生成的文件添加到类路径下，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5645e3a8a76d4e689cdf6b2895671352.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
除了上面这里，还有很多个地方都需要这么操作，我们执行`OAPServerStartUp` 的main方法启动Skywalking，只要执行找不到类，就找下有没有任何编译后生成的类没在类路径下，都把他们设置为类路径即可。

Skywalking依赖的插件特别多，因此依赖的包也特别多，我们把Skywalking安装到本地，会耗费很长时间，但不要担心，因为迟早会安装完成，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/92fba1d1c8344bf0b4431d9c8d09b63e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2 模块分析

- **apm-application-toolkit:** 常用的工具工程，例如：log4j、log4j2、logback 等常见日志框架的接入接口，Kafka轮询调用注解，apm-application-toolkit 模块类似于暴露 API 定义，对应的处理逻辑在`apm-sniffer/apm-toolkit-activation` 模块中实现,如下图：  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/4516dbace5924ef7840fb6f380f22d16.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- **apm-commons**：SkyWalking 的公共组件和工具类。如下图所示，其中包含两个子模块，apm-datacarrier 模块提供了一个生产者-消费者模式的缓存组件（DataCarrier），无论是在 Agent 端还是OAP 端都依赖该组件。apm-util 模块则提供了一些常用的工具类，例如，字符串处理工具类\(StringUtil）、占位符处理的工具类（PropertyPlaceholderHelper、  
  PlaceholderConfigurerSupport）等等。

- **apache-skywalking-apm**：SkyWalking 打包后使用的命令文件都在此目录中，例如，前文启动 OAP和 SkyWalking Rocketbot 使用的 startup.sh 文件。

- **apm-protocol**：该模块中只有一个 apm-network 模块，我们需要关注的是其中定义的 .proto 文件，定义 Agent 与后端 OAP 使用 gRPC 交互时的协议。

- **apm-sniffer**：agent核心功能以及agent依赖插件，模块比较多：  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/4e33563b6f064ebb9c767a441052739d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- **apm-webapp**：SkyWalking Rocketbot 对应的后端。

- **oap-server**：opa主程序，该工程中有多个模块，我们对核心模块进行说明：  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/43418b14fce443508be0d6a64c4af620.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# Skywalking Agent启动流程剖析

## 1.1 Skywalking Agent架构

我们在学习Skywalking之前，先了解一下微内核架构，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/df9eb662fb824d8bb041c3c43bf1cfda.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**微内核架构**（Microkernel Architecture），也被称为插件化架构（Plug-in Architecture）,是一种面向功能进行拆分的可扩展性架构，通常用于实现基于产品（原文为product-based，指存在多个版本，需要下载安装才能使用，与web-based想对应）的应用。

微内核架构的好处：

> 1:测试成本下降。从软件工程的角度看，微内核架构将变化的部分和不变的部分拆分，降低了测试的成本，符合设计模式中的开放封闭原则。  
>   
> 2:稳定性。由于每个插件模块相对独立，即使其中一个插件有问题，也可以保证内核系统以及其他插件的稳定性。  
>   
> 3:可扩展性。在增加新功能或接入新业务的时候，只需要新增相应插件模块即可；在进行历史功能下线时，也只需删除相应插件模块即可。

微内核的核心系统设计的关键技术有：**插件管理，插件连接和插件通信。**

SkyWalking Agent 采用了微内核架构（Microkernel Architecture），是一种面向功能进行拆分的可扩展性架构。

> **apm-agent-core**: 是Skywalking Agent的核心模块  
> **apm-sdk-plugin**: 是Skywalking需要的各个插件模块  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/2a4a3fcbb0d141548f05b4fdadc1cf17.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2 Skywalking Agent启动流程

**1\)启动OAP**  
我们接下来启动Skywalking oap，我们在 `oap-server\server-starter`或者 oap-`server\server-starter-es7`中找到 `OAPServerStartUp` 类，执行该类的main方法即可启动，但默认用的是H2存储，如果希望用elasticsearch存储，需要修改被调用的服务 server-bootstrap 的配置文件application.yml 配置elasticsearch位置：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/22da2c2bc4524e84b78b2a51bd17ad7c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
执行 `OAPServerStartUp`的main方法不报错就没问题。

**2\)启动SkyWalking Rocketbot**  
apm-webapp 是 Spring Boot 的 Web项目，执行 ApplicationStartUp 中的 main\(\) 方法。正常启动之后，访问 localhost:8080，看到 SkyWalking Rocketbot 的 UI 界面即为启动成功。

如果修改启动端口，可以直接修改application.yml即可。

**3\)直接使用源码中的Agent**  
项目打包会生成 `skywalking-agent.jar` ，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ed7b95909d2741e3b7c4e30d6f45a112.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们来使用一下前面源码工程中打包生成的 `skywalking-agent.jar`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ddbba528c84944479fb0a6179d46d046.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
启动的整个方法执行流程如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/74f6a400b8d14ae9b755ad472b0915df.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们总结一下Skywalking Agent启动流程:

1.  初始化配置信息。该步骤中会加载 agent.config 配置文件，其中会检测 Java Agent 参数以及环境变量是否覆盖了相应配置项。
2.  查找并解析 skywalking-plugin.def 插件文件。
3.  AgentClassLoader 加载插件。
4.  PluginFinder 对插件进行分类管理。
5.  使用 Byte Buddy 库创建 AgentBuilder。这里会根据已加载的插件动态增强目标类，插入埋点逻辑。
6.  使用 JDK SPI 加载并启动 BootService 服务。BootService 接口的实现会在后面的课时中展开详细介绍。
7.  添加一个 JVM 钩子，在 JVM 退出时关闭所有 BootService 服务。

# Skywalking Agent源码剖析

前面我们对Skywalking Agent启动流程源码进行了剖析，接下来我们对启动流程中每个步骤源码进行剖析。

## 1.1 配置初始化

![在这里插入图片描述](https://img-blog.csdnimg.cn/54e7cf11dcff4afeafd5eadb5ed11028.png)  
启动driver服务的时候，会指定`skywalking-agent.jar`路径，同时会指定 `agent.config`配置文件路径，如上配置，此时需要初始化加载该文件，加载流程可以从启动类 `SkyWalkingAgent.premain()`方法找答案。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6b0bb6777e444e18a4d5703f40c99d10.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
加载解析文件的时候，permain\(\)方法会调用initializeCoreConfig\(String agentOptions\)方法，并解析agent.config文件，并将文件内容存入到Properties中，此时加载是按照`${配置项名称:默认值}`的格式解析各个配置，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8bce2907b8104dc481675c67a497bb46.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
loadConfig\(\) 方法会优先根据环境变量（skywalking\_config）指定的 agent.config 文件路径加载。若环境变量未指定 skywalking\_ config 配置，则到 skywalking-agent.jar 同级的 config 目录下查找agent.confg 配置文件。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d0bd137d22c6425e9a44ef998ff2433f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
解析前后的数据也是不一致的，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/785d698cf5d646789994987b5a9deafc.png)  
`overrideConfigBySystemProp()`方法中会遍历环境变量（即 System.getProperties\(\) 集合），如果环境变 是以 “skywalking.” 开头的，则认为是 SkyWalking 的配置，同样会填充到 Config 类中，以覆盖agent.config 中的默认值。如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1ec9665a198041fd808613522812760a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)ConfigInitializer 工具类，将配置信息填充到 Config 中的静态字段中，SkyWalking Agent 启动所需的全部配置都已经填充到 Config 中，后续使用配置信息时直接访问 Config 中的相应静态字段即可。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d914cea3397d4db480ccf78d1a8b7855.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Config结构：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3b1ecd22ddde4dac9faeeca4d6fb4e8a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- Config中Agent类的 `SERVICE_NAME` 对应agent.config中的`agent.service_name=${xxx}`
- Config中Collector类的 `BACKEND_SERVICE` 对应agent.config中的`agent.backend_service=${xxx}`

## 2.2 插件加载

加载插件执行流程：

1.  new PluginBootstrap\(\)
2.  PluginBootstrap\(\).loadPlugins\(\)
3.  AgentClassLoader.initDefaultLoader\(\); 没有指定类加载器的时候使用  
    PluginBootstrap.ClassLoader
4.  创建PluginResourcesResolver插件加载解析器
5.  将解析的插件存到List pluginClassList，此时只存储了插件的名字和类路径
6.  创建插件实例
7.  将所有插件添加到Skywalking内核中

插件加载流程如下：  
在 `SkyWalkingAgent.premain()`方法中会执行插件加载，如下代码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1dad782cc0e24090b58aaa7a713852e6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

加载插件的全部详细代码如下\(`org.apache.skywalking.apm.agent.core.plugin.PluginBootstrap`\)：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8ce0125761464aeabe28af6932aff4fa.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
SkyWalking Agent 加载插件时使用到一个自定义的 ClassLoader —— AgentClassLoader，之所以自定义类加载器，目的是不在应用的 Classpath 中引入 SkyWalking 的插件 jar 包，这样就可以让应用无依  
赖、无感知的插件。

AgentClassLoader 作为一个类加载器，主要工作还是从其 Classpath 下加载类（或资源文件），对应的就是其 findClass\(\) 方法和 findResource\(\) 方法：

我们来看一下findClass，主要根据类名获取它的Class：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/05bf58fb46394e4ebd24877e2649370e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
findResource\(\)方法主要获取文件路径，换句话理解，就是获取插件路径，我们来看下方法：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ad297e32f82f4b17bdcb74a1a3f8ebad.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.3 解析插件

### 1.3.1 PluginResourcesResolver

在`loadPlugins(`\) 方法中使用了`PluginResourcesResolver` ,`PluginResourcesResolver` 是 Agent插件的资源解析器，会通过 `AgentClassLoader` 中的 `findResource()` 方法读取所有 Agent 插件中  
的 `skywalking-plugin.def`文件。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d81a5bcd23774971896ca8494136a2f4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
拿到全部插件的 skywalking-plugin.def 文件之后，PluginCfg 会逐行进行解析，转换成PluginDefine 对象。PluginDefine 中有两个字段,分别对应 skywalking-plugin.def 中的key和value，解析流程如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/607687992fba4a7887f0ae361ef82369.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
接下来会遍历全部`PluginDefine`对象，通过反射将其中 defineClass 字段中记录的插件类实例化，核心逻辑如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/37a3ea9b7ba945069420bc34e0fcaff7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`AbstractClassEnhancePluginDefine`抽象类是所有 Agent 插件类的顶级父类，其中定义了四个核心方法，决定了一个插件类应该增强哪些目标类、应该如何增强、具体插入哪些逻辑，如下所示：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e277d12ac26e483aad6bd4f229ee63a3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- **enhanceClass**\(\) 方法：返回的 ClassMatch，用于匹配当前插件要增强的目标类。
- **define**\(\) 方法：插件类增强逻辑的入口，底层会调用下面的 enhance\(\) 方法和 witnessClass\(\) 方法。
- **enhance**\(\) 方法：真正执行增强逻辑的地方。
- **witnessClass**\(\) 方法：一个开源组件可能有多个版本，插件会通过该方法识别组件的不同版本，防止对不兼容的版本进行增强。

**ClassMatch**  
enhanceClass\(\) 方法决定了一个插件类要增强的目标类，返回值为 ClassMatch 类型对象。ClassMatch 类似于一个过滤器，可以通过多种方式匹配到目标类，ClassMatch 接口的实现如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/34e454f0b7534411b062064d89fd3788.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

- **NameMatch**：根据其 className 字段（String 类型）匹配目标类的名称。
- **IndirectMatch**：子接口中定义了两个方法  
  ![在这里插入图片描述](https://img-blog.csdnimg.cn/c447e122f32042aab05fbdc72b4d90eb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
- **MultiClassNameMatch**：其中会指定一个 matchClassNames 集合，该集合内的类即为目标类。
- **ClassAnnotationMatch**：根据标注在类上的注解匹配目标类。
- **MethodAnnotationMatch**：根据标注在方法上的注解匹配目标类。
- **HierarchyMatch**：根据父类或是接口匹配目标类。

我们来分析一下ClassAnnotationMatch的buildJunction\(\)方法和isMatch\(\)方法：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1dc5107b913544cf8e32b4dd32d7d9a2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
isMatch\(\)方法如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2afa21ee00bd4497b25adcd504096397.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.3.2 PluginFinder

PluginFinder 是 AbstractClassEnhancePluginDefine 查找器，可以根据给定的类查找用于增强的AbstractClassEnhancePluginDefine 集合。

在 PluginFinder 的构造函数中会遍历前面课程已经实例化的 AbstractClassEnhancePluginDefine ，并根据 enhanceClass\(\) 方法返回的 ClassMatcher 类型进行分类，得到如下两个集合：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b6c0c08b0f524283974f0280b95f8f91.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.3.3 AgentBuilder

利用bytebuddy的API生成一个代理，并执行transform方法和监听器Listener（主要是日志相关）。在premain中，通过链式调用，被builderMatch\(\)匹配到的类都会执行transform方法，transform定义了字节码增强的逻辑：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/690bd5ecad3a4fb08ce22dbf5ff00e46.png)  
Config.Agent.IS\_OPEN\_DEBUGGING\_CLASS 在 agent.config 中对应配置  
`agent.is_open_debugging_class`  
如果将其配置为 true，则会将动态生成的类输出到 debugging 目录中。  
AgentBuilder 是 Byte Buddy 库专门用来支持 Java Agent 的一个 API，如下所示：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1ae57a4377b44b6cb1eae5decb536347.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面代码中有些方法我们需要理解一下：

- **ignore**\(\) 方法：忽略指定包中的类，对这些类不会进行拦截增强。
- **type**\(\) 方法：在类加载时根据传入的 ElementMatcher 进行拦截，拦截到的目标类将会被transform\(\) 方法中指定的 Transformer 进行增强。
- **transform**\(\) 方法：这里指定的 Transformer 会对前面拦截到的类进行增强。
- **with**\(\) 方法：添加一个 Listener 用来监听 AgentBuilder 触发的事件。

首先， PluginFInder.buildMatch\(\) 方法返回的 ElementMatcher 对象会将全部插件的匹配规则（即插件的 enhanceClass\(\) 方法返回的 ClassMatch）用 OR 的方式连接起来，这样，所有插件能匹配到的所有类都会交给Transformer 处理。

再来看 with\(\) 方法中添加的监听器 —— SkywalkingAgent.Listener，它继承了 AgentBuilder.Listener接口，当监听到 Transformation 事件时，会根据 IS\_OPEN\_DEBUGGING\_CLASS 配置决定是否将增强之后的类持久化成 class 文件保存到指定的 log 目录中。注意，该操作是需要加锁的，会影响系统的性能，一般只在测试环境中开启，在生产环境中不会开启。

Skywalking.Transformer实现了 AgentBuilder.Transformer 接口，其 transform\(\) 方法是插件增强目标类的入口。Skywalking.Transformer 会通过 PluginFinder 查找目标类匹配的插件（即AbstractClassEnhancePluginDefine 对象），然后交由 AbstractClassEnhancePluginDefine 完成增强，核心实现如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/07d7cb4840244908aed573be7bdb7e91.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)