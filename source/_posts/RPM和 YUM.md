---
title: RPM和 YUM
date: 2020-05-12 10:49:34
tags: 
categories: Linux
---

<!--more-->

### RPM和 YUM

- [rpm包的管理](#rpm_2)
- [yum](#yum_63)

# rpm包的管理

**介绍：**  
一种用于互联网下载包的打包及安装工具，它包含在某些 Linux 分发版中。它生成具有.RPM 扩展名的文件。RPM 是 RedHat Package Manager（RedHat 软件包管理工具）的缩写，类似 windows 的 setup.exe，这一文件格式名称虽然打上了 RedHat 的标志，但理念是通用的。  
Linux 的分发版本都有采用（suse,redhat, centos 等等），可以算是公认的行业标准了

**rpm 包的简单查询指令：**  
查询已安装的 rpm 列表 rpm –qa|grep xx

例如:请查询看一下，当前的 Linux 有没有安装 firefox  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512103549544.png)

**15.1.3 rpm 包名基本格式：**  
一个 rpm 包名：firefox-45.0.1-1.el6.centos.x86\_64.rpm

---

名称:firefox  
版本号：45.0.1-1  
适用操作系统: el6.centos.x86\_64  
表示 centos6.x 的 64 位系统  
如果是 i686、i386 表示 32 位系统，noarch 表示通用。。

**rpm 包的其它查询指令：**  
rpm \-qa :查询所安装的所有 rpm 软件包  
rpm \-qa | more \[分页显示\]  
rpm \-q 软件包名 :查询软件包是否安装  
rpm \-qi 软件包名 ：查询软件包信息  
rpm \-ql 软件包名 :查询软件包中的文件  
rpm \-qf 文件全路径名 :查询文件所属的软件包  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512104019858.png)

**卸载 rpm 包：**  
• 基本语法  
rpm \-e RPM 包的名称  
• 应用案例

1.  删除 firefox 软件包  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512104111589.png)  
    • 细节问题
2.  如果其它软件包依赖于您要卸载的软件包，卸载时则会产生错误信息。如： \$ rpm -e foo  
    removing these packages would break dependencies:foo is needed by bar-1.0-1
3.  如果我们就是要删除 foo 这个 rpm 包，可以增加参数 --nodeps ,就可以强制删除，但是一般不推荐这样做，因为依赖于该软件包的程序可能无法运行  
    如：\$ rpm -e --nodeps foo  
    _带上 --nodeps 就是强制删除。_

**安装 rpm 包：**

• 基本语法  
rpm \-ivh RPM 包全路径名称

• 参数说明  
i=install 安 装  
v=verbose 提 示  
h=hash 进度条

1.  演示安装 firefox 浏览器  
    步骤先找到 firefox 的安装 rpm 包,你需要挂载上我们安装 centos 的 iso 文件，然后到/media/下去找 rpm 找 。  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512104250341.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# yum

**介绍：**  
Yum 是一个 Shell 前端软件包管理器。基于 RPM 包管理，能够从指定的服务器自动下载 RPM 包并且安装，可以自动处理依赖性关系，并且一次安装所有依赖的软件包。使用 yum 的前提是可以联网。

**yum 的基本指令**  
yum install xxx 下载安装  
案例：请使用 yum 的方式来安装 firefox

1.  先查看一下 firefox rpm 在 yum 服务器有没有
2.  安装  
    yum install firefox  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200512104836101.png)