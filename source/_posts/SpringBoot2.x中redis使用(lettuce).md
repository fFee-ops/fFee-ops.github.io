---
title: SpringBoot2.x中redis使用(lettuce)
date: 2020-07-22 12:03:10
tags: 
categories: Redis
---

<!--more-->

### 文章目录

- [测试String类型](#String_120)
- [测试hash类型](#hash_185)

**pom.xml中添加如下依赖**

```xml
  <!--默认是lettuce客户端-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <!-- redis依赖commons-pool 这个依赖一定要添加 -->
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-pool2</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <groupId>org.junit.vintage</groupId>
                    <artifactId>junit-vintage-engine</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
```

**application.yml**

```yaml
spring:
  redis:
    port: 6379
    password: ***
    host: 192.168.**.**
    lettuce:
      pool:
        max-active: 8 # 连接池最大连接数（使用负值表示没有限制）
        max-idle: 8 # 连接池中的最大空闲连接
        min-idle: 0 # 连接池中的最小空闲连接
        max-wait: 1000 # 连接池最大阻塞等待时间（使用负值表示没有限制）
      shutdown-timeout: 100


```

**redis配置类**  
编写缓存配置类RedisConfig用于调优缓存默认配置，RedisTemplate\<String, Object>的类型兼容性更高  
在redisTemplate\(\)这个方法中用**JacksonJsonRedisSerializer**更换掉了Redis默认的序列化方式：**JdkSerializationRedisSerializer**  

JdkSerializationRedisSerializer 序列化被序列化对象必须实现Serializable接口，被序列化除属性内容还有其他 内容，长度长且不易阅读,默认就是采用这种序列化方式 存储内容如下： "\\xac\\xed\\x00\\x05sr\\x00\!com.oreilly.springdata.redis.User\\xb1\\x1c \\n\\xcd\\xed\%\\xd8\\x02\\x00\\x02I\\x00\\x03ageL\\x00\\buserNamet\\x00\\x12Ljava/lang/String;xp\\x00\\x00\\x00\\ x14t\\x00\\x05user1"  
  
JacksonJsonRedisSerializer序列化,被序列化对象不需要实现Serializable接口，被序列化的结果清晰，容易阅读，而且存储字节少，速度快、存储内容如下： \{"userName":"guoweixin","age":20\}  
  
StringRedisSerializer序列化  
一般如果key、value都是string字符串的话，就是用这个就可以了
---

**RedisConfig类**

```java
package com.java_lettuce.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * RedisTemplate-->redis进行了进一步封装 （lettuce)
 */

@Configuration
public class redisConfig {

    @Bean
    public RedisTemplate<String,Object> redisTemplate(LettuceConnectionFactory factory){
        RedisTemplate<String,Object> template = new RedisTemplate <>();
        template.setConnectionFactory(factory);
        Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new
                Jackson2JsonRedisSerializer(Object.class);
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(om);
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
        
// 在使用注解@Bean返回RedisTemplate的时候，同时配置hashKey与hashValue的序列化方式。
// key采用String的序列化方式
        template.setKeySerializer(stringRedisSerializer);
// value序列化方式采用jackson
        template.setValueSerializer(jackson2JsonRedisSerializer);
// hash的key也采用String的序列化方式
        template.setHashKeySerializer(stringRedisSerializer);
// hash的value序列化方式采用jackson
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        template.afterPropertiesSet();
        return template;
    }
}

```

# 测试String类型

```java
@Service
public class RedisServiceImpl {
@Autowired
private RedisTemplate<String,Object> redisTemplate;

 private org.slf4j.Logger logger = LoggerFactory.getLogger(redisConfig.class);
/**
* 普通缓存放入
* @param key 键
* @return true成功 false失败
*/
public String getString(String key) {
if(redisTemplate.hasKey(key)) {
logger .info("Redis中查询");
return (String) redisTemplate.opsForValue().get(key);
}else{
String val="qaqawer";
redisTemplate.opsForValue().set(key, val);
logger .info("数据库中查询的");
return val;
}
}
/**
* 普通缓存放入
* @param key 键
* @param value 值
* @param expireTime 超时时间(秒)
* @return true成功 false失败
*/
public Boolean set(String key, Object value, int expireTime) {
try {
redisTemplate.opsForValue().set(key, value, expireTime, TimeUnit.SECONDS);
return true;
} catch (Exception e) {
e.printStackTrace();
return false;
}
}
```

**单元测试：**

```java
@SpringBootTest
class JavaLettuceApplicationTests {

    @Autowired
    LettceServiceImp serviceImp;
    @Test
    void contextLoads() {
        String nname = serviceImp.getString("NNAME");
        System.out.println(nname);
    }

    @Test
    void  t1(){
        Boolean aBoolean = serviceImp.set("sex", "男", 20);
        System.out.println(aBoolean);

    }

```

# 测试hash类型

```java
@Logger
@Service
public class LettceServiceImp {
        private org.slf4j.Logger logger = LoggerFactory.getLogger(redisConfig.class);
    @Autowired
    private RedisTemplate<String,Object> redisTemplate;


//    ========================================================测试Hash类型
    /**
     * 判断key是否存在，如果存在 在Redis中查询
     * 如果不存在，在MYSQL中查询，并将结果得到，添加到Redis Hash中
     * @param id
     * @return
     */


    public User selectUserById1(String id){
        if(redisTemplate.opsForHash().hasKey("user",id)){
            logger.info("Redis中查询对象");
            return (User) redisTemplate.opsForHash().get("user",id);
        }else{
            User u=new User();
            u.setId(id);
            u.setName("唷？");
            u.setAge(22);
            logger.info("mysql中查询对象");
            redisTemplate.opsForHash().put("user",id,u);
            return u;
        }
    }
```

**单元测试**

```java
 @Test
    void  t2(){
        User user = serviceImp.selectUserById1("1001");
        System.out.println(user);

    }
```