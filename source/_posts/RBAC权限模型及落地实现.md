---
title: RBAC权限模型及落地实现
date: 2021-02-11 18:35:20
tags: 
categories: Shiro
---

<!--more-->

### RBAC权限模型及落地实现

- [RBAC权限模型](#RBAC_2)
- [落地实现](#_21)

# RBAC权限模型

**概念：** 基于角色的权限管理\(Role- Based access contro\)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210211181906687.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
比如在项目中有一些对象：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210211181522713.png)  
然后有一些行为，存放在行为表中：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210211181609271.png)  
那么，操作和对象组合起来就是权限，存储在权限表中：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210211181643288.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

> 比如id为`1`的权限概念为：允许添加用户

然后把权限分配给角色，我们用户只需要关联角色就行了。比如平常电脑的普通用户，超级管理员就是两个不同的角色，拥有不同的权限。

**角色表：**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210211181956805.png)  
**用户表:**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210211182013838.png)

# 落地实现

一般选择使用Shiro来实现权限认证。Shiro每次验证权限之前，都要执行授权方法，把用户具有的权限封装成权限对象，然后放行请求。接下来Web方法的`@RequiresPermissions`注解，会从权限对象中提取权限数据，跟要求的权限作比较。如果用户具有该Web方法要求的权限，那么Web方法就会正常执行。反之则返回异常消息。

比如在`小白在线办公系统`中的流程就是这样的：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210211183243327.png)

①有需求，添加用户这个功能只有超级管理员才可以使用，也即角色root或者拥有添加用户权限的角色才可以操作这个功能。

②在小程序登录的时候，会根据userid获取到对应用户的权限列表，并且存储在本地。

③然后登录成功后，shiro都会进行权限验证，如果有这个权限就可以让用户看到这个模块的入口。

我们只需要在后端web方法中加上相应的注解就行了。

```java
    @PostMapping("/addUser")
    @ApiOperation("添加用户")
    @RequiresPermissions(value = {"ROOT", "USER:ADD"}, logical = Logical.OR)
    public R addUser() {
        return R.ok("用户添加成功");
    }
```