---
title: Nginx跨域配置、防盗链配置
date: 2022-02-13 16:00:19
tags:
password:
categories: Nginx
---

# 跨域配置
当出现403跨域错误的时候` No 'Access-Control-Allow-Origin' header is present on the requested resource`，需要给Nginx服务器配置响应的header参数：
```shell
---
title: Nginx跨域配置、防盗链配置
date: 2022-02-13 16:00:19
tags:
password:
categories: Nginx

---

# 跨域配置

当出现403跨域错误的时候` No 'Access-Control-Allow-Origin' header is present on the requested resource`，需要给Nginx服务器配置响应的header参数：

​```shell
server {
	listen 80;
	server_name test.cross.com;
	if ( $host ~ (.*).cross.com){
		set $domain $1;#记录二级域名值
	}
	#是否允许请求带有验证信息
	add_header Access-Control-Allow-Credentials true;
	#允许跨域访问的域名,可以是一个域的列表，也可以是通配符*
	add_header Access-Control-Allow-Origin http://static.enjoy.com;
	#允许脚本访问的返回头
	add_header Access-Control-Allow-Headers 'x-requested-with,content-
	type,Cache-Control,Pragma,Date,x-timestamp';
	#允许使用的请求方法，以逗号隔开
	add_header Access-Control-Allow-Methods 'POST,GET,OPTIONS,PUT,DELETE';
	#允许自定义的头部，以逗号隔开,大小写不敏感
	add_header Access-Control-Expose-Headers 'WWW-Authenticate,Server-
	Authorization';
	#P3P支持跨域cookie操作
	add_header P3P 'policyref="/w3c/p3p.xml", CP="NOI DSP PSAa OUR BUS IND ONL
	UNI COM NAV INT LOC"';
    #OPTIONS类的请求，是跨域先验请求
    if ($request_method = 'OPTIONS') {
    #204代表ok
        return 204;
    }
}
​```



# 防盗链配置

盗链指的是在自己的界面展示非本服务器上的内容，通过技术手段获得其他服务器的资源。绕过他人资源展示页面，在自己页面向用户提供此内容，从而减轻自己服务器的负担，因为真实的空间和流量来自其他服务器。
因此，通常为了避免被盗链，通常Web服务器建议配置防盗链。

在nginx中添加如下配置

​```shell
# 需要防盗的后缀
location ~* \.(jpg|jpeg|png|gif|bmp|swf|rar|zip|doc|xls|pdf|gz|bz2|mp3|mp4|flv)$
    #设置过期时间
    expires     30d;
    # valid_referers 就是白名单的意思
    # 支持域名或ip
    # 允许ip 192.168.0.1 的请求
    # 允许域名 *.baidu.com 所有子域名
    valid_referers none blocked 192.168.0.1 *.baidu.com;
    if ($invalid_referer) {
        # return 403;
        # 盗链返回的图片，替换盗链网站所有盗链的图片
        rewrite ^/ https://site.com/403.jpg;
    }
    root  /usr/share/nginx/img;
}
​```

> 以上配置主要看 valid_referers，这个变量代表只允许网址访问，上面配置中允许 IP 为 192.168.0.1 和 baidu搜索引擎访问图片该服务下的资源，否则就重定向到一张默认图片
```


# 防盗链配置

盗链指的是在自己的界面展示非本服务器上的内容，通过技术手段获得其他服务器的资源。绕过他人资源展示页面，在自己页面向用户提供此内容，从而减轻自己服务器的负担，因为真实的空间和流量来自其他服务器。
因此，通常为了避免被盗链，通常Web服务器建议配置防盗链。

在nginx中添加如下配置
```shell
# 需要防盗的后缀
location ~* \.(jpg|jpeg|png|gif|bmp|swf|rar|zip|doc|xls|pdf|gz|bz2|mp3|mp4|flv)$
    #设置过期时间
    expires     30d;
    # valid_referers 就是白名单的意思
    # 支持域名或ip
    # 允许ip 192.168.0.1 的请求
    # 允许域名 *.baidu.com 所有子域名
    valid_referers none blocked 192.168.0.1 *.baidu.com;
    if ($invalid_referer) {
        # return 403;
        # 盗链返回的图片，替换盗链网站所有盗链的图片
        rewrite ^/ https://site.com/403.jpg;
    }
    root  /usr/share/nginx/img;
}
```
> 以上配置主要看 valid_referers，这个变量代表只允许网址访问，上面配置中允许 IP 为 192.168.0.1 和 baidu搜索引擎访问图片该服务下的资源，否则就重定向到一张默认图片