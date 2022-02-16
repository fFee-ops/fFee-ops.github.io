---
title: ZSet
date: 2020-08-11 11:21:44
tags: 
categories: Redis
---

<!--more-->

### ...

- [简介](#_2)
- [常用命令](#_12)
- [应用场景](#_37)
- [使用lettuce操作ZSet](#lettuceZSet_46)

# 简介

1、Redis 有序集合和集合一样也是string类型元素的集合,且不允许重复的成员。  
2、不同的是每个元素都会关联一个double类型的分数。redis正是通过分数来为集合中的成员进行从小到大的排序。  
3、有序集合的成员是唯一的,但分数\(score\)却可以重复。  
4、集合是通过哈希表实现的。 集合中最大的成员数为 2次方32 \- 1 \(4294967295, 每个集合可存储40多亿个成员\)。

**Redis的ZSet是有序、且不重复 （很多时候，我们都将redis中的有序集合叫做zsets，这是因为在redis中，有序集合相关的操作指令都是以z开头的）**

# 常用命令

```sql
赋值语法：
ZADD key score1 member1 [score2 member2] :向有序集合添加一个或多个成员，或者更新已存在成员的分
数

取值语法：
ZCARD key :获取有序集合的成员数
ZCOUNT key min max :计算在有序集合中指定区间分数的成员数
ZRANK key member :返回有序集合中指定成员的索引
ZRANGE key start stop [WITHSCORES] :通过索引区间返回有序集合成指定区间内的成员(低到高)
ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT] :通过分数返回有序集合指定区间内的成员
ZREVRANGE key start stop [WITHSCORES] :返回有序集中指定区间内的成员，通过索引，分数从高到底
ZREVRANGEBYSCORE key max min [WITHSCORES] :返回有序集中指定分数区间内的成员，分数从高到低排序

删除语法：
DEL key :移除集合
ZREM key member [member ...] :移除有序集合中的一个或多个成员
ZREMRANGEBYRANK key start stop :移除有序集合中给定的排名区间的所有成员(第一名是0)(低到高排序)
ZREMRANGEBYSCORE key min max :移除有序集合中给定的分数区间的所有成员
ZINCRBY key increment member :增加memeber元素的分数increment，返回值是更改后的分数
```

# 应用场景

**常应用于：排行榜**

- 比如twitter 的public timeline可以以发表时间作为score来存储，这样获取时就是自动按时间排好序的。
- 比如一个存储全班同学成绩的Sorted Set，其集合value可以是同学的学号，而score就可以是其考试得分，这样在数据插入集合的时候，就已经进行了天然的排序。
- 还可以用Sorted Set来做带权重的队列，比如普通消息的score为1，重要消息的score为2，然后工作线程可以选择按score的倒序来获取工作任务。让重要的任务优先执行。

# 使用lettuce操作ZSet

```java
/**
* @ClassName ZSetCacheServiceImpl
* @Description TODO
* @Author guoweixin
* @Version 1.0
*/
@Service("zsetCacheService")
public class ZSetCacheServiceImpl implements ZSetCacheService {
private final static Logger log = LoggerFactory.getLogger(ZSetCacheServiceImpl.class);
@Autowired
private RedisTemplate<String, Object> redisTemplate;
/**
* 增添加元素到变量中同时指定元素的分值。
* @param key 键
* @param value 值
* @param score 分值
* @return true 成功 false 失败
*/
public boolean add(String key, Object value, double score){
try {
redisTemplate.opsForZSet().add(key,value,score);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
/**
* 获取变量指定区间的元素。START为0,END为-1代表取全部
* @param key 键
* @param start 开始位置
* @param end 结束位置
* @return 返回SET
*/
@Override
public Set<Object> range(String key, long start, long end) {
return redisTemplate.opsForZSet().range(key,start,end);
}
/**
* 用于获取满足非score的排序取值。这个排序只有在有相同分数的情况下才能使用，如果有不同的分数则返回值不
确定。
* @param key 键
* @param range
* @return 返回SET
*/
public Set<Object> rangeByLex(String key, RedisZSetCommands.Range range){
return redisTemplate.opsForZSet().rangeByLex(key,range);
}
/**
* 获取变量中元素的个数
* @param key 键
* @return 返回个数
*/
public long zCard(String key){
return redisTemplate.opsForZSet().zCard(key);
}
/**
* 获取区间值的个数。
* @param key 键
* @param min 最小SCORE
* @param max 最大SCORE
* @return 返回数量
*/
@Override
public long count(String key, double min, double max) {
return redisTemplate.opsForZSet().count(key,min,max);
}
/**
* 修改变量中的元素的分值。
* @param key
* @param value
* @param delta
* @return
*/
@Override
public double incrementScore(String key, Object value, double delta) {
return redisTemplate.opsForZSet().incrementScore(key,value,delta);
}
/**
* 获取元素的分值
* @param key 键
* @param o 要查找的值
* @return 返回分值
*/
public double score(String key, Object o){
return redisTemplate.opsForZSet().score(key,o);
}
/**
* 用于获取满足非score的设置下标开始的长度排序取值。
* @param key 键
* @param range 范围
* @param limit 限制区域
* @return 返回SET
*/
@Override
public Set<Object> rangeByLex(String key, RedisZSetCommands.Range range,
RedisZSetCommands.Limit limit) {
return redisTemplate.opsForZSet().rangeByLex(key, range,limit);
}
/**
* 通过TypedTuple方式新增数据。
* @param key 键
* @param tuples 元组
*/
@Override
public void add(String key, Set<ZSetOperations.TypedTuple<Object>> tuples) {
redisTemplate.opsForZSet().add(key,tuples);
}
/**
* 根据设置的score获取区间值
* @param key 键
* @param min 最小值
* @param max 最大值
* @return 返回SET
*/
@Override
public Set<Object> rangeByScore(String key, double min, double max) {
return redisTemplate.opsForZSet().rangeByScore(key,min,max);
}
/**
* 根据设置的score获取区间值从给定下标和给定长度获取最终值。
* @param key 键
* @param min 最小值
* @param max 最大值
* @param offset 偏移时
* @param count 取的长度
* @return 返回SET
*/
@Override
public Set<Object> rangeByScore(String key, double min, double max, long offset, long
count) {
return redisTemplate.opsForZSet().rangeByScore(key,min,max,offset,count);
}
/**
* 获取RedisZSetCommands.Tuples的区间值。
* @param key 键
* @param start 开始SCORE值
* @param end 结束SCORE值
* @return 返回区间值
*/
@Override
public Set<ZSetOperations.TypedTuple<Object>> rangeWithScores(String key, long start,
long end) {
return redisTemplate.opsForZSet().rangeWithScores(key,start,end);
}
/**
* 获取RedisZSetCommands.Tuples的区间值通过分值。
* @param key 键
* @param min 最小分值
* @param max 最大分值
* @return 返回SET
*/
@Override
public Set<ZSetOperations.TypedTuple<Object>> rangeByScoreWithScores(String key, double
min, double max) {
return redisTemplate.opsForZSet().rangeByScoreWithScores(key, min, max);
}
/**
* 获取RedisZSetCommands.Tuples的区间值从给定下标和给定长度获取最终值通过分值。
* @param key 键
* @param min 最小分值
* @param max 最大分值
* @param offset 偏移量
* @param count 总数
* @return 返回SET
*/
@Override
public Set<ZSetOperations.TypedTuple<Object>> rangeByScoreWithScores(String key, double
min, double max, long offset, long count) {
return redisTemplate.opsForZSet().rangeByScoreWithScores(key, min,
max,offset,count);
}
/**
* 获取变量中元素的索引,下标开始位置为
* @param key 键
* @param o 要查找的值
* @return 返回下标
*/
@Override
public long rank(String key, Object o) {
return redisTemplate.opsForZSet().rank(key,o);
}
/**
* 匹配获取键值对，ScanOptions.NONE为获取全部键值对；
ScanOptions.scanOptions().match("C").build()匹配获取键位map1的键值对,不能模糊匹配。
* @param key 键
* @param options 选项
* @return 返回键值对
*/
@Override
public Cursor<ZSetOperations.TypedTuple<Object>> scan(String key, ScanOptions options)
{
return redisTemplate.opsForZSet().scan(key, options);
}
/**
* 索引倒序排列指定区间元素。
* @param key 键
* @param start 开始位置
* @param end 结束位置
* @return 返回倒排后的结果
*/
@Override
public Set<Object> reverseRange(String key, long start, long end) {
return redisTemplate.opsForZSet().reverseRange(key,start,end);
}
/**
* 倒序排列指定分值区间元素。
* @param key 键
* @param min 最小SCORE
* @param max 最大SCORE
* @return 返回区间元素
*/
@Override
public Set<Object> reverseRangeByScore(String key, double min, double max) {
return redisTemplate.opsForZSet().reverseRangeByScore(key,min,max);
}
/**
* 倒序排列从给定下标和给定长度分值区间元素。
* @param key 键
* @param min 最小SCORE
* @param max 最大SCORE
* @param offset 偏移量
* @param count 数量
* @return 返回列表
*/
@Override
public Set<Object> reverseRangeByScore(String key, double min, double max, long offset,
long count) {
return redisTemplate.opsForZSet().reverseRangeByScore(key,min,max,offset,count);
}
/**
* 倒序排序获取RedisZSetCommands.Tuples的分值区间值。
* @param key 键
* @param min 最小SCORE
* @param max 最大SCORE
* @return 返回SET集合
*/
@Override
public Set<ZSetOperations.TypedTuple<Object>> reverseRangeByScoreWithScores(String key,
double min, double max) {
return redisTemplate.opsForZSet().reverseRangeByScoreWithScores(key,min,max);
}
/**
* 序排序获取RedisZSetCommands.Tuples的从给定下标和给定长度分值区间值
* @param key 键
* @param min 最小SCORE
* @param max 最大SCORE
* @param offset 偏移量
* @param count 总数
* @return 返回SET
*/
@Override
public Set<ZSetOperations.TypedTuple<Object>> reverseRangeByScoreWithScores(String key,
double min, double max, long offset, long count) {
return
redisTemplate.opsForZSet().reverseRangeByScoreWithScores(key,min,max,offset,count);
}
/**
* 索引倒序排列区间值。
* @param key 键
* @param start 开始Score
* @param end 结束SCORE
* @return 返回列表
*/
@Override
public Set<ZSetOperations.TypedTuple<Object>> reverseRangeWithScores(String key, long
start, long end) {
return redisTemplate.opsForZSet().reverseRangeWithScores(key,start,end);
}
/**
* 获取倒序排列的索引值。
* @param key 键
* @param o 值
* @return 返回倒序排列的索引值
*/
@Override
public long reverseRank(String key, Object o) {
return redisTemplate.opsForZSet().reverseRank(key,o);
}
/**
* 获取2个变量的交集存放到第3个变量里面。
* @param key 键
* @param otherKey 要交集的键
* @param destKey 目标键
* @return 返回交集长度
*/
@Override
public long intersectAndStore(String key, String otherKey, String destKey) {
return redisTemplate.opsForZSet().intersectAndStore(key,otherKey,destKey);
}
/**
* 获取多个变量的交集存放到第3个变量里面。
* @param key 键
* @param list 多个要交集的KEY
* @param destKey 要存入的KEY
* @return 返回数量
*/
@Override
public long intersectAndStore(String key, List list, String destKey) {
return redisTemplate.opsForZSet().intersectAndStore(key,list,destKey);
}
/**
* 获取2个变量的合集存放到第3个变量里面。
* @param key 键
* @param otherKey 要合并的KEY
* @param destKey 共同的并集元素存到destK
* @return 返回元素个数
*/
@Override
public long unionAndStore(String key, String otherKey, String destKey) {
return redisTemplate.opsForZSet().unionAndStore(key,otherKey,destKey);
}
/**
* 获取多个变量的合集存放到第3个变量里面。
* @param key 键
* @param list 要合的集合KEY
* @param destKey 目票集合KEY
* @return 返回合集长度
*/
@Override
public long unionAndStore(String key, List list, String destKey) {
return redisTemplate.opsForZSet().unionAndStore(key,list,destKey);
}
/**
* 批量移除元素根据元素值。
* @param key 键
* @param values 要删除的元素
* @return 返回删除的数量
*/
@Override
public long remove(String key, Object... values) {
return redisTemplate.opsForZSet().remove(key,values);
}
/**
* 根据分值移除区间元素。
* @param key 键
* @param min 最小的SCORE
* @param max 最大的SCORE
* @return 返回移除的元素数量
*/
@Override
public long removeRangeByScore(String key, double min, double max) {
return redisTemplate.opsForZSet().removeRangeByScore(key,min,max);
}
/**
* 根据索引值移除区间元素。
* @param key 键
* @param start 索引开始
* @param end 索引结束
应用场景
常应用于：排行榜
销量排名，积分排名等
1比如twitter 的public timeline可以以发表时间作为score来存储，这样获取时就是自动按时间排好序的。
2比如一个存储全班同学成绩的Sorted Set，其集合value可以是同学的学号，而score就可以是其考试得分，这
样在数据插入集合的时候，就已经进行了天然的排序。
3还可以用Sorted Set来做带权重的队列，比如普通消息的score为1，重要消息的score为2，然后工作线程可以
选择按score的倒序来获取工作任务。让重要的任务优先执行。
代码案例
案例1
学员成绩排行榜：
* @return 返回移除的数量
*/
@Override
public long removeRange(String key, long start, long end) {
return redisTemplate.opsForZSet().removeRange(key,start,end);
}
/**
* 删除指定的KEY的缓存
* @param keys
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
}
```