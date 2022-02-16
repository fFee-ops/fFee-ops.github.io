---
title: OpenResty介绍
date: 2022-02-15 13:26:45
tags:
password:
categories: Nginx
---

OpenResty是一个基于 Nginx 与 Lua 的**高性能 Web 平台**，其内部集成了大量精良的 Lua 库、第三方模块以及大多数的依赖项。

用于方便地搭建能够处理超高并发、扩展性极高的动态 Web 应用、Web 服务和动态网关。


OpenResty通过汇聚各种设计精良的 Nginx 模块（主要由 OpenResty 团队自主开发），从而将Nginx 有效地变成一个强大的通用 Web 应用平台。这样，Web 开发人员和系统工程师可以使用 Lua 脚本语言调动 Nginx 支持的各种 C 以及 Lua 模块，快速构造出足以胜任 10K 乃至 1000K 以上单机并发连接的高性能 Web 应用系统。


**OpenResty的目标是让你的Web服务直接跑在Nginx服务内部**，充分利用 Nginx 的非阻塞 I/O 模型，不仅仅对 HTTP 客户端请求,甚至于对远程后端诸如 MySQL、PostgreSQL、Memcached 以及Redis 等都进行一致的高性能响应。


# Nginx 的流程定义
nginx实际把请求处理流程划分为了11个阶段，这样划分的原因是将请求的执行逻辑细分，各阶段按照处理时机定义了清晰的执行语义，开发者可以很容易分辨自己需要开发的模块应该定义在什么阶段。

![在这里插入图片描述](https://img-blog.csdnimg.cn/d65f065d0d15406ba04ff9a47fa6a34e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
1. 当请求进入Nginx后先READ REQUEST HEADERS 读取头部 然后再分配由哪个指令操作
2. Identity 寻找匹配哪个Location*
3. Apply Rate Limits 是否要对该请求限制
4. Preform Authertication 权限验证
5. Generate Content 生成给用户的响应内容
6. 如果配置了反向代理 那么将要和上游服务器通信 Upstream Services
7. 当返回给用户请求的时候要经过过滤模块 Response Filter
8. 发送给用户的同时 记录一个Log日志

# 流程详解
![在这里插入图片描述](https://img-blog.csdnimg.cn/6465a60e2a9846d181dfad3d4b81fd17.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

# OpenResty处理流程
由于 Nginx 把一个请求分成了很多阶段，第三方模块就可以根据自己的行为，挂载到不同阶段处理达到目的，OpenResty 也应用了同样的特性。不同的阶段，有不同的处理行为，这是OpenResty 的一大特色，OpenResty 处理一个请求的流程参考下图

![在这里插入图片描述](https://img-blog.csdnimg.cn/80850ab5abc345f194428eb94b9ce8c5.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
![在这里插入图片描述](https://img-blog.csdnimg.cn/07aaef18d88c4dc4a9ad81f9895f0093.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)





# OpenResty应用场景
例如商品详情页架构的要求 ->高可用 ，-> 高性能，-> 高并发 ；一般来说 业界分为2种主流的方案。
## 中小公司的详情页方案
很多中小型 电商的商品详情页 可能一分钟都没有一个访问，这种的话，就谈不上并发设计，一个tomcat 就能搞定。

还有一种中小型公司呢？虽然说公司不大，但是也是有几十万日活。然后几百万用户，这种公司,就是稍微大点的公司，他们的商品详情用，采取的方案可能是全局的一个静态页面
![在这里插入图片描述](https://img-blog.csdnimg.cn/921446d314ef46b494aad45e7a6f82b3.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
就是我们有把商品详情页直接做成一个静态页面，然后这样子每次全量的更新，把数据全部静态放到 redis 里面，每次数据变化的时候，我们就通过一个Java服务去渲染这个数据，然后把这个静态页面推送到到文件服务器


**缺点：**
- 这种方案的缺点，如果商品很多，那么渲染的时间会很长，达不到实时的效果
- 文件服务器性能高，tomcat性能差，压力都在Tomcat服务器了
- 只能处理一些静态的东西，如果动态数据很多，比如有库存的，你不可能说每次去渲染，然后推送到文件服务器，那不是更加慢？

## 大型公司的商品详情页的核心思想
![在这里插入图片描述](https://img-blog.csdnimg.cn/63f1d73e24b547b2882ab91a8cdcd3a2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
上图展示了核心思想主要有以下四步来完成

**1、生成静态页**
添加修改页面的时候生成静态页，这个地方生成的是一个通用的静态页，敏感数据比如 价格，商品名称等，通过占位符来替换，然后将生成的静态页的链接，以及敏感数据同步到redis中，如果只修改价格不需要重新生成静态页，只需要修改redis敏感数据即可。

**2、推送到文件服务器**
这个的文件服务器泛指能够提供静态文件处理的文件服务器，nginx代理静态文件，tomcat，以及OSS等都算静态文件服务器，生成完静态文件后将文件推送到文件服务器，并将请求连接存放进redis中


**3、布隆过滤器过滤请求**
Redis和nginx的速度很快，但是如果有人恶意请求不存在的请求会造成redis很大的开销，那么可以采用布隆过滤器将不存在的请求过滤出去。

**4、lua直连Redis读取数据**
因为java连接Reids进行操作并发性能很弱，相对于OpenResty来说性能差距很大，这里使用OpenResty，读取Redis中存放的URL以及敏感数据。

**5、OpenResty 渲染数据**
从Redis获取到URL后lua脚本抓取模板页面内容，然后通过redis里面的敏感数据进行渲染然后返回前端，因为都是lua脚本操作性能会很高