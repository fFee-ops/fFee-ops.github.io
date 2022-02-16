---
title: Failed to bind properties under ‘logging.level‘ to java.util.Map java.lang.String, java.lang.String
date: 2021-01-27 21:21:23
tags: 
categories: 踩坑
---

<!--more-->

springBoot 2.0 添加 日志级别，启动报错：

```java
org.springframework.boot.context.properties.bind.BindException: Failed to bind properties under 'logging.level' to java.util.Map<java.lang.String, java.lang.String>
	at org.springframework.boot.context.properties.bind.Binder.handleBindError(Binder.java:249) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder.bind(Binder.java:225) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder.bind(Binder.java:208) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder.bind(Binder.java:177) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.logging.LoggingApplicationListener.setLogLevels(LoggingApplicationListener.java:342) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.logging.LoggingApplicationListener.initializeFinalLoggingLevels(LoggingApplicationListener.java:318) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.logging.LoggingApplicationListener.initialize(LoggingApplicationListener.java:266) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.logging.LoggingApplicationListener.onApplicationEnvironmentPreparedEvent(LoggingApplicationListener.java:228) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.logging.LoggingApplicationListener.onApplicationEvent(LoggingApplicationListener.java:201) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.context.event.SimpleApplicationEventMulticaster.doInvokeListener(SimpleApplicationEventMulticaster.java:172) ~[spring-context-5.1.6.RELEASE.jar:5.1.6.RELEASE]
	at org.springframework.context.event.SimpleApplicationEventMulticaster.invokeListener(SimpleApplicationEventMulticaster.java:165) ~[spring-context-5.1.6.RELEASE.jar:5.1.6.RELEASE]
	at org.springframework.context.event.SimpleApplicationEventMulticaster.multicastEvent(SimpleApplicationEventMulticaster.java:139) ~[spring-context-5.1.6.RELEASE.jar:5.1.6.RELEASE]
	at org.springframework.context.event.SimpleApplicationEventMulticaster.multicastEvent(SimpleApplicationEventMulticaster.java:127) ~[spring-context-5.1.6.RELEASE.jar:5.1.6.RELEASE]
	at org.springframework.boot.context.event.EventPublishingRunListener.environmentPrepared(EventPublishingRunListener.java:75) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.SpringApplicationRunListeners.environmentPrepared(SpringApplicationRunListeners.java:54) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.SpringApplication.prepareEnvironment(SpringApplication.java:347) [spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:306) [spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1260) [spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1248) [spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at com.paile.demo.DmUserConsumerApplication.main(DmUserConsumerApplication.java:14) [classes/:na]
Caused by: org.springframework.core.convert.ConverterNotFoundException: No converter found capable of converting from type [java.lang.String] to type [java.util.Map<java.lang.String, java.lang.String>]
	at org.springframework.core.convert.support.GenericConversionService.handleConverterNotFound(GenericConversionService.java:321) ~[spring-core-5.1.6.RELEASE.jar:5.1.6.RELEASE]
	at org.springframework.core.convert.support.GenericConversionService.convert(GenericConversionService.java:194) ~[spring-core-5.1.6.RELEASE.jar:5.1.6.RELEASE]
	at org.springframework.boot.context.properties.bind.BindConverter$CompositeConversionService.convert(BindConverter.java:177) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.BindConverter.convert(BindConverter.java:98) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.BindConverter.convert(BindConverter.java:90) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.MapBinder.bindAggregate(MapBinder.java:65) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.AggregateBinder.bind(AggregateBinder.java:58) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder.lambda$bindAggregate$2(Binder.java:304) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder$Context.withIncreasedDepth(Binder.java:448) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder$Context.access$100(Binder.java:388) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder.bindAggregate(Binder.java:303) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder.bindObject(Binder.java:261) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	at org.springframework.boot.context.properties.bind.Binder.bind(Binder.java:220) ~[spring-boot-2.1.4.RELEASE.jar:2.1.4.RELEASE]
	... 18 common frames omitted
 
 
Process finished with exit code 1
```

原因

```yml
logging:
      level: debug(这是字符串，所以抛异常)
      
      level是map键值对形式
      （key:包名）cn.itcast: debug（值：是级名）
```

**解决方法：**

```yml
logging:
  level: info
```

修改为

```yml
logging:
  level:
    com.sl.gulimall.ware:  debug
```

---