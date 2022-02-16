---
title: 注解@Param的用法解析
date: 2020-10-15 21:02:08
tags: 
categories: Mybatis
---

<!--more-->

### \@Param注解的用法解析

- [一.xml形式](#xml_3)
- [二.注解形式](#_42)


在实际的开发中，经常会遇到多个接口参数的情况。在之前的例子中，我们都是将多个参数合并到一个JavaBean中，但是不可能每次都为不同的参数创建一个新的JavaBean，所以需要使用其他方式来传递多个参数，常见的方法有使用Map类型和使用\@param注解。

# 一.xml形式

**实例一 \@Param注解单一属性**  
dao层示例

```java
Public User selectUser(@param(“userName”) String name, @param(“userpassword”) Int password);
```

xml映射对应示例

```xml
<!--使用注解传递参数,这时是不涉及单独一个类型的,所以去掉parameterType属性-->
<select id=" selectUser" resultMap="BaseResultMap">  
    select  *  from user_user_t 
        where user_name = #{userName，jdbcType=VARCHAR} and user_password=#{userPassword,jdbcType=VARCHAR}  
</select>
```

**注意**：采用#\{\}的方式把\@Param注解括号内的参数进行引用（括号内参数对应的是形参如 userName对应的是name）；

> 在这里给参数配置\@param注解后，Mybatis会自动将参数封装成Map类型，而\@param注解的值会成为Map中的key，因此在sql中可以通过配置的注解值来使用参数。

---

**实例二 \@Param注解JavaBean对象**  
dao层示例

```java
/**
* 根据用户ID和角色的enabled状态获取用户角色
* 
* @param user
* @param role
* @return
*/
List<SysRole> selectRolesByUserIdAndRoleEnabled(
		@Param("user")SysUser user,
		@Param("role")SysRole role
);
```

> 可以看到，经过\@param配置后的参数在xml文件的sql中可以直接使用。但是当参数是JavaBean类型时，使用\@param注解后就不能直接使用，而是要通过点取值的方式。  
> 通过这样的方式来传递参数时，在sql语句中需要使用#\{user.id\}和#\{role.enabled\}从两个JavaBean中取出指定属性的值。

# 二.注解形式

**1，使用\@Param注解**

当以下面的方式进行写SQL语句时：

```java
    @Select("select column from table where userid = #{userid} ")
    public int selectColumn(int userid);
```

当你使用了使用\@Param注解来声明参数时，如果使用 #\{\} 或 \$\{\} 的方式都可以。当你不使用\@Param注解来声明参数时，必须使用使用 #\{\}方式

```java
    @Select("select column from table where userid = ${userid} ")
    public int selectColumn(@Param("userid") int userid);
```

> 在动态配置的时候使用到该参数的含义：当只有一个参数，可以使用\@parameter，它就代表了这个参数，如果使用\@Param的话，会使用指定的参数值userid1代替userid。

```java
    @Select("select column from table where userid = ${userid1} ")
    public int selectColumn(@Param("userid1") int userid);
```