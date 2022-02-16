---
title: Nginx 的配置文件
date: 2020-10-11 00:17:02
tags: 
categories: Nginx
---

<!--more-->

# 1、配置文件结构
Nginx配置文件一般位于Nginx安装目录下的conf目录下。整个文件以block形式组合而成，每一个block都使用"{}"大括号来表示。block中可以嵌套其他block层级。其中main层是最高层次。


Nginx配置文件主要有4部分，main(全局设置)、server（主机设置）、upstream（上游服务器设置，主要为反向代理，负载均衡相关配置）和location（url匹配特定位置的设置），每部分包含若干指令。

 - Main部分的设置影响其他所有部分的设置；
 - Server部分主要用于指定虚拟机主机域名，ip和端口；
 - Upstream的指令用于设置一系列的后端服务器，设置反向代理及后端服务器的负载均衡；
 - Location部分用于匹配网页位置（如，跟目录“/”,”/images”等）。

它们之间的关系是，server继承main，location继承server，upstream既不会继承指令也不会被继承。


在这四个部分当中，每个部分都包含若干指令，这些指令主要包含Nginx的主模块指令、事件模块指令、HTTP核心模块指令，同时每个部分还可以使用其他HTTP模块指令，例如Http SSL模块、HttpGzip Static模块和Http Addition模块等。
![在这里插入图片描述](https://img-blog.csdnimg.cn/ca1ba2116c304282a8f25103697b3f94.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**真实的nginx配置文件可能如下**

![在这里插入图片描述](https://img-blog.csdnimg.cn/351259d29fc24f99bd85241bf912977e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)




# 2、配置文件位置
配置文件是一些文本文件，通常位于`nginx安装目录/etc/nginx` 或 `/etc/nginx` 。主配置文件通常命名为 nginx.conf 。所有和nginx行为相关的配置都应该位于一个集中的配置文件目录中

# 3、配置文件中的内容
可以将 nginx.conf 配置文件分为三部分： 
<font color=red>第一部分：全局块 </font>
>从配置文件开始到 events 块之间的内容，主要会**设置一些影响 nginx 服务器整体运行的配置指令**，主要包括配置运行 Nginx 服务器的用户（组）、允许生成的 worker process 数，进程 PID 存放路径、日志存放路径和类型以及配置文件的引入等。
>比如 worker_processes 1;处理并发数的配置

<font color=red>第二部分：events 块 </font>
>events 块涉及的指令主要影响 **Nginx 服务器与用户的网络连接**，常用的设置包括是否开启对多 work process下的网络连接进行序列化，是否允许同时接收多个网络连接，选取哪种事件驱动模型来处理连接请求，每个 word process 可以同时支持的最大连接数等。
>比如 worker_connections 1024; 支持的最大连接数为 1024

<font color=red>第三部分：http 块</font>
这算是 Nginx 服务器配置中最频繁的部分，代理、缓存和日志定义等绝大多数功能和第三方模块的配置都在这里。
 需要注意的是：http 块也可以包括 **http 全局块**、**server 块**。
 <font color=red>①、http 全局块</font>
 > http 全局块配置的指令包括文件引入、MIME-TYPE 定义、日志自定义、连接超时时间、单链接请求数上限等。

 <font color=red>②、server 块</font>
 >这块和虚拟主机有密切关系，虚拟主机从用户角度看，和一台独立的硬件主机是完全一样的，该技术的产生是为了节省互联网服务器硬件成本。 每个 http 块可以包括多个 server 块，而每个 server 块就相当于一个虚拟主机。 而每个 server 块也分为全局 server 块，以及可以同时包含多个 locaton 块。
 > **1、全局 server 块**
 > 最常见的配置是本虚拟机主机的监听配置和本虚拟主机的名称或 IP 配置。
 > **2、location 块**
 > 一个 server 块可以配置多个 location 块。 这块的主要作用是基于 Nginx 服务器接收到的请求字符串（例如 server_name/uri-string），对虚拟主机名称（也可以是 IP 别名）之外的字符串（例如 前面的 /uri-string）进行匹配，对特定的请求进行处理。地址定向、数据缓存和应答控制等功能，还有许多第三方模块的配置也在这里进行。

# 4、Nginx的全局配置
![在这里插入图片描述](https://img-blog.csdnimg.cn/de3a8b37514b445a9091a3554bca2483.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_17,color_FFFFFF,t_70,g_se,x_16)
**①user**
user是个主模块指令，指定Nginx `Worker`进程运行用户以及用户组，默认由nobody账号运行。这个地方如果写错了就会出现获取不到用户的错误
![在这里插入图片描述](https://img-blog.csdnimg.cn/adc596a9b71b47a5ba1db3e36d71d739.png)
**②worker_processes**
是个主模块指令，指定了Nginx要开启的进程数。每个Nginx进程平均耗费10M~12M内存。建议指定和CPU的数量一致即可。
这个地方如果配置配置了 `worker_processes 2`; 那么他的工作进程就有两个
![在这里插入图片描述](https://img-blog.csdnimg.cn/b234d513eb6544f0b6c546643950b29b.png)
**③error_log**
是个主模块指令，用来定义全局错误日志文件。日志输出级别有debug、info、notice、warn、error、crit可供选择，其中，debug输出日志最为最详细，而crit输出日志最少。
日志文件路径一般在nginx安装目录的logs目录中
![在这里插入图片描述](https://img-blog.csdnimg.cn/555a315f7baa49ca94406620fed7c961.png)
**④pid**
是个主模块指令，用来指定进程pid的存储文件位置。
运行进程和nginx的master的进程号是一致的，只有nginx运行时才存在，如果nginx停止了 pid也会被删除掉
![在这里插入图片描述](https://img-blog.csdnimg.cn/05073c98c94a46d4afd1b8521a41967a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# 5、 events事件指令
events事件指令是设定Nginx的**工作模式**及**连接数上限**：

**①use**
use是个事件模块指令，用来指定Nginx的工作模式。Nginx支持的工作模式有select、poll、kqueue、epoll、rtsig和/dev/poll。其中select和poll都是标准的工作模式，kqueue和epoll是高效的工作模式，不同的是epoll用在Linux平台上，而kqueue用在BSD系统中。对于Linux系统，epoll工作模式是首选。

**②worker_connections**
也是个事件模块指令，用于定义Nginx每个进程的最大连接数，默认是1024。最大客户端连接数由worker_processes和worker_connections决定，即`Max_client=worker_processes*worker_connections`。
在作为反向代理时，max_clients变为：`max_clients = worker_processes * worker_connections/4`。
进程的最大连接数受Linux系统进程的最大打开文件数限制，在执行操作系统命令`“ulimit -n 65536”`后`worker_connections`的设置才能生效。