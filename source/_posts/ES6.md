---
title: ES6
date: 2020-11-09 16:16:35
tags: 
categories: 前端
---

<!--more-->

### ES6

- [简介](#_2)
- [一些实例](#_7)
- - [let、const](#letconst_8)
  - [解构表达式](#_66)
  - [函数优化](#_138)
  - [对象优化](#_224)
  - [数组中新增方法：map和reduce](#mapreduce_306)
- [模块化](#_358)

# 简介

ECMAScript6.0（以下简称ES6，ECMAScript是一种由Ecma国际通过ECMA-262标准化的脚本），是JavaScript语言的下一代标准，2015年6月正式发布，从ES6开始的版本号采用年号，如ES2015，就是ES6。ES2016就是ES7。

ECMAScript是**规范**，JS的规范的具体实现。

# 一些实例

## let、const

> 1、var在\{\}之外也起作用  
>   
> 2、let在\{\}不起作用  
>   
> 3、var多次声明同一变量不会报错，let多次声明会报错，只能声明一次。  
>   
> 4、var 会变量提升（打印和定义可以顺序反）。let 不存在变量提升（顺序不能反）  
>   
> 5、let的const声明之后不允许改变，类似java中的final

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
    

    <script>
       // var 声明的变量往往会越域
       // let 声明的变量有严格局部作用域
//         {
//             var a = 1;
//             let b = 2;
//         }
//         console.log(a);  // 1
//         console.log(b);  // ReferenceError: b is not defined

    // var 可以声明多次
            // let 只能声明一次
//         var m = 1
//         var m = 2
//         let n = 3
// //         let n = 4
//         console.log(m)  // 2
//         console.log(n)  // Identifier 'n' has already been declared

        // var 会变量提升
        // let 不存在变量提升
//         console.log(x);  // undefined
//         var x = 10;
//         console.log(y);   //ReferenceError: y is not defined
//         let y = 20;

        
        		// 1. const声明之后不允许改变
                // 2. 一但声明必须初始化，否则会报错
        const a = 1;
        a = 3; //Uncaught TypeError: Assignment to constant variable.
    
    </script>

</body>
</html>

```

## 解构表达式

> 1、支持let arr = \[1,2,3\]; let \[a,b,c\] = arr;即把arr中的值分别赋给a,b,c  
>   
> 2、支持对象解析：const \{ name: abc, age, language \} = person; 冒号代表在person中拿到name再将name的值再传给abc  
>   
> 3、增加了一些字符串函数  
>   
> 4、简化了字符串拼接  
>   
> 5、占位符功能 \$\{\}，即字符串中可以插入变量，表达式等  

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

    <script>
        //数组解构
       /* 原来的写法  
       let arr = [1,2,3];
         let a = arr[0];
        let b = arr[1];
        let c = arr[2];
        */

        // let [a,b,c] = arr; ES6写法
        // console.log(a,b,c)

        const person = {
            name: "jack",
            age: 21,
            language: ['java', 'js', 'css']
        }
        /*      const name = person.name;
                const age = person.age;
              	const language = person.language;*/
			
        //对象解构
        const { name: abc, age, language } = person;
        console.log(abc, age, language);

        //4、字符串扩展
        let str = "hello.vue";
        console.log(str.startsWith("hello"));//true
        console.log(str.endsWith(".vue"));//true
        console.log(str.includes("e"));//true
        console.log(str.includes("hello"));//true

        //字符串模板
        let ss = `<div>
                    <span>hello world<span>
                </div>`;
        console.log(ss);

        //  // 2、字符串插入变量和表达式。变量名写在 ${} 中，${} 中可以放入 JavaScript 表达式。

        function fun() {
            return "这是一个函数"
        }

        let info = `我是${abc}，今年${age + 10}了, 我想说： ${fun()}`;
        console.log(info);

    </script>
</body>
</html>

```

## 函数优化

> 1、原来想要函数默认值得这么写b = b || 1; 现在可以直接写了  
> function add\(a, b = 1\) \{\}  
>   
> 2、函数不定参数function fun\(…values\) \{\}  
>   
> 3、支持箭头函数（lambda表达式），还支持使用\{\}结构传入对象的成员  

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

    <script>
        //在ES6以前，我们无法给一个函数参数设置默认值，只能采用变通写法：
        function add(a, b) {
            // 判断b是否为空，为空就给默认值1
            b = b || 1;
            return a + b;
        }
        // 传一个参数
        console.log(add(10));


        //现在可以这么写：直接给参数写上默认值，没传就会自动使用默认值
        function add2(a, b = 1) {
            return a + b;
        }
        console.log(add2(20));


        //2）、不定参数
        function fun(...values) {
            console.log(values.length)
        }
        fun(1, 2)      //2
        fun(1, 2, 3, 4)  //4

        //3）、箭头函数
        //以前声明一个方法
        // var print = function (obj) {
        //     console.log(obj);
        // }
        var print = obj => console.log(obj);
        print("hello");

        var sum = function (a, b) {
            c = a + b;
            return a + c;
        }

        var sum2 = (a, b) => a + b;
        console.log(sum2(11, 12));

        var sum3 = (a, b) => {
            c = a + b;
            return a + c;
        }
        console.log(sum3(10, 20))


        const person = {
            name: "jack",
            age: 21,
            language: ['java', 'js', 'css']
        }

        function hello(person) {
            console.log("hello," + person.name)
        }

        //箭头函数+解构
        var hello2 = ({name}) => console.log("hello," +name);
        hello2(person);

    </script>
</body>
</html>

```

## 对象优化

> 1、可以获取map的键值对等Object.keys\(\)、values、entries  
>   
> 2、Object.assgn\(target,source1,source2\) 合并  
>   
> 3、const person2 = \{ age, name \}//声明对象简写  
>   
> 4、…代表取出该对象所有属性拷贝到当前对象。let someone = \{ …p1 \}  

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
    <script>
        const person = {
            name: "jack",
            age: 21,
            language: ['java', 'js', 'css']
        }

        console.log(Object.keys(person));//["name", "age", "language"]
        console.log(Object.values(person));//["jack", 21, Array(3)]
        console.log(Object.entries(person));//[Array(2), Array(2), Array(2)]

        const target = { a: 1 };
        const source1 = { b: 2 };
        const source2 = { c: 3 };

        //{a:1,b:2,c:3}
        Object.assign(target, source1, source2);

        console.log(target);//["name", "age", "language"]

        //2）、声明对象简写
        const age = 23
        const name = "张三"
        const person1 = { age: age, name: name }

        const person2 = { age, name }//声明对象简写
        console.log(person2);

        //3）、对象的函数属性简写
        let person3 = {
            name: "jack",
            // 以前：
            eat: function (food) {
                console.log(this.name + "在吃" + food);
            },
            //箭头函数this不能使用，对象.属性
            eat2: food => console.log(person3.name + "在吃" + food),
            eat3(food) {
                console.log(this.name + "在吃" + food);
            }
        }

        person3.eat("香蕉");
        person3.eat2("苹果")
        person3.eat3("橘子");

        //4）、对象拓展运算符

        // 1、拷贝对象（深拷贝）
        let p1 = { name: "Amy", age: 15 }
        let someone = { ...p1 }
        console.log(someone)  //{name: "Amy", age: 15}

        // 2、合并对象
        let age1 = { age: 15 }
        let name1 = { name: "Amy" }
        let p2 = {name:"zhangsan"}
        p2 = { ...age1, ...name1 } 
        console.log(p2)
    </script>
</body>

</html>

```

## 数组中新增方法：map和reduce

> 1、**map：** arr = arr.map\(item=> item\*2\);（将数组arr中的值乘以2后又放回数组）  
>   
> 2、**reduce：** arr.reduce\(\(原来的值,处理后的值即return的值\)=>\{\}  
> reduce\(\) 为数组中的每一个元素依次执行回调函数，不包括数组中被删除或从未被赋值的元素  

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
    
    <script>
        //数组中新增了map和reduce方法。
        //map()：接收一个函数，将原数组中的所有元素用这个函数处理后放入新数组返回。
         let arr = ['1', '20', '-5', '3'];
         
        //  arr = arr.map((item)=>{
        //     return item*2
        //  });
         arr = arr.map(item=> item*2);

        

         console.log(arr);
        //reduce() 为数组中的每一个元素依次执行回调函数，不包括数组中被删除或从未被赋值的元素
        //[2, 40, -10, 6]
        //arr.reduce(callback,[initialValue])
        
       /**
     1、previousValue （上一次调用回调返回的值，或者是提供的初始值（initialValue））
    2、currentValue （数组中当前被处理的元素）
    3、index （当前元素在数组中的索引）
    4、array （调用 reduce 的数组）*/
        let result = arr.reduce((a,b)=>{
            console.log("上一次处理后："+a);
            console.log("当前正在处理："+b);
            return a + b;
        },100);
        console.log(result)

    
    </script>
</body>
</html>

```

# 模块化

模块化就是把代码进行拆分，方便重复利用。类似于java中的导包，而JS换了个概念，是导模块。

模块功能主要有两个命令构成 export 和import  
`1、export用于暴露模块的对外接口`  
`2、import用于导入其他模块提供的功能`

**user.js**

```js
var name = "jack"
var age = 21
function add(a,b){
    return a + b;
}

export {name,age,add}

```

**hello.js**

```js
// export const util = {
//     sum(a, b) {
//         return a + b;
//     }
// }

export default {
    sum(a, b) {
        return a + b;
    }
}
// export {util}

//`export`不仅可以导出对象，一切JS变量都可以导出。比如：基本类型变量、函数、数组、对象。

```

**main.js**

```js
import abc from "./hello.js"
import {name,add} from "./user.js"

abc.sum(1,2);
console.log(name);
add(1,3);

```