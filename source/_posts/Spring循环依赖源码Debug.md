---
title: Spring循环依赖源码Debug
date: 2021-01-11 21:54:46
tags: 
categories: Spring
---

<!--more-->

### Spring循环依赖源码Debug

- - [3大Map和四大方法，总体相关对象](#3Map_8)
  - [A/B两对象在三级缓存中的迁移说明](#AB_31)
  - [Debug技巧](#Debug_40)
  - [本次Debug的全部断点](#Debug_52)

首先我们要搞清楚两个概念：**实例化/初始化**

**实例化:** 堆内存中申请一块内存空间,类似租赁好房子，自己的家具东西还没有搬家进去

**初始化属性填充** ：完成属性的各种赋值，类似装修、家电家具进场

## 3大Map和四大方法，总体相关对象

![在这里插入图片描述](https://img-blog.csdnimg.cn/2021011121345992.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**三级缓存+四大方法**  
①三级缓存：

第一层singletonObjects存放的是已经初始化好了的Bean。

第二层earlySingletonObjects存放的是实例化了，但是未初始化的Bean

第三层singletonFactories存放的是FactoryBean。假如A类实现FactoryBean,那么依赖注入的时候不是A类，而是A类产生的Bean

②四大方法：  
1.getSingleton：希望从容器里面获得单例的bean，没有的话 就去创建

2.doCreateBean: 没有就创建bean

3.populateBean: 创建完了以后，要填充属性

4.addSingleton: 填充完了以后，再添加到容器进行使用

## A/B两对象在三级缓存中的迁移说明

1.  A创建过程中需要B，于是A将自己放到三级缓存里面，去实例化B

2.  B实例化的时候发现需要A，于是B先查一级缓存，没有，再查二级缓存，还是没有，再查三级缓存，找到了A  
    然后把三级缓存里面的这个A放到二级缓存里面，并删除三级缓存里面的A

3.  B顺利初始化完毕，将自己放到一级缓存里面（此时B里面的A依然是创建中状态）  
    然后回来接着创建A，此时B已经创建结束，直接从一级缓存里面拿到B，然后完成创建，并将A自己放到一级缓存里面。

## Debug技巧

①（Step Over）代表是单步，一步步走

② \(Step into\)代表是源码天生的自然进入，这是打debug本身JDK自带的源码，源码里面没有你自己所写的代码；

③（Force Step Into） 这个是强制进入，这个一般用来debug强制进入自己所写的源代码

④一般源码级别的调试， \(Step into\)足够了，但如果你要用（Force Step Into） 也完全可以。

⑤ 如果找不到刚才停留的那一行的debug，如果断点打飞了怎么办，这个时候请选择Show Execution Point （也叫归位）

## 本次Debug的全部断点

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210111214327343.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)