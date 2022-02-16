---
title: Apollo源码剖析
date: 2022-01-14 17:31:12
tags: java 开发语言 后端
categories: Apollo
---

<!--more-->

### Apollo源码剖析

- [1\. Portal创建APP](#1_PortalAPP_2)
- - [1.1 创建APP](#11_APP_11)
  - - [1.1.1 实体Bean](#111_Bean_14)
    - [1.1.2 业务执行流程](#112__64)
  - [1.2 数据同步](#12__95)
  - - [1.2.1 观察者模式](#121__98)
    - [1.2.2 事件监听](#122__122)
    - [1.2.3 同步业务执行流程](#123__129)
- [2\. Namespace创建](#2_Namespace_142)
- - [2.1 创建AppNamespace](#21_AppNamespace_153)
  - - [2.1.1 实体Bean](#211_Bean_156)
    - [2.1.2 业务执行流程](#212__222)
  - [2.2 数据同步](#22__240)
  - - [2.2.1 事件监听](#221__241)
    - [2.2.2 同步业务执行流程](#222__249)
- [3\. Apollo客户端](#3_Apollo_271)
- - [3.1 Spring扩展](#31_Spring_273)
  - [3.2 Apollo扩展Spring](#32_ApolloSpring_283)
  - [2.3 数据同步](#23__288)
  - [3.4 \@ApolloConfigChangeListener](#34_ApolloConfigChangeListener_292)

# 1\. Portal创建APP

Apollo创建App的过程如果基于控制台操作是很简单的，但是Apollo是如何实现的呢，我们接下来进行相关源码剖析。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/13e8b765558a4a0f8e446bf17f63283d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
创建APP的流程如上图：  
1:用户在后台执行创建app，会将请求发送到Portal Service  
2:Portal Service将数据保存到Portal DB中  
3:Portal Service同时将数据同步到Admin Service中，这个过程是异步的  
4:Admin Service将数据保存到Config DB中

## 1.1 创建APP

创建APP由Portal Service执行，我们从它的JavaBean、Controller、Service、Dao一步一步分析。

### 1.1.1 实体Bean

**1\)Table**  
APP对应的表结构如下：

```sql
CREATE TABLE `App` (
	`Id` INT ( 10 ) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
	`AppId` VARCHAR ( 500 ) NOT NULL DEFAULT 'default' COMMENT 'AppID',
	`Name` VARCHAR ( 500 ) NOT NULL DEFAULT 'default' COMMENT '应用名',
	`OrgId` VARCHAR ( 32 ) NOT NULL DEFAULT 'default' COMMENT '部门Id',
	`OrgName` VARCHAR ( 64 ) NOT NULL DEFAULT 'default' COMMENT '部门名字',
	`OwnerName` VARCHAR ( 500 ) NOT NULL DEFAULT 'default' COMMENT 'ownerName',
	`OwnerEmail` VARCHAR ( 500 ) NOT NULL DEFAULT 'default' COMMENT 'ownerEmail',
	`IsDeleted` bit ( 1 ) NOT NULL DEFAULT b '0' COMMENT '1: deleted, 0: normal',
	`DataChange_CreatedBy` VARCHAR ( 32 ) NOT NULL DEFAULT 'default' COMMENT '创建人邮
	箱前缀',
	`DataChange_CreatedTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	`DataChange_LastModifiedBy` VARCHAR ( 32 ) DEFAULT '' COMMENT '最后修改人邮箱前缀',
	`DataChange_LastTime` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
	PRIMARY KEY ( `Id` ),
	KEY `AppId` (
	`AppId` ( 191 )),
	KEY `DataChange_LastTime` ( `DataChange_LastTime` ),
	KEY `IX_Name` (
	`Name` ( 191 )) 
) ENGINE = INNODB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '应用表';
```

**2\)App\(Bean\)**  
在 `apollo-common`项目中， `com.ctrip.framework.apollo.common.entity.App` ，继承`BaseEntity` 抽象类，应用信息实体。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f6fa06497d0a46ac9fde90a6109526e2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

1.  ORM 选用 Hibernate 框架。
2.  `@SQLDelete(...)`\+ `@Where(...)` 注解，配合 BaseEntity.extends 字段，实现 App 的逻辑删除。

**3\)BaseEntity\(Bean\)**  
`com.ctrip.framework.apollo.common.entity.BaseEntity` ，是基础实体抽象类。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/46b5065cc8d1460dacb42b63ee5d433d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
部分注解和方法我们说明一下：  
3\. id 字段，编号，Long 型，全局自增。  
4\. isDeleted 字段，是否删除，用于逻辑删除的功能。  
5\. dataChangeCreatedBy 和 dataChangeCreatedTime 字段，实现数据的创建人和时间的记录，方便追踪。  
6\. dataChangeLastModifiedBy 和 dataChangeLastModifiedTime 字段，实现数据的更新人和时间的记录，方便追踪。  
7\. \@PrePersist 、 \@PreUpdate 、 \@PreRemove 注解，CRD 操作前，设置对应的时间字段。  
8\. 在 Apollo 中，所有实体都会继承 BaseEntity ，实现公用字段的统一定义。这种设计值得借鉴，特别是创建时间和更新时间这两个字段，特别适合线上追踪问题和数据同步。

**数据为什么要同步呢？**  
在文初的流程图中，我们看到 App 创建时，在 Portal Service 存储完成后，会异步同步到 AdminService 中，这是为什么呢？

在 Apollo 的架构中，一个环境\( Env \) 对应一套 Admin Service 和 Config Service 。 而 Portal Service会管理所有环境\( Env \) 。因此，每次创建 App 后，需要进行同步。

或者说，App 在 Portal Service 中，表示需要管理的 App 。而在 Admin Service 和 Config Service中，表示存在的 App 。

### 1.1.2 业务执行流程

**1\)Controller**  
在 apollo-portal 项目中，`com.ctrip.framework.apollo.portal.controller.AppController`  
，提供 App 的 API 。

在创建项目的界面中，点击【提交】按钮，调用创建 App 的 API 。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3fba253da9c245799c2d15b4753a83e0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
处理请求的方法如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4fe0ee7e0a4a4d4a93c2a08675a1853e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
关于创建app请求操作我们做一下说明：

1.  POST `apps`接口，Request Body 传递 JSON 对象。
2.  `com.ctrip.framework.apollo.portal.entity.model.AppModel`，App Model 负责接收来自 Portal 界面（就是展示给用户的可视化界面）的复杂请求对象。例如，AppModel 一方面带有创建 App 对象需要的属性，另外也带有需要授权管理员的编号集合 admins ，即存在跨模块的情况。
3.  调用 `#transformToApp(AppModel)` 方法，将 AppModel 转换成 App 对象。转换方法很简单，点击方法，直接查看。
4.  `调用 AppService#createAppInLocal(App)`方法，保存 App 对象到 Portal DB 数据库。
5.  调用 `ApplicationEventPublisher#publishEvent(AppCreationEvent)`方法，发布`com.ctrip.framework.apollo.portal.listener.AppCreationEvent` 事件。
6.  授予 App 管理员的角色。
7.  授予 App 管理员的角色。

**2\)Service**  
在 apollo-portal 项目中，`com.ctrip.framework.apollo.portal.service.AppService`，提供App 的 Service逻辑。

`#createAppInLocal(App)` 方法，保存 App 对象到 Portal DB 数库。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d1856d33f78a4a1ba651ac0664d886fe.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**3\)AppRepository**  
在 apollo-portal 项目中`com.ctrip.framework.apollo.common.entity.App.AppRepository`，继承`org.springframework.data.repository.PagingAndSortingRepository`接口，提供 App 的数据访问，即 DAO 。  
代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/317ab905470f44729fc38dc0525f0754.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
持久层是基于 Spring Data JPA 框架，使用 Hibernate 实现。

## 1.2 数据同步

在前面流程图中我们说过会调用Admin Service执行同步，同步过程是如何同步的呢，其实这里采用了观察者模式进行了监听操作。

### 1.2.1 观察者模式

**定义：**  
对象之间存在一对多或者一对一依赖，当一个对象改变状态，依赖它的对象会收到通知并自动更新。  
MQ其实就属于一种观察者模式，发布者发布信息，订阅者获取信息，订阅了就能收到信息，没订阅就收不到信息。

**优点：**

1.  观察者和被观察者是抽象耦合的。
2.  建立了一套触发机制。

**缺点：**

1.  如果一个被观察者对象有很多的直接和间接的观察者的话，将所有的观察者都通知到会花费很多时间。
2.  如果在观察者和观察目标之间有循环依赖的话，观察目标会触发它们之间进行循环调用，可能导致系统崩溃。

**Spring观察者模式**  
`ApplicationContext`事件机制是观察者设计模式的实现，通过 `ApplicationEvent`类和`ApplicationListener`接口，可以实现 `ApplicationContext`事件处理。

如果容器中有一个 `ApplicationListener Bean` ，每当 `ApplicationContext`发布`ApplicationEvent`时，`ApplicationListener Bean`将自动被触发。这种事件机制都必须需要程序显式的触发。

其中spring有一些内置的事件，当完成某种操作时会发出某些事件动作。比如监听`ContextRefreshedEvent` 事件，当所有的bean都初始化完成并被成功装载后会触发该事件，实现`ApplicationListener<ContextRefreshedEvent>` 接口可以收到监听动作，然后可以写自己的逻辑。

同样事件可以自定义、监听也可以自定义，完全根据自己的业务逻辑来处理。

### 1.2.2 事件监听

在Portal Service创建APP的controller中会创建时间监听，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ac87c6d69fc44e8eb641c345a8619361.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
事件监听创建后，Portal Service中有一个监听创建监听对象，在该监听对象中会监听创建事件信息，并根据创建的APP进行同步调用，主要调用的是AppAPI，而**AppAPI是执行远程操作的**，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/367b4208742b4d6fba1bf09c6728f7be.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
AppAPI使用了RestTemplate执行远程操作，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b6ee9cb7b887428687f46f9bc5ecb153.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 1.2.3 同步业务执行流程

在 apollo-adminservice 项目中，`com.ctrip.framework.apollo.adminservice.controller.AppController` ，提供 App 的 API 。

`#create(AppDTO)`方法，创建 App 。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/10487904625843d8a63f104effc7784c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`com.ctrip.framework.apollo.biz.service.AdminService` , `#createNewApp(App)`方法，代码如下：  
![ ](https://img-blog.csdnimg.cn/3daf30b144b44a6a9de5e24c08e91d2e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在 `apollo-biz` 项目中，`com.ctrip.framework.apollo.biz.service.AppService`，提供 App 的Service 逻辑给 Admin Service 和 Config Service 。

`#save(App)`方法，保存 App 对象到数据库中。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/928e1df1a73642f4926e7b752757cfdf.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2\. Namespace创建

![在这里插入图片描述](https://img-blog.csdnimg.cn/7384d0b77e054ff281dbb282a49cc76a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
namespace创建的流程也是先经过Portal Service，再同步到Admin Service中，大致流程其实和APP创建类似。执行流程我们先来一起分析一下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1e43384636e342b18b614c2da0db46c5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
这里我们发现有AppNamespace和Namespace，他们有一定区别：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1330635cec9a4636800f35e6cc87e723.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Namespace 类型有三种：

1.  私有类型：私有类型的 Namespace 具有 private 权限。
2.  公共类型：公共类型的 Namespace 具有 public 权限。公共类型的 Namespace 相当于游离于应用之外的配置，且通过 Namespace 的名称去标识公共 Namespace ，所以公共的 Namespace 的名称必须全局唯一。
3.  关联类型：关联类型又可称为继承类型，关联类型具有 private 权限。关联类型的Namespace 继承于公共类型的Namespace，用于覆盖公共 Namespace 的某些配置。

## 2.1 创建AppNamespace

AppNamespace创建由Portal Service发起，我们先来分析该工程。

### 2.1.1 实体Bean

**1\)Table**  
AppNamespace对应表表结构如下：

```sql
CREATE TABLE `AppNamespace` (
	`Id` INT ( 10 ) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
	`Name` VARCHAR ( 32 ) NOT NULL DEFAULT '' COMMENT 'namespace名字，注意，需要全局唯
	一',
	`AppId` VARCHAR ( 32 ) NOT NULL DEFAULT '' COMMENT 'app id',
	`Format` VARCHAR ( 32 ) NOT NULL DEFAULT 'properties' COMMENT 'namespace的format类
	型',
	`IsPublic` bit ( 1 ) NOT NULL DEFAULT b '0' COMMENT 'namespace是否为公共',
	`Comment` VARCHAR ( 64 ) NOT NULL DEFAULT '' COMMENT '注释',
	`IsDeleted` bit ( 1 ) NOT NULL DEFAULT b '0' COMMENT '1: deleted, 0: normal',
	`DataChange_CreatedBy` VARCHAR ( 32 ) NOT NULL DEFAULT '' COMMENT '创建人邮箱前缀',
	`DataChange_CreatedTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	`DataChange_LastModifiedBy` VARCHAR ( 32 ) DEFAULT '' COMMENT '最后修改人邮箱前缀',
	`DataChange_LastTime` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
	PRIMARY KEY ( `Id` ),
	KEY `IX_AppId` ( `AppId` ),
	KEY `Name_AppId` ( `Name`, `AppId` ),
	KEY `DataChange_LastTime` ( `DataChange_LastTime` ) 
) ENGINE = INNODB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COMMENT = '应用namespace定
义';
```

Namespace表结构如下：

```sql
CREATE TABLE `Namespace` (
	`Id` INT ( 10 ) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
	`AppId` VARCHAR ( 500 ) NOT NULL DEFAULT 'default' COMMENT 'AppID',
	`ClusterName` VARCHAR ( 500 ) NOT NULL DEFAULT 'default' COMMENT 'Cluster Name',
	`NamespaceName` VARCHAR ( 500 ) NOT NULL DEFAULT 'default' COMMENT 'Namespace
	Name',
	`IsDeleted` bit ( 1 ) NOT NULL DEFAULT b '0' COMMENT '1: deleted, 0: normal',
	`DataChange_CreatedBy` VARCHAR ( 32 ) NOT NULL DEFAULT 'default' COMMENT '创建人邮
	箱前缀',
	`DataChange_CreatedTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
	`DataChange_LastModifiedBy` VARCHAR ( 32 ) DEFAULT '' COMMENT '最后修改人邮箱前缀',
	`DataChange_LastTime` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
	PRIMARY KEY ( `Id` ),
	KEY `AppId_ClusterName_NamespaceName` (
		`AppId` ( 191 ),
		`ClusterName` ( 191 ),
	`NamespaceName` ( 191 )),
	KEY `DataChange_LastTime` ( `DataChange_LastTime` ),
	KEY `IX_NamespaceName` (
	`NamespaceName` ( 191 )) 
) ENGINE = INNODB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COMMENT = '命名空间';
```

**2\)实体Bean**  
在 apollo-common 项目中，`com.ctrip.framework.apollo.common.entity.AppNamespace` ，继承BaseEntity 抽象类，App Namespace 实体。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e0ddc3c732ea4ee69292cffa660a25ab.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

1.  appId 字段，App 编号，指向对应的 App 。App : AppNamespace = 1 : N
2.  format 字段，格式。在`com.ctrip.framework.apollo.core.enums.ConfigFileFormat`枚举类中，定义了6种类型: `Properties("properties"), XML("xml"), JSON("json"),YML("yml"), YAML("yaml"), TXT("txt");`
3.  字段，是否公用的
4.  Namespace的获取权限分为两种：
    - private （私有的）：private 权限的 Namespace ，只能被所属的应用获取到。一个应用尝试获取其它应用 private 的 Namespace ，Apollo 会报 “404” 异常。
    - public （公共的）：public 权限的 Namespace ，能被任何应用获取。

  
  

在 apollo-biz 项目中，`com.ctrip.framework.apollo.biz.entity.Namespace`，继承BaseEntity 抽象类，Cluster Namespace 实体，是配置项的集合，类似于一个配置文件的概念。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/228e93e2121544578a73e8ab007ad018.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 2.1.2 业务执行流程

**1\)Controller**

提交业务请求会调用 apollo-portal 的`com.ctrip.framework.apollo.portal.controller.NamespaceController` ，Portal Service提供了提供 AppNamespace 和 Namespace 的 API 。

`com.ctrip.framework.apollo.portal.controller.NamespaceController` 创建AppNamespace方法源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/38e95a8e96e645f78e2bd99ec7772226.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
在这里我们不难发现它又创建了监听，所以肯定也会涉及数据同步。

**2\)Service**  
在 apollo-portal 项目中，`com.ctrip.framework.apollo.portal.service.AppNamespaceService` ，提供 AppNamespace的 Service 逻辑。

`#createAppNamespaceInLocal(AppNamespace)`方法，保存AppNamespace 对象到 Portal DB 数据库。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/dddd7b3b53374c4a88659b0ab33a8997.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

DAO就是对数据库进行一些CRUD，就不进行分析了。

## 2.2 数据同步

### 2.2.1 事件监听

`com.ctrip.framework.apollo.portal.listener.CreationListener`，对象创建监听器，目前监听`AppCreationEvent`和`AppNamespaceCreationEvent` 事件。

`com.ctrip.framework.apollo.portal.listener.CreationListener#onAppNamespaceCreationEvent`代码如下：

![在这里插入图片描述](https://img-blog.csdnimg.cn/94ee65caf9d84465ac6864c1a3895385.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面监听仍然会调用远程服务，使用了namespaceAPI执行了远程调用，**部分源码**如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0f834811e96e45fc8edf2b7c26574b04.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

### 2.2.2 同步业务执行流程

**1\)Controller**  
在 apollo-adminservice 项目中，`com.ctrip.framework.apollo.adminservice.controller.AppNamespaceController`，提供AppNamespace 的 API 。

`#create(AppNamespaceDTO)`方法，创建 AppNamespace 。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b5e112df40004b5693e13733fc47f4a0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**2\)Service**  
在 apollo-biz 项目中，`com.ctrip.framework.apollo.biz.service.AppNamespaceService`，提供 AppNamespace 的 Service 逻辑给 Admin Service 和 Config Service 。

`#save(AppNamespace)` 方法，保存 AppNamespace 对象到数据库中。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ed2382baeb5e451bb4fd1daff08a8522.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
调用 `#instanceOfAppNamespaceInAllCluster(appId, namespaceName, createBy)` 方法，创建AppNamespace 在 App 下，每个 Cluster 的 Namespace 对象。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1eb32d0b3f074b6184a5a39496f24930.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
注意这里每次都调用了`namespaceService.save()`方法，该方法会保存Namespace。

  

在 apollo-biz 项目中，`com.ctrip.framework.apollo.biz.service.NamespaceService` ，提供Namespace 的 Service 逻辑给 Admin Service 和 Config Service 。

`#save(Namespace)` 方法，保存 Namespace 对象到数据库中。代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c29f7565d40e41bdb0dbb096c0f1743f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3\. Apollo客户端

本节主要分析一下Apollo客户端是如何获取Apollo配置信息的。

## 3.1 Spring扩展

我们要想实现Apollo和Spring无缝整合，需要在Spring容器刷新之前，从Apollo服务器拉取配置文件，并注入到Spring容器指定变量中，此时可以利用 `ApplicationContextInitializer` 对象。

`ConfigurableApplicationContext`：可以操作配置文件信息，代码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/542c7778453145b087edad444f61da15.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
`ApplicationContextInitializer` 是Spring框架原有的东西，这个类的主要作用就是在`ConfigurableApplicationContext`类型\(或者子类型\)的 ApplicationContext 做refresh之前，允许我们对`ConfiurableApplicationContext` 的实例做进一步的设置和处理。

`ApplicationContextInitializer`:代码如下  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5d682eef360848fa84887984e50f956c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.2 Apollo扩展Spring

Apollo利用Spring扩展机制实现了先从Apollo加载配置，并解析配置，再将数据添加到`ConfigurableApplicationContext`中，从而实现配置优先加载：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/fbf858b88fb94dd28ae65bfe81db5a14.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.3 数据同步

![在这里插入图片描述](https://img-blog.csdnimg.cn/02e77b335e724f829a9d505c15c46801.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4fae26e0547f48c69a7682aec875503a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.4 \@ApolloConfigChangeListener

`@ApolloConfigChangeListener`注解是监听注解是基于拦截器实现的，当Apollo配置文件发生变更时，用该注解标注的方法会立刻得到通知。我们来看下方法：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ed0c2e40416d4fb58308fc3f764e1f22.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
该注解涉及到时间对象`ConfigChangeEvent` ，该对象信息如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/ecddad7d20474cb098b2271109e9e613.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面变更数据用到了一个对象记录 `ConfigChange`，源码如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/94cffbfda9854ecf9ada9a3b1b5d0353.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**1\)监听器添加**  
ApolloAnnotationProcessor前置拦截器，为每个namespace添加监听器：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/36a3f79f76344d7192f7d4cdd2c7fc49.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**2\)监听器执行**  
监听器执行在执行同步发现数据变更的时候执行，其中`RemoteConfigRepository.sync()` 例子如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/da4a04a5ac704526a318691a6fc70900.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)