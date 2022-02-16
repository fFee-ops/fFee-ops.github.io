---
title: BookInfo示例分析
date: 2022-01-19 14:26:36
tags: java http 网络
categories: ServiceMesh
---

<!--more-->

### BookInfo示例分析

- [1\. 为什么要配置⽹关、虚拟服务？](#1__4)
- - [1.1 概念](#11__5)
  - [1.2 IngressGateway](#12_IngressGateway_29)
- [2\. 服务之间是如何通信的？](#2__39)
- - [2.1 K8S四层⽹络架构](#21_K8S_40)
  - [2.2 服务间的通信](#22__48)

  
前⾯已经将BookInfo进⾏了部署以及⼀些功能的演示，从⼤体上理解了Istio到底是什么，在解决什么问题。下⾯针对BookInfo示例来解释⼀些疑惑。

# 1\. 为什么要配置⽹关、虚拟服务？

## 1.1 概念

⾸先，需要了解⽹关以及虚拟服务的概念。

**网关（Geteway）：**

1.  ⽹关是服务⽹格的边界，⽤于处理HTTP、TCP ⼊⼝与出⼝流量，Service Mesh 中的服务只能通过⽹关对外暴露接⼝，以⽅便管控，其配置中可以定义暴露的端⼝以及传输层⾯上的配置（是否需要启⽤ TLS）。
2.  BookInfo 配置了⼀个对外暴露 80 端⼝的⽹关服务，并不绑定任何域名（这样才能以 IP ⽅式进⾏访问）。  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/b68970e8a13047c2bda221795036055e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
3.  如果指定了hosts，那么必须通过该域名进⼊  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/ba535b90333d4585818a02dc782d90bc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)

**虚拟服务：**

4.  虚拟服务就是配置如何在服务⽹格内将请求路由到服务，这基于 Istio 和平台提供的基本的连通性和服务发现能⼒。每个虚拟服务包含⼀组路由规则，Istio 按顺序评估它们，Istio 将每个给定的请求匹配到虚拟服务指定的实际⽬标地址。（可以浅显的理解为 网关负责拦截所有请求，然后根据虚拟服务的配置进行路由转发）  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/bb4b1fc4cf224489acdb803600035c7d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_19,color_FFFFFF,t_70,g_se,x_16)

5.  hosts：虚拟服务主机名可以是 IP 地址、DNS 名称，或者依赖于平台的⼀个简称（例如Kubernetes 服务的短名称），也可以使⽤通配符（“\*”）前缀，创建⼀组匹配所有服务的路由规则。

6.  路由规则  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/08aeb0d5abe04fd2867e0119653bd887.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

7.  路由优先级  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/1eabc4f0c21243eab62c71dd52b46053.png)

8.  必须把⽹关绑定到虚拟服务上，⽹关才能⽣效。\(`bookinfo-gateway.yaml`\)  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/7ce249a6f74948bd946684f1e97590f1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2 IngressGateway

istio-ingressgateway 是 Istio 安装完成后就会启动的服务，其作⽤是作为整个服务⽹格的边缘⽹关，即客户端请求由此**进⼊⽹格整体**。在边缘架设⽹关的作⽤不仅是做⼀层统⼀代理，更是对服务接⼝的统⼀管理。

需要注意的是，这⾥ Istio 所描述的 IngressGateway 并不是⼀个应⽤，其名称为`IngressGateway`，⽽是对**流量⼊⼝**⽹关的⼀个泛指，与之相对应的还有⼀个叫作`EngressGateway`的**出⼝**⽹关，是对流出流量的统⼀代理。

在默认情况下，Envoy 是没有任务路由转发规则的，需要在 Pilot 统⼀配置后，才会⽣效，⽽这⾥的配置正是 Virtual Service。  
`bookinfo-gateway.yaml：`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/dd7d55eaf0784c3bb4f5b8ec031b188c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2\. 服务之间是如何通信的？

## 2.1 K8S四层⽹络架构

Istio运⾏于Kubernetes平台，Kubernetes 中的物理资源是以 Node 为单位来进⾏分配的——也是最⼤的资源分配单位——Node 中可以有很多 Pod，每个 Pod 中⼜可以有多个 Container，多个 Pod 以Service 为标识聚合对外提供服务，⽽最下层的 Deployment 是对整体服务体系的抽象，它的实体便是  
yaml ⽂件。Deployment、Service、Pod、Container 便构成 Kubernetes 的四层部署结构。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4bdf233ff4954397869aa8a0b9f83120.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Kubernetes 的 Service 之所以会允许存在多个 Pod，是因为：

1.  为了让应⽤可以以多版本的形式存在，⽐如 App 可以以 v1、v2 及 v3 的版本存在，对外暴露的都是同⼀服务名，如果不加以控制，那么流量将会平均地分配到以上三个版本中；
2.  对应⽤进⾏更好的容错，⽐如可以将⼀个服务的 Pod 复制到多个 Node 上，这样当⼀台机器宕机的时候，应⽤服务仍然是可以正常⼯作的。

## 2.2 服务间的通信

![在这里插入图片描述](https://img-blog.csdnimg.cn/7be5d92c8685432da90814ee2a810076.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
可以看到，reviews 服务就被划分成了 v1、v2、v3 三个版本，但是查看服务的时候却只有⼀个reviews服务。

每个服务都分配了⼀个cluster-ip，这个ip地址并不是⽹卡层⾯的地址，⽽是Kubernetes平台的分配的虚拟ip，所以对于该ip的调⽤，kubernetes就会将流量分给该ip下对应的pod。

> 该ip地址还对应⼀个内部域名，例如⼀个服务叫 reviews，它的命名空间是 default，在Kubernetes 中其默认的域名为svc.cluster.local，所以只需要访问  
> `reviews.default.svc.cluster.local`这个域名就可以解析到其对应的 ClusterIP，也可以通过服务名直接访问。

在reviews的源码中，通过http协议，调⽤ratings服务。

在容器中进⾏验证，由于reviews容器中没有curl、wget等基础命令，所以需要借助于alpine容器进⾏验证。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/80858f98640e42cd93fab8fc56971384.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)