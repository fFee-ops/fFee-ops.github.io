---
title: CSDN博客迁移到HEXO
date: 2022-01-21 20:32:50
tags:
password:
categories: 杂
---

@[toc](CSDN博客迁移到HEXO)

一直想把CSDN博客全部迁移到HEXO，但是HEXO是有特定格式的，网上找了很多工具都不太好用。终于发现了一个！
[https://github.com/flytam/CsdnSyncHexo](https://github.com/flytam/CsdnSyncHexo)

我来记录一下使用步骤（其实在该项目的README界面有详细的介绍，不过自己操作起来稍微有点不同）：
1、安装
```shell
# > 3.0版本
npm i csdnsynchexo@latest
```
2、在当前目录下新建`config.json`，内容如下
![在这里插入图片描述](https://img-blog.csdnimg.cn/0ce2d87a11714647a9fd54828e12ed34.png)
>userId csdn 用户名。如https://blog.csdn.net/flytam的 flytam


3、在当前窗口进入cmd，然后执行`hsync --config ./config.json`即可。等全部下载完后就能在当前目录下的csdnToHexo文件夹下发现文章了。