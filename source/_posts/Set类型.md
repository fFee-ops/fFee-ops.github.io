---
title: Set类型
date: 2020-08-05 22:27:48
tags: 
categories: Redis
---

<!--more-->

### \= =

- [命令](#_5)
- [应用场景](#_40)
- [RedisTemplate操作Set](#RedisTemplateSet_47)

  
Redis 的 Set 是 String 类型的无序集合。集合成员是唯一的，这就意味着集合中不能出现重复的数据。  
Redis 中集合是通过哈希表实现的，set是通过hashtable实现的 集合中最大的成员数为 232 - 1 \(4294967295, 每个集合可存储40多亿个成员\)。 类似于JAVA中的 Hashtable集合

# 命令

```sql
赋值语法：
SADD key member1 [member2] :向集合添加一个或多个成员


取值语法：
SCARD key :获取集合的成员数
SMEMBERS key :返回集合中的所有成员
SISMEMBER key member :判断 member 元素是否是集合 key 的成员(开发中：验证是否存在判断）
SRANDMEMBER key [count] :返回集合中一个或多个随机数


删除语法：
SREM key member1 [member2] :移除集合中一个或多个成员
SPOP key [count] :移除并返回集合中的一个随机元素
SMOVE source destination member :将 member 元素从 source 集合移动到 destination 集合


差集语法：
SDIFF key1 [key2] :返回给定所有集合的差集(左侧）
SDIFFSTORE destination key1 [key2] :返回给定所有集合的差集并存储在 destination 中


交集语法：
SINTER key1 [key2] :返回给定所有集合的交集(共有数据）
SINTERSTORE destination key1 [key2] :返回给定所有集合的交集并存储在 destination 中


并集语法：
SUNION key1 [key2] :返回所有给定集合的并集
SUNIONSTORE destination key1 [key2] :所有给定集合的并集存储在 destination 集合中
```

# 应用场景

**常应用于：对两个集合间的数据\[计算\]进行交集、并集、差集运算**  
1、利用集合操作，可以取不同兴趣圈子的交集,以非常方便的实现如共同关注、共同喜好、二度好友等功能。对上面的所有集合操作，你还可以使用不同的命令选择将结果返回给客户端还是存储到一个新的集合中。

2、利用唯一性，可以统计访问网站的所有独立 IP、存取当天\[或某天\]的活跃用户列表。

# RedisTemplate操作Set

```java
/**
* @ClassName SetcacheServiceImpl
* @Description TODO
* @Author guoweixin
* @Version 1.0
*/
@Service("setCacheService")
public class SetCacheServiceImpl implements SetCacheService {
private final static Logger log = LoggerFactory.getLogger(SetCacheServiceImpl.class);
@Autowired
private RedisTemplate<String, Object> redisTemplate;
/**
* 向变量中批量添加值。
* @param key 键
* @param objects 值
* @return true成功 false失败
*/
public boolean add(String key, Object...objects){
try {
redisTemplate.opsForSet().add(key,objects);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 向变量中批量添加值。
* @param key 键
* @param expireTime 值
* @param values 值
* @return true成功 false失败
*/
@Override
public Boolean add(String key, int expireTime, Object... values) {
try {
redisTemplate.opsForSet().add(key,values);
if (expireTime > 0)
expire(key, expireTime);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* members(K key)获取变量中的值。
* @param key 键
* @return 返回Set对象
*/
public Set<Object> members(String key) {
return redisTemplate.opsForSet().members(key);
}
/**
* 获取变量中值的长度。
* @param key 键
* @return 返回SET的长度
*/
@Override
public long size(String key) {
return redisTemplate.opsForSet().size(key);
}
/**
* 检查给定的元素是否在变量中。
* @param key 键
* @param o 要检查的变量
* @return true存在 false不存在
*/
@Override
public boolean isMember(String key, Object o) {
return redisTemplate.opsForSet().isMember(key,o);
}
/**
* 转移变量的元素值到目的变量。
* @param key 键
* @param value 要转移的元素
* @param destValue 目标键
* @return true 成功 false 失败
*/
@Override
public boolean move(String key, Object value, String destValue) {
return redisTemplate.opsForSet().move(key,value,destValue);
}
/**
* 弹出变量中的元素。
* @param key 键
* @return 返回弹出的元素
*/
@Override
public Object pop(String key) {
return redisTemplate.opsForSet().pop(key);
}
/**
* 批量移除变量中的元素。
* @param key 键
* @param values 要移除的元素
* @return 返回移除元素个数
*/
@Override
public long remove(String key, Object... values) {
return redisTemplate.opsForSet().remove(key,values);
}
/**
* 匹配获取键值对
* @param key 键
* @param options 选项
* @return 返回键值对
*/
@Override
public Cursor<Object> scan(String key, ScanOptions options) {
return redisTemplate.opsForSet().scan(key,options);
}
/**
* 通过集合求差值。
* @param key 键
* @param list LIST中的对象是要比较缓存的KEY
* @return 返回差差值
*/
@Override
public Set<Object> difference(String key, List list) {
return redisTemplate.opsForSet().difference(key,list);
}
@Override
public Set<Object> difference(String key, String otherKeys) {
return redisTemplate.opsForSet().difference(key,otherKeys);
}
/**
* 将求出来的差值元素保存。
* @param key 键
* @param otherKey 要比较的缓存键
* @param destKey 要保存差值的缓存键
*/
@Override
public void differenceAndStore(String key, String otherKey, String destKey) {
redisTemplate.opsForSet().differenceAndStore(key,otherKey,destKey);
}
/**
* 将求出来的差值元素保存。
* @param key 键
* @param otherKeys 要比较的多个缓存键
* @param destKey 要保存差值的缓存键
*/
@Override
public void differenceAndStore(String key, List otherKeys, String destKey) {
redisTemplate.opsForSet().differenceAndStore(key,otherKeys,destKey);
}
/**
* 获取去重的随机元素。
* @param key 键
* @param count 数量
* @return 返回随机元素
*/
@Override
public Set<Object> distinctRandomMembers(String key, long count) {
return redisTemplate.opsForSet().distinctRandomMembers(key,count);
}
/**
* 获取2个变量中的交集。
* @param key 键
* @param otherKey 比较的缓存键
* @return 返回交集
*/
@Override
public Set<Object> intersect(String key, String otherKey) {
return redisTemplate.opsForSet().intersect(key,otherKey);
}
@Override
public Set<Object> intersect(String key, List list) {
return redisTemplate.opsForSet().intersect(key,list);
}
/**
* 获取2个变量交集后保存到最后一个参数上
* @param key 键
* @param otherKey 其它的缓存键
* @param destKey 交集键
*/
@Override
public void intersectAndStore(String key, String otherKey, String destKey) {
redisTemplate.opsForSet().intersectAndStore(key, otherKey, destKey);
}
/**
* 获取2个变量交集后保存到最后一个参数上
* @param key 键
* @param otherKey 其它的缓存键列表
* @param destKey 交集键
*/
@Override
public void intersectAndStore(String key, List otherKey, String destKey) {
redisTemplate.opsForSet().intersectAndStore(key, otherKey, destKey);
}
/**
* 获取2个变量的合集。
* @param key 键
* @param otherKey 要合的键
* @return 返回合并后的SET
*/
@Override
public Set<Object> union(String key, String otherKey) {
return redisTemplate.opsForSet().union(key,otherKey);
}
@Override
public Set<Object> union(String key, Set set) {
return redisTemplate.opsForSet().union(key,set);
}
/**
* 获取2个变量合集后保存到最后一个参数上。
* @param key 键
* @param otherKey 要合的键
* @param destKey 合并后的键
*/
@Override
public void unionAndStore(String key, String otherKey, String destKey) {
redisTemplate.opsForSet().unionAndStore(key, otherKey, destKey);
}
/**获取2个变量合集后保存到最后一个参数上。
*
* @param key 键
* @param list 要合的键列表
* @param destKey 合并后的键
*/
@Override
public void unionAndStore(String key, List list, String destKey) {
redisTemplate.opsForSet().unionAndStore(key, list, destKey);
}
/**
* 随机获取变量中的元素。
* @param key 键
* @return 返回其中一个随机元素
*/
@Override
public Object randomMember(String key){
return redisTemplate.opsForSet().randomMember(key);
}
/**
* 随机获取变量中指定个数的元素
* @param key 键
* @param count 取随机数的个数
应用场景
常应用于：对两个集合间的数据[计算]进行交集、并集、差集运算
1、利用集合操作，可以取不同兴趣圈子的交集,以非常方便的实现如共同关注、共同喜好、二度好友等功能。对上面
的所有集合操作，你还可以使用不同的命令选择将结果返回给客户端还是存储到一个新的集合中。
2、利用唯一性，可以统计访问网站的所有独立 IP、存取当天[或某天]的活跃用户列表。
代码案例
案例1
案例2
案例3
ZSet
* @return 返回随机数LIST
*/
@Override
public List<Object> randomMembers(String key, long count){
return redisTemplate.opsForSet().randomMembers(key,count);
}
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
```