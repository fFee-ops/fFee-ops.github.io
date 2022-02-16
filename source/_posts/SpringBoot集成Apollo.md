---
title: SpringBoot集成Apollo
date: 2022-01-11 12:26:59
tags: spring boot java 后端
categories: Apollo
---

<!--more-->

### SpringBoot集成Apollo

- [1\. 集成Apollo](#1_Apollo_4)
- [2\. 测试是否集成成功](#2__53)

**项目结构图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d8af4461062f476cb573e30da01d75be.png)

# 1\. 集成Apollo

集成Apollo有2个步骤，首先是要引入Apollo的客户端，接着需要在springboot核心配置文件中引入需要从Apollo中注入的配置信息。

**①引入依赖**  
在`hailtaxi-driver`的pom.xml中引入如下依赖：

```xml
        <!--ApolloClient-->
        <dependency>
            <groupId>com.ctrip.framework.apollo</groupId>
            <artifactId>apollo-client</artifactId>
            <version>1.7.0</version>
        </dependency>
```

**②修改配置**  
在 driver项目的bootstrap.yml 中写上如下配置：

```yml
server:
  port: 18081
#Apollo应用
app:
  id: hailtaxi-driver-config  #使用的 Apollo 的项目（应用）编号
apollo:
  meta: http://192.168.211.145:8080 #Apollo Meta Server 地址
  bootstrap:
    enabled: true   #是否开启 Apollo 配置预加载功能。默认为 false。
    eagerLoad:
      enable: true  #是否开启 Apollo 支持日志级别的加载时机。默认为 false。
    namespaces: application,stmt,driver-info,springboot-config  #使用的 Apollo 的命名空间，默认为 application。
```

# 2\. 测试是否集成成功

为了将更多资源交给Apollo，我们在 hailtaxi-driver-config 中添加一个新的namespace，用于配置springboot的核心配置`springboot-config`内容如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1ae396178316472e9fad746ff3b07be1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

```properties
spring.application.name = hailtaxi-driver
spring.datasource.driver-class-name = com.mysql.cj.jdbc.Driver
spring.datasource.url = jdbc:mysql://192.168.211.145:3306/hailtaxi-driver?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC
spring.datasource.username = root
spring.datasource.password = 123456
spring.cloud.consul.host = 192.168.211.145
spring.cloud.consul.port = 8500
spring.cloud.consul.discovery.service-name = ${spring.application.name}
spring.cloud.consul.discovery.prefer-ip-address = true
```

我们编写一个案例，获取配置中的数据（stmt、driver-info），并对外输出友好提示，在`hailtaxi-driver` 中创建代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/511f8b20854e4496aaf5e390443a67ec.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_15,color_FFFFFF,t_70,g_se,x_16)

```java
@RestController
@RequestMapping(value = "/trip")
//@ConfigurationProperties(prefix = "platform")
@Data
public class TripController {

    @Autowired
    private Environment environment;

    @Value("${ip}")
    private String ip;

    private String name;
    private String address;
    private String coursename;

    /***
     * 出行提醒
     * @return
     */
    @GetMapping(value = "/message")
    public String message(){
        //获取hailtaxi-driver-config中stmt数据
        String ip = environment.getProperty("ip");
        String city = environment.getProperty("city");
        String weather = environment.getProperty("weather");

        //获取hailtaxi-driver-config中driver-info数据
        String drivertype = environment.getProperty("drivertype");

        //组装提示信息
        String message = "您的IP【"+ip+"】，欢迎【"+
                city+"】用户，当前天气"+weather+"。您选择的车型为【"+
                drivertype+"】，祝您出行愉快！【"+
                name+"】来自于【"+coursename+"】，联系地址："+address;
        return message;
    }
}
```

我们请求 `http://localhost:18081/trip/message` 进行测试，效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/244f45b7323e4e97bdaec3695893c671.png)