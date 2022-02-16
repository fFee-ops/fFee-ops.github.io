---
title: Springboot整合Mybatis让日志中输出执行的sql语句
date: 2022-02-10 19:07:46
tags:
password:
categories: Mybatis
---

有时候我们需要在控制台看一下sql语句的执行结果来排查错误，这个时候就需要如下操作：

默认mybatis已经配置好了

**①引入依赖**
```xml
    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>


            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-web</artifactId>
                <!-- 去掉logback配置 -->
                <exclusions>
                    <exclusion>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-starter-logging</artifactId>
                    </exclusion>
                </exclusions>
            </dependency>

            <!-- 引入log4j2依赖 -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-log4j2</artifactId>
            </dependency>
```
> 首先引入了lombok，这样就可以使用@Slf4j注解了。就不用写一大串代码来定义`log`了。
> 然后我们排除了springboot自带的logback，转而引入log4j2，因为它性能更高


**②修改yml文件**
```yml
	mybatis:
	  configuration:
	  # 就是这行代码让mybatis可以输出sql语句
	    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
	    
	logging:
	  level:
	  # 项目大体日志等级，也就是不额外设置就是info了
	    root: info
	    # 单独指定某个包的日志等级，因为DAO层设置为info信息太多了，只需要关注一些报警与错误即可
	    com.example.emos.wx.db.dao : warn
	  pattern:
	    console: "%d{HH:mm:ss}  %-5level  %msg%n"

```

**③启动项目即可**