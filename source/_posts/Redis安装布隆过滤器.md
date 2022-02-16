---
title: Redis安装布隆过滤器
date: 2022-02-16 11:30:44
tags:
password:
categories: Redis
---

关于布隆过滤器的简介请看这篇文章 ：[https://juejin.cn/post/6844904013419249678](https://juejin.cn/post/6844904013419249678)


# 安装
在redis布隆过滤器插件地址下载最新的release源码，在编译服务器进行解压编译
```shell
wget https://github.com/RedisBloom/RedisBloom/archive/v2.2.4.tar.gz
```
然后解压插件进行插件的编译
```shell
tar RedisBloom-2.2.4.tar.gz
cd RedisBloom-2.2.4
make
```
编译得到动态库 `rebloom.so`
![在这里插入图片描述](https://img-blog.csdnimg.cn/bad2728b2d204bd5a65275b8526db5f4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)


修改redis配置文件即可加载bloom filter插件
```shell
#在redis配置文件(redis.conf)中加入该模块即可
vim redis.conf
#添加
loadmodule /softwares/RedisBloom-2.2.4/redisbloom.so （前面为你自己的路径）
```


#  布隆过滤器常用命令
注意：在redis客户端执行以下命令时要用小写
![在这里插入图片描述](https://img-blog.csdnimg.cn/05f90d09ac764012943ea0f4711b91d0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
# 测试
登录redis-cli，执行以下命令：
```shell
# 在redis中添加一个布隆过滤器 错误率是0.01 数量是1万个
bf.reserve bf_test 0.01 10000 NONSCALING
# 在bf_test 的布隆过滤器添加一个key
bf.add bf_test key
# 验证布隆过滤器key是否存在
bf.exists bf_test key
# 验证布隆过滤器key1是否存在
bf.exists bf_test key1
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/7bd788af50a841ecb238cb91a7dfa1fc.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)