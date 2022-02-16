---
title: Istio快速⼊门
date: 2022-01-18 15:19:20
tags: docker kubernetes 容器
categories: ServiceMesh
---

<!--more-->

### Istio快速⼊门

- [1\. 搭建kubernetes集群](#1_kubernetes_2)
- - [1.1 环境准备](#11__5)
  - [1.2 前置⼯作](#12__8)
  - [1.3 搭建集群](#13__73)
- [2\. 搭建Istio环境](#2_Istio_157)
- - [2.1 下载 Istio](#21__Istio_158)
  - [2.2 安装Istio](#22_Istio_187)
- [3\. Bookinfo示例](#3_Bookinfo_203)
- - [3.1 应⽤说明](#31__204)
  - [3\. 2 部署应⽤](#3_2__222)
  - [3.3 启动应⽤服务](#33__227)
  - [3.4 确定 Ingress 的 IP](#34__Ingress__IP_253)
  - [3.5 应⽤默认⽬标规则](#35__284)
- [4\. 体验Istio](#4_Istio_295)
- - [4.1 按照版本路由](#41__296)
  - [4.2 按照不同⽤户身份路由](#42__395)

# 1\. 搭建kubernetes集群

Istio运⾏在kubernetes平台是最佳的选择，所以我们先搭建kubernetes环境。

## 1.1 环境准备

准备3台Centos7虚拟机：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0235066ebb964c92b5136fd08c954eef.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 1.2 前置⼯作

搭建K8S之前，需要⼀些前置的准备⼯作，否则不能完成集群的搭建。

```shell
#修改主机名
hostnamectl set-hostname node2
hostnamectl set-hostname node3
```

```shell
#更新yum源，并且完成yum update操作
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
wget -O /etc/yum.repos.d/CentOS-Base.repo
https://mirrors.aliyun.com/repo/Centos-7.repo
yum makecache
yum -y update
```

```shell
#安装docker
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-
ce/linux/centos/docker-ce.repo
yum makecache fast
yum -y install docker-ce

#启动docker服务
systemctl start docker.service
#开机⾃启
systemctl enable docker.service
#添加docker阿⾥云加速器
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
"registry-mirrors": ["https://c6n8vys4.mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
#测试⼀下，看下载速度怎么样
docker pull redis
docker rmi redis:latest
```

```shell
#关闭防⽕墙
systemctl stop firewalld.service
systemctl disable firewalld.service
#添加hosts映射
vim /etc/hosts
192.168.31.106 node1
192.168.31.107 node2
192.168.31.108 node3
scp /etc/hosts node2:/etc/
scp /etc/hosts node3:/etc/
```

```shell
#设置node1到node2、node3免登陆
ssh-keygen #⼀路下⼀步操作
ssh-copy-id node2
ssh-copy-id node3
#测试
ssh node2
ssh node3
```

## 1.3 搭建集群

```shell
#修改系统参数
# 将 SELinux 设置为 permissive 模式（相当于将其禁⽤）
setenforce 0
sed -i  's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

# 禁⽤swap⽂件，编辑/etc/fstab，注释掉引⽤ swap 的⾏
vim /etc/fstab
swapoff -a


# 设置⽹桥参数
vim /etc/sysctl.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
net.ipv4.tcp_tw_recycle = 0

scp /etc/sysctl.conf node2:/etc/
scp /etc/sysctl.conf node3:/etc/

#⽴即⽣效
sysctl -p
#安装kubectl
vim /etc/yum.repos.d/kubernetes.repo


[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=0

yum list kubectl –showduplicates
yum install -y kubectl.x86_64
kubectl version

yum install -y kubelet kubeadm --disableexcludes=kubernetes

#拉取所需要的镜像
kubeadm config images pull --image-repository=registry.cn-hangzhou.aliyuncs.com/itcast --kubernetes-version=v1.18.6
#如果拉取失败，尝试这个：kubeadm config images pull --image-repository=lank8s.cn --kubernetes-version=v1.18.6

#开始初始化，如果使⽤lank8s.cn拉取的镜像，需要指定--image-repository=lank8s.cn
kubeadm init --apiserver-advertise-address 192.168.31.106 --pod-network-cidr=10.244.0.0/16 --image-repository=registry.cn-hangzhou.aliyuncs.com/itcast --kubernetes-version=v1.18.6

#当看到 Your Kubernetes control-plane has initialized successfully! 说明初始化成功了！

#拷⻉admin.conf到home⽬录，否则出错：The connection to the server localhost:8080was refused - did you specify the right host or port?
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

#设置⽹络 kube-flannel.yml ⽂件在文章【https://sliing.blog.csdn.net/article/details/122559986】中
kubectl apply -f kube-flannel.yml


#测试
[root@node1 k8s]# kubectl get nodes
	NAME STATUS ROLES AGE VERSION
	node1 Ready master 23m v1.18.6

#将node2、node3加⼊到集群，token要替换成⾃⼰的
kubeadm join 192.168.31.106:6443 --token ekw4eu.cfi77sji1jyczhj6 --discovery-token-ca-cert-hash
sha256:21de4177eaf76353dd060f2a783c9dafe17636437ade020bc40d60a8ab903483

#测试
[root@node1 k8s]# kubectl get nodes
NAME STATUS ROLES AGE VERSION
node1 Ready master 31m v1.18.6
node2 Ready <none> 6m46s v1.18.6
node3 Ready <none> 2m21s v1.18.6

#说明集群组件成功了
#如果需要删除集群，执⾏ kubeadm reset ，3台机器都需要执⾏

#查看正在执⾏的pod
kubectl get pod --all-namespaces -o wide
```

查看正在执⾏的pod，`kubectl get pod \--all-namespaces \-o wide`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/455d673f74cd436d82e4b2e0c2416aa9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 2\. 搭建Istio环境

## 2.1 下载 Istio

下载 Istio，下载内容将包含：安装⽂件、示例和 istioctl 命令⾏⼯具。

1.  访问 [Istio release](https://github.com/istio/istio/releases/tag/1.6.5)⻚⾯下载与您操作系统对应的安装⽂件。在 macOS 或 Linux 系统中，也可以通过以下命令下载最新版本的 Istio：

    ```shell
    $ curl -L https://istio.io/downloadIstio | sh -
    ```

2.  切换到 Istio 包所在⽬录下。例如：Istio 包名为`istio-1.6.5`，则：

    ```shell
    $ cd istio-1.6.5
    ```

    安装⽬录包含如下内容：

    - `samples/`⽬录下，有示例应⽤程序
    - `bin/`⽬录下，包含 istioctl 的客户端⽂件。 istioctl ⼯具⽤于⼿动注⼊Envoysidecar 代理。

3.  将 istioctl 客户端路径增加到 path 环境变量中，macOS 或 Linux 系统的增加⽅式如下：

    ```shell
    $ export PATH=$PWD/bin:$PATH
    ```

**安装 bash ⾃动补全⽂件**  
如果您使⽤ bash，istioctl ⾃动补全的⽂件位于 tools ⽬录。通过复制 istioctl.bash ⽂件到您的 home⽬录，然后添加下⾏内容到您的 .bashrc ⽂件执⾏ istioctl tab 补全⽂件：

```shell
source ~/istioctl.bash
```

如果 istioctl 补全⽂件已经正确安装，在您输⼊ istioctl 命令时通过按 Tab 键，它会返回⼀组推荐命令供您选择

## 2.2 安装Istio

请按照以下步骤在您所选的平台上使⽤ demo 配置⽂件安装 Istio。

1.  安装 demo 配置
    ```shell
    $ istioctl manifest apply --set profile=demo
    ```
2.  为了验证是否安装成功，需要先确保以下 Kubernetes 服务正确部署，然后验证除 `jaeger-agent` 服务外的其他服务，是否均有正确的`CLUSTER-IP`：
    ```shell
    $ kubectl get svc -n istio-system
    ```

    > 如果集群运⾏在⼀个不⽀持外部负载均衡器的环境中（例如：minikube）， istio-ingressgateway 的 EXTERNAL-IP 将显示为 `<pending>` 状态。请使⽤服务的 NodePort或 端⼝转发来访问⽹关。

请确保关联的 Kubernetes pod 已经部署，并且 `STATUS`为`Running`：

![在这里插入图片描述](https://img-blog.csdnimg.cn/eea9fa6d77424a82aa6cabc22dac8a72.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 3\. Bookinfo示例

## 3.1 应⽤说明

这个示例部署了⼀个⽤于演示多种 Istio 特性的应⽤，该应⽤由四个单独的微服务构成。 这个应⽤模仿在线书店的⼀个分类，显示⼀本书的信息。 ⻚⾯上会显示⼀本书的描述，书籍的细节（ISBN、⻚数等），以及关于这本书的⼀些评论。

Bookinfo 应⽤分为四个单独的微服务：

- productpage . 这个微服务会调⽤ details 和 reviews 两个微服务，⽤来⽣成⻚⾯。
- details . 这个微服务中包含了书籍的信息。
- reviews . 这个微服务中包含了书籍相关的评论。它还会调⽤ ratings 微服务。
- ratings . 这个微服务中包含了由书籍评价组成的评级信息。

reviews 微服务有 3 个版本：

- v1 版本不会调⽤ ratings 服务。
- v2 版本会调⽤ ratings 服务，并使⽤ 1 到 5 个⿊⾊星形图标来显示评分信息。
- v3 版本会调⽤ ratings 服务，并使⽤ 1 到 5 个红⾊星形图标来显示评分信息。

下图展示了这个应⽤的端到端架构。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/61cc8b5bccdd43a892a70a6a91b243c9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Bookinfo 应⽤中的⼏个微服务是由不同的语⾔编写的。 这些服务对 Istio 并⽆依赖，但是构成了⼀个有代表性的服务⽹格的例⼦：它由多个服务、多个语⾔构成，并且 reviews 服务具有多个版本。

## 3\. 2 部署应⽤

要在 Istio 中运⾏这⼀应⽤，⽆需对应⽤⾃身做出任何改变。 您只要简单的在 Istio 环境中对服务进⾏配置和运⾏，具体⼀点说就是把 Envoy sidecar 注⼊到每个服务之中。 最终的部署结果将如下图所示：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1c46c939da4946478ee0f006de68c1c0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
所有的微服务都和 Envoy sidecar 集成在⼀起，被集成服务所有的出⼊流量都被 sidecar 所劫持，这样就为外部控制准备了所需的 Hook，然后就可以利⽤ Istio 控制平⾯为应⽤提供服务路由、遥测数据收集以及策略实施等功能。

## 3.3 启动应⽤服务

1.  进⼊ Istio 安装⽬录。

2.  Istio 默认⾃动注⼊ Sidecar. 请为 default 命名空间打上标签 `istio-injection=enabled`：

    ```shell
    $ kubectl label namespace default istio-injection=enabled
    ```

3.  使⽤ kubectl 部署应⽤：

    ```shell
    $ kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml
    ```

    如果您在安装过程中禁⽤了 Sidecar ⾃动注⼊功能⽽选择⼿动注⼊ Sidecar，请在部署应⽤之前使⽤ `istioctl kube-inject` 命令修改 bookinfo.yaml ⽂件。

    ```shell
    $ kubectl apply -f <(istioctl kube-inject -f samples/bookinfo/platform/kube/bookinfo.yaml)
    ```

    上⾯的命令会启动全部的四个服务，其中也包括了 reviews 服务的三个版本（v1、v2 以及 v3）。在实际部署中，微服务版本的启动过程需要持续⼀段时间，并不是同时完成的。

4.  确认所有的服务和 Pod 都已经正确的定义和启动：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/5cd93f7bfa7147e4a144986677bf7fcc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/b5bf87a06f1f4019ac93493e7efa0733.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

5.  要确认 Bookinfo 应⽤是否正在运⾏，请在某个 Pod 中⽤ curl 命令对应⽤发送请求，例如ratings ：

    ```shell
    $ kubectl exec -it $(kubectl get pod -l app=ratings -o  jsonpath='{.items[0].metadata.name}') -c ratings -- curl productpage:9080/productpage | grep -o "<title>.*</title>"
    ```

    出现`<title>Simple Bookstore App</title>`即可。

## 3.4 确定 Ingress 的 IP

现在 Bookinfo 服务启动并运⾏中，您需要使应⽤程序可以从外部访问 Kubernetes 集群，例如使⽤浏览器。可以⽤ Istio Gateway 来实现这个⽬标。

1.  为应⽤程序定义 Ingress ⽹关：

    ```shell
    $ kubectl apply -f samples/bookinfo/networking/bookinfo-gateway.yaml
    ```

2.  确认⽹关创建完成：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/611ff346243240689f37bbaa92dd3d6b.png)

  3.  设置访问⽹关的 INGRESS\_HOST 和 INGRESS\_PORT 变量。确认并设置。

```shell
#设置 ingress 端⼝
export INGRESS_PORT=$(kubectl -n istio-system get service istio-
ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].nodePort}')

export SECURE_INGRESS_PORT=$(kubectl -n istio-system get service istio- ingressgateway -o jsonpath='{.spec.ports[?(@.name=="https")].nodePort}')

#设置 ingress IP
export INGRESS_HOST=$(kubectl get po -l istio=ingressgateway -n istio-system -o jsonpath='{.items[0].status.hostIP}')

```

 4.     设置 GATEWAY\_URL ：

```shell
export GATEWAY_URL=$INGRESS_HOST:$INGRESS_PORT
```

可以⽤浏览器打开⽹址 http://\$GATEWAY\_URL/productpage ，来浏览应⽤的 Web ⻚⾯。如果刷新⼏次应⽤的⻚⾯，就会看到 productpage ⻚⾯中会随机展示 reviews 服务的不同版本的效果（红⾊、⿊⾊的星形或者没有显示）。 reviews 服务出现这种情况是因为我们还没有使⽤ Istio 来控制版本  
的路由。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c7bfc302c4514ce5b84fe249d74ff43d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 3.5 应⽤默认⽬标规则

在使⽤ Istio 控制 Bookinfo 版本路由之前，您需要在⽬标规则中定义好可⽤的版本，命名为 subsets 。

```shell
#设置
kubectl apply -f samples/bookinfo/networking/destination-rule-all.yaml
#查询
kubectl get destinationrules -o yaml
```

⾄此，Istio 完成了全部的接管，第⼀个示例部署完成。

# 4\. 体验Istio

## 4.1 按照版本路由

reviews有三个版本，默认情况下，会进⾏轮询，也就是我们看到的，每⼀次刷新都会有不同的效果。如果，我们需要将请求全部切换到某⼀个版本，需要Istio是⾮常简单的，只需要添加虚拟服务即可。  
示例：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/c354fdda834e4589bb38e34271110d0e.png)  
其内容如下：

```yml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: productpage
spec:
  hosts:
  - productpage
  http:
  - route:
    - destination:
        host: productpage
        subset: v1
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
  - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v1
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ratings
spec:
  hosts:
  - ratings
  http:
  - route:
    - destination:
        host: ratings
        subset: v1
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: details
spec:
  hosts:
  - details
  http:
  - route:
    - destination:
        host: details
        subset: v1
---
```

经过测试，发现reviews不再切换样式。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/5c90249868fa4efe9091c7de63260be1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
还可以将部分流量转移到v3版本，基于此可以实现灰度发布、A/B测试等：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/109ef3828248466fb9655f9bb9ad0c4c.png)  
内容如下：

```yml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
    - reviews
  http:
  - route:
    - destination:
        host: reviews
        subset: v1
      weight: 50
    - destination:
        host: reviews
        subset: v3
      weight: 50
```

刷新浏览器中的 /productpage ⻚⾯，⼤约有 50\% 的⼏率会看到⻚⾯中出带 红⾊ 星级的评价内容。这是因为 v3 版本的 reviews 访问了带星级评级的 ratings 服务，但 v1 版本却没有。  
如果认为 reviews:v3 微服务已经稳定，可以通过应⽤此 virtual service 规则将 100\% 的流量路由到reviews:v3：

```shell
kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-v3.yaml
```

这样，所有的请求都转向到了v3了。  
如果需要删除虚拟⽹络，可以执⾏：

```shell
kubectl delete -f samples/bookinfo/networking/virtual-service-all-v1.yaml
```

**其实要执行不同的策略，每次使用不同的yml文件就好了**

## 4.2 按照不同⽤户身份路由

接下来，您将更改路由配置，以便将来⾃特定⽤户的所有流量路由到特定服务版本。在这，来⾃名为Jason 的⽤户的所有流量将被路由到服务`reviews:v2`

请注意，Istio 对⽤户身份没有任何特殊的内置机制。事实上， productpage 服务在所有到 reviews服务的 HTTP 请求中都增加了⼀个⾃定义的 end-user 请求头，从⽽达到了本例⼦的效果。

请记住， reviews:v2 是包含星级评分功能的版本。

 1.     运⾏以下命令以启⽤基于⽤户的路由：

```shell
$ kubectl apply -f samples/bookinfo/networking/virtual-service-reviews-test-v2.yaml
```

2.  确认规则已创建：  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/b0115ef6730a4f659bec83f76dbf9c0c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
3.  在 Bookinfo 应⽤程序的 /productpage 上，以⽤户 jason 身份登录。刷新浏览器。看到星级评分显示在每个评论旁边。
4.  以其他⽤户身份登录（选择您想要的任何名称）。刷新浏览器。现在星星消失了。这是因为除了 Jason 之外，所有⽤户的流量都被路由到reviews:v1 。