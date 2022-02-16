---
title: mycat的安装
date: 2021-10-05 14:57:10
tags: mysql linux
categories: MyCat
---

<!--more-->

### mycat的安装

- [环境准备](#_2)
- [MyCat的安装](#MyCat_5)

# 环境准备

本次安装环境为CentOS7.3。如果你要使用MyCat，那么首先要在你的机器上安装Mysql和JDK。

# MyCat的安装

从官网下载需要的安装包，并且上传到具体的虚拟机中进行解压缩。  
下载地址为：<http://dl.mycat.org.cn/1.6.7.5/2020-4-10/>

```shell
解压文件到/usr/local文件夹下
tar -zxvf  Mycat-server-1.6.7.5-release-20200422133810-linux.tar.gz -C /usr/local
配置环境变量
vi /etc/profile
#下面的配置是为了可以全局使用mycat命令，不配置也行，就要进入到bin目录去执行命令启动
添加如下配置信息：
export MYCAT_HOME=/usr/local/mycat
export PATH=$MYCAT_HOME/bin:$PATH:$JAVA_HOME/bin
```

当执行到这步的时候，其实就可以启动了，但是为了能正确显示出效果，最好修改下mycat的具体配置，让我们能够正常进行访问。

**配置mycat**  
进入到/usr/local/mycat/conf目录下，修改该文件夹下的配置文件

**1、修改server.xml文件**\(只需要保留这些，多余的可以先删除\)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- - - Licensed under the Apache License, Version 2.0 (the "License"); 
	- you may not use this file except in compliance with the License. - You 
	may obtain a copy of the License at - - http://www.apache.org/licenses/LICENSE-2.0 
	- - Unless required by applicable law or agreed to in writing, software - 
	distributed under the License is distributed on an "AS IS" BASIS, - WITHOUT 
	WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. - See the 
	License for the specific language governing permissions and - limitations 
	under the License. -->
<!DOCTYPE mycat:server SYSTEM "server.dtd">
<mycat:server xmlns:mycat="http://io.mycat/">
	<user name="root" defaultAccount="true">
		<property name="password">123456</property>
		<property name="schemas">TESTDB</property>
		<property name="defaultSchema">TESTDB</property>
	</user>
</mycat:server>
```

**2、修改schema.xml文件** \(只需要保留这些，多余的可以先删除\)

```xml
<?xml version="1.0"?>
<!DOCTYPE mycat:schema SYSTEM "schema.dtd">
<mycat:schema xmlns:mycat="http://io.mycat/">
        <schema name="TESTDB" checkSQLschema="false" sqlMaxLimit="100" dataNode="dn1">
        </schema>
        <dataNode name="dn1" dataHost="host1" database="msb" />
        <dataHost name="host1" maxCon="1000" minCon="10" balance="0"
                          writeType="0" dbType="mysql" dbDriver="native" switchType="1"  slaveThreshold="100">
                <heartbeat>select user()</heartbeat>
                <writeHost host="hostM1" url="192.168.85.111:3306" user="root"
                                   password="123456">
                        <readHost host="hostS1" url="192.168.85.112:3306" user="root" password="123456"></readHost>
                </writeHost>
        </dataHost>
</mycat:schema>
```

**启动mycat**

​ mycat的启动有两种方式，一种是控制台启动，一种是后台启动，在初学的时候建议大家使用控制台启动的方式，当配置文件写错之后，可以方便的看到错误，及时修改，但是在生产环境中，使用后台启动的方式比较稳妥。

​ 控制台启动：去mycat/bin目录下执行 ./mycat console

​ 后台启动：去mycat/bin目录下执行 ./mycat start

​ 按照如上配置在安装的时候应该不会报错，如果出现错误，根据错误的提示解决即可。

**登录验证**

管理窗口的登录

​ 从另外的虚拟机去登录访问当前mycat，输入如下命令即可

```
mysql -uroot -p123456 -P 9066 -h 192.168.85.111
```

​ 此时访问的是mycat的管理窗口，可以通过show \@\@help查看可以执行的命令

​ 数据窗口的登录

​ 从另外的虚拟机去登录访问mycat，输入命令如下：

```
mysql -uroot -p123456 -P8066 -h 192.168.85.111
```

​ 当都能够成功的时候以为着mycat已经搭建完成。