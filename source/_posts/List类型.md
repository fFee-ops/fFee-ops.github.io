---
title: List类型
date: 2020-08-05 15:21:13
tags: 
categories: Redis
---

<!--more-->

### \~\~

- [常用命令](#_6)
- [应用场景](#_87)
- [RedisTemplate操作List](#RedisTemplateList_108)

  
List类型是一个链表结构的集合，其主要功能有push、pop、获取元素等。更详细的说，List类型是一个双端链表的节点，可以通过相关的操作进行集合的头部或者尾部添加和删除元素。  
  
按照插入顺序排序。你可以添加一个元素到列表的头部（左边）或者尾部（右边）一个列表最多可以包含 232- 1 个元素 \(4294967295, 每个列表超过40亿个元素\) 类似JAVA中的LinkedList

# 常用命令

**赋值**

```sql
赋值语法：
LPUSH key value1 [value2] :将一个或多个值插入到列表头部(从左侧添加)

RPUSH key value1 [value2] :在列表中添加一个或多个值(从右侧添加)

LPUSHX key value :将一个值插入到已存在的列表头部。如果列表不在，操作无效

RPUSHX key value :一个值插入已存在的列表尾部(最右边)。如果列表不在，操作无效。
```

**取值**

```sql
取值语法：
LLEN key :获取列表长度

LINDEX key index :通过索引获取列表中的元素

LRANGE key start stop :获取列表指定范围内的元素
```

返回列表中指定区间内的元素，区间以偏移量 START 和 END 指定。  
其中 0 表示列表的第一个元素， 1 表示列表的第二个元素，以此类推。  
也可以使用负数下标，以 \-1 表示列表的最后一个元素， \-2 表示列表的倒数第二个元素，以此类推。  
例如：查看某list中的所有值，LRANGE key 0 \-1

---

**删除**

```sql
删除语法：
LPOP key 移出并获取列表的第一个元素(从左侧删除)

RPOP key 移除列表的最后一个元素，返回值为移除的元素(从右侧删除)

BLPOP key1 [key2 ] timeout 移出并获取列表的第一个元素， 如果列表没有元素会阻塞列表直到等待超时或发
现可弹出元素为止。
实例:
redis 127.0.0.1:6379> BLPOP list1 100
在以上实例中，操作会被阻塞，如果指定的列表 key list1 存在数据则会返回第一个元素，否则在等待100秒后会返回
nil



BRPOP key1 [key2 ] timeout :移出并获取列表的最后一个元素， 如果列表没有元素会阻塞列表直到等待超时或
发现可弹出元素为止。

LTRIM key start stop :对一个列表进行修剪(trim)，就是说，让列表只保留指定区间内的元素，不在指定区
间之内的元素都将被删除。
```

**修改**

```sql
修改语法：
LSET key index value :通过索引设置列表元素的值

LINSERT key BEFORE|AFTER world value :在列表的元素前或者后插入元素 描述：将值 value 插入到列表key 当中，位于值 world 之前或之后。
```

**高级语法**

```sql
高级语法：
RPOPLPUSH source destination :移除列表的最后一个元素，并将该元素添加到另一个列表并返回

示例描述：
RPOPLPUSH a1 a2 :a1的最后元素移到a2的左侧

RPOPLPUSH a1 a1 :循环列表，将最后元素移到最左侧

BRPOPLPUSH source destination timeout :从列表中弹出一个值，将弹出的元素插入到另外一个列表中并返回它； 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。
```

# 应用场景

**项目常应用于：1、对数据量大的集合数据删减 2、任务队列**

**1、对数据量大的集合数据删减** 列表数据显示、关注列表、粉丝列表、留言评价等…分页、热点新闻（Top5\)等 利用  
LRANGE还可以很方便的实现分页的功能,在博客系统中，每片博文的评论也可以存入一个单独的list中。

**2、任务队列** \(list通常用来实现一个消息队列，而且可以确保先后顺序，不必像MySQL那样还需要通过ORDER BY来  
进行排序\)

任务队列介绍\(生产者和消费者模式\)： 在处理Web客户端发送的命令请求时，某些操作的执行时间可能会比我们预期的更长一些，通过将待执行任务的相关信 息放入队列里面，并在之后对队列进行处理，用户可以推迟执行那些需要一段时间才能能完成的操作，这种将工作交给任务 处理器来执行的做法被称为任务队列（task queue）。 RPOPLPUSH source destination 移除列表的最后一个元素，并将该元素添加到另一个列表并返回

# RedisTemplate操作List

```java
/**
* @ClassName ListCacheServiceImpl
* @Description TODO
* @Author guoweixin
* @Version 1.0
*/
@Service("listCacheService")
public class ListCacheServiceImpl implements ListCacheService {
private final static Logger log = LoggerFactory.getLogger(ListCacheServiceImpl.class);
@Autowired
private RedisTemplate<String, Object> redisTemplate;
/**
* 将list放入缓存
* @param key 键
* @param value 值
* @return true 成功 false 失败
*/
public boolean lpushAll(String key, List <Object> value) {
try {
redisTemplate.opsForList().leftPushAll(key, value);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 将list放入缓存
* @param key 键
* @param value 值
* @param time 时间(秒)
* @return true 成功 false 失败
*/
public boolean lpushAll(String key, List <Object> value, long time) {
try {
redisTemplate.opsForList().leftPushAll(key, value);
if (time > 0) {
expire(key, time);
}
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 将list放入缓存
* @param key 键
* @param value 值
* @return true 成功 false 失败
*/
public boolean rpushAll(String key, List <Object> value) {
try {
redisTemplate.opsForList().rightPushAll(key, value);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 将list放入缓存
* @param key 键
* @param value 值
* @param time 时间(秒)
* @return true 成功 false 失败
*/
public boolean rpushAll(String key, List <Object> value, long time) {
try {
redisTemplate.opsForList().rightPushAll(key, value);
if (time > 0)
expire(key, time);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 在变量左边添加元素值。
* @param key 键
* @param object 值
* @return true 成功 false 失败
*/
@Override
public Boolean lpush(String key, Object object) {
try {
redisTemplate.opsForList().leftPush(key, object);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 把最后一个参数值放到指定集合的第一个出现中间参数的前面，如果中间参数值存在的话。
* @param key 键
* @param pivot 中间参数
* @param object 要放的值
* @return 成功 true 失败 false
*/
@Override
public Boolean lpush(String key, Object pivot, Object object) {
try {
redisTemplate.opsForList().leftPush(key,pivot,object);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 集合中第一次出现第二个参数变量元素的右边添加第三个参数变量的元素值。
* @param key 键
* @param pivot 中间参数
* @param object 要放的值
* @return 成功 true 失败 false
*/
@Override
public Boolean rpush(String key, Object pivot,Object object) {
try {
redisTemplate.opsForList().rightPush(key,pivot,object);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 向集合最右边添加元素。
* @param key 键
* @param object 值
* @return 成功 true 失败 false
*/
@Override
public Boolean rpush(String key, Object object) {
try {
redisTemplate.opsForList().rightPush(key, object);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 在变量左边添加元素值。
* @param key 键
* @param expireTime 超时时间
* @param objects 值
* @return 成功 true 失败 false
*/
@Override
public Boolean lpush(String key, int expireTime, Object... objects) {
try {
redisTemplate.opsForList().leftPush(key,objects);
if (expireTime > 0) {
expire(key, expireTime);
}
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 在变量右边添加元素值。
* @param key 键
* @param expireTime 超时时间
* @param objects 值
* @return 成功 true 失败 false
*/
@Override
public Boolean rpush(String key, int expireTime, Object... objects) {
try {
redisTemplate.opsForList().rightPush(key,objects);
if (expireTime > 0) {
expire(key, expireTime);
}
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 如果存在集合则向左边添加元素，不存在不加
* @param key 键
* @param object 值
* @return 成功 true 失败 false
*/
public boolean lPushIfPresent(String key, Object object){
try {
redisTemplate.opsForList().leftPushIfPresent(key,object);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 如果存在集合则向右边添加元素，不存在不加
* @param key 键
* @param object 返回
* @return 成功 true 失败 false
*/
public boolean rPushIfPresent(String key, Object object){
try {
redisTemplate.opsForList().rightPushIfPresent(key,object);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 移除集合中的左边第一个元素
* @param key 键
* @return 返回右边的第一个元素
*/
@Override
public Object lpop(String key) {
return redisTemplate.opsForList().leftPop(key);
}
/**
* 移除集合中右边的元素。一般用在队列取值
* @param key 键
* @return 返回右边的元素
*/
@Override
public Object rpop(String key) {
return redisTemplate.opsForList().rightPop(key);
}
/**
* 移除集合中左边的元素在等待的时间里，如果超过等待的时间仍没有元素则退出。一般用在队列取值
* @param key 键
* @param time 时间
* @return 左边的元素
*/
@Override
public Object lpop(String key,long time) {
return redisTemplate.opsForList().leftPop(key,time,TimeUnit.MILLISECONDS);
}
/**
* 移除集合中右边的元素在等待的时间里，如果超过等待的时间仍没有元素则退出。一般用在队列取值
* @param key 键
* @param time 时间
* @return 返回右边元素
*/
@Override
public Object rpop(String key,long time) {
return redisTemplate.opsForList().rightPop(key,time,TimeUnit.MILLISECONDS);
}
/**
*获取指定区间的值。
* @param key 键
* @param start 开始位置
* @param end 结束位置，为-1指结尾的位置， start 0，end -1取所有
* @return
*/
@Override
public List<Object> lrange(String key, long start, long end) {
return redisTemplate.opsForList().range(key,start,end);
}
/**
* 获取集合长度
* @param key 键
* @return 返回长度
*/
@Override
public Long llen(String key) {
return redisTemplate.opsForList().size(key);
}
/**
* 在集合的指定位置插入元素,如果指定位置已有元素，则覆盖，没有则新增，超过集合下标+n则会报错。
* @param key 键
* @param index 位置
* @param value 值
*/
@Override
public void set(String key, Long index, Object value) {
redisTemplate.opsForList().set(key,index,value);
}
/**
* 获取集合指定位置的值
* @param key 键
* @param index 位置
* @return 返回值
*/
@Override
public Object lindex(String key, Long index) {
return redisTemplate.opsForList().index(key,index);
}
/**
* 从存储在键中的列表中删除等于值的元素的第一个计数事件。count> 0：
* 删除等于从左到右移动的值的第一个元素；count< 0：删除等于从右到左移动的值的第一个元素；count =
0：删除等于value的所有元素。
* @param key 键
* @param count
* @param object
* @return
*/
@Override
public long remove(String key,long count,Object object) {
return redisTemplate.opsForList().remove(key, count ,object);
}
/**
* // 截取集合元素长度，保留长度内的数据。
* @param key 键
* @param start 开始位置
* @param end 结束位置
*/
@Override
public void trim(String key,long start,long end) {
redisTemplate.opsForList().trim(key, start, end);
}
/**
* 除集合中右边的元素，同时在左边加入一个元素。
* @param key 键
* @param str 加入的元素
* @return 返回右边的元素
*/
@Override
public Object rightPopAndLeftPush(String key,String str){
return redisTemplate.opsForList().rightPopAndLeftPush(key,str);
}
/**
* 移除集合中右边的元素在等待的时间里，同时在左边添加元素，如果超过等待的时间仍没有元素则退出。
* @param key 键
* @param str 左边增中的值
* @param timeout 超时时间
* @return 返回移除右边的元素
*/
@Override
public Object rightPopAndLeftPush(String key,String str, long timeout){
return
redisTemplate.opsForList().rightPopAndLeftPush(key,str,timeout,TimeUnit.MILLISECONDS);
}
/**
* 删除
应用场景
项目常应用于：1、对数据量大的集合数据删减 2、任务队列
1、对数据量大的集合数据删减 列表数据显示、关注列表、粉丝列表、留言评价等…分页、热点新闻（Top5)等 利用
LRANGE还可以很方便的实现分页的功能,在博客系统中，每片博文的评论也可以存入一个单独的list中。
2、任务队列 (list通常用来实现一个消息队列，而且可以确保先后顺序，不必像MySQL那样还需要通过ORDER BY来
进行排序)
代码案例
案例1
* @param keys 键
*/
@Override
public void del(String... keys) {
if (keys != null && keys.length > 0) {
if (keys.length == 1) {
redisTemplate.delete(keys[0]);
} else {
redisTemplate.delete(CollectionUtils.arrayToList(keys));
}
}
}
/**
* 设置过期时间
* @param key 键
* @param seconds 超时时间
* @return 成功 true 失败 false
*/
@Override
public boolean expire(String key, long seconds) {
return redisTemplate.expire(key,seconds,TimeUnit.SECONDS);
}
}
```