---
title: OpenResty应用
date: 2022-02-15 18:14:51
tags:
password:
categories: Nginx
---

# 1. OpenResty 命令详解
```shell
openresty -h | -?
```
>含义：查看OpenResty的帮助，可以得知当前的版本号以及全部指令的使用方式。
>![在这里插入图片描述](https://img-blog.csdnimg.cn/5848baf9d1a548fc847fe8f2e11b295d.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)



```shell
openresty -v
```
>含义：查看当前OpenResty的版本
>![在这里插入图片描述](https://img-blog.csdnimg.cn/d7a8d3a693224c298c9470fb64c5a654.png)

```shell
openresty -V
```
>含义：查看当前OpenResty的编译信息
>![在这里插入图片描述](https://img-blog.csdnimg.cn/d8d48daf93884da7a8915ddd5b730b9b.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)




```shell
openresty -t | -T
```
>含义：检查当前nginx.conf文件的语法错误。运行这个命令只是去检查语法并不会去启动OpenResty。
>![在这里插入图片描述](https://img-blog.csdnimg.cn/daf0c297090348cab1902c86826ab3b6.png)



```shell
openresty -s 信号
```
>含义：使用”-s”选项，会主动想openrest的master进程发送信号，可以通过信号的类型来执行不同的操作。
>![在这里插入图片描述](https://img-blog.csdnimg.cn/7d455f82ed0b45daa07e6a5290256f48.png)

# 2. Lua基础功能使用
## 2.1 hello world
**①创建 helloworld.lua**
```lua
ngx.say("你好世界！");
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/6698d04d7e8e4ea8b2f7023af09794a1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**②修改 nginx.conf**
```shell
server{
        listen 80;
        server_name 192.168.80.16;

        location /helloworld {
           content_by_lua_file /softwares/openresty/script/helloworld.lua;
        }
}
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/48edffb9a91b4f4db6befb50cf8eff4c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**③重启nginx访问`192.168.80.16/helloworld`**
会自动下载一个文件，打开就是：你好世界！
![在这里插入图片描述](https://img-blog.csdnimg.cn/f94adcb6092f4d7cb03218546d9b9e12.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/331a80b97ff34eeabedfb9f2e45025c4.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 2.2 获取请求 uri 参数
获取url参数 `ngx.var.arg_xx`与`ngx.req.get_uri_args[“xx”]`两者都是为了获取请求url中的参数.

**①修改nginx.conf**
```shell
location /print_param {
    content_by_lua_block {
        local arg = ngx.req.get_uri_args()
            for k,v in pairs(arg) do
            ngx.say("[GET ] key:", k, " v:", v)
            end

            ngx.req.read_body() -- 解析 body 参数之前一定要先读取 body
            local arg = ngx.req.get_post_args()
            for k,v in pairs(arg) do
            ngx.say("[POST] key:", k, " v:", v)
            end
    }
}
```
**②重启nginx然后在shell端发起请求**
```shell
curl '127.0.0.1/print_param?a=1&b=2%26' -d 'c=3&d=4%26'
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/17f09f3cb8104b9986a7d0fc4b6c85e6.png)
​ 从这个例子中，我们可以很明显看到两个函数 `ngx.req.get_uri_args`、`ngx.req.get_post_args `获取数据来源是有明显区别的，前者来自 uri 请求参数，而后者来自 post 请求内容。


## 2.3 传递请求 uri 参数
当我们可以获取到请求参数，自然是需要这些参数来完成业务控制目的。大家都知道，URI 内容传递过程中是需要调用 `ngx.encode_args` 进行规则转义。

**①修改nginx.conf**
```shell
location /test {
    content_by_lua_block {
        local res = ngx.location.capture(
            '/print_param',
            {
            method = ngx.HTTP_POST,
                args = ngx.encode_args({a = 1, b = '2&'}),
                body = ngx.encode_args({c = 3, d = '4&'})
        }
        )
            ngx.say(res.body)
    }
}
```

**②重启nginx，并执行**
```shell
curl '127.0.0.1/test'
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/3c0c2080762746aeaeb52c376f128099.png)
## 2.4 获取请求类型
**①修改nginx.conf**
```shell
location /lua_request{
    default_type 'text/html';
    lua_code_cache off;
    content_by_lua_file  /usr/example/lua/lua_request.lua;
}
```
**②创建 `/usr/example/lua/lua_request.lua`**
```lua
local arg = ngx.req.get_uri_args()
for k,v in pairs(arg) do
   ngx.say("[GET ] key:", k, " v:", v)
end

ngx.req.read_body() -- 解析 body 参数之前一定要先读取 body
local arg = ngx.req.get_post_args()
for k,v in pairs(arg) do
   ngx.say("[POST] key:", k, " v:", v)
end
```
> 在上述例子中有以下的api
> - **ngx.req.get_uri_args** 获取在uri上的get类型参数，返回的是一个table类型的数据结构。
> - **ngx.req.read_body** 读取body，这在解析body之前，一定要先读取body。
> - **ngx.req.get_post_args** 获取form表单类型的参数，返回结果是一个table类型的数据。


**③重启nginx，并执行**
```shell
curl ‘http://192.168.80.16/lua_request?a=323&b=ss’ -d ‘c=12w&d=2se3’
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/2692f8cb046d4098abfd995a477da100.png)