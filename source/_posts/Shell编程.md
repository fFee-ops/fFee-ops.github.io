---
title: Shell编程
date: 2020-05-16 10:53:06
tags: 
categories: Linux
---

<!--more-->

### Shell编程

- [shell 是什么](#shell__2)
- [Shell 脚本的执行方式](#Shell__6)
- - [脚本的常用执行方式](#_16)
- [shell 的变量](#shell__26)
- - [将命令的返回值赋给变量](#_56)
- [设置环境变量](#_62)
- [位置参数变量](#_84)
- [预定义变量](#_101)
- [运算符](#_111)
- [条件判断](#_134)
- [流程控制](#_177)
- - [if 判断](#if__178)
  - [case 语句](#case__205)
  - [for 循环](#for__224)
  - [while循环](#while_246)
- [read 读取控制台输入](#read__258)
- [函数](#_268)
- - [系统函数](#_269)
  - [自定义函数](#_292)

# shell 是什么

Shell 是一个命令行解释器，它为用户提供了一个向 Linux 内核发送请求以便运行程序的界面系统级程序，用户可以用 Shell 来启动、挂起、停止甚至是编写一些程序.  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516101317588.png)

# Shell 脚本的执行方式

**脚本格式要求**

1.  脚本以#\!/bin/bash 开头
2.  脚本需要有可执行权限

**编写第一个 Shell 脚本**  
创建一个 Shell 脚本，输出 hello world\!  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516101736277.png)

## 脚本的常用执行方式

• 方式 1\(输入脚本的绝对路径或相对路径\)  
1\)首先要赋予 helloworld.sh 脚本的+x 权限  
2\)执行脚本  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516102123776.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
• 方式 2\(sh+脚本\)，不推荐  
说明：不用赋予脚本+x 权限，直接执行即可  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516102133682.png)

# shell 的变量

**Shell 的变量的介绍**  
1）Linux Shell 中的变量分为，系统变量和用户自定义变量。  
2）系统变量：\$ HOME、\$ PWD、\$ SHELL、\$ USER 等等比如： echo \$HOME 等等…  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516102757999.png)  
3）显示当前shell中所有变量：set  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516103824659.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**shell 变量的定义**

• 基本语法  
1\)定义变量：变量=值  
2\)撤销变量：unset 变量  
3\) 声明静态变量：readonly 变量，注意：不能 unset

案例 1：定义变量 A、撤销变量 A

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516104033231.png)

案例2：声明静态的变量 B=2，不能 unset  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516104116281.png)

**定义变量的规则**

1.  变量名称可以由字母、数字和下划线组成，但是不能以数字开头。
2.  等号两侧不能有空格
3.  变量名称一般习惯为大写

## 将命令的返回值赋给变量

1） A=`ls \-la` 反引号（键盘\~），运行里面的命令，并把结果返回给变量 A  
2） A=\$\(ls \-la\) 等价于反引号  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516104247559.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 设置环境变量

**基本语法**

1.  export 变量名=变量值 （功能描述：将 shell 变量输出为环境变量）
2.  source 配置文件 （功能描述：让修改后的配置立即生效）
3.  echo \$变量名 （功能描述：查询环境变量的值）  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051610511737.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**快速入门**

1.  在/etc/profile 文件中定义 TOMCAT\_HOME 环境变量

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516105210908.png)

 2.     查看环境变量 TOMCAT\_HOME 的值

```linux
echo	$TOMCAT_HOME
```

3.  在另外一个 shell 程序中使用 TOMCAT\_HOME  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516105249109.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

_**注意：在输出 TOMCAT\_HOME 环境变量前，需要让其生效  
source /etc/profile**_

# 位置参数变量

**介绍**  
当我们执行一个 shell 脚本时，如果希望获取到命令行的参数信息，就可以使用到位置参数变量，比如 ： ./myshell.sh 100 200 , 这个就是一个执行 shell 的命令行，可以在 myshell 脚本中获取到参数信息

**基本语法**

```
$n （功能描述：n 为数字，$ 0 代表命令本身，$ 1-$ 9 代表第一到第九个参数，十以上的参数，十以上的参数需要用大括号包含，如${10}）
$* （功能描述：这个变量代表命令行中所有的参数，$*把所有的参数看成一个整体）
$@（功能描述：这个变量也代表命令行中所有的参数，不过$@把每个参数区分对待）
$#（功能描述：这个变量代表命令行中所有参数的个数）
```

示例：编写一个 shell 脚本 positionPara.sh ， 在脚本中获取到命令行的各个参数信息  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516124534970.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516124547461.png)

# 预定义变量

**基本介绍**  
就是 shell 设计者事先已经定义好的变量，可以直接在 shell 脚本中使用

**基本语法**  
\$\$ （功能描述：当前进程的进程号（PID））  
\$\! （功能描述：后台运行的最后一个进程的进程号（PID））  
\$？ （功能描述：最后一次执行的命令的返回状态。如果这个变量的值为 0，证明上一个命令正确执行；如果这个变量的值为非 0\<具体是哪个数，由命令自己来决定>，则证明上一个命令执行不正确了。）

# 运算符

**基本语法**

```
1)  $((运算式))或$[运算式]
2)	expr m + n
注意 expr 运算符间要有空格
3)	expr m - n
4)	expr	\*, /, %	乘，除，取余
```

示例：计算（2+3）X4 的值

1.  \$\(\(运算式\)\)  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051612500954.png)
2.  \$\[运算式\]  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516125020429.png)
3.  expr  
    ![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516125032296.png)

---

示例:请求出命令行的两个参数\[整数\]的和  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516125300141.png)

# 条件判断

**•基本语法**  
\[ condition \]（注意 condition 前后要有空格）  
非空返回 true，可使用\$\?验证（0 为 true，>1 为 false\)

例如：

```
[hi]  返回true
[] 返回false
```

\[condition\] \&\& echo OK || echo notok 条件满足，执行后面的语句

**常用判断条件**

```
1)两个整数的比较
= 字符串比较
-lt 小 于
-le 小于等于
-eq 等 于
-gt 大 于
-ge 大于等于
-ne 不等于

2) 按照文件权限进行判断
-r 有读的权限  [ -r  文件  ]
-w 有写的权限
-x 有执行的权限

3)按照文件类型进行判断
-f 文件存在并且是一个常规的文件
-e 文件存在
-d 文件存在并是一个目录

```

案例 1：“ok"是否等于"ok”  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516125637800.png)  
案例 2：23 是否大于等于 22  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516125702602.png)  
案例 3：/root/install.log 目录中的文件是否存在  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516125717758.png)

# 流程控制

## if 判断

```
•	基本语法
if [ 条件判断式 ];then
程序
fi


或者


if [ 条件判断式 ]
then
程序
elif [条件判断式]
 
then
程序
fi

```

**注意事项：（1）\[ 条件判断式 \]，中括号和条件判断式之间必须有空格  
\(2\) 推荐使用第二种方式**  
请编写一个 shell 程序，如果输入的参数，大于等于 60，则输出 “及格了”，如果小于 60,  
则输出 “不及格”  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516125933832.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## case 语句

• 基本语法

```
case $变量名 in
"值 1"）
如果变量的值等于值 1，则执行程序 1
;;
"值 2"）
如果变量的值等于值 2，则执行程序 2
;;
…省略其他分支…
*）
如果变量的值都不是以上的值，则执行此程序
 
;;
esac
```

当命令行参数是 1 时，输出 “周一”, 是 2 时，就输出"周二"， 其它情况输出 “other”  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516130128805.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## for 循环

• 基本语法1：

```
for 变 量 in 值 1 值 2 值 3…
do
程序
done
```

打印命令行输入的参数 【会使用到\$\* \$\@】  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516130409416.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
• 基本语法 2

```
for (( 初始值;循环控制条件;变量变化 ))
do
程序
done


```

从 1 加到 100 的值输出显示  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516130521637.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## while循环

• 基本语法 1

```
while [ 条件判断式 ]
do
程序
done

```

从命令行输入一个数 n，统计从 1+…+ n 的值  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516130646738.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# read 读取控制台输入

**基本语法**  
read\(选项\)\(参数\)  
选项：

\-p：指定读取值时的提示符；  
\-t：指定读取值时等待的时间（秒），如果没有在指定的时间内输入，就不再等待了  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516131813274.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 函数

## 系统函数

**• basename 基本语法**  
功能：返回完整路径最后 / 的部分，常用于获取文件名  
basename \[pathname\] \[suffix\]

basename \[string\] \[suffix\] （功能描述：basename 命令会删掉所有的前缀包括最后一个（‘/’）字符，然后将字符串显示出来。）

选项：  
suffix 为后缀，如果 suffix 被指定了，basename 会将 pathname 或 string 中的 suffix 去掉。

**• dirname 基本语法**  
功能：返回完整路径最后 / 的前面的部分，常用于返回路径部分  
dirname 文件绝对路径 （功能描述：从给定的包含绝对路径的文件名中去除文件名（非目录的部分），然后返回剩下的路径（目录的部分））

---

案例 1：请返回 /home/aaa/test.txt 的 “test.txt” 部分  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516132226684.png)

案例 2：请返回 /home/aaa/test.txt 的 /home/aaa  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200516132247260.png)

## 自定义函数

• 基本语法

```
[ function ] funname[()]
{
 
Action; [return int;]
}
```

调用直接写函数名：funname \[值\]

**计算输入两个参数的和（read）， getSum**

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051613235256.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)