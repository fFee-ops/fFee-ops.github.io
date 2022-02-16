---
title: Vue 组件化开发
date: 2020-11-09 16:52:46
tags: 
categories: Vue
---

<!--more-->

### Vue 组件化开发

- [什么叫做组件化](#_2)
- [实例](#_31)

# 什么叫做组件化

所谓组件化，就是把页面拆分成多个组件**然后可重复利用**，每个组件依赖的 CSS、JS、模板、图片等资源放在一起开发和维护。  
因为组件是资源独立的，所以组件在系统内部可复用，组件和组件之间可以嵌套，如果项目比较复杂，可以极大简化代码量，并且对后期的需求变更和维护也更加友好。

`通常一个应用会以一棵嵌套的组件树的形式来组织：`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201109164934579.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
例如，你可能会有页头、侧边栏、内容区等组件，每个组件又包含了其它的像导航链接、博文之类的组件。为了能在模板中使用，这些组件必须先注册以便 Vue 能够识别。这里有两种组件的注册类型：**全局注册**和**局部注册。**

**全局注册**

```js
Vue.component('my-component', {
  // 选项
})
```

**局部注册**

```js
import HelloWorld from './components/HelloWorld'

export default {
  components: {
    HelloWorld
  }
}
```

区别：全局组件是挂载在 Vue.options.components 下，而局部组件是挂载在 vm.\$options.components 下，这也是全局注册的组件能被任意使用的原因。

# 实例

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

<body>

    <div id="app">
        <button v-on:click="count++">我被点击了 {{count}} 次</button>

        <counter></counter>
        <counter></counter>
        <counter></counter>
        <counter></counter>
        <counter></counter>

        <button-counter></button-counter>
    </div>
    <script src="../node_modules/vue/dist/vue.js"></script>


    <script>
        //1、全局声明注册一个组件
        Vue.component("counter", {
            template: `<button v-on:click="count++">我被点击了 {{count}} 次</button>`,
            data() {//在组件模块中data一般写为函数的形式
                return {
                    count: 1
                }
            }
        });

        //2、局部声明一个组件
        const buttonCounter = {
            template: `<button v-on:click="count++">我被点击了 {{count}} 次~~~</button>`,
            data() {
                return {
                    count: 1
                }
            }
        };

        new Vue({
            el: "#app",
            data: {
                count: 1
            },
            components: {
                'button-counter': buttonCounter
            }
        })
    </script>
</body>

</html>

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201109165236549.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)