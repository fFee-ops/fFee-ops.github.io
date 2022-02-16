---
title: spring boot与spring cloud版本
date: 2020-10-16 13:48:01
tags: 
categories: SpringCloud
---

<!--more-->

### spring boot与spring cloud版本

- [Springboot版本选择](#Springboot_2)
- [SpringCloud版本选择](#SpringCloud_12)
- - [Cloud命名规则](#Cloud_17)
- [查看SpringCloud和Springboot之间的依赖关系](#SpringCloudSpringboot_23)
- [本次学习使用的版本](#_70)
- [boot版2.2.2不是最新，为什么选2.2.2？](#boot222222_75)

# Springboot版本选择

[GitHub源码地址](https://github.com/spring-projects/spring-boot/releases/)

[SpringBoot2.0新特性](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.0-Release-Notes)

通过上面官网发现，Boot官方强烈建议你升级到2.X以上版本  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016133016987.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
本次Springboot版本将使用2.2.2

# SpringCloud版本选择

[GitHub源码地址](https://github.com/spring-projects/spring-cloud/wiki)

[官网](https://spring.io/projects/spring-cloud)

## Cloud命名规则

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016133313727.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
**SpringCloud的多版本**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016133302895.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 查看SpringCloud和Springboot之间的依赖关系

[网址](https://spring.io/projects/spring-cloud#overview)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016134044302.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016134049615.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**更详细的版本对应查看方法**  
[网址](https://start.spring.io/actuator/info)  
打开网址后会得到一段json字符串

```json
{"git":{"branch":"8faaadcff4eab8d404ed2f79053ed9028eb789b4","commit":{"id":"8faaadc","time":"2020-10-15T12:44:03Z"}},"build":{"version":"0.0.1-SNAPSHOT","artifact":"start-site","versions":{"spring-boot":"2.3.4.RELEASE","initializr":"0.10.0-SNAPSHOT"},"name":"start.spring.io website","time":"2020-10-15T12:55:48.153Z","group":"io.spring.start"},"bom-ranges":{"azure":{"2.0.10":"Spring Boot >=2.0.0.RELEASE and <2.1.0.RELEASE","2.1.10":"Spring Boot >=2.1.0.RELEASE and <2.2.0.M1","2.2.4":"Spring Boot >=2.2.0.M1 and <2.3.0.M1","2.3.5":"Spring Boot >=2.3.0.M1"},"codecentric-spring-boot-admin":{"2.0.6":"Spring Boot >=2.0.0.M1 and <2.1.0.M1","2.1.6":"Spring Boot >=2.1.0.M1 and <2.2.0.M1","2.2.4":"Spring Boot >=2.2.0.M1 and <2.3.0.M1","2.3.0":"Spring Boot >=2.3.0.M1 and <2.4.0-M1"},"solace-spring-boot":{"1.0.0":"Spring Boot >=2.2.0.RELEASE and <2.3.0.M1","1.1.0":"Spring Boot >=2.3.0.M1"},"solace-spring-cloud":{"1.0.0":"Spring Boot >=2.2.0.RELEASE and <2.3.0.M1","1.1.1":"Spring Boot >=2.3.0.M1"},"spring-cloud":{"Finchley.M2":"Spring Boot >=2.0.0.M3 and <2.0.0.M5","Finchley.M3":"Spring Boot >=2.0.0.M5 and <=2.0.0.M5","Finchley.M4":"Spring Boot >=2.0.0.M6 and <=2.0.0.M6","Finchley.M5":"Spring Boot >=2.0.0.M7 and <=2.0.0.M7","Finchley.M6":"Spring Boot >=2.0.0.RC1 and <=2.0.0.RC1","Finchley.M7":"Spring Boot >=2.0.0.RC2 and <=2.0.0.RC2","Finchley.M9":"Spring Boot >=2.0.0.RELEASE and <=2.0.0.RELEASE","Finchley.RC1":"Spring Boot >=2.0.1.RELEASE and <2.0.2.RELEASE","Finchley.RC2":"Spring Boot >=2.0.2.RELEASE and <2.0.3.RELEASE","Finchley.SR4":"Spring Boot >=2.0.3.RELEASE and <2.0.999.BUILD-SNAPSHOT","Finchley.BUILD-SNAPSHOT":"Spring Boot >=2.0.999.BUILD-SNAPSHOT and <2.1.0.M3","Greenwich.M1":"Spring Boot >=2.1.0.M3 and <2.1.0.RELEASE","Greenwich.SR6":"Spring Boot >=2.1.0.RELEASE and <2.1.18.BUILD-SNAPSHOT","Greenwich.BUILD-SNAPSHOT":"Spring Boot >=2.1.18.BUILD-SNAPSHOT and <2.2.0.M4","Hoxton.SR8":"Spring Boot >=2.2.0.M4 and <2.3.5.BUILD-SNAPSHOT","Hoxton.BUILD-SNAPSHOT":"Spring Boot >=2.3.5.BUILD-SNAPSHOT and <2.4.0.M1","2020.0.0-M3":"Spring Boot >=2.4.0.M1 and <=2.4.0.M1","2020.0.0-M4":"Spring Boot >=2.4.0.M2 and <2.4.0-SNAPSHOT","2020.0.0-SNAPSHOT":"Spring Boot >=2.4.0-SNAPSHOT"},"spring-cloud-alibaba":{"2.2.1.RELEASE":"Spring Boot >=2.2.0.RELEASE and <2.3.0.M1"},"spring-cloud-services":{"2.0.3.RELEASE":"Spring Boot >=2.0.0.RELEASE and <2.1.0.RELEASE","2.1.7.RELEASE":"Spring Boot >=2.1.0.RELEASE and <2.2.0.RELEASE","2.2.3.RELEASE":"Spring Boot >=2.2.0.RELEASE and <2.3.0.M1"},"spring-statemachine":{"2.0.0.M4":"Spring Boot >=2.0.0.RC1 and <=2.0.0.RC1","2.0.0.M5":"Spring Boot >=2.0.0.RC2 and <=2.0.0.RC2","2.0.1.RELEASE":"Spring Boot >=2.0.0.RELEASE"},"vaadin":{"10.0.17":"Spring Boot >=2.0.0.M1 and <2.1.0.M1","14.3.7":"Spring Boot >=2.1.0.M1 and <2.4.0-M1"},"wavefront":{"2.0.1":"Spring Boot >=2.1.0.RELEASE"}},"dependency-ranges":{"okta":{"1.2.1":"Spring Boot >=2.1.2.RELEASE and <2.2.0.M1","1.4.0":"Spring Boot >=2.2.0.M1 and <2.4.0-M1"},"mybatis":{"2.0.1":"Spring Boot >=2.0.0.RELEASE and <2.1.0.RELEASE","2.1.3":"Spring Boot >=2.1.0.RELEASE and <2.4.0-M1"},"geode":{"1.2.10.RELEASE":"Spring Boot >=2.2.0.M5 and <2.3.0.M1","1.3.4.RELEASE":"Spring Boot >=2.3.0.M1 and <2.4.0-M1","1.4.0-M3":"Spring Boot >=2.4.0-M1"},"camel":{"2.22.4":"Spring Boot >=2.0.0.M1 and <2.1.0.M1","2.25.2":"Spring Boot >=2.1.0.M1 and <2.2.0.M1","3.3.0":"Spring Boot >=2.2.0.M1 and <2.3.0.M1","3.5.0":"Spring Boot >=2.3.0.M1 and <2.4.0-M1"},"open-service-broker":{"2.1.3.RELEASE":"Spring Boot >=2.0.0.RELEASE and <2.1.0.M1","3.0.4.RELEASE":"Spring Boot >=2.1.0.M1 and <2.2.0.M1","3.1.1.RELEASE":"Spring Boot >=2.2.0.M1 and <2.4.0-M1"}}}
```

然后用解析工具转换一下json字符串

```json
{
这是其中的一小部分，可以从这里看到对应的关系
        "spring-cloud": {
            "Finchley.M2": "Spring Boot >=2.0.0.M3 and <2.0.0.M5",
            "Finchley.M3": "Spring Boot >=2.0.0.M5 and <=2.0.0.M5",
            "Finchley.M4": "Spring Boot >=2.0.0.M6 and <=2.0.0.M6",
            "Finchley.M5": "Spring Boot >=2.0.0.M7 and <=2.0.0.M7",
            "Finchley.M6": "Spring Boot >=2.0.0.RC1 and <=2.0.0.RC1",
            "Finchley.M7": "Spring Boot >=2.0.0.RC2 and <=2.0.0.RC2",
            "Finchley.M9": "Spring Boot >=2.0.0.RELEASE and <=2.0.0.RELEASE",
            "Finchley.RC1": "Spring Boot >=2.0.1.RELEASE and <2.0.2.RELEASE",
            "Finchley.RC2": "Spring Boot >=2.0.2.RELEASE and <2.0.3.RELEASE",
            "Finchley.SR4": "Spring Boot >=2.0.3.RELEASE and <2.0.999.BUILD-SNAPSHOT",
            "Finchley.BUILD-SNAPSHOT": "Spring Boot >=2.0.999.BUILD-SNAPSHOT and <2.1.0.M3",
            "Greenwich.M1": "Spring Boot >=2.1.0.M3 and <2.1.0.RELEASE",
            "Greenwich.SR6": "Spring Boot >=2.1.0.RELEASE and <2.1.18.BUILD-SNAPSHOT",
            "Greenwich.BUILD-SNAPSHOT": "Spring Boot >=2.1.18.BUILD-SNAPSHOT and <2.2.0.M4",
            "Hoxton.SR8": "Spring Boot >=2.2.0.M4 and <2.3.5.BUILD-SNAPSHOT",
            "Hoxton.BUILD-SNAPSHOT": "Spring Boot >=2.3.5.BUILD-SNAPSHOT and <2.4.0.M1",
            "2020.0.0-M3": "Spring Boot >=2.4.0.M1 and <=2.4.0.M1",
            "2020.0.0-M4": "Spring Boot >=2.4.0.M2 and <2.4.0-SNAPSHOT",
            "2020.0.0-SNAPSHOT": "Spring Boot >=2.4.0-SNAPSHOT"
        },
        "spring-cloud-alibaba": {
            "2.2.1.RELEASE": "Spring Boot >=2.2.0.RELEASE and <2.3.0.M1"
        },
      
}
```

# 本次学习使用的版本

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016134533449.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

---

# boot版2.2.2不是最新，为什么选2.2.2？

**1、只用boot，直接用最新**  
**2、同时用boot和cloud，需要照顾cloud，由cloud决定boot版本**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016134650395.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)