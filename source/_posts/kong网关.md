---
title: kong网关
date: 2022-02-16 16:49:01
tags:
password:
categories: Nginx
---

# 1.  kong网关简介

Kong是一款基于OpenResty（Nginx + Lua模块）编写的高可用、易扩展的，由Mashape公司开源的API Gateway项目。Kong是基于NGINX和Apache Cassandra或PostgreSQL构建的，能提供易于使用的RESTful API来操作和配置API管理系统，所以它可以水平扩展多个Kong服务器，通过前置的负载均衡
配置把请求均匀地分发到各个Server，来应对大批量的网络请求。

# 2. 为什么需要 API 网关
API网关是一个服务器，是系统的唯一入口。从面向对象设计的角度看，它与外观模式类似。API网关封装了系统内部架构，为每个客户端提供一个定制的API。它可能还具有其它职责，如身份验证、监控、负载均衡、缓存、请求分片与管理、静态响应处理。API网关方式的核心要点是，所有的客户端和消费端都通过统一的网关接入微服务，在网关层处理所有的非业务功能。通常，网关也是提供REST/HTTP的访问API。
![在这里插入图片描述](https://img-blog.csdnimg.cn/d3f137f203ad4f0bb2896fe607783a17.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
在微服务架构之下，服务被拆的非常零散，降低了耦合度的同时也给服务的统一管理增加了难度。如上图左所示，在旧的服务治理体系之下，鉴权，限流，日志，监控等通用功能需要在每个服务中单独实现，这使得系统维护者没有一个全局的视图来统一管理这些功能。API 网关致力于解决的问题便是为微服务纳管这些通用的功能，在此基础上提高系统的可扩展性。如右图所示，微服务搭配上 API 网关，可以使得服务本身更专注于自己的领域，很好地对服务调用者和服务提供者做了隔离。

目前，比较流行的网关有：Nginx 、 Kong 、Orange等等，还有微服务网关Zuul 、Spring CloudGateway等等
对于 API Gateway，常见的选型有基于 Openresty 的 Kong、基于 Go 的 Tyk 和基于 Java 的gateway，这三个选型本身没有什么明显的区别，主要还是看技术栈是否能满足快速应用和二次开发。

## 2.1 和Spring Cloud Gateway区别
1. 像Nginx这类网关，性能肯定是没得说，它适合做那种门户网关，是作为整个全局的网关，是对外的，处于**最外层的**；而Gateway这种，更像是**业务网关**，主要用来对应不同的客户端提供服务的，用于聚合业务的。各个微服务独立部署，职责单一，对外提供服务的时候需要有一个东西把业务聚合起来。（一句话来说，Kong适合做最外面的网关，负责分发请求到不同的服务。Spring Cloud Gateway适合做内部网关，比如短信微服务有多个功能，Spring Cloud Gateway就去分发这些）
2. 像Nginx这类网关，都是用不同的语言编写的，不易于扩展；而Gateway就不同，它是用Java写的，易于扩展和维护
3. Gateway这类网关可以实现熔断、重试等功能，这是Nginx不具备的

所以，你看到的网关可能是这样的
![在这里插入图片描述](https://img-blog.csdnimg.cn/a69082b5db06429987ac4ea7757f0dff.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)


# 3. 为什么要使用kong
- 插件市场丰富，很多插件可以降低开发成本；
- 可扩展性，可以编写lua脚本来定制自己的参数验证权限验证等操作；
- 基于openResty，openResty基于Nginx保障了强劲的性能；
- 便捷性能扩容，只需要水平增加服务器资源性能就能提升 ；
- 负载均衡健康检查
## 3.1  kong的组成部分
- Kong Server ：基于nginx的服务器，用来接收API请求。
- Apache Cassandra/PostgreSQL ：用来存储操作数据。
- Kong dashboard：官方推荐UI管理工具（收费），当然，也可以使用 restfull 方式 管理admin api

Kong采用插件机制进行功能定制，插件集（可以是0或N个）在API请求响应循环的生命周期中被执行。插件使用Lua编写，目前已有几个基础功能：HTTP基本认证、密钥认证、CORS（Cross-Origin Resource Sharing，跨域资源共享）、TCP、UDP、文件日志、API请求限流、请求转发以及Nginx监
控。

## 3.2 Kong网关的特性
- 可扩展性: 通过简单地添加更多的服务器，可以轻松地进行横向扩展，这意味着您的平台可以在一个较低负载的情况下处理任何请求；
- 模块化: 可以通过添加新的插件进行扩展，这些插件可以通过RESTful Admin API轻松配置；
- 在任何基础架构上运行: Kong网关可以在任何地方都能运行。您可以在云或内部网络环境中部署Kong，包括单个或多个数据中心设置，以及public，private 或invite-only APIs。



# 4. kong网关架构
1. Kong核心基于OpenResty构建，实现了请求/响应的Lua处理化；
2. Kong插件拦截请求/响应，如果接触过Java Servlet，等价于拦截器，实现请求/响应的AOP处理；
3. Kong Restful 管理API提供了API/API消费者/插件的管理；
4. 数据中心用于存储Kong集群节点信息、API、消费者、插件等信息，目前提供了PostgreSQL和Cassandra支持，如果需要高可用建议使用Cassandra；
5. Kong集群中的节点通过gossip协议自动发现其他节点，当通过一个Kong节点的管理API进行一些变更时也会通知其他节点。每个Kong节点的配置信息是会缓存的，如插件，那么当在某一个Kong节点修改了插件配置时，需要通知其他节点配置的变更。

## 4.1 Kong网关请求流程
使用Kong网关的API接口的典型请求工作流程：
![在这里插入图片描述](https://img-blog.csdnimg.cn/932fdf7df3a5469186cf2d1cb80b7e1f.png)
当Kong运行时，每个对API的请求将先被Kong命中，然后这个请求将会被代理转发到最终的API接口。在请求（Requests）和响应（Responses）之间，Kong将会执行已经事先安装和配置好的任何插件，授权您的API访问操作。Kong是每个API请求的入口点（Endpoint）。


# 5. kong 部署
## 5.1 安装PostgreSQL10
**1、准备YUM源**
```shell
yum install -y https://mirrors.tuna.tsinghua.edu.cn/postgresql/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm
```
```shell
sed -e 's,download.postgresql.org/pub,mirrors4.tuna.tsinghua.edu.cn/postgresql,g' -i /etc/yum.repos.d/pgdg-redhat-all.repo
```

**2、安装PostgreSQL10**
```shell
yum install -y postgresql10 postgresql10-server
```

```shell
yum install -y postgresql10-contrib postgresql10-test
```

**3、初始化数据库**
默认数据目录在/var/lib/pgsql/10/data

```shell
cd /var/lib/pgsql/10/data

# 运行
/usr/pgsql-10/bin/postgresql-10-setup initdb
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c1332a7090894468851f1ab85ee46621.png)

**4、使用自定义数据目录**
```shell
mkdir /data

cd /var/lib/pgsql/10/data
# 修改数据目录权限
chown -R postgres:postgres /data
# 修改服务启动脚本的数据目录
# 服务脚本默认的Environment=PGDATA=/var/lib/pgsql/10/data
# 不改这个会导致服务启动失败
sed -e 's,^Environment=PGDATA=.*,Environment=PGDATA=/data,' -i /usr/lib/systemd/system/postgresql-10.service
systemctl daemon-reload
# 切换到postgres用户
su - postgres
# 修改默认PGDATA环境变量
sed -e 's,^PGDATA.*,PGDATA=/data,' -i ~/.bash_profile
# 应用变量
source ~/.bash_profile
# 初始化数据库
/usr/pgsql-10/bin/initdb --encoding=UTF-8  \
                         --local=en_US.UTF8 \
                         --username=postgres \
                         --pwprompt \
                         --pgdata=$PGDATA \
                         --data-checksums
```

执行最后一步之后会让你输入密码：本次密码为`root`


**5、启动PostgreSQL**
```shell
systemctl enable postgresql-10.service
systemctl start postgresql-10.service
```


**6、验证数据库**
```shell
ps -ef | grep postgres
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/c725b7ae7aef49f5a4dbf2d1b37b0557.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
查看数据库监听端口:
![在这里插入图片描述](https://img-blog.csdnimg.cn/72333bcd60ce43bd86d13d7483b24255.png)
**7、登录数据库**
```shell
# 切换用户
su - postgres
# 在postgres用户下可以直接免密码登录到数据库
psql -U postgres
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/57477679df384fbfb9a751338a69ca62.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**8、查看数据库**
```shell
postgres=# \conninfo

postgres=# \l
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/bc9b2f9767c047998af7d423fd7b3a9d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**9、增加PATH变量**
```shell
su - postgres

vim ~/.bash_profile
# 添加如下内容
PGHOME='/usr/pgsql-10'
export PATH=${PGHOME}/bin:${PATH}
```


## 5.2 Kong安装
```shell
curl -Lo kong-2.5.0.amd64.rpm $( rpm --eval "https://download.konghq.com/gateway-2.x-centos-%{centos_ver}/Packages/k/kong-2.5.0.el%{centos_ver}.amd64.rpm")
```
```shell
sudo yum install kong-2.5.0.amd64.rpm
```
安装完成后，查看安装目录
```shell
whereis kong
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/89af11b14fe140a3a70f09fefdee94a6.png)

然后我们进入kong的安装目录
```shell
cd /etc/kong 
```
复制它的配置文件便于修改：
```shell
cp kong.conf.default kong.conf
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/7c21aed7771340e2a57bec3f6fde2b69.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
修改配置文件：
①打开注释
![在这里插入图片描述](https://img-blog.csdnimg.cn/662ee372d09c4acb830e15b3dac2eced.png)
②打开注释并修改为下面那条内容
![在这里插入图片描述](https://img-blog.csdnimg.cn/eca3d1e520184f1bb1e68618bc169def.png)
③打开关于数据库的设置并配置好
![在这里插入图片描述](https://img-blog.csdnimg.cn/82fcea0f79de4229b0352f3b04932021.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)


然后开始配置数据库：
```shell
#使用postgres用户登录
su - postgres
#登录PostgreSQL数据库
psql
# 创建所需数据
create user kong with password 'kong123';         // 创建用户

create database kong_db owner kong;               // 创建数据库

grant all privileges on database kong_db to kong; // 授权

#退出数据库
\q
```


至此配置完成了。
还是在`etc/kong`下执行命令：
```shell
# 初始化kong
kong migrations bootstrap -c /etc/kong/kong.conf
# 启动kong
kong start -c ./kong.conf

# 查看监听端口
netstat -ntl
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/5d4d9266113345e78e44a5b2fb834c86.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**验证：用浏览器访问`http://192.168.80.16:8001/`**
![在这里插入图片描述](https://img-blog.csdnimg.cn/c865a6791ff64b57b2d297697d750dac.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
至此，kong安装启动成功


## 5.3 Kong配置
我们来看一个典型 Nginx 的配置对应在 Kong 上是怎么样的，下面是一个典型的 Nginx 配置
![在这里插入图片描述](https://img-blog.csdnimg.cn/ff57a7b1ff074bbba4206bb282097532.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
下面我们开看看其对应 Kong 中的配置
![在这里插入图片描述](https://img-blog.csdnimg.cn/68507a9b4be54b33b80b2108eade27ad.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
这一切配置都是通过其 Http Restful API 来动态实现的，无需我们再手动的 reload Nginx.conf。
在上述的配置中涉及到了几个概念： Upstream、Target、Service、Route 等概念，它们是 Kong的几个核心概念，也是我们在使用 Kong API 时经常打交道的，下面我们就其几个核心概念做一下简单的说明。

**1、Upstream**

Upstream 对象表示虚拟主机名，可用于通过多个服务（目标）对传入请求进行负载均衡。例如：`service.v1.xyz` 为 Service 对象命名的上游 Host 是`service.v1.xyz` 对此服务的请求将代理到上游定义的目标。


 **2、Target**
目标 IP地址/主机名，其端口表示后端服务的实例。每个上游都可以有多个 Target，并且可以动态添加 Target。
由于上游维护 Target 的更改历史记录，因此无法删除或者修改 Target。要禁用目标，请发布一个新的 Targer weight=0，或者使用 DELETE 来完成相同的操作

**3、Service**
顾名思义，服务实体是每个上游服务的抽象，服务的示例是数据转换微服务，计费API等。

服务的主要属性是它的 URL（其中，Kong 应该代理流量），其可以被设置为单个JSON串或通过指定其 protocol， host，port 和path。

服务与路由相关联（服务可以有许多与之关联的路由），路由是 Kong 的入口点，并定义匹配客户端请求的规则。一旦匹配路由，Kong 就会将请求代理到其关联的服务。

**4、Route**
路由实体定义规则以匹配客户端的请求。每个 Route 与一个 Service 相关联，一个服务可能有多个与之关联的路由，与给定路由匹配的每个请求都将代理到其关联的 Service 上。可以配置的字段有:
- hosts
- paths
- methods
- 
  Service 和 Route 的组合（以及它们之间的关注点分离）提供了一种强大的路由机制，通过它可以在Kong 中定义细粒度的入口点，从而使基础架构路由到不同上游服务。

**5、Consumer**
Consumer 对象表示服务的使用者或者用户，你可以依靠 Kong 作为主数据库存储，也可以将使用者列表与数据库映射，以保持Kong 与现有的主数据存储之间的一致性。

**6、Plugin**
插件实体表示将在 HTTP请求/响应生命周期 期间执行的插件配置。它是为在 Kong 后面运行的服务添加功能的，例如身份验证或速率限制。

将插件配置添加到服务时，客户端向该服务发出的每个请求都将运行所述插件。如果某个特定消费者需要将插件调整为不同的值，你可以通过创建一个单独的插件实例，通过 service 和 consumer 字段指定服务和消费者。



## 5.4 kongAPI操作
### 5.4.1 配置网关
**配置服务**
```shell
# 添加服务
curl -i -X POST http://192.168.80.16:8001/services/ -d 'name=test-service' -d 'url=http://192.168.80.16/1.html'
```
url 参数是一个简化参数，用于一次性添加 protocol，host，port 和 path。
![在这里插入图片描述](https://img-blog.csdnimg.cn/e5f5f51953234cdb8641dd3ddbcf4fa7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**添加路由**
```shell
# 添加service 的路由
curl -i -X POST http://192.168.80.16:8001/routes/ -d 'methods=GET' -d 'paths=/service' -d 'service.id=e35066fd-9c39-4170-9842-5e36581b58b6'
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/a4fd08deeb444b2995c1aab9a56cfdb6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**访问测试：**
`http://192.168.80.16:8000/service?a=123`，就能访问到1.html的页面了
