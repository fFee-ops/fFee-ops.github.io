---
title: Nginx 配置实例-反向代理实例
date: 2020-10-11 12:43:22
tags: 
categories: Nginx
---

<!--more-->

### Nginx 配置实例-反向代理实例

- [实例1](#1_1)
- [实例2](#2_41)
- [location 指令说明](#location__64)

# 实例1

**1、实现效果**  
（1）打开浏览器，在浏览器地址栏输入地址 www.123.com，跳转到 liunx 系统 tomcat 主页面中

**2、准备工作**  
（1）在 liunx 系统安装 tomcat，使用默认端口 8080

- tomcat 安装文件放到 liunx 系统中，解压
- 进入 tomcat 的 bin 目录中，./startup.sh 启动 tomcat 服务器

（2）对外开放访问的端口

```shell
firewall-cmd --add-port=8080/tcp --permanent
firewall-cmd –reload

查看已经开放的端口号
firewall-cmd --list-all
```

（3）在 windows 系统中通过浏览器访问 tomcat 服务器  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011122049121.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
如果能看到这个页面证明Tomcat启动成功。

**3、访问过程的分析**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011122131277.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

> 相当于访问www.123.com就是去访问192.168.17.129然后又因为默认就是80端口，而Nginx的默认端口也是80，所以相当于是访问的Nginx服务器。再由Nginx服务器根据location块儿的规则去找到对应的真实服务器地址

**4、具体配置**  
第一步 在 windows 系统的 host 文件进行域名和 ip 对应关系的配置  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011122307542.png#pic_center)  
（1）添加内容在 host 文件中  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011122327267.png#pic_center)  
第二步 在 nginx 进行请求转发的配置（反向代理配置）  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011122412511.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
proxy\_pass 中的127.0.0.1相当于local host

5、最终测试

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011122636508.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 实例2

**1、实现效果**  
使用 nginx 反向代理，根据访问的路径跳转到不同端口的服务中  
nginx 监听端口为 9001，

访问 http://192.168.17.129:9001/edu/ 直接跳转到 127.0.0.1:8080  
访问 http:// 192.168.17.129:9001/vod/ 直接跳转到 127.0.0.1:8081

**2、准备工作**  
（1）准备两个 tomcat 服务器，一个 8080 端口，一个 8081 端口  
（2）创建文件夹和测试页面

> 在两个Tomcat的webapps下分别创建edu和vod再随便写两个html页面放进去

**3、具体配置**  
（1）找到 nginx 配置文件，进行反向代理配置  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011123741506.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
（2）开放对外访问的端口号 9001 8080 8081

4、最终测试

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011123931833.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# location 指令说明

该指令用于匹配 URL。  
语法如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011130828674.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)