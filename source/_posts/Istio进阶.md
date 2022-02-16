---
title: Istio进阶
date: 2022-01-19 14:31:00
tags: linux kubernetes docker
categories: ServiceMesh
---

<!--more-->

### Istio进阶

- [1\. Sidecar流量接管原理](#1_Sidecar_1)
- - [1.1 Init 容器解析](#11_Init__33)
  - [1.2 iptables 注⼊解析](#12_iptables__51)
- [2\. 超时与重试](#2__56)
- - [2.1 超时](#21__57)
  - [2.2 重试](#22__67)
- [3\. 熔断器](#3__78)
- - [3.1 部署httpbin](#31_httpbin_82)
  - [3.2 配置熔断器](#32__88)
  - [3.3 客户端](#33__93)
  - [3.4 触发熔断器](#34__105)
  - [3.5 清理](#35__119)
- [4\. 可视化⽹络](#4__130)
- - [4.1 启动服务](#41__135)
  - [4.2 图](#42__162)
  - [4.3 路由加权](#43__182)
  - [4.4 查看⼯作负载](#44__201)

# 1\. Sidecar流量接管原理

Sidecar 的部署⽀持⾃动注⼊与⼿动配置两种⽅式，若想使⽤⾃动注⼊的⽅式，⽬前则是需要Kubernetes 配合的，只需要将应⽤对应的 Namespace 设置⼀个 label 即可。例如 Namespace 如果是default，则可以标记如下：

```shell
kubectl label namespace default istio-injection=enabled
```

如果选择⼿动注⼊，需要这样操作：

```shell
kubectl apply -f <(istioctl kube-inject -f samples/bookinfo/platform/kube/bookinfo.yaml)
```

在 Istio 架构中，Sidecar 是与应⽤⼀⼀对应的，那么它到底是存在于什么地⽅呢？  
![在这里插入图片描述](https://img-blog.csdnimg.cn/cb3951125d75436793bc8b2e0395901b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
可以看到，与reviews-v3相关的容器有三个，分别是：

- k8s\_istio-proxy\_reviews-v3-xxx
- k8s\_reviews\_reviews-v3-xxx
- k8s\_POD\_reviews-v3-xxx

其中，第⼆个是应⽤本身，第三个是pause容器，第⼀个就是Sidecar了，每个pod都有这样三个⼀组的容器。

> **pause容器的作⽤：**  
> 在 Linux 系统启动时，任何进程都是由第⼀个进程 init 派⽣出来的，因此在正常情况下，它们都拥有同样的命名空间。当⼀个进程结束或者异常退出的时候，它的⽗进程负责处理它的返回结果，以让操作系统正常回收其进程空间；不过有些时候，⼀些⽗进程却没有很好地处理⼦进程的退出情况，就是说没有调⽤ wait 命令来处理其返回代码，其原因可能是代码写得不好或者意外崩溃了。  
>   
> 这个时候，操作系统就会将失去⽗进程的进程挂到 PID 为 1 的进程下，⼀般场景下就是init 进程，⽽这种进程也被形象地称为孤⼉进程（Orphan Process）。不过在 Docker 容器中，容器独⽴命名空间中的每个应⽤进程⾃身就是第⼀个进程（即 PID=1），如果这个时候，应⽤进程——例如 Nginx——的⼦进程⼜调⽤ fork 或者 exec 参数创建了更多的⼦进程，那么当出现问题时，它们就会被挂到 Nginx 下⾯。这样的问题在于，虽然从层级关系上，进程间的关系是对了，但Nginx 本身跟 Init 并不⼀样，它没有处理僵⼫进程的逻辑，所以即便挂在了它下⾯也没⽤。  
>   
> pause 容器没有实质性的业务逻辑，仅仅处理⼦进程返回时的各种信号，以让其顺利退出。

k8s\_istio-proxy容器是如何劫持流量的？ 通过alpine容器分别进⼊应⽤容器和sidecar容器进⾏查询：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f0711d1b694c41bca80b5e753e1de48c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
可以看到，sidecar容器和应⽤容器的ip地址是完全⼀致的，也就是说明他们俩共享的ip地址。那么，共享了ip地址后，sidecar⼜是如何劫持流量的呢？为了弄明⽩这个问题，我们需要看⼀下，Istio在注⼊sidecar时到底做了哪些事情。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c2b6eae797ac453aaf9583d8e619990a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Istio 给应⽤ Pod 注⼊的配置主要包括：

- Init 容器 istio-init：⽤于 pod 中设置 iptables 端⼝转发
- Sidecar 容器 istio-proxy：运⾏ sidecar 代理，如 Envoy 或 MOSN

## 1.1 Init 容器解析

Istio 在 pod 中注⼊的 Init 容器名为`istio-init` ，我们在上⾯ Istio 注⼊完成后的 YAML ⽂件中看到了该容器的启动命令是：

```shell
istio-iptables -p 15001 -z 15006 -u 1337 -m REDIRECT -i '*' -x "" -b '*' -d 15090,15021,15020
```

Init 容器的启动⼊⼝是\` istio-iptables 命令⾏，该命令⾏⼯具的⽤法如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8bc569bbda5b42a3b5dd9ec397cc1320.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
命令解析：

这条启动命令的作⽤是：

- 将应⽤容器的所有流量都转发到 sidecar 的 15006 端⼝。
- 使⽤ istio-proxy ⽤户身份运⾏， UID 为 1337，即 sidecar 所处的⽤户空间，这也是 istio-proxy 容器默认使⽤的⽤户，⻅ YAML 配置中的 runAsUser 字段。
- 使⽤默认的 REDIRECT 模式来重定向流量。
- 将所有出站流量都重定向到 sidecar 代理（通过 15001 端⼝）。

因为 Init 容器初始化完毕后就会⾃动终⽌，因为我们⽆法登陆到容器中查看 iptables 信息，但是 Init 容器初始化结果会保留到应⽤容器和 sidecar 容器中。

## 1.2 iptables 注⼊解析

查看与 productpage 有关的 iptables 规则如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/586deb62c32e4a36b6ff1279fbe2af8d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
流程示例：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c5c9a9812b694794a19424558cab2cf0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2\. 超时与重试

## 2.1 超时

超时是 Envoy 代理等待来⾃给定服务的答复的时间量，以确保服务不会因为等待答复⽽⽆限期的挂起，并在可预测的时间范围内调⽤成功或失败。HTTP 请求的默认超时时间是 15 秒，这意味着如果服务在15 秒内没有响应，调⽤将失败。

对于某些应⽤程序和服务，Istio 的缺省超时可能不合适。例如，超时太⻓可能会由于等待失败服务的回复⽽导致过度的延迟；⽽超时过短则可能在等待涉及多个服务返回的操作时触发不必要地失败。

为了找到并使⽤最佳超时设置，Istio 允许您使⽤虚拟服务按服务轻松地动态调整超时，⽽不必修改您的业务代码。

下⾯的示例是⼀个虚拟服务，它对 ratings 服务的 v1 ⼦集的调⽤指定 10 秒超时：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8ccd5c5b129d46d3a91c40809f1d63b4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.2 重试

重试设置指定如果初始调⽤失败，Envoy 代理尝试连接服务的最⼤次数。通过确保调⽤不会因为临时过载的服务或⽹络等问题⽽永久失败，重试可以提⾼服务可⽤性和应⽤程序的性能。重试之间的间隔（25ms+）是可变的，并由 Istio ⾃动确定，从⽽防⽌被调⽤服务被请求淹没。默认情况下，在第⼀次  
失败后，Envoy 代理不会重新尝试连接服务。

与超时⼀样，Istio 默认的重试⾏为在延迟⽅⾯可能不适合您的应⽤程序需求（对失败的服务进⾏过多的重试会降低速度）或可⽤性。

您可以在虚拟服务中按服务调整重试设置，⽽不必修改业务代码。您还可以通过添加每次重试的超时来进⼀步细化重试⾏为，并指定每次重试都试图成功连接到服务所等待的时间量。

下⾯的示例配置了在初始调⽤失败后最多重试 3 次来连接到服务⼦集，每个重试都有 2 秒的超时。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/605b7fe3c5db4916bc87eef5e2772644.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3\. 熔断器

熔断器是 Istio 为创建具有弹性的微服务应⽤提供的有⽤的机制。在熔断器中，设置⼀个对服务中的单个主机调⽤的限制，例如并发连接的数量或对该主机调⽤失败的次数。⼀旦限制被触发，熔断器就会“跳闸”并停⽌连接到该主机。

使⽤熔断模式可以快速失败⽽不必让客户端尝试连接到过载或有故障的主机。

## 3.1 部署httpbin

httpbin是⼀个开源项⽬，使⽤Python+Flask编写，利⽤它可以测试各种HTTP请求和响应。官⽹：<http://httpbin.org/>

```shell
kubectl apply -f samples/httpbin/httpbin.yaml
```

## 3.2 配置熔断器

创建⼀个⽬标规则，在调⽤ httpbin 服务时应⽤熔断设置：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/3d1df285f8de4d8d921c69bef3ef0dfa.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
验证⽬标规则是否已正确创建：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c8c90ab053c94d3a8271ef9d358c408b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.3 客户端

创建客户端程序以发送流量到 httpbin 服务。这是⼀个名为 Fortio 的负载测试客户的，其可以控制连接数、并发数及发送 HTTP 请求的延迟。通过 Fortio 能够有效的触发前⾯ 在 DestinationRule 中设置的熔断策略。

 1.     向客户端注⼊ Istio Sidecar 代理，以便 Istio 对其⽹络交互进⾏管理：

```shell
$ kubectl apply -f <(istioctl kube-inject -f samples/httpbin/sample-client/fortio-deploy.yaml)
```

2.  登⼊客户端 Pod 并使⽤ Fortio ⼯具调⽤ httpbin 服务。 -curl 参数表明发送⼀次调⽤：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/ffe275f96a4b44f9bde8e8ba6c5b335a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

可以看到调⽤后端服务的请求已经成功！接下来，可以测试熔断。

## 3.4 触发熔断器

在 DestinationRule 配置中，定义了 maxConnections: 1 和http1MaxPendingRequests: 1。 这些规则意味着，如果并发的连接和请求数超过⼀个，在 istio-proxy 进⾏进⼀步的请求和连接时，后续请求或连接将被阻⽌。

1.  发送并发数为 2 的连接（ -c 2 ），请求 20 次（ -n 20 ）：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/05a2664235b04bf1922e01b2da5b7a2e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
    结果：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/9caca3cd992740d7a883aaa2f888c19a.png)
2.  将并发连接数提⾼到 3 个：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/b366149c5bff4697a484ca9038f92fe8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/93b5f189bb8b4edeaf44b8c85bd78564.png)
3.  查询 istio-proxy 状态以了解更多熔断详情:  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/7cc87e3bfb434572954a528cc2e4cad2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
    可以看到 upstream\_rq\_pending\_overflow 值 59 ，这意味着，⽬前为⽌已有 59 个调⽤被标记为熔断。

## 3.5 清理

 1.     清理规则:

```shell
$ kubectl delete destinationrule httpbin
```

 2.     下线 httpbin 服务和客户端：

```shell
$ kubectl delete deploy httpbin fortio-deploy
$ kubectl delete svc httpbin
```

# 4\. 可视化⽹络

在Istio中可以使⽤Kiali进⾏可视化的管理服务⽹格。Kiali官⽹：<https://www.kiali.io/>。  
下⾯我们还是基于demo环境以及Bookinfo进⾏演示，在demo环境中已经默认安装了kiali，默认的⽤户名密码均为：admin。

## 4.1 启动服务

1、要验证服务是否在您的群集中运⾏，请运⾏以下命令：

```shell
$ kubectl -n istio-system get svc kiali
```

2、要确定 Bookinfo URL

```shell
export INGRESS_PORT=$(kubectl -n istio-system get service istio-
ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].nodePort}')
export INGRESS_HOST=$(kubectl get po -l istio=ingressgateway -n istio-system -o jsonpath='{.items[0].status.hostIP}')
export GATEWAY_URL=$INGRESS_HOST:$INGRESS_PORT
```

3、 将流量发送到⽹格，有三种选择：

- 在浏览器中访问 http://\$GATEWAY\_URL/productpage
- 多次使⽤以下命令：`$ curl http://$GATEWAY_URL/productpage`
- 如果您在系统中安装了 watch 命令，请通过以下⽅式连续发送请求，时间间隔为1秒：
  > `$ watch \-n 1 curl \-o /dev/null \-s \-w %{http_code}`  
  >   
  > `$GATEWAY_URL/productpage`

4、要打开 Kiali UI，请在您的 Kubernetes 环境中执⾏以下命令：  
`$ istioctl dashboard kiali \--address 192.168.31.106`

5、要登录 Kiali UI，请到 Kiali 登录界⾯，然后输⼊默认的⽤户名密码。  
6、登录后⽴即显示的 Overview ⻚⾯中查看⽹格的概述。Overview ⻚⾯显示了⽹格中具有服务的所有名称空间。以下屏幕截图显示了类似的⻚⾯：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/99ea20451ebc47b0899e444d491f5682.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4.2 图

![在这里插入图片描述](https://img-blog.csdnimg.cn/187f98e52b7a44ee93d2aceadc2d53ce.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
查看流量分配的百分⽐：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d27213e5005e47b290672b186a014c78.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
请求统计数据，RPS数据（最⼩/最⼤的⽐值）  
![在这里插入图片描述](https://img-blog.csdnimg.cn/8756087c67794363ba34ceb59678f5eb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_10,color_FFFFFF,t_70,g_se,x_16)  
显示不同的图表类型，有四种类型：

**①App**  
图形类型将⼀个应⽤程序的所有版本聚合到⼀个图形节点中。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/eb907a089b5840ffb095e9f5d240285e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**②Versioned App**  
图类型显示每个应⽤程序版本的节点，但是特定应⽤程序的所有版本都组合在⼀起。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/60f56b03c6ef4e0ab27a3b7c0a74f8ef.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**③Workload**  
图类型显示了服务⽹格中每个⼯作负载的节点。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/4e0ce001697241c8a1eca420395a9526.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
**④Service**  
图类型显示⽹格中每个服务的节点。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/21cf922268674268bcccd2fc827857d4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 4.3 路由加权

默认路由规则会平均分配浏览到每个可⽤节点，通过kiali可以可⾏可视化的调节：  
第⼀步，查看servers列表：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/82e9f5fa69194c9a9faed582bbd3c191.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
第⼆步，进⼊reviews服务：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a684764defd74f66a0db4cde76a7fbda.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
第三步，删除原有路由规则：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/221e720b638741169556dfc511a2fc4b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_13,color_FFFFFF,t_70,g_se,x_16)  
第四步，创建权重的规则：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/e625ee498afb4b5cb84f82e6dbfb34a3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_13,color_FFFFFF,t_70,g_se,x_16)  
默认情况：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9879b9f91830496cbd5eeb4407723d46.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
进⾏调整：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/dd2aaab1f36f4eb899fd9c2f21325c66.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
保存操作。  
第五步，通过watch执⾏⼀段时间，观察效果：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/168d8e8290f846bf826820eff06ed09e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
可以看到，分配到reviews的v1、v2、v3的百分⽐发⽣了变化。

## 4.4 查看⼯作负载

![在这里插入图片描述](https://img-blog.csdnimg.cn/04e71484f8b348efa89011a8c2574a00.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
⼊站、出站信息：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5c21949226cc4a13a8244a09d02d8a7f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
⽇志信息：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b741c87484924f6aae73e235ff88b60e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
⼊站指标信息：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a7b0f7d753974c42afb8f7a91d01bd9a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
出站指标信息：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0413a6dc7b204348aca9ae6471423790.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)