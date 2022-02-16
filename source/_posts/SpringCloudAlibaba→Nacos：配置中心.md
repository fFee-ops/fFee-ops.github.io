---
title: SpringCloudAlibaba→Nacos：配置中心
date: 2020-10-26 13:32:37
tags: spring cloud java spring
categories: SpringCloudAlibaba
---

<!--more-->

### Nacos作为服务配置中心

- [1、配置管理](#1_2)
- - [UI操作界面的配置](#UI_3)
  - [项目中的配置](#_14)
  - [测试](#_29)
- [2、多环境切换](#2_41)
- - [UI操作界面的配置](#UI_45)
  - [项目中的配置](#_53)
  - [名称关系总结图](#_60)
- [3、共享配置](#3_65)
- - [UI操作界面的配置](#UI_69)
  - [项目中的配置](#_76)
  - [测试](#_81)
- [4、配置刷新](#4_86)
- - [1.Environment自动刷新](#1Environment_88)
  - [2\. \@Value刷新](#2_Value_103)
- [5、灰度发布](#5_163)

# 1、配置管理

## UI操作界面的配置

我们可以在Nacos控制台配置项目的配置数据，先打开Nacos控制台，在 命名空间 中点击新建命名空间 ，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e26266c9a4d84a30b91b1459df13f920.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在 配置管理>配置列表 中添加，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c6c9824eed134a1c8a2c19a676681a72.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
再将项目yml中的配置内容拷贝到如下表单中，比如我们可以把 `hailtaxi-driver` 原来在yml中关于数据源的配置填写到下面表单中，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3948164fde814dcbb743578a24e3a267.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 项目中的配置

①项目中需要先**引入依赖包**，我们以 `hailtaxi-driver`为例，在 pom.xml 中引入如下依赖：

```xml
        <!--nacos-config-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
            <version>2.2.5.RELEASE</version>
        </dependency>
```

②配置文件中添加配置中心地址，在 `hailtaxi-driver`的 bootstrap.yml 中添加如下配置：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/34150d6551c7415e88aaa4314a95d3bd.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6530979a6e624ca08f4fd7bfc1bd7c66.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 测试

①此时可以删除掉`hailtaxi-driver`的yml文件中关于数据源的配置。然后我们启动该服务。

②会默认加载配置中心名称为`${spring.application.name}.${file-extension:properties}`的配置，也就是`hailtaxi-driver.yaml`

如果此时配置文件名字如果和当前服务名字不一致，可以使用 name 属性来直接指定配置文件名字：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/44add14ec1d4487886d8c7736d4f458d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

③访问`http://localhost:18081/driver/info/1`发现可以拿到数据  
![在这里插入图片描述](https://img-blog.csdnimg.cn/81b85e1a17154fe2b8edee337caf0840.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_17,color_FFFFFF,t_70,g_se,x_16)

# 2、多环境切换

在日常开发中如果遇到多套环境下的不同配置，可以通过Spring 提供的  
`${spring.profiles.active}` 这个配置项来配置。

## UI操作界面的配置

比如开发环境我们可以在nacos中创建 `hailtaxi-driver-dev.yaml`，测试环境可以在配置中创建`hailtaxi-driver-test.yaml`，创建如下：

**hailtaxi-driver-test.yaml**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ce28d9fb08da4f338d60940cbe201753.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**hailtaxi-driver-dev.yaml**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6ae0b7ff1d2840b2a865c694efeabb38.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 项目中的配置

①修改 `hailtaxi-driver` 的 bootstrap.yml 配置文件，如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d1e5f7391d0549eab06868717ddc6a05.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**测试：访问`http://localhost:18081/driver/info/1`**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3cd64c3560f14edfb3a283af9b7c159d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
②将`active` 换成test,效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5b658c762cbf401486eada6ffdcafcb7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_19,color_FFFFFF,t_70,g_se,x_16)

## 名称关系总结图

![在这里插入图片描述](https://img-blog.csdnimg.cn/9bacfbf5a35c47fe94c55202767c08ba.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3、共享配置

比如数据源配置，可能每个yml都需要，而且都是相同的，这个时候就可以把这部分配置文件抽取出来作为共享配置，减少代码冗余度。  
Spring Cloud Alibaba Nacos Config 从`0.2.1`版本后，可支持自定义 Data Id 的配置，通过它可以解决配置共享问题。

## UI操作界面的配置

我们可以先创建一个配置 `datasource.yaml`用于配置数据库连接，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ee9ba8f5b7ef4b65abeec08e9e26c0b9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们把之前的 `hailtaxi-driver-dev.yaml` 中的数据库连接池删掉，只保留IP，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9103ce1eb8ae46c6a5f12716d0608ad9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 项目中的配置

在`bootstrap.yml`中引入配置需要使用 `extension-configs` 属性，配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e000ee8d99c9403e99bef4f1aba73b92.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

> 这里 `extension-configs[n]`中n值越大，优先级越高，它既能解决一个应用多个配置，同时还能解决配置共享问题。

## 测试

测试访问`http://localhost:18081/driver/info/1`此时能访问数据库，同时也能获取 `hailtaxi-driver-dev.yaml` 中的配置，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/392d96e331cc40509582e3c58bbbe083.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 4、配置刷新

配置自动刷新对程序来说非常重要，Nacos支持配置自动刷新，并且提供了多种刷新机制。

## 1.Environment自动刷新

`spring-cloud-starter-alibaba-nacos-config`支持配置的动态更新，Environment能实时更新到最新的配置信息。

例如，在driver的主启动类中添加如下代码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d21ac5190ef74520a95ae831342147d7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**测试：**  
①我们现在用的是`hailtaxi-driver-dev.yaml`，里面的ip是`192.168.80.222`。  
②我们先运行主启动类：可以看到刚启动时是读取的配置文件的ip  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8751b8b5a1f24a19b8a81e30fd8c972d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
③现在我们来手动修改nacos配置文件中的ip为`192.168.80.666`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c0f979df3f8746e88602ac49a9314229.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
④我们并没有重启项目，但是项目还是监听到了配置文件的变化  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a0a216e05e114fac8ff41351d82c6c25.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2\. \@Value刷新

程序中如果写了 \@Value 注解，可以采用`@RefreshScope` 实现刷新，只需要在需要刷新配置的类上添加该注解即可，如下代码：

```java
@RestController
@RequestMapping(value = "/driver")
//添加该注解来自动刷新配置
@RefreshScope
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Value("${server.port}")
    private String port;

    @Value("${ip}")
    private String ip;

    private Logger logger = LogManager.getLogger(DriverController.class);

    /***
     * 测试
     * @param id
     * @return
     */
    @RequestMapping(value = "/demo")
    public String demo(String id){
        return id;
    }

    /****
     * 司机信息
     */
    @GetMapping(value = "/info/{id}")
    public Driver info(@PathVariable(value = "id")String id) throws InterruptedException {
        Driver driver = driverService.findById(id);
        if(driver==null){
            throw new RuntimeException("司机不存在");
        }
        driver.setName(driver.getName()+"---ip="+ip);
        return driver;
    }

    /****
     * 更新司机信息
     */
    @PutMapping(value = "/status/{id}/{status}")
    public Driver status(@PathVariable(value = "id")String id,@PathVariable(value = "status")Integer status){
        //修改状态
        driverService.update(id,status);

        //修改状态后的司机信息
        Driver driver = driverService.findById(id);
        driver.setName(driver.getName()+"---"+port);
        return driver;
    }
}
```

# 5、灰度发布

灰度配置指的是指定部分客户端IP进行新配置的下发，其余客户端配置保持不变，用以验证新配置对客户端的影响，保证配置的平稳发布。灰度配置是生产环境中一个比较重要的功能，对于保证生产环境的稳定性非常重要。在1.1.0中，Nacos支持了以IP为粒度的灰度配置，具体使用步骤如下：

①在配置列表页面，点击某个配置的“编辑配置”按钮,勾选“Beta发布”，在文本框里填入要下发配置配置的IP，多个IP用逗号分隔，操作如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/af9635d14de94c87a306f6f1665d1f3d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

②修改配置内容，点击“发布Beta”按钮，即可完成灰度配置的发布，点击“发布Beta”后，“发布Beta”按钮变灰，此时可以选择“停止Beta”或者“发布”。“停止Beta”表示取消停止灰度发布，当前灰度发布配置的IP列表和配置内容都会删除，页面回到正常发布的样式。“发布”表示将灰度配置在所有客户端生效，之前的配置也会被覆盖，同时页面回到正常发布的样式：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d1190e886d694c52b46475fe230bc00c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)