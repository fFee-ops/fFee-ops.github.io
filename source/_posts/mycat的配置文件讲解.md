---
title: mycat的配置文件讲解
date: 2021-10-05 16:00:24
tags: 数据库 sql
categories: MyCat
---

<!--more-->

### mycat的配置文件讲解

- [schema.xml文件](#schemaxml_2)
- - - [1、schema标签](#1schema_6)
    - [2、table标签](#2table_20)
    - [3、childTable标签](#3childTable_54)
    - [4、dataNode标签](#4dataNode_68)
    - [5、dataHost标签](#5dataHost_82)
    - [6、heartbeat标签](#6heartbeat_135)
- [server.xml文件](#serverxml_139)
- [rule.xml](#rulexml_179)
- - - [1、tableRule](#1tableRule_182)
    - [2、function](#2function_200)

  
在之前的操作中，我们已经做了部分文件的配置，但是具体的属性并没有讲解，下面我们讲解下每一个配置文件具体的属性以及相关的基本配置。

# schema.xml文件

schema.xml作为mycat中重要地配置文件之一，管理者mycat的逻辑库、表、分片规则、DataNode以及DataSource。

### 1、schema标签

```xml
<schema name="TESTDB" checkSQLschema="false" sqlMaxLimit="100" dataNode="dn1"></schema>
```

​ schema标签用于定义mycat实例中的逻辑库，mycat可以有多个逻辑库，每个逻辑库都有自己相关的配置，可以使用schema标签来划分这些不同的逻辑库。如果不配置schame，那么所有的表配置都将属于同一个默认的逻辑库。

​ **dataNode：** 该属性用于绑定逻辑库到某个具体的database上。

​ **checkSQLschema：** 当该值为true时，如果执行`select * from TESTDB.user`，那么mycat会将语句修改为`select * from user`,即把表示schema的字符去掉，避免发送到后端数据库执行时报错。

​ **sqlMaxLimit：** 当该值设置为某个数值的时候，每次执行的sql语句，如果没有加上limit语句，mycat也会自动加上对应的值。例如，当设置值为100的时候，那么`select * from user`的效果跟执行`select * from user limit 100`相同。如果不设置该值的话，mycat默认会把所有的数据信息都查询出来，造成过多的输出，所以，还是建议设置一个具体的值，以减少过多的数据返回。当然sql语句中可以显式的制定limit的大小，不受该属性的约束。

### 2、table标签

```xml
<table name="travelrecord" dataNode="dn1,dn2,dn3" rule="auto-sharding-long" ></table>
```

​ table标签定义了mycat中的逻辑表，所有需要拆分的表都需要在这个标签中定义。

​ **name：** 定义逻辑表的表名，这个名字就如同创建表的时候指定的表名一样，同个schema标签中定义的名字必须唯一。

​ **dataNode：** 定义这个逻辑表所属的dataNode，该属性的值需要和dataNode标签中的name属性值对应，如果需要定义的dn过多，可以使用如下方法减少配置：

```xml
<table name="travelrecord" dataNode="multipleDn$0-99,multipleDn2$100-199" rule="auto-shardinglong" ></table>
<dataNode name="multipleDn$0-99" dataHost="localhost1" database="db$0-99" ></dataNode>
<dataNode name="multipleDn2$100-199" dataHost="localhost1" database=" db$100-199" ></dataNode>
```

​ **rule：** 该属性用于指定逻辑表要使用的规则名字，规则名字在rule.xml中定义，必须与tableRule标签中的name属性值一一对应

​ **ruleRequired：** 该属性用于指定表是否绑定分片规则，如果配置为true，但没有配置具体rule的话，程序会报错。

​ **primaryKey：** 该逻辑表对应真实表的主键，例如：分片的规则是使用非主键进行分片的，那么在使用主键查询的时候，就会发送查询语句到所有配置的DN上，如果使用该属性配置真实表的主键。那么mycat会缓存主键与具体DN的信息，那么再次使用非主键进行查询的时候就不会进行广播式的查询，就会直接发送语句到具体的DN，但是尽管配置改属性，如果缓存没有命中的话，还是会发送语句给具体的DN来获得数据

​ **type：** 该属性定义了逻辑表的类型，目前逻辑表只有全局表和普通表两种类型。对应的配置：

- 全局表：global

- 普通表：不指定该值为global的所有表

​ **autoIncrement：** mysql 对非自增长主键，使用 last\_insert\_id\(\)是不会返回结果的，只会返回 0。所以，只有定义了自增长主键的表才可以用 last\_insert\_id\(\)返回主键值。mycat 目前提供了自增长主键功能，但是如果对应的 mysql 节点上数据表，没有定义 auto\_increment，那么在 mycat 层调用 last\_insert\_id\(\)也是不会返回结果的。由于 insert 操作的时候没有带入分片键， mycat 会先取下这个表对应的全局序列，然后赋值给分片键。 这样才能正常的插入到数据库中，最后使用 last\_insert\_id\(\)才会返回插入的分片键值。如果要使用这个功能最好配合使用数据库模式的全局序列。使用 autoIncrement=“true” 指定这个表有使用自增长主键，这样 mycat 才会不抛出分片键找不到的异常。使用 autoIncrement=“false” 来禁用这个功能，当然**你也可以直接删除掉这个属性。默认就是禁用的。**

​ **needAddLimit：** 指定表是否需要自动的在每个语句后面加上limit限制。由于使用了分库分表，数据量有时会特别巨大。这时候执行查询语句，如果恰巧又忘记了加上数量限制的话，那么查询所有的数据出来，就会执行很久的时间，所以mycat自动为我们加上了limit 100。当前如果语句中又limit，那么就不会添加了。

### 3、childTable标签

​ childTable标签用于定义ER分片的子表。通过标签上的属性与父表进行关联。

​ **name：** 定义子表的表名

​ **joinKey：** 插入子表的时候会使用这个列的值查找父表存储的数据节点

​ **parentKey：** 属性指定的值一般为与父表建立关联关系的列名。程序首先获取joinkey的值，再通过parentKey属性指定的列名产生查询语句，通过执行该语句得到父表存储再哪个分片上，从而确定子表存储的位置。

​ **primaryKey：** 跟table标签所描述相同

​ **needAddLimit：** 跟table标签所描述相同

### 4、dataNode标签

```xml
<dataNode name="dn1" dataHost="lch3307" database="db1" ></dataNode>
```

​ dataNode标签定义了mycat中的数据节点，也就是我们通常说的数据分片，一个dataNode标签就是一个独立的数据分片。

​ **name：** 定义数据节点的名字，这个名字需要是唯一的，我们需要再table标签上应用这个名字，来建立表与分片对应的关系

​ **dataHost：** 该属性用于定义该分片属于哪个数据库实例，属性值是引用dataHost标签上定义的name属性。

​ **database：** 该属性用于定义该分片属性哪个具体数据库实例上的具体库，

### 5、dataHost标签

​ 该标签定义了具体的数据库实例、读写分离配置和心跳语句

```xml
<dataHost name="localhost1" maxCon="1000" minCon="10" balance="0"
writeType="0" dbType="mysql" dbDriver="native">
<heartbeat>select user()</heartbeat>
<!-- can have multi write hosts -->
<writeHost host="hostM1" url="localhost:3306" user="root"
password="123456">
<!-- can have multi read hosts -->
<!-- <readHost host="hostS1" url="localhost:3306" user="root" password="123456"
/> -->
</writeHost>
<!-- <writeHost host="hostM2" url="localhost:3316" user="root" password="123456"/> -->
</dataHost>
```

​ **name：** 唯一标识dataHost标签，供上层的标签使用

​ **maxcon：** 指定每个读写实例连接池的最大连接

​ **mincon：** 指定每个读写实例连接连接池的最小链接，初始化连接池的大小

​ **balance：** 负载均衡类型：

- 0：不开启读写分离机制，所有读操作都发送到当前可用的writeHost上

- 1：全部的readHost和stand by writeHost参与select语句的负载均衡，简单的说，当双主双从模式（M1->S1,M2->S2,并且M1与M2互为主备），正常情况下，M2,S1,S2都参与select语句的负载均衡

- 2：所有读操作都随机的再writeHost、readHost上分发

- 3：所有读请求随机的分发到writeHost对应readHost执行，writeHost不负担读压力，在之后的版本中失效。

​ **writeType：** 写类型

- writeType=0：所有的写操作发送到配置的第一个writeHost，第一个挂了切换到还生存的第二个writeHost，重启之后以切换后的为准，切换记录保存在配置文件 dnindex.properties

- writeType=1：所有写操作都随机的发送到配置的writeHost，1.5以后**废弃**不推荐

​ **dbType：** 指定后端连接的数据库类型，如MySQL，mongodb,oracle

​ **dbDriver：** 指定连接后端数据库使用的Driver，目前可选的值有native和JDBC。使用native的话，因为这个值执行的是二进制的mysql协议，所以可以使用mysql和maridb，其他类型的数据库则需要使用JDBC驱动来支持。

​ **switchType：** 是否进行主从切换

- \-1：表示不自动切换

- 1：默认值，自动切换

- 2：基于mysql主从同步的状态决定是否切换

### 6、heartbeat标签

​ 这个标签指明用于和后端数据库进行心跳检测的语句。

# server.xml文件

server.xml几乎保存了所有mycat需要的系统配置信息。

```xml
<user name="test">
<property name="password">test</property>
<property name="schemas">TESTDB</property>
<property name="schemas">TESTDB</property>
<property name="schemas">TESTDB</property>
<property name="schemas">TESTDB</property>
<privileges check="false">
    <schema name="TESTDB" dml="0010" showTables="custome/mysql">
        <table name="tbl_user" dml="0110"></table>
        <table name="tbl_dynamic" dml="1111"></table>
    </schema>
    </privileges>
</user>    
```

​ server.xml中的标签本就不多，这个标签主要用于定义登录mycat的用户和权限。

1.  property标签用来声明具体的属性值
2.  name用来指定用户名
3.  password用来修改密码
4.  readonly用来限制用户是否是只读的
5.  schemas用来控制用户课访问的schema，如果有多个的话，用逗号分隔
6.  privileges标签是对用户的schema及下级的table进行精细化的DML控制，privileges节点的check属性适用于标识是否开启DML权限检查，默认false标识不检查，当然不配置等同于不检查。在进行检查的时候，是通过四个二进制位来标识的，insert，update，select，delete按照顺序标识，0表示未检查，1表示要检查

​  
system标签表示系统的相关属性：

| 属性 | 含义 | 备注 |
| --- | --- | --- |
| charset | 字符集设置 | utf8,utf8mb4 |
| defaultSqlParser | 指定的默认解析器 | druidparser，fdbparser\(1.4之后作废\) |
| processors | 系统可用的线程数， | 默认为机器CPU核心线程数 |
| processorBufferChunk | 每次分配socket direct buffer的大小 | 默认是4096个字节 |
| processorExecutor | 指定NIOProcessor共享的businessExecutor固定线程池大小，mycat在处理异步逻辑的时候会把任务提交到这个线程池中 |  |
| sequnceHandlerType | mycat全局序列的类型 | 0为本地文件，1为数据库方式，2为时间戳方式，3为分布式ZK ID生成器，4为zk递增id生成 |

# rule.xml

rule.xml里面就定义了我们对表进行拆分所涉及到的规则定义。我们可以灵活的对表使用不同的分片算法，或者对表使用相同的算法但具体的参数不同，这个文件里面主要有tableRule和function这两个标签。

### 1、tableRule

​ 这个标签被用来定义表规则，定义的表规则在schema.xml文件中

```xml
<tableRule name="rule1">
    <rule>
    	<columns>id</columns>
        <algorithm>func1</algorithm>
    </rule>
</tableRule>    
```

- name属性指定唯一的名字，用来标识不同的表规则
- 内嵌的rule标签则指定对物理表中的哪一列进行拆分和使用什么路由算法
- columns内指定要拆分的列的名字
- algorithm使用function标签中的那么属性，连接表规则和具体路由算法。当然，多个表规则可以连接到同一个路由算法上。

### 2、function

```xml
<function name="hash-int" class="io.mycat.route.function.PartitionByFileMap">
    <property name="mapFile">partition-hash-int.txt</property>
</function>
```

- name指定算法的名字
- class指定路由算法具体的类名字
- property为具体算法需要用到的一些属性