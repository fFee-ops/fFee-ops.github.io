---
title: Mybatis高级部分笔记--1
date: 2020-04-04 20:19:37
tags: 
categories: Mybatis
---

<!--more-->

### Mybatis

- [Springboot中使用Mybatis](#SpringbootMybatis_1)
- - [1.数据库环境切换](#1_3)
  - [2.注解方式](#2_11)
  - [3.增删改的返回值问题](#3_22)
  - [4.事务自动提交](#4_27)
  - [5.自增问题](#5_35)
  - [6.参数问题](#6_92)
  - [7\. 增加的值为null](#7_null_124)
  - [8.返回值为HashMap的情况](#8HashMap_153)
  - [9.鉴别器](#9_198)
  - [10.别名问题](#10_228)
  - [11\. SQL标签](#11_SQL_230)
  - [12.内置参数](#12_275)
  - [13.模糊](#13_287)
  - [14.批量操作DML](#14DML_300)
  - [15.Mybatis架构](#15Mybatis_349)
  - [16.日志](#16_351)
  - [17.PageHelper](#17PageHelper_367)

# Springboot中使用Mybatis

[springboot整合Mybatis](https://www.cnblogs.com/to-red/p/11368292.html)

## 1.数据库环境切换

a.切换 environment （指定实际使用的数据库）  
b.配置 Provider别名  
c.写不同数据库的SQL语句  
d.在mappe.xml中配置databaseId=“Provider别名”

如果mapper.xml的 sql标签 仅有 一个 不带databaseId的标签，则改标签 会自动适应当前数据库。  
如果 既有不带databaseId的标签，又有带databaseId的标签,则程序会优先使用带databaseId的标签

## 2.注解方式

推荐使用xml  
a.将sql语句写在接口的方法上\@Select\(""\) ;  
b.将接口的全类名 写入，让mybatis知道sql语句此时是存储在接口中  
注解/xml都支持批量引入，

```xml
    <mappers>
	<!--以下可以将com.yanqun.mapper 包中的注解接口 和 xml全部一次性引入 -->
          <package name="com.yanqun.mapper" />
      </mappers>
```

## 3.增删改的返回值问题

返回值可以是void、Integer、Long、Boolean  
如何操作：只需要在接口中 修改返回值即可  
不需要在xml文件中修改

## 4.事务自动提交

```
	手动提交：
 sessionFactory.openSession();
 session.commit();
	自动提交：每个dml语句 自动提交
	sessionFactory.openSession(true);
```

## 5.自增问题

_**mysql支持自增**_  
只需要配置两个属性即可：

```xml
useGeneratedKeys="true" keyProperty="stuNo"
<!-- useGeneratedKeys是否开启自增，keyProperty是那一列自增 -->
    <insert id="addStudent"
            parameterType="com.yanqun.entity.Student"  databaseId="mysql" useGeneratedKeys="true" keyProperty="stuNo">
          insert into student(stuName,stuAge,graName)
          values(#{stuName},#{stuAge},#{graName})
 </insert>
```

```sql
create table student
(
   stuno int(4) primary key auto_increment,//auto_increment自增
   stuname varchar(10),
   stuage int(4),
   graname varchar(10)
);
```

_**oracle不支持自增 ：通过序列模拟实现**_  
方式一：before（推荐）

```sql
	create sequence myseq //创建一个序列
		increment by 1 //序列每次自增1
		start with 1;//序列从1开始

通过  <insert>的子标签 <selectKey>实现：
	在 <selectKey>中查询下一个序列（自增后的值），再将此值传入keyProperty="stuNo"属性，最后在真正执行时 使用该属性值。
```

↓

```xml
<insert id="addStudent"
            parameterType="com.yanqun.entity.Student"  databaseId="oracle">
          <selectKey keyProperty="stuNo" resultType="Integer" order="BEFORE">
              select myseq.nextval from dual
          </selectKey>

          insert into student(stuno,stuName,stuAge,graName)
          values(#{stuNo} , #{stuName},#{stuAge},#{graName})
   </insert>	
```

```
方式二：after
```

---

序列自带的两个属性：  
nextval：序列中下一个值  
currval: 当前值

```sql
insert into student values(myseq.nextval,'zs1',23,'a1');
insert into student values(myseq.nextval,'zs2',24,'a2');
insert into student values(myseq.nextval,'zs3',25,'a3');
insert into student values(myseq.nextval,'zs4',26,'a4');
insert into student values(myseq.nextval,'zs5',27,'a5');
```

## 6.参数问题

a.传入多个参数时，不用在mapper.xml中编写parameterType  
异常提示：  
stuNo不能使用。可以使用的是： \[arg3, arg2, arg1, arg0, param3, param4, param1, param2\]

```xml
    <insert ...>
        insert into student(stuno,stuName,stuAge,graName)
        values(#{arg0} , #{arg1},#{arg2},#{arg3})
    </insert>
```

b.命名参数  
可以在接口中通过\@Param\(“sNo”\) 指定sql中参数的名字

```java
	 public abstract Integer addStudent(@Param("sNo") Integer stuNo);
```

```xml
	    <insert...>
      	  insert into student(stuno,...)
       	 values(#{sNo}, ...)
   		 </insert>
```

c.综合使用  
即又有简单类型又有对象类型

```java
Integer addStudent(@Param("sNo")Integer stuNo, @Param("stu")Student student);
```

```xml
<insert id="addStudent"  databaseId="oracle">
      	 insert into student(stuno,stuName,stuAge,graName)
      	 values(#{sNo} , #{stu.stuName},#{stu.stuAge},#{stu.graName})
   </insert>
```

## 7\. 增加的值为null

oracle: 如果插入的字段是Null, 提示错误： Other 而不是null

mysql：如果插入的字段是Null, 可以正常执行（没有约束）

原因：  
各个数据库 在mybatis中 对各种数据类型的 默认值不一致。  
mybatis中，jdbcTypeForNull（如果是null） ，则默认值OTHER。Other来说，MySQL能够处理（NULL）,但是Oracle不行。

解决：  
oracle： null \->OTHER ,需要手工告诉oracle :other \->null

 -    _**a.修改具体的sql标签**_  
  当 某个数据类型oracle无法处理时，告诉它用默认值null；注意，此时设置的jdbcType=NULL不会影响正常的赋值（“zs”）

```xml
    <insert id="addStudent"  databaseId="oracle">
        insert into student(stuno,stuName)
        values(#{stuNo} , #{stuName,jdbcType=NULL}) 
    </insert>
```

 -    _**b.配置 mybatis全局配置文件conf.xml**_

```xml
    <settings>
        <setting name="jdbcTypeForNull" value="NULL"/>
    </settings>
```

null \->jdbcTypeForNull \-> NULL

## 8.返回值为HashMap的情况

```xml
	<select id="queryStudentOutByHashMap"   parameterType="int"
            resultType="HashMap">
         select stuNo "no",stuName "name",stuAge "age"
        from student  where stuNo = #{stuNo}
    </select>
    其中 stuNo是数据库的字段名,“no”是stuNo的别名，
    用于 在map中 get值时使用(作为map的key)。  map.get("no" );
```

如果不加别名，则map的key就是 字段名

```xml
	<select id="queryStudentOutByHashMap"   parameterType="int"
            resultType="HashMap">
         select stuNo,stuName,stuAge 
        from student  where stuNo = #{stuNo}
    </select>
```

思考：  
如何在MAP中存储多个学生并且以 STUNO作为MAP的key，STUNO对应的学生信息作为value。

```
  STUNAME
33	zs  22	
34	ls	22	
45	ww	33		
87	zl	69	
```

即map:  
key:STUNO value:Student

```
程序根据select的返回值 知道map的value就是 Student ,
根据  @MapKey("stuNo")知道 Map的key是stuNo.即在接口对应的方法上面加
上该注解。
```

```java
    @MapKey("STUNO")  //oracle的元数据（字段名、表名 ）都是大写
    HashMap<Integer,Student> queryStudentsByHashMap();
```

```xml
    <select id="queryStudentsByHashMap"
            resultType="HashMap">
         select stuNo ,stuName ,stuAge  from student
    </select>
```

## 9.鉴别器

在resultMap中 还可以使用鉴别器：对相同sql中不同字段值进行判断，从而进行不同的 处理。

```xml
<select id="queryStudentsWithResultMap"
           resultMap ="studentResultMap">
        select sno, sname,nickname, sage, gname from student

   </select>

   <resultMap type="com.yanqun.entity.Student" id="studentResultMap">
       <!--主键 -->
       <id  column="sno" property="stuNo"/>
       <!--普通字段
       <result  column="sname" property="stuName"/> -->
       <result  column="sage" property="stuAge"/>
       <result  column="gname" property="graName"/>

       <!-- 鉴别器  : 对查询结果进行分支处理： 如果是a年级，则真名，如果b年级，显示昵称-->
       <discriminator javaType="string"  column="gname">
           <case value="a" resultType="com.yanqun.entity.Student" >
               <result  column="sname" property="stuName"/>
           </case>

           <case value="b" resultType="student">
               <result  column="nickname" property="stuName"/>
           </case>
       </discriminator>

   </resultMap>
```

## 10.别名问题

如果在批量设置别名时，出现了冲突。可以在出现歧义的类上使用\@Alias\(“XXX”\)区分。

## 11\. SQL标签

```xml
<where>可以处理拼接sql中 【开头】第一个and

<trim>可以处理拼接sql中 【开头或结尾】第一个and
```

```
开头：
	 <trim prefix="where" prefixOverrides="and">
	给拼接的SQL加prefix="where" 
	prefixOverrides="and"，处理拼接SQL中【开头】第一个and

	suffixOverrides="and"，处理拼接SQL中【结尾】最后一个and
```

```xml
 <trim prefix="where" prefixOverrides="and">
               <if  test="stuName != null and stuName !='' ">
                   and stuName like '%${stuName}%'
               </if>
               <if  test="graName != null and graName !='' ">
                   and graName like '%${graName}%'
               </if>
               <if  test="stuAge != null and stuAge !='' ">
                   and stuAge = #{stuAge}
               </if>
             </trim>
---------------------------------------------------------------    
  select * from student
        <trim prefix="where" suffixOverrides="and">

            <bind name="_queryName" value="'%'+stuName+'%'"/>
            <if  test="_parameter.stuName != null and _parameter.stuName !='' ">
                 stuName like #{_queryName} and
            </if>

            <if  test="graName != null and graName !='' ">
                 graName like '%${graName}%' and
            </if>
            <if  test="stuAge != null and stuAge !='' ">
                 stuAge = #{stuAge} and
            </if>

        </trim>
```

```
	prefix	： 拼接
	prefixOverrides：删除 
```

## 12.内置参数

```
_parameter:  代表mybatis的输入参数。
_databaseId: 代表当前数据库的 名字
```

```sql
<select id="queryStudentByNo" resultType="com.yanqun.entity.Student"
            parameterType="int">
        select * from student where stuNo = #{stuNo}
    <!--
      <if test="_databaseId == 'oracle'">
      select * from student where stuNo = #{_parameter}
      </if>
```

## 13.模糊

```txt
	a.   ${}  ：原样输出
			 stuName like '%${stuName}%'
			 
	b.传值时，直接传 
		student.setStuName("%s%");  
		stuName like #{stuName}
		
	c.bind参数
	   <bind name="_queryName" value="'%'+stuName+'%'"/>
	通过bind将传入的stuName进行了处理（增加了%...%）
```

## 14.批量操作DML

_**有BATCH\(推荐\):**_  
需要开启BATCH

```java
sessionFactory.openSession(ExecutorType.BATCH ); //--推荐的写法
```

预编译SQL一次 ，其余DML 只需要设置参数值即可  
insert into student\(stuNo,stuName,stuAge,graName\)  
values\(#\{stuNo\} , #\{stuName\},#\{stuAge\},#\{graName\}\)

_**没有BATCH\(不推荐\)：**_  
预编译N次 ，每次DML都需要 执行完整的SQL  
oracle:批量插入  
a. create table 表 select … from 旧表  
b. insert into 表\(…\) select … from 表 ;  
c. begin …\(DML\)… end ;  
d. 数据泵、SQL Loader 、外部表

以 c. begin …\(DML\)… end ;为例

```
--核心：将SQL拼接成oracle能够执行的SQL   ； collection的参数必须是 collection或List
```

```xml
    <insert id="addStudentOracle"  databaseId="oracle">
          <foreach collection="list" open="begin" close="end ;" item="student">
            insert into student(stuno,stuname) values(#{student.stuNo},#{student.stuName}) ;
          </foreach>
    </insert>
    循环的是整条SQL语句
```

mysql:批量插入  
insert into student\(stuno,stuname\) values\(100,‘zsx’\),\(200,‘lsx’\),\(200,‘lsx’\),\(200,‘lsx’\)… ;

```xml
   <insert id="addStudentMySql"  databaseId="mysql">
          insert into student(stuno,stuname) values
          <foreach collection="list" item="student" separator=","  close=";" >
              (#{student.stuNo},#{student.stuName})
          </foreach>
循环的只有VALUES()里面的部分
    </insert>	
```

_**这种批量插入方式不推荐：**_  
1.没有用到mybatis对批量插入的支持  
2.不适合数据库迁移  
3.如果大量数据，则会将 拼接的SQL语句拉的很长，而部分数据库 对SQL语句的长度有限制。

## 15.Mybatis架构

![Mybatis架构](https://img-blog.csdnimg.cn/20200407123238233.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

## 16.日志

1.引入 log4j-1.2.17jar  
2\. 配置conf.xml

```xml
 <settings>
        <setting name="logImpl" value="LOG4J" />
    </settings>
```

```
3. 日志配置文件log4j.properties   ---一般直接复制
```

```properties
log4j.rootLogger=DEBUG, stdout    
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=%5p [%t] - %m%n
```

## 17.PageHelper

使用步骤  
1、引入JAR包或者Maven依赖  
2、 在 MyBatis 配置 xml 中配置拦截器插件

```xml
<!-- 
    plugins在配置文件中的位置必须符合要求，否则会报错，顺序如下:
    properties?, settings?, 
    typeAliases?, typeHandlers?, 
    objectFactory?,objectWrapperFactory?, 
    plugins?, 
    environments?, databaseIdProvider?, mappers?
-->
<plugins>
    <!-- com.github.pagehelper为PageHelper类所在包名 -->
    <plugin interceptor="com.github.pagehelper.PageInterceptor">
        <!-- 使用下面的方式配置参数，后面会有所有的参数介绍 -->
        <property name="param1" value="value1"/>
	</plugin>
</plugins>
```

3、挑选一种方法使用（这里演示一种推荐的）

```java
//第二种，Mapper接口方式的调用，推荐这种使用方式。
PageHelper.startPage(1, 10);
List<User> list = userMapper.selectIf(1);
```

```java
public static void queryAllWithPageHelper() throws Exception {
		
		Reader reader=Resources.getResourceAsReader("config.xml");
		SqlSessionFactory seesionFactory=new SqlSessionFactoryBuilder().build(reader);
		
		SqlSession session=seesionFactory.openSession(ExecutorType.BATCH);
		StudentMapper mapper=session.getMapper(StudentMapper.class);
		PageHelper.startPage(2, 3);
		List<Student> list = mapper.queryAll();
		for (Student student : list) {
			
			System.out.println(student);
		}
		
		session.close();
	}
```

想要详细使用见说明手册：[PageHelper中文手册](https://github.com/pagehelper/Mybatis-PageHelper/blob/master/wikis/zh/HowToUse.md)

注意：有可能会出现错误

```java
Error parsing SQL Mapper Configuration. Cause: org.apache.ibatis.builder.BuilderException: Error resolving class. Cause: org.apache.ibatis.type.TypeException: Could not resolve type alias 'com.github.pagehelper.PageInterceptor'.  Cause: java.lang.ClassNotFoundException: Cannot find class: com.github.pagehelper.PageInterceptor
```

原因：这是因为在MyBatis中配置了高版本插件引入低版本的jar，则会出现以后错误。  
解决：使用更高版本的PageHelper；

或者以下错误：![在这里插入图片描述](https://img-blog.csdnimg.cn/20200407154245329.png)  
原因:引入高版本jar在MyBatis中配置的插件是低版本的  
解决

```txt
1.将Maven依赖改为版本4
2.将插件配置改为<plugin interceptor="com.github.pagehelper.PageInterceptor"/>
```

---

对应关系：

```xml
<plugins>
	<!-- PageHelper4版本插件配置 -->
	<plugin interceptor="com.github.pagehelper.PageHelper"/>
</plugins>
<!-- PageHelper4版本依赖 -->
<dependency>
	<groupId>com.github.pagehelper</groupId>
	<artifactId>pagehelper</artifactId>
	<version>4.1.6</version>
</dependency>
 
---------------------------------------------------------------------
 
<plugins>
	<!-- PageHelper5版本配置 -->
	<plugin interceptor="com.github.pagehelper.PageInterceptor"/>
</plugins>
<!-- PageHelper5版本依赖 -->
<dependency>
	<groupId>com.github.pagehelper</groupId>
	<artifactId>pagehelper</artifactId>
	<version>5.1.6</version>
</dependency>
```