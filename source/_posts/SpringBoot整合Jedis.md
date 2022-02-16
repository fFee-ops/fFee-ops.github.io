---
title: SpringBoot整合Jedis
date: 2020-07-22 11:43:59
tags: 
categories: Redis
---

<!--more-->

### 文章目录

- [Jedis操作String类型](#JedisString_119)
- [Jedis操作Hash类型](#JedisHash_181)

  
我们在使用springboot搭建微服务的时候，在很多时候还是需要redis的高速缓存来缓存一些数据，存储一些高频率访问的数据，如果直接使用redis的话又比较麻烦，在这里，使用jedis来实现redis缓存来达到高效缓存的目的

**引入依赖:**

```xml
<dependency>
<groupId>redis.clients</groupId>
<artifactId>jedis</artifactId>
</dependency>
```

因为 SpringBoot 内默认引用了jedis版本。  
所以我们直接引入jedis 依赖 无需在配置 jedis的版本号了。

**application.yml**

```yaml
spring:
  redis:
    port: 6379
    password: ****
    host: 192.168.**.**
    jedis:
      pool:
        max-idle: 6 #最大空闲数
        max-active: 10 #最大连接数
        min-idle: 2 #最小空闲数
    timeout: 2000 #连接超时

    logging.level.org.springframework.boot.autoconfigure: ERROR
```

**编写Config**

```java
package com.example.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

@Configuration
public class JedisConfig {
    private Logger logger = LoggerFactory.getLogger(JedisConfig.class);

//    将yml文件中的属性给注入进来
    @Value("${spring.redis.host}")
    private String host;
    @Value("${spring.redis.port}")
    private int port;
    @Value("${spring.redis.password}")
    private String password;
    @Value("${spring.redis.timeout}")
    private int timeout;
    @Value("${spring.redis.jedis.pool.max-active}")
    private int maxActive;
    @Value("${spring.redis.jedis.pool.max-idle}")
    private int maxIdle;
    @Value("${spring.redis.jedis.pool.min-idle}")
    private int minIdle;

    @Bean
    public JedisPool jedisPool(){
        JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
        jedisPoolConfig.setMaxIdle(maxIdle);
        jedisPoolConfig.setMinIdle(minIdle);
        jedisPoolConfig.setMaxTotal(maxActive);

        //创建一个Jedis连接池对象
        JedisPool jedisPool=new JedisPool(jedisPoolConfig,host,port,timeout,password);

        logger.info("JedisPoll连接成功："+host+"\t"+port);
        return jedisPool;
    }

}

```

---

**封装工具类**

```java
package com.example.Utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

@Component
public class jedisUtils {

    @Autowired
    private JedisPool jedisPool;

    /**
     * 获取Jedis资源
     */
    public Jedis getJedis() {
        return jedisPool.getResource();
    }

    /**
     * 释放Jedis连接
     */
    public void close(Jedis jedis) {
        if (jedis != null) {
            jedis.close();
        }

    }
}

```

# Jedis操作String类型

```java
package com.example.service.impl;

import com.example.Utils.jedisUtils;
import com.example.config.JedisConfig;
import com.example.entity.User;
import com.example.service.JedisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import redis.clients.jedis.Jedis;

import java.util.HashMap;
import java.util.Map;

@Service
public class JedisServiceImpl implements JedisService {
    private Logger logger = LoggerFactory.getLogger(JedisConfig.class);

    @Autowired
    private jedisUtils jedisUtils;
    @Override
    public String getString(String key) {
        Jedis jedis = jedisUtils.getJedis();
        String val=null;
        if (!jedis.exists(key)){
//            如果redis中没有该key，则去mysql中查找并且将其存在redis中
        val="鸭子";
        logger.info("从Mysql中查询到了该数据："+val);
        jedis.set(key,val);
        logger.info("往redis中存入了该数据，值为："+val);

        }else {
//    从redis中直接读取该key
       val= jedis.get(key);
        logger.info(key+"存在于redis中，值为："+val);
        }

    jedis.close();
        return val;
    }

}

```

**进行单元测试**

```java
@SpringBootTest
public class JedisTests {
@Autowired
private JedisServiceImpl jedisService;
@Test
void t1(){
String val= jedisService.getString("name");
System.out.println(val);
}
}
```

# Jedis操作Hash类型

```java
package com.example.service.impl;

import com.example.Utils.jedisUtils;
import com.example.config.JedisConfig;
import com.example.entity.User;
import com.example.service.JedisService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import redis.clients.jedis.Jedis;

import java.util.HashMap;
import java.util.Map;

@Service
public class JedisServiceImpl implements JedisService {
    private Logger logger = LoggerFactory.getLogger(JedisConfig.class);





    /**
     * 测试 jedis 操作hash类型
     * 根据用户ID查询用户信息
     * 先判断Redis中是否存在，
     * 如果不存在，数据库中查询。并存到Redis中
     * 如果存在，直接查询Redis 并返回
     * @return
     */

    @Override
    public User selectBy(String id) {

        String key="user:id"; //根据规则生成相同规范的key
        User user = new User();

        Jedis jedis = jedisUtils.getJedis();
        if (!jedis.exists(key)){
            //mysql中查并存入redis
            user.setId("1");
            user.setName("老肥");

            logger.info("从Mysql中查询到了该用户  信息为："+user);
            Map<String,String> map=new HashMap<>();
            map.put("id",user.getId());
            map.put("name",user.getName());

            jedis.hset(key,map);
            logger.info(key+"成功存入Redis:"+user);



        }else {
            Map<String,String> map= jedis.hgetAll(key);
            user.setId(map.get("id"));
            user.setName(map.get("name"));
            logger.info(key+"\t"+"Redis中查询出来的是:"+map);
        }
        jedisUtils.close(jedis);
        return user;
    }
}

```

**进行单元测试**

```java
@SpringBootTest
public class JedisTests {
@Autowired
private JedisServiceImpl jedisService;
@Test
void hash(){
User user= jedisService.selectBy("1001");
System.out.println(user);
}
}
```