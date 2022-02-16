---
title: Git与Egit常见操作和配置
date: 2020-05-22 13:22:55
tags: 
categories: Git
---

<!--more-->

### Git、Egit

- [安装Git](#Git_4)
- [常用命令](#_38)
- [示例](#_50)
- [Egit](#Egit_92)
- - [第一次发布](#_104)
  - [后续提交](#_111)
  - [第一次下载](#_123)
  - [更新](#_126)
- [git冲突的解决：](#git_131)
- [git多个人 团队协作开发](#git__145)

Git:分布式版本控制软件  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522130953259.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 安装Git

1、[GIT下载](https://git-scm.com/download/win)  
2、安装时： 只需要修改Use git from git bash only…,其他默认下一步  
3、配置path: E:\\programs\\Git\\bin  
4、配置git：用户名和邮箱  
右键-git bash

```bash
git config --global user.name "xx"
git config --global user.email "xx@qq.com"
```

5、为了 在本地 和远程仓库之间进行 免密钥登录，可以配置ssh

①先本地生成ssh：

```bash
ssh-keygen -t rsa -C xx@qq.com     //一直回车
```

②发送给远程：  
github \- settings \- SSH and … \- New SSH \- title任意、key中输入 刚才在本地生成的ssh：  
将本地刚才生成的id\_rsa.pub\(一般在C:\\Users\\用户名.ssh\)内容复制到远程的Key中  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522131543892.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

③：测试连通性：

```bash
ssh -T git@github.com
```

如果本地和远程成功通信，则可以在 /.ssh目录中 发现known\_hosts文件

---

# 常用命令

git add:将本地文件 增加到暂存区

git commit:将暂存区的内容 提交到 本地仓库（本地分支，默认master分支）

git push：将本地仓库的内容 推送到 远程仓库（远程分支）

git pull:将远程仓库（远程分支）的内容 拉取到 本地仓库（本地分支）

# 示例

1、在本地新建git项目  
在项目根目录 右键 \- git bash \- git init  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522131823349.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

2、 在远程建立git项目  
new-建立项目- 生成 git\@github.com:yanqun/mygitremote.git

3、本地项目-远程项目关联

```bash
git remote add origin git@github.com:yanqun/mygitremote.git
（新建仓库后获得的那个链接）
```

4、第一次发布项目 （本地-远程）

```bash
git add .      //文件-暂存区
git commit -m "注释内容"  //暂存区-本地分支（默认master）
git push -u origin master
```

5、第一次下载项目（远程-本地）

```bash
git clone git@github.com:yanqun/mygitremote.git(点击GItHub的
clone会有链接)
```

6、后续提交\(本地-远程\)

```bash
(在当前工作目录 右键-git bash)
git add.
git commit -m "提交到分支"
git push  origin master
```

7、更新\(远程-本地\)

```bash
git pull
```

---

# Egit

在Eclipse中操作git  
目前的eclipse基本都支持git，如果不支持 则到eclplise marktplace 搜git安装

配置：  
a.team-git-configuration \-邮箱 用户名  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522211217793.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
b.general \-network \-ssh2选中 生成的ssh目录  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020052221125013.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 第一次发布

share project  
加入暂存区add to index  
提交到本地分支commit  
将项目推送到远程 右键-team \-remote \-push —

## 后续提交

team-add to index  
team \-commit  
team \-push

**commit时：  
commit and push 或commit按钮的区别：**  
commit按钮：不能单独的Push某一个文件，只能Push整个项目  
commit and push：可以 单独Push某一个文件

## 第一次下载

import \-clone \-输入 https/ssh的唯一标示符

## 更新

team \- remote \-pull

# git冲突的解决：

发现冲突： 进入同步视图 右键——team \- synchronized…

解决：  
添加到本地暂存区 add to index  
提交到本地分支 commit  
更新服务端的分支内容 到本地分支 pull  
修改冲突：直接修改 或者 merge tool  
（—>已经变为了普通本地文件）  
add to index  
commit push

# git多个人 团队协作开发

github中 该项目 \-settings  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522211814638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
增加合作者： Collaborators 加入 合作者：github 全名或邮箱

发送邀请链接

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200522212103499.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

合作伙伴： 打开该链接、接受邀请 :合作开发…clone项目、修改、add \\commit\\push