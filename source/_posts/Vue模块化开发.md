---
title: Vue模块化开发
date: 2020-11-09 23:30:10
tags: 
categories: Vue
---

<!--more-->

### Vue模块化开发

  
1、全局安装 webpack  
`npm install webpack-g`

2、全局安装vue脚手架  
`npm install \-g @vue/cli-init`

3、初始化vue项目  
`vue init webpack appname`  
Vue脚手架使用 webpack模板初始化一个 appname项目

4、启动vue项目;  
项目的 package json中有 scripts,代表我们能运行的命令  
`npm start= npm run dev`:启动项目

`npm run build`:将项目打包

如果遇到问题[全局安装Vue-cli之后还是提示vue不是内部或外部命令，也不是可运行的程序或批处理文件。](https://blog.csdn.net/qq_21040559/article/details/109588897)

5、如果要整合elementUI就执行`npm i element-ui \-S`

**[elementUI的使用手册](https://element.eleme.cn/#/zh-CN/component/installation)**