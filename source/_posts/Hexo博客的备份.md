---
title: Hexo博客的备份
date: 2020-11-15 13:22:38
tags: 
categories: 杂
---

<!--more-->

### Hexo博客的备份

- [前提、机制](#_5)
- [备份博客](#_16)
- - [创建新分支](#_17)
  - [获取 .git文件夹](#_git_25)
  - [.gitignore](#gitignore_31)
  - [备份](#_45)
  - [为啥把hexo作为默认分支](#hexo_58)
  - [个人备份习惯](#_64)
- [恢复博客](#_75)
- - [克隆项目到本地](#_80)
  - [恢复博客](#_87)

经过一天的挣扎总算把博客搭建的差不多了。但是要考虑到以后换电脑，博客的搬迁工作，于是便有了这一篇文章。

# 前提、机制

前提是你已经初始化好了自己想要备份的那个博客。GIT、GitHub/Gitee环境已经准备好了。

机制是这样的，由于hexo d上传部署到github的其实是hexo编译后的文件，是用来生成网页的，不包含源文件。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201115131729596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
也就是上传的是在本地目录里自动生成的.deploy\_git里面。

其他文件 ，包括我们写在source 里面的，和配置文件，主题文件，都没有上传到gitee,所以可以利用git的分支管理，将源文件上传到另一个分支即可。

# 备份博客

## 创建新分支

我是用的gitee，因为Github有时候速度慢上不去。首先建立博客时已经开了一个新仓库了，如果再开另一个仓库存放源代码有点浪费，因此采用建立新分支的方法备份博客。

不过在建立新分支前请确保仓库内**已有master分支**（Hexo本地建站后第一次上传时会自动生成）。  
然后创建一个用来备份的分支hexo，并且将其设置为默认分支。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201115115816713.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## 获取 .git文件夹

原始的博客文件夹只有  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201115115911474.png#pic_center)  
是没有.git文件夹的，于是我们先去桌面或者哪里随便一个地方，把刚刚的hexo分支给clone下来。然后剪切出里面的.git文件夹，复制到现在的博客文件夹中。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201115125728900.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## .gitignore

用来在上传时候忽略一些文件，即不上传`.gitignore`中忽略的文件。如果有最好，没有的话自己手动添加。

```
.DS_Store
Thumbs.db
db.json
*.log
node_modules/
public/
.deploy*/
```

**注意，如果你之前克隆过theme中的主题文件，那么应该把主题文件中的.git文件夹删掉，因为git不能嵌套上传，最好是显示隐藏文件，检查一下有没有，否则上传的时候会出错，导致你的主题文件无法上传，这样你的配置在别的电脑上就用不了了。**

## 备份

通过如下命令将本地文件备份到Github上。  
在hexo博客的根目录下执行

```bash
$ git add .
$ git commit -m "Backup"
$ git push origin hexo
```

这样就备份完博客了且在Github上能看到两个分支\(master和hexo\)。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201115130038393.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
其中`node_modules、public、db.json`已经被忽略掉了，没有关系，不需要上传的，因为在别的电脑上需要**重新输入命令安装** 。

## 为啥把hexo作为默认分支

master分支是默认的博客静态页面分支，在之后恢复博客的时候并不需要。同时这样每次同步的时候就不用指定分支，比较方便

## 个人备份习惯

```bash
hexo clean
git add .
git commit -m "Backup"
git push
hexo g
hexo d
```

# 恢复博客

目前假设本地Hexo博客基础环境已经搭好：比如安装git  
、nodejs、hexo安装等等。。  
如果不会可以参考[这个视频](https://www.bilibili.com/video/BV1Yb411a7ty)

## 克隆项目到本地

输入下列命令克隆博客必须文件\(hexo分支\)：

```bash
$ git clone https://github.com/yourgithubname/yourgithubname.github.io
```

## 恢复博客

在clone下来的那个文件夹里面执行

```bash
$ npm install hexo-cli
$ npm install
$ npm install hexo-deployer-git
```

**在此不需要执行hexo init这条指令，因为不是从零搭建起新博客。**

然后就完成了，你如果想也可以

```
hexo clean
hexo g
hexo d
```

一下再开始写你的博客。