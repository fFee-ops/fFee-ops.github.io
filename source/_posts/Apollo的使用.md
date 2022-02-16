---
title: Apollo的使用
date: 2022-01-11 11:53:12
tags: java
categories: Apollo
---

<!--more-->

### Apollo的使用

- [项目配置托管](#_2)
- - [1\. 配置创建](#1__5)
  - - [默认配置](#_16)
    - [公共配置创建](#_28)
    - [配置关联](#_49)
    - [私有配置](#_57)
- [Apollo实用功能](#Apollo_64)
- - [1\. 自动刷新](#1__65)
  - [2\. Apollo监听器](#2_Apollo_83)
  - [3\. 配置加密](#3__117)
  - [4\. 配置加载顺序](#4__182)
  - [5\. 灰度发布](#5__189)

# 项目配置托管

我们接下来使用Apollo作为配置中心，将项目配置托管到Apollo中。

## 1\. 配置创建

![在这里插入图片描述](https://img-blog.csdnimg.cn/b65fac043d524c72a0e9659e2c809104.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
点击创建应用，会出现如下表单：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2b22cc21bbe4402780c8ccb45de69430.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
创建应用参数说明：

- 部门：选择应用所在的部门。部门数据来自 ApolloPortalDB 库的`ServerConfig` 表的 `Key =organizations` 对应的记录。
- 应用 AppId：用来标识应用身份的唯一 id，格式为 string，需要和客户端 app.properties 中配置的 app.id 对应。
- 应用名称：应用名，仅用于界面展示。
- 应用负责人：默认具有项目管理员权限。
- 项目管理员：可以创建 Namespace 和集群、分配用户权限。

### 默认配置

创建配置就需要将项目中的配置挪到Apollo中，可以点击添加配置按钮，默认每个项目都有一个默认配置 `application.properties` ，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4947089cd7d746e78b0fb9cc2b63233b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
添加配置如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/526f0520bae049a09f96baa1bea7bd85.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时就相当于在 application.properties 中添加了一个key：value数据：

```yml
#bootstrap.properties
message=黑马顺风车，日活4.5亿架构
```

配置保存后，可以看到配置信息，但项目中还无法直接读取数据，必须发布之后才能读取，如下图，还可以查看每次修改的历史记录、哪些项目在使用该实例、修改配置、删除当前配置文件，每个配置文件都被定义为namespace：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/70076efc938243d1bab038654cd4b7f0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 公共配置创建

除了默认的配置，我们还可以自己创建更多配置，创建新配置点击`添加Namespace` 即可出现如下添加界面：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/117039e35e7b430d86c24ab74fd57fc0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在这里类型有2个选项，一个是创建公共\(public\)配置，一个是创建私有\(private\)配置，关于他们的区别如下：

**public:**

1.  公共的Namespace的配置能被任何项目读取。
2.  通过创建公共Namespace可以实现公共组件的配置，或多个应用共享同一份配置的需求，例如数据源配置就可以配置到公共的Namespace中去
3.  如果其它应用需要覆盖公共部分的配置，可以在其它应用那里关联公共Namespace，然后在关联的Namespace里面配置需要覆盖的配置即可
4.  如果其它应用不需要覆盖公共部分的配置，那么就不需要在其它应用那里关联公共Namespace

**private:**

1.  私有Namespace的配置只能被所属的应用获取到
2.  通过创建一个私有的Namespace可以实现分组管理配置
3.  私有Namespace的格式可以是xml、yml、yaml、json、txt. 您可以通过apollo-client中ConfigFile接口来获取非properties格式Namespace的内容

我们接下来可以添加部分数据并发布，如下图：

![在这里插入图片描述](https://img-blog.csdnimg.cn/bac506a34b8245219769211a7303cc8e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 配置关联

我们接下来创建配置关联公共配置,我们可以先创建一个项目 `hailtaxi-driver-config` ，在该项目中创建一个私有配置 ipinfo 继承上面的stmt公共配置：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1c22bab2f78141e99c1987ade0063a18.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们再添加一部分数据如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fb422847508a43af81d435ea47fccbc0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 私有配置

我们接下来可以为 `hailtaxi-driver-config`创建一个私有配置，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a8979054508c4e78a9691b8fa93dfd51.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们添加部分信息如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cc93b7e0a6a74b59ac870c8816155c68.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# Apollo实用功能

## 1\. 自动刷新

前面我们已经实现了SpringBoot读取配置，但我们用的是 Environment ，我们分别使用一下 \@Value和 \@ConfigurationProperties ，再观察下配置是否会刷新。

我们在`stmt` 中增加如下数据：

```
platform.name=黑马顺风车
platform.address=北京金燕龙科研大楼
platform.coursename=黑马架构师课程
```

完整配置如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/dd59ccf40a084e168434715a33b411d4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们分别修改 ip 、 city 、 platform.name ，并发布，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/936c1830e46e4fcba8d9638240ae06a8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们可以发现此时 ip 、 city 发生了变化，而 plateform.name 未发生变化，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e14599e1be304cc394ff02cce88b21e1.png)  
目前 Apollo 暂时未提供 \@ConfigurationProperties 注解的配置类的自动刷新配置的功能，并且在纯 Spring Boot 项目中，没有太好的实现自动刷新配置的方式，所以大家以后用Apollo作为配置中心，**建议使用 \@Value 或者使用 Environment 加载配置**，如果有些场景必须要用到`@ConfigurationProperties`就需要结合Apollo的监听器解决。

## 2\. Apollo监听器

Apollo 已经能够满足我们绝大多数场景下的自动刷新配置的功能,但是项目中如果使用了`@ConfigurationProperties`此时只能借助Apollo的监听器功能实现数据刷新，可以先在监听器中读取变更的内容，然后调用指定的set方法执行重新赋值操作。

我们在 hailtaxi-driver 中创建监听器:  
![在这里插入图片描述](https://img-blog.csdnimg.cn/7db2cfc8370044329434d7960b0ebe0d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_14,color_FFFFFF,t_70,g_se,x_16)

```java
@Component
public class ApolloConfigListener {

    /***
     * 数据变更监听
     * @param changeEvent
     * @throws Exception
     */
    @ApolloConfigChangeListener(
            value = {"stmt", "driver-info"},        //侦听指定文件变更
            interestedKeyPrefixes = {"platform."})  //以plateform.开始的key发生变更才监听
    public void onChange(ConfigChangeEvent changeEvent) throws Exception {
        //获得 Apollo 所有配置项
        Set<String> strings = changeEvent.changedKeys();
        for (String key : strings) {
            System.out.println("变更的Key=" + key);
            System.out.println("变更前的value=" + changeEvent.getChange(key).getOldValue());
            System.out.println("变更后的value=" + changeEvent.getChange(key).getNewValue());
        }
    }

}
```

我们修改 stmt 配置，修改后记得发布，如下操作：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/06d093b5e50447abbe89eeb9b6b20b12.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在项目中我们调试结果如下：【即接收到了变更的value】  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bf673f2265c24b769674cb99ba0d6672.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3\. 配置加密

考虑到安全性，我们可能最好将配置文件中的敏感信息进行加密。例如说，MySQL 的用户名密码、第三方平台的 Token 令牌等等。不过，Apollo 暂时未内置配置加密的功能。官方文档说明如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ae87e5da09b54bb29949714a65d85cca.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**1\)密文获取**  
我们需要借助第三方包`jasypt`来实现加密功能，要使用`jasypt`先在项目中引入依赖：

```xml
        <!--jasypt-->
        <dependency>
            <groupId>com.github.ulisesbocchio</groupId>
            <artifactId>jasypt-spring-boot-starter</artifactId>
            <version>3.0.3</version>
        </dependency>
```

注意：  
①3.0.0 以后更改了加密算法，所以假如你不设置的话，使用网上的方法加密出来的密码启动就会报错

```yml
# jasypt 密码加密配置
jasypt:
  encryptor:
  # 加密盐值
    password: jasypt
    # 加密算法设置 3.0.0 以后
    algorithm: PBEWithMD5AndDES
    iv-generator-classname: org.jasypt.iv.NoIvGenerator
```

②3.0.0 之前的 Jasypt需要额外添加 Jasypt 的加密盐值配置到 Tomcat

```sell
-Djasypt.encryptor.password=xxxx
```

我们先使用StringEncryptor获取密文，可以先创建一个明文，对明文进行加密，比如我数据库连接密码为`123456`，存储在Apollo，现在我要对其加密。

```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class PasswordTest {

    @Autowired
    private StringEncryptor encryptor;

    @Test
    public void encode() {
        String password = "123456";
        System.out.println(encryptor.encrypt(password));
    }
}
```

运行后可得到加密结果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0ebf44d55e9b423aae3b18bcb389e225.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**2\)密文输入**  
我们将密文配置到Apollo中，以 ENC\(密文\) 修饰，我们对数据连接中密码进行加密，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/28f34f8a53e248f1b8c49d3b27260c1c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

接下来我们运行hailtaxi-driver程序，发现还是可以从数据库获取指定司机信息`http://localhost:18081/driver/info/1`，证明将密码替换成密文后依旧可以运行。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fde685bf33a04e07b257291d33c27583.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4\. 配置加载顺序

Apollo多个Namespace加载顺序是存在差异

1.  对于`apollo.bootstrap` 对应一个 `CompositePropertySource`对象，即使有对应多个 ApolloNamespace。并且，多个 Namespace 是按照在`apollo.bootstrap.namespaces`配置顺序。  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/9c9b80c162274f9cac3d7a586f5860b0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

2.  所有 Apollo 对应的 PropertySource 对象，优先级非常高，目前看下来仅仅低于 server.ports对应的 MapPropertySource。基本上，我们可以认为是最高优先级了。

## 5\. 灰度发布

通过创建灰度版本，您可以对某些配置做灰度测试 灰度流程为:  
1.创建灰度版本  
2.配置灰度配置项  
3.配置灰度规则.如果是私有的namespace可以按照客户端的IP进行灰度，如果是公共的namespace则可以同时按AppId和客户端的IP进行灰度  
4.灰度发布

灰度版本最终有两种结果:**全量发布和放弃灰度**

1.  全量发布:灰度的配置合到主版本并发布，所有的客户端都会使用合并后的配置
2.  放弃灰度:删除灰度版本，所有的客户端都会使用回主版本的配置

注意事项:如果灰度版本已经有灰度发布过，那么修改灰度规则后，无需再次灰度发布就立即生效

![在这里插入图片描述](https://img-blog.csdnimg.cn/aa16352fc7c24b858a22070906eeadd4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
如下图，如果测试版本有额外的配置，我们可以点击新增灰度配置  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e0d39168161b4cd3861a700e922dce56.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
新增配置后，点击灰度发布才会生效  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f6d731bd389c46ff98a7b925e336a7a1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们可以让指定的IP的服务为灰度版本，如下图可以选择当前访问过服务的IP，如果有其他指定IP，可以手动直接输入，手动输入多个IP以逗号隔开，当用户访问这些IP指定的服务时，对应配置才会生效。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cc76f22763e94e92bb1a0c1d0aee6c5e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
手动输入IP  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b447834d5f89470ba439e523a175771d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
全量灰度发布在现实工作中是指灰度版本没有问题了，需要把所有服务的版本全部切换成完成测试的灰度版本，我们点击全量发布即可,全量发布的时候，我们可以把灰度版本删除。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6dfa9a466860401cbfff3d4671e5796b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)