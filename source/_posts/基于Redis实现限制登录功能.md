---
title: 基于Redis实现限制登录功能
date: 2020-07-25 10:45:43
tags: 
categories: Redis
---

<!--more-->

### title

- [具体代码实现](#_32)

**需求：**  
用户在2分钟内，仅允许输入错误密码5次。  
如果超过次数，限制其登录1小时。（要求每登录失败时，都要给相应提式）

**思路：**  
\*\*1、\*\*判断当前登录的用户是否被限制登录  
    1.1如果没有被限制\(执行登录功能\)

**2、** 判断是否登录成功  
    **2.1**登录成功–>\(清除输入密码错误次数信息\)  
    **2.2**登录不成功

        **2.2.1**记录登录错误次数\(判断 Redis中的登录次数KEY是否存在\)  
user: loginCount:fail:用户名  
        **2.2.1.1**如果不存在  
是第一次登录失败次数为1user; loginCount:fai1:用户名进行赋值,同时设置失效期

        **2.2.1.2** 如果存在  
查询登录失败次数的key结果  
if\(结果\<4\)  
user: loginCount: fail: +1  
else\{//4  
限制登录KEY存在,同时设置限制登录时间锁定1小时。\}

**3、** 如果被锁定 做出相应的提示

# 具体代码实现

**前端**

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org" >
<head>
    <meta charset="UTF-8" />
    <title>Title</title>
</head>
<script src="jquery-3.4.1.js"></script>

<body>
<div style="text-align: center">
    请输入用户名<input  id="u" type="text"/>
    密码：<input id="password" type="text"/> <button onclick="f1()">登陆</button>
</div>



<script>




    function f1() {
        var u=$("#u").val();
        var password=$("#password").val();
        $.ajax({
            url:"/judge",
            type: "post",
            data: {"user":u,"password":password},
            success(flag){
              alert(flag);
            }

        });
    }

</script>

</body>
</html>

```

---

**Controller**

```java
package com.java_lettuce.Controller;

import com.java_lettuce.ServiceImpl.LettceServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;

@Controller
public class controller {
    @Autowired
    LettceServiceImp serviceImp;


    @ResponseBody
    @RequestMapping("/judge")
    public  String  judge(HttpServletRequest request){

        String u=request.getParameter("user");
        String password=request.getParameter("password");

        if (password.equals("123")){

            return "登录成功";
        }else {
            String info = serviceImp.judge(u);

            return info;
        }


    }


    @RequestMapping("/index2")

    public String index2(){

        return "index2";
    }

}

```

---

**ServiceImpl**

```java
package com.java_lettuce.ServiceImpl;


import com.java_lettuce.Util.SendEmailUtil;
import com.java_lettuce.config.redisConfig;
import com.java_lettuce.entity.User;
import jdk.nashorn.internal.runtime.logging.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Logger
@Service
public class LettceServiceImp {
        private org.slf4j.Logger logger = LoggerFactory.getLogger(redisConfig.class);
    @Autowired
    private RedisTemplate<String,String> redisTemplate;


    public String judge(String u){
        String keyLoginFail="user:"+u+": login:fail: count";//用户登录失败次数
        String keyLoginStop="user:"+u+": login:stop:time";//用户禁止登录时间

        int num=5;//总登录次数

        //判断用户是否处于限制时间内
        if (redisTemplate.hasKey(keyLoginStop)){

            long stopTime=redisTemplate.getExpire(keyLoginStop,TimeUnit.MINUTES);//剩余 禁止登陆时间
            return  "处于限制登陆状态，请在"+stopTime+"分钟后重新登陆";
        }else {
            if (!redisTemplate.hasKey(keyLoginFail)){//是首次失败
                //设置过期时间要和存值分开，不然会失效。
                redisTemplate.opsForValue().set(keyLoginFail,"1");
                redisTemplate.expire(keyLoginFail,2,TimeUnit.MINUTES);
                return "密码输入错误，2分钟内还剩"+(num-1)+"次机会登陆";

            }else {
                //2分钟内非首次登陆失败
                int failCount=Integer.parseInt(redisTemplate.opsForValue().get(keyLoginFail));
                if (failCount>=num-1){
                    //超过限制次数，冻结帐号
                    redisTemplate.opsForValue().set(keyLoginStop,"1");
                    redisTemplate.expire(keyLoginStop,1,TimeUnit.HOURS);
                    return  "密码输入错误超过五次，冻结帐号一小时";
                }else {
                    redisTemplate.opsForValue().increment(keyLoginFail,1);
                    Long waitTime = redisTemplate.getExpire(keyLoginFail, TimeUnit.SECONDS);

                    return "密码输入错误"+(failCount+1)+"次，在2分钟内还可输入"+(num-(failCount+1))+"次"
                            +"次数将于"+waitTime+"秒后重置";

                }


            }


        }

    }


}

```

---

**yml配置文件和上个博客相同**

---

**RedisConfig**

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
    /**
     * 在redisTemplate()这个方法中用JacksonJsonRedisSerializer更换掉了Redis默认的序列化方式：JdkSerializationRedisSerializer
     *JdkSerializationRedisSerializer序列化被序列化对象必须实现Serializable接口，被序列化除属性内容还有其他
     * 内容，长度长且不易阅读,默认就是采用这种序列化方式
     *
     *
     *JacksonJsonRedisSerializer序列化,被序列化对象不需要实现Serializable接口，被序列化的结果清晰，容易阅
     * 读，而且存储字节少，速度快
     *一般如果key、value都是string字符串的话，就是用这个就可以了
     *
     * @param factory
     * @return
     */
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