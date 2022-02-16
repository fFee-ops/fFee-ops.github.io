---
title: crond 任务调度
date: 2020-04-17 12:50:37
tags: 
categories: Linux
---

<!--more-->

### crond

- [原理示意图与概述](#_2)
- [快速入门](#_16)
- - [任务的要求](#_17)
  - [步骤](#_22)
  - [参数细节说明](#_27)
- [crond 相关指令:](#crond__45)

# 原理示意图与概述

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417122950359.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**概述**：  
任务调度：是指系统在某个时间执行的特定的命令或程序。  
任务调度分类：  
1.系统工作：有些重要的工作必须周而复始地执行。如病毒扫描等  
2.个别用户工作：个别用户可能希望执行某些程序，比如对 mysql 数据库的备份。

---

基本语法： crontab \[选项\]  
常用选项：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417123257542.png)

# 快速入门

## 任务的要求

设置任务调度文件：/etc/crontab  
设置个人任务调度。执行 crontab –e 命令。接着输入任务到调度文件  
如：\*/1 \* \* \* \* ls –l /etc/ > /tmp/to.txt  
意思说每小时的每分钟执行 ls –l /etc/ > /tmp/to.txt 命令

## 步骤

1.  conrtab -e
2.  \*/ 1 \* \* \* \* ls -l /etc >> /tmp/to.txt
3.  当保存退出后就程序。
4.  在每一分钟都会自动的调用 ls -l /etc >> /tmp/to.txt

## 参数细节说明

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417123418434.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417123425944.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417123433741.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
案例：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200417123946403.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

案例 3: 每天凌晨 2:00 将 mysql 数据库 testdb ，备份到文件中mydb.bak。

1.  先编写一个文件 /home/mytask3.sh  
    /usr/local/mysql/bin/mysqldump -u root -proot testdb > /tmp/mydb.bak
2.  给 mytask3.sh 一个可以执行权限

chmod 744 /home/mytask3.sh  
3\) crontab \-e  
4\) 0 2 \* \* \* /home/mytask3.sh  
5\) 成功

# crond 相关指令:

1.  crontab –r：终止任务调度。
2.  crontab –l：列出当前有那些任务调度
3.  service crond restart \[重启任务调度\]