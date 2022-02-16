---
title: SpringCloudAlibaba→Seata：集成SpringBoot
date: 2022-01-07 14:44:06
tags: spring boot java spring cloud
categories: SpringCloudAlibaba
---

<!--more-->

### Seata集成SpringBoot

- [详细步骤](#_2)
- - [1）依赖引入](#1_14)
  - [2）配置Seata](#2Seata_25)
  - [3）代理数据源](#3_166)
  - [4）全局事务控制](#4_173)
  - [5）分布式事务测试](#5_178)

# 详细步骤

集成SpringBoot可以按照如下步骤实现\(默认seataServer已经安装好了并且启动了\)：

1.  引入依赖包`spring-cloud-starter-alibaba-seata`
2.  配置Seata
3.  创建代理数据源
4.  \@GlobalTransactional全局事务控制

**项目结构图：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/60402d16130d4fa28afbd885dde4c052.png)

## 1）依赖引入

【用到seata的项目都要引入依赖】  
我们首先在 `hailtaxi-driver` 和`hailtaxi-order`中引入依赖：

```xml
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
            <version>2.2.5.RELEASE</version>
        </dependency>
```

## 2）配置Seata

【用到seata的项目都要添加如下配置】

依赖引入后，我们需要在项目中配置SeataClient端信息，关于SeataClient端配置信息,官方也给出了很多版本的模板，可以打开<https://github.com/seata/seata/tree/1.4.0/script>，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/66952f55b06645ebb0f870a6445b8b21.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
我们可以选择`spring`，把 `application.yml`文件直接拷贝到工程中，文件如下：

```yml
seata:
  enabled: true
  application-id: applicationName
  #当前分布式事务所对应的组【一般自己修改，默认为：my_test_tx_group】
  tx-service-group: seata_transcation
  enable-auto-data-source-proxy: true
  data-source-proxy-mode: AT
  use-jdk-proxy: false
  excludes-for-auto-proxying: firstClassNameForExclude,secondClassNameForExclude
  client:
    rm:
      async-commit-buffer-limit: 1000
      report-retry-count: 5
      table-meta-check-enable: false
      report-success-enable: false
      saga-branch-register-enable: false
      saga-json-parser: fastjson
      lock:
        retry-interval: 10
        retry-times: 30
        retry-policy-branch-rollback-on-conflict: true
    tm:
      commit-retry-count: 5
      rollback-retry-count: 5
      default-global-transaction-timeout: 60000
      degrade-check: false
      degrade-check-period: 2000
      degrade-check-allow-times: 10
    undo:
      data-validation: true
      log-serialization: jackson
      log-table: undo_log
      only-care-update-columns: true
    log:
      exceptionRate: 100
  service:
    #    默认为【vgroup-mapping:】需要修改为驼峰命名规则
    vgroupMapping:
      #      默认为【my_test_tx_group: default】，需要修改为【tx-service-group】的值
      seata_transcation: default
    grouplist:
      #      seataServer安装的地址
      default: 192.168.80.16:8091
    enable-degrade: false
    disable-global-transaction: false
  transport:
    shutdown:
      wait: 3
    thread-factory:
      boss-thread-prefix: NettyBoss
      worker-thread-prefix: NettyServerNIOWorker
      server-executor-thread-prefix: NettyServerBizHandler
      share-boss-worker: false
      client-selector-thread-prefix: NettyClientSelector
      client-selector-thread-size: 1
      client-worker-thread-prefix: NettyClientWorkerThread
      worker-thread-size: default
      boss-thread-size: 1
    type: TCP
    server: NIO
    heartbeat: true
    serialization: seata
    compressor: none
    enable-client-batch-send-request: true
#  config:
#    type: file
#    consul:
#      server-addr: 127.0.0.1:8500
#    apollo:
#      apollo-meta: http://192.168.1.204:8801
#      app-id: seata-server
#      namespace: application
#      apollo-accesskey-secret: ""
#    etcd3:
#      server-addr: http://localhost:2379
#    nacos:
#      namespace:
#      serverAddr: 127.0.0.1:8848
#      group: SEATA_GROUP
#      username: ""
#      password: ""
#    zk:
#      server-addr: 127.0.0.1:2181
#      session-timeout: 6000
#      connect-timeout: 2000
#      username: ""
#      password: ""
#    custom:
#      name: ""
  registry:
    type: nacos
    load-balance: RandomLoadBalance
    load-balance-virtual-nodes: 10
    file:
      name: file.conf
    nacos:
      application: seata-server
      server-addr: 114.215.191.164:8848
      group : "DEFAULT_GROUP"

#    consul:
#      server-addr: 127.0.0.1:8500
#    etcd3:
#      serverAddr: http://localhost:2379
#    eureka:
#      weight: 1
#      service-url: http://localhost:8761/eureka
#    redis:
#      server-addr: localhost:6379
#      db: 0
#      password:
#      timeout: 0
#    sofa:
#      server-addr: 127.0.0.1:9603
#      region: DEFAULT_ZONE
#      datacenter: DefaultDataCenter
#      group: SEATA_GROUP
#      addressWaitTime: 3000
#      application: default
#    zk:
#      server-addr: 127.0.0.1:2181
#      session-timeout: 6000
#      connect-timeout: 2000
#      username: ""
#      password: ""
#    custom:
#      name: ""
```

关于配置文件内容参数比较多，我们只需要掌握核心部分：

> **seata\_transaction: default**:事务分组，前面的seata\_transaction可以自定义，通过事务分组很方便找到集群节点信息。  
>   
> **tx-service-group: seata\_transaction**:指定应用的事务分组，和上面定义的分组前部分保持一致。  
> **default: 192.168.211.145:8091**:服务地址，seata-server服务地址。

## 3）代理数据源

【用到seata的项目都要配置代理数据源】  
通过代理数据源可以保障事务日志数据和业务数据能同步，关于代理数据源早期需要手动创建，但是随着Seata版本升级，不同版本实现方案不一样了，下面是官方的介绍：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8b2d91b837c74f5787a6de3d5c932f04.png)  
我们当前的版本是1.3.0,所以我们创建代理数据源只需要在启动类上添加  
`@EnableAutoDataSourceProxy`注解即可。在 Dirver和Order项目的主启动类上添加该注解：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bb1e49517cdb4c03b271a3387de7ae66.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4）全局事务控制

假设现在有下单->修改司机信息->创建订单3个操作同时在 `hailtaxi-order` 工程中执行，打车成功创建订单是由客户发起，在 `hailtaxi- order`中执行，并且`feign`调用`hailtaxi-driver` ，所以 `hailtaxi-order`是全局事务入口，我们在`OrderInfoServiceImpl.addOrder()`方法上添加 `@GlobalTransactional`，那么此时该方法就是全局事务的入口，为了测试事务，我们在代码中添加一个异常，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/61648a1a05f34b3fb8f001c29dfe8ba1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 5）分布式事务测试

我们此时执行请求 `http://localhost:18082/order/addOrder?id=123`，我们可以看到执行的最终结果是失败。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5a2369d704ea4e6d8e5d647bc61f4167.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
但是控制台可以看到driver其实是执行成功了的。因为driver是在发生异常前就执行了的。所以肯定能成功。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/bafb2194b9be40a2ad4f692632867d55.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时这种情况就需要全局事务控制，我们去数据库看看司机的状态是否改变了。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f3036891931b48f1a514587fa9b2f4e4.png)  
我们可发现，司机的状态并没有改变，这就是说全局事务控制起了效果。