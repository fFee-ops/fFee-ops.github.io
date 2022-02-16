---
title: Mybatis学习笔记(三)
date: 2020-03-29 12:48:16
tags: 
categories: Mybatis
---

<!--more-->

### 输入输出参数

- [输入参数（parameterType）](#parameterType_1)
- - [#\{\}、\$\{\}的区别](#_3)
  - [\$\{\}、#\{\}相同之处](#_19)
- [输出参数\(resultType\)](#resultType_54)
- - [resultType](#resultType_94)
- [动态SQL](#SQL_117)
- - [For each](#For_each_134)

# 输入参数（parameterType）

## #\{\}、\$\{\}的区别

1.类型为 简单类型（8个基本类型+String）时：  
a.  
#\{任意值\}  
\$\{value\} ，其中的标识符只能是value

b.#\{\}自动给String类型加上’’ （自动类型转换）

\$\{\} 原样输出，但是适合于 动态排序（动态字段）

```sql
动态排序：
select stuno,stuname,stuage  from student  order by ${value} asc
```

c.#\{\}可以防止SQL注入  
\$\{\}不防止

## \$\{\}、#\{\}相同之处

a.都可以 获取对象的值 （嵌套类型对象）  
i.获取对象值：  
模糊查询，方式一：

```sql
select stuno,stuname,stuage  from student where stuage= #{stuAge}  or stuname like #{stuName} 
```

```java
			Student student = new Student();
 			student.setStuAge(24);
 			student.setStuName("%w%");
 			List<Student> students = studentMapper.queryStudentBystuageOrstuName(student) ;//接口的方法->SQL
```

模糊查询，方式二：

```sql
		select stuno,stuname,stuage  from student where stuage= #{stuAge}  or stuname like '%${stuName}%'
		student.setStuName("w");
```

2…类型为 对象类型时：  
#\{属性名\}  
\$\{属性名\}

---

输入对象为HashMap：  
where stuage= #\{stuAge\}

用map中key的值 匹配 占位符#\{stuAge\}，如果匹配成功 就用map的value替换占位符

```java
Map<String,Object> studentMap = new HashMap<>();
 			studentMap.put("stuAge", 24) ;
 			studentMap.put("stuName", "zs") ;
 			
 			List<Student> students = studentMapper.queryStudentBystuageOrstuNameWithHashMap (studentMap) ;//接口的方法->SQL
```

# 输出参数\(resultType\)

1.简单类型（8个基本+String）  
2.输出参数为实体对象类型  
3.输出参数为实体对象类型的集合 ：虽然输出类型为集合，但是resultType依然写 集合的元素类型（resyltType=“Student”）  
4.输出参数类型为HashMap  
–HashMap本身是一个集合，可以存放多个元素，  
但是根据提示发现 返回值为HashMap时 ，查询的结果只能是1个学生（no,name）；  
–>结论：一个HashMap 对应一个学生的多个元素（多个属性） 【一个map，一个学生】  
类似于二维数组  
\{<!-- -->  
\{1,zs,23,xa\}, -一个HashMap对象  
\{2,ls,24,bj\},  
\{3,ww,25,tj\}  
\}  
所以如果想查出多个学生的多个属性应该将Map放入LIST中

```xml
<select id="queryStudentsWithHashMap" resultType="HashMap">
		select stuno "stuNo", stuname  "stuName" from student   
	</select>
```

↓

```java
List<Map<String, Object>> queryStudentsWithHashMap();
```

↓

```java
	public static void queryStudentsWithHashMap() throws Exception {
		Reader reader = Resources.getResourceAsReader("config.xml");//把该配置文件变成对象
		SqlSessionFactory sessionFactory=new SqlSessionFactoryBuilder().build(reader);
		
		SqlSession session = sessionFactory.openSession();
		StudentMapper mapper = session.getMapper(StudentMapper.class);	
		List<Map<String, Object>> stuMaps = mapper.queryStudentsWithHashMap();
		
		System.out.println(stuMaps);
		session.close();
	}
```

---

## resultType

resultMap:实体类的属性、数据表的字段： 类型、名字不同时（stuno,id）  
注意：当属性名 和字段名 不一致时，除了使用resultMap以外，还可以使用resultType+HashMap:

a.resultMap

```xml
	<resultMap type="student" id="queryStudentByIdMap">
			<!-- 指定类中的属性 和 表中的字段 对应关系 -->
			<id property="stuNo"  column="id" />
			<result property="stuName" column="name" />
	</resultMap>
```

b.resultType+HashMap  
select 表的字段名 “类的属性名” from… 来制定字段名 和属性名的对应关系

```xml
	<select id="queryStudentByIdWithHashMap" 	 parameterType="int"	resultType="student" >
		select id "stuNo",name "stuName" from student where id = #{id}
	</select>
```

**_注意: 如果如果10个字段，但发现 某一个字段结果始终为默认值（0，0.0，null），则可能是 表的字段 和 类的属性名字写错。_**

# 动态SQL

```xml
	<select id="queryStuByStunoWithSqltag" resultType="Student" parameterType="Student">
			select stuno,stuname,stuage from Student 
			<where>
			<!-- where 会自动处理第一个and 如果没有输入stuname，则stuage则会自动变为第一个 -->
				<if test="stuName !=null">
					and stuname=#{stuName}
				</if>
				<if test="stuAge !=null">
					and stuage=#{stuAge}
				</if>
				
			</where>
	</select>
```

## For each

例：查询学号为1、2、16的学生信息

ids = \{1,2,16\};

select stuno,stuname from student where stuno in\(1,2,16\) .

```
<foreach>迭代的类型：数组、对象数组、集合、属性(Grade类： List<Integer> ids)
```

属性（Grade）：  
在Grade类中要定义好stuNos来保存学号，并生成set/get方法

```xml
	<select id="queryStuWithGrade"  parameterType="Grade" resultType="Student">
		select * from student
		<where>
		<if test="stuNos	!=null">
			<foreach collection="stuNos" open=" and stuno in (" close=")" item="stuNo" separator=",">
				${stuNo}
			</foreach>
		</if>
		</where>
	</select>
```

```java
	public static void queryStuWithGrade() throws Exception {
		Reader reader = Resources.getResourceAsReader("config.xml");//把该配置文件变成对象
		SqlSessionFactory sessionFactory=new SqlSessionFactoryBuilder().build(reader);
		
		SqlSession session = sessionFactory.openSession();
		StudentMapper mapper = session.getMapper(StudentMapper.class);	
		Grade grade=new Grade();
		List<Integer> stuNos=new ArrayList<Integer>();
		stuNos.add(1);
		stuNos.add(2);
		stuNos.add(16);
		grade.setStuNos(stuNos);
		
		
		List<Student> students = mapper.queryStuWithGrade(grade);
		
		System.out.println(students);
		session.close();
	}
```

数组：

```xml
	<!-- 将多个元素值 放入数组中 int[] stuNos = {1,2,53} -->
	<select id="queryStudentsWithArray"  parameterType="int[]" resultType="student">
	  	select * from student 
	  	<where>
	  		 <if test="array!=null and array.length">
	  		 	<foreach collection="array" open=" and  stuno in (" close=")" 
	  		 		item="stuNo" separator=",">   
	  		 		#{stuNo} 
	  		 	</foreach>
	  		 </if>	  		
	  	</where>
	</select>
```

```java
	public static void queryStudentsWithArray() throws Exception {
		Reader reader = Resources.getResourceAsReader("config.xml");//把该配置文件变成对象
		SqlSessionFactory sessionFactory=new SqlSessionFactoryBuilder().build(reader);
		
		SqlSession session = sessionFactory.openSession();
		StudentMapper mapper = session.getMapper(StudentMapper.class);	
		int[] stuNos= {1,2,16};
		
		List<Student> students = mapper.queryStudentsWithArray(stuNos);
		
		System.out.println(students);
		session.close();
	}
```

简单类型的数组:  
_**_无论编写代码时，传递的是什么参数名\(stuNos\)，在mapper.xml中 必须用array代替该数组_**_

集合\(与数组类似\)：  
_**_无论编写代码时，传递的是什么参数名\(stuNos\)，在mapper.xml中 必须用list代替该数组_**_

---

对象数组：  
Student\[\] students = \{student0,student1,student2\} 每个studentx包含一个学号属性

```xml
<sql id="objectArrayStunos">
		<where>
	  		 <if test="array!=null and array.length>0">
	  		 	<foreach collection="array" open=" and  stuno in (" close=")" 
	  		 		item="student" separator=",">   
	  		 		#{student.stuNo}
	  		 	</foreach>
	  		 </if>
	  	</where>
	</sql>



	<!-- 将多个元素值 放入对象数组中Student[] students = {student0,student1,student2}  每个studentx包含一个学号属性 -->
	<select id="queryStudentsWithObjectArray"  parameterType="Object[]" resultType="student">
	  	select * from student 
	  	<!--如果sql片段和  引用处不在同一个文件中，则需要 在refid 引用时  加上namespace:   namespace.id
	   <include refid="org.lanqiao.mapper.abcMapper.objectArrayStunos"></include> -->
	   <include refid="objectArrayStunos"></include>
	  
	</select>
```

```java
	public static void queryStudentsWithObjectArray() throws Exception {
		Reader reader = Resources.getResourceAsReader("config.xml");//把该配置文件变成对象
		SqlSessionFactory sessionFactory=new SqlSessionFactoryBuilder().build(reader);
		
		SqlSession session = sessionFactory.openSession();
		StudentMapper mapper = session.getMapper(StudentMapper.class);	
		Student stu1=new Student();
		stu1.setStuNo(1);
		Student stu2=new Student();
		stu2.setStuNo(2);
		Student stu16=new Student();
		stu16.setStuNo(16);
		Student[] stus= {stu1,stu2,stu16};
		
		List<Student> students = mapper.queryStudentsWithObjectArray(stus);
		
		System.out.println(students);
		session.close();
	}
```

_**注意的几点**_：

```xml
<select id="queryStudentsWithObjectArray"  parameterType="Object[]" resultType="student">
中的parameterType必须为"Object[]"
------------------------------------------------------------------	 
	 	<foreach collection="array" open=" and  stuno in (" close=")" 
	  		 		item="student" separator=",">   
	  		 		#{student.stuNo}
	  	</foreach>
collection：要遍历的那个集合
open：遍历集合对象以前的
close：遍历集合对象以后的
item：集合中的每个元素，类比java中foreach循环
separator：括号内分隔符
```

_**SQL片段：**_  
java：方法  
数据库：存储过程、存储函数  
Mybatis :SQL片段

a.提取相似代码  
b.引用