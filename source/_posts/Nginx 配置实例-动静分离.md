---
title: Nginx 配置实例-动静分离
date: 2020-10-11 16:25:09
tags: 
categories: Nginx
---

<!--more-->

### Nginx 配置实例-动静分离

**1、什么是动静分离**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011161612101.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

> ①Nginx 动静分离简单来说就是把动态跟静态请求分开，不能理解成只是单纯的把动态页面和静态页面物理分离。严格意义上说应该是动态请求跟静态请求分开，可以理解成使用 Nginx处理静态页面，Tomcat 处理动态页面。动静分离从目前实现角度来讲大致分为两种，一种是纯粹把静态文件独立成单独的域名，放在独立的服务器上，也是目前主流推崇的方案；

> ②通过 location 指定不同的后缀名实现不同的请求转发。通过 expires 参数设置，可以使浏览器缓存过期时间，减少与服务器之前的请求和流量。  
> 具体 Expires 定义：是给一个资源设定一个过期时间，也就是说无需去服务端验证，直接通过浏览器自身确认是否过期即可，所以不会产生额外的流量。此种方法非常适合不经常变动的资源。（如果经常更新的文件，  
> 不建议使用 Expires 来缓存），我这里设置 3d，表示在这 3 天之内访问这个 URL，发送一个请求，比对服务器该文件最后更新时间没有变化，则不会从服务器抓取，返回状态码 304，  
> 如果有修改，则直接从服务器重新下载，返回状态码 200。

**2、准备工作**  
（1）在 liunx 系统中准备静态资源，用于进行访问  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011162208712.png#pic_center)

**3、具体配置**  
（1）在 nginx 配置文件中进行配置  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011162242862.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

**4、最终测试**  
（1）浏览器中输入地址  
http://192.168.17.129/image/01.jpg  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201011162326761.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
（2）在浏览器地址栏输入地址  
http://192.168.17.129/www/a.html  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020101116240875.png#pic_center)