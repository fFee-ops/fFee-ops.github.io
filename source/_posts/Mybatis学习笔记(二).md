---
title: Mybatis学习笔记(二)
date: 2020-03-27 12:50:01
tags: 
categories: Mybatis
---

<!--more-->

### mapper动态代理方式的crud （MyBatis接口开发）

- [具体实现的步骤：](#_14)
- [优化：](#_46)
- [类型处理器（类型转换器）：](#_74)
- - [自定义MyBatis类型处理器](#MyBatis_89)

  
原则：约定优于配置

硬编码方式  
abc.java  
Configuration conf = new Configuration\(\);  
con.setName\(“myProject”\) ;

配置方式：  
abc.xml  
myProject

约定：默认值就是myProject，如果再要修改可以使用配置方式或者硬编码方式进行修改。

# 具体实现的步骤：

```
1.基础环境
2.（不同之处）
	约定的目标： 省略掉statement,即根据约定 直接可以定位出SQL语句

  a.接口，接口中的方法必须遵循以下约定：
		 *1.方法名和mapper.xml文件中标签的name值相同
		 * 2.方法的 输入参数 和mapper.xml文件中标签的 parameterType类型一致 (如果mapper.xml的标签中没有 parameterType，则说明方法没有输入参数)
		 * 3.方法的返回值  和mapper.xml文件中标签的 resultType类型一致 （无论查询结果是一个 还是多个（student、List<Student>），在mapper.xml标签中的resultType中只写 一个（Student）；如果没有resultType，则说明方法的返回值为void）

除了以上约定，要实现 接口中的方法  和  Mapper.xml中SQL标签一一对应，还需要以下1点：
	namespace的值 ，就是  接口的全类名（ 接口 - mapper.xml 一一对应）

	
匹配的过程：（约定的过程）
1.根据 接口名 找到 mapper.xml文件（根据的是namespace=接口全类名）
2.根据 接口的方法名 找到 mapper.xml文件中的SQL标签 （方法名=SQL标签Id值）

以上2点可以保证： 当我们调用接口中的方法时，
程序能自动定位到 某一个Mapper.xml文件中的sqL标签


	 
以上，可以通过接口的方法->SQL语句

执行：
		StudentMapper studentMapper = session.getMapper(StudentMapper.class) ;
		studentMapper.方法();

通过session对象获取接口（session.getMapper(接口.class);），再调用该接口中的方法，程序会自动执行该方法对应的SQL。
```

注意：SQL映射文件（mapper.xml） 和 接口放在同一个包中 （注意修改conf.xml中加载mapper.xml文件的路径），为了确保接口能根据全类名找到对应的xml文件。

# 优化：

1.可以将配置信息 单独放入 db.properties文件中，然后再动态引入  
db.properties：  
k=v

```
  	<configuration>
	<properties  resource="db.properties"/>
```

引入之后，使用\$\{key\}来代替之前的url 等等.

2.MyBatis全局参数  
在conf.xml中设置

```
<settings>
		<setting name="cacheEnabled" value="false"  />
		<setting name="lazyLoadingEnabled" value="false"  />
</settings>
```

但是一般不要动。  
![一些全局参数](https://img-blog.csdnimg.cn/20200328111734985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
3.别名

```
<typeAliases>
	<!-- 单个别名 （别名 忽略大小写） -->
	<!-- <typeAlias type="org.lanqiao.entity.Student" alias="student"/> -->
	<!--  批量定义别名  （别名 忽略大小写），以下会自动将该包中的所有类 批量定义别名： 别名就是类名（不带包名，忽略大小写）   -->
	<package name="org.lanqiao.entity"/>
</typeAliases>
```

![Mybatis内置别名](https://img-blog.csdnimg.cn/20200328111918534.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# 类型处理器（类型转换器）：

1.MyBatis自带一些常见的类型处理器  
int \- number  
2.自定义MyBatis类型处理器  
java \-数据库\(jdbc类型\)  
示例：  
实体类Student : boolean stuSex  
true:男  
false：女

表student： number stuSex  
1:男  
0：女  
通俗的解释就是在java程序中输入true/false，但是通过类型处理器后数据库中存放的相应的数据为1/0。

## 自定义MyBatis类型处理器

自定义类型转换器（boolean \-number）步骤：  
a.创建转换器：需要实现TypeHandler接口  
通过阅读源码发现，此接口有一个实现类 BaseTypeHandler ，因此 要实现转换器有2种选择：（一般选择第二种比较简单）  
i.实现接口TypeHandler接口  
ii.继承BaseTypeHandler  
b.配置conf.xml

示例：  
首先创建一个converter

```java
package org.cduck.converter;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

//BaseTypeHandler<java类型>
public class BooleanAndIntConverter extends BaseTypeHandler<Boolean>{

	//java(boolean)-DB(number)
	/*
	 * ps:PreparedStatement对象
	 * i：PreparedStatement对象操作参数的位置
	 * parameter:java值
	 * jdbcType：jdbc操作的数据库类型
	 */
	@Override
	public void setNonNullParameter(PreparedStatement ps, int i, Boolean parameter, JdbcType jdbcType)
			throws SQLException {
			if(parameter) {
				//1
				ps.setInt(i, 1); 
			}else {
//				0
				ps.setInt(i, 0); 
			}
	}

	//db(number)->java(boolean)
	@Override
	public Boolean getNullableResult(ResultSet rs, String columnName) throws SQLException {
		int sexnum = rs.getInt(columnName) ;//rs.getInt("stuno") ;
//		if(sexnum == 1)
//		
//			return true;
//		else {
//			return false ;
//		}
		return sexnum == 1?true:false ;
	}

	@Override
	public Boolean getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
		int sexnum = rs.getInt(columnIndex) ;//rs.getInt(1)
		return sexnum == 1?true:false ;
	}

	@Override
	public Boolean getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
		int sexnum = cs.getInt(columnIndex) ;//rs.getInt(1)
		return sexnum == 1?true:false ;
	}

}
```

然后在config.xml中进行配置

```xml
<typeHandlers>
		<typeHandler handler="org.cduck.converter.BooleanAndIntConverter" javaType="Boolean" jdbcType="INTEGER"/>
	</typeHandlers>
```

再去StudentMapper.xml去写SQL语句等（这里以使用转换器查询单个学生为例）

```xml
 <!-- resultMap可以实现2个功能：
1.类型转换
2.属性-字段的映射关系
		resultMap:类中属性 和表中字段无法合理识别（Boolean->1）
		resultType：类中属性 和表中字段可以合理识别（string->VARCHAR）
		 -->
 <select id="queryStudentByStunoWithConverter" resultMap="StudentResult" parameterType="int">
			select * from Student where stuNO = #{stuNO}
	</select>
 <resultMap type="student" id="StudentResult">
		 <!-- 分为主键和非主键 -->
		 	<id property="stuNo" column="stuno" />
		 	<result property="stuName" column="stuname"/>
		 	<result property="stuAge" column="stuage"/>
		 	<result property="graName" column="graname"/>
		 	<result property="stusex" column="stusex" javaType="Boolean" jdbcType="INTEGER"/>
		 </resultMap> 
```

再去操作Mybatis的接口（SstudentMapper中去写出方法）

```java
		public interface StudentMapper {
		/**
		 * 		1、方法名和mapper.xml中的标签name值相同
		 * 		2、方法的输入参数类型和mapper.xml中的标签parameterType相同
		 * 		3、返回值同理
		 */
			
			void addStudentWithConverter();
			
		}
```

最后一步就是去Test类中进行测试

```java
	public static void queryStudentBystunoWithConverter() throws Exception {
		Reader reader = Resources.getResourceAsReader("config.xml");//把该配置文件变成对象
		SqlSessionFactory sessionFactory=new SqlSessionFactoryBuilder().build(reader);
		
		SqlSession session = sessionFactory.openSession();
		StudentMapper mapper = session.getMapper(StudentMapper.class);	
		Student student = mapper.queryStudentByStunoWithConverter(1);
		
		System.out.println(student);
		session.close();
	}
	
```