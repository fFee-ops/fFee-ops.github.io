---
title: Dubbo和zookeeper的关系
date: 2020-07-09 12:23:57
tags: 
categories: zookeeper
---

<!--more-->

### QAQ

  
简单来说打个比方：dubbo就是动物园的动物，zookeeper是动物园。如果游客想看动物的话那么就去动物园看。比如你要看老虎，那么动物园有你才能看到。

换句话说我们把很多不同的dubbo（动物）放到zookeeper（动物园中）提供给我们游客进行观赏。这个过程中三个关键：场所、供给者、消费者。

再说一个分布式的项目，server（消费）层与 service（供给）层被拆分了开来， 部署在不同的tomcat中， 我在server层需要调用 service层的接口，但是两个运行在不同tomcat下的服务无法直接互调接口，那么就可以通过zookeeper和dubbo实现。就好比把动物放到动物园，我们要看了直接去动物园就行。而不能直接去动物生活的地方去看，会有性命安全之忧。