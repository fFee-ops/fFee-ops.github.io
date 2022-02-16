---
title: Vue.js快速入门
date: 2020-11-04 23:53:21
tags: 
categories: Vue
---

<!--more-->

### Vue.js快速入门

- [简介](#_2)
- [Vue基础](#Vue_8)
- - [el挂载点](#el_9)
  - [data数据对象](#data_22)
- [本地应用](#_27)
- - [v-text](#vtext_32)
  - [v-html](#vhtml_38)
  - [v-on基础](#von_44)
  - [v-show](#vshow_50)
  - [v-if](#vif_56)
  - [v-bind](#vbind_62)
  - [v-for](#vfor_71)
  - [v-on补充](#von_77)
  - [v-model](#vmodel_83)
- [网络应用](#_92)
- - [axios](#axios_94)
  - [axios+vue](#axiosvue_102)
- [一些demo](#demo_110)

# 简介

- JS框架
- 简化Dom操作
- 响应式数据驱动

# Vue基础

## el挂载点

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104233858560.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104233910728.png#pic_center)  
**Vue实例的作用范围是什么呢？**  
Vue会管理el选项命中的元素及其内部的**后代元素**

**是否可以使用其他的选择器？**  
可以使用其他的选择器,但是建议使用ID选择器，**因为id是唯一的**

**是否可以挂载其他的dom元素呢？**  
可以使用其他的双标签,不能使用HTML和BODY  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234206556.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## data数据对象

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234224603.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234236178.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234247920.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 本地应用

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234321996.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234326580.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234332306.png#pic_center)

## v-text

设置标签的文本值\(textContent\)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234426318.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/202011042344298.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234454951.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## v-html

设置标签的innerHTML，如果有\< a >这些，它会解析后然后展示出来，而不是原样输出  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234529374.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020110423453317.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234626834.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## v-on基础

为元素绑定事件  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234650855.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234653279.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234708813.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## v-show

根据表达值的真假,切换元素的显示和隐藏  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234750700.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020110423475386.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234814555.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## v-if

根据表达值的真假,切换元素的显示和隐藏  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104234836565.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/202011042348395.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104235209974.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## v-bind

设置元素的属性\(比如:src,title,class\)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104235249993.png#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104235234881.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020110423523884.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104235258736.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## v-for

根据数据生成列表结构  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124608332.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124611116.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124655904.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## v-on补充

[传递自定义参数,事件修饰符](https://cn.vuejs.org/v2/api/#v-on)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124749460.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124751960.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124820707.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## v-model

**获取**和设置表单元素的值\(双向数据绑定\)，一般用来接收用户输入的值  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124914432.png#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124916563.png#pic_center)  
如果input中的值更新了，那么data中的message也会更新

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105124927599.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 网络应用

## axios

功能强大的网络请求库：[文档](https://github.com/axios/axios)

```js
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105125121459.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105125152326.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

## axios+vue

axios如何结合vue开发网络应用  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105125302425.png#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105125538293.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201105125322435.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)

# 一些demo

[Github地址\~](https://github.com/fFee-ops/Vue.jsQuickStart)