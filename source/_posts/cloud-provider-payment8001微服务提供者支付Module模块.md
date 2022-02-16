---
title: cloud-provider-payment8001微服务提供者支付Module模块
date: 2020-10-16 14:38:00
tags: 
categories: 被引用
---

<!--more-->

> **1、建cloud-provider-payment8001**  
> 创建完成后请回到父工程查看pom文件变化  
>   
> **2、改Moudle的POM文件**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>springcloud2020</artifactId>
        <groupId>com.sl.springcloud</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>cloud-provider-payment8001</artifactId>
    <dependencies>
        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web -->
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/com.alibaba/druid -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.1.10</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-jdbc -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-devtools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>


    </dependencies>


</project>
```

> **3、写YML**

```yml
server:
  port: 8001


spring:
  application:
    name: cloud-payment-service
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: org.gjt.mm.mysql.Driver
    url: jdbc:mysql://localhost:3306/springcloud?useUnicode=true&characterEncoding=utf-8&useSSL=false
    username: root
    password: xxxx

mybatis:
  mapperLocations: classpath:mapper/*.xml
  type-aliases-package: com.sl.springcloud.Entity


```

> **4、主启动**  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016142348541.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
> **5、业务类**  
> ①先建表  
> ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201016142552974.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70#pic_center)  
> ②entitles

```java
package com.sl.springcloud.Entity;

/**
 * 用来将后台返回的值格式化为json字符串，展示给前台。
 */
public class CommonResult<T> {
    private Integer code;
    private String message;
    private T data;

    public CommonResult(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public CommonResult(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public CommonResult() {

    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }


}



```

```java
package com.sl.springcloud.Entity;

import java.io.Serializable;

public class payment implements Serializable {
    private Long id;
    private String serial;

    public payment() {
    }

    public payment(Long id, String serial) {
        this.id = id;
        this.serial = serial;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSerial() {
        return serial;
    }

    public void setSerial(String serial) {
        this.serial = serial;
    }
}

```

> ③3.dao

```java
package com.sl.springcloud.Dao;

import com.sl.springcloud.Entity.payment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PaymentDao {

    public int create(payment p);
    public payment getPaymentById(Long id);
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.sl.springcloud.Dao.PaymentDao">

<!--设置useGeneratedKeys参数值为true，在执行添加记录之后可以获取到数据库自动生成的主键ID。
    public int create(payment p);受全局useGeneratedKeys参数控制，添加记录之后将返回主键id
-->

<!--    keyProperty：指定自动增长的字段，我这里是id。
所以下边的insert中可以不写id字段，前提是数据库中一定要设置好id的自增长。-->
    <insert id="create" parameterType="payment" useGeneratedKeys="true" keyProperty="id">
    insert  into payment(serial) values(${serial});
    </insert>

    <select id="getPaymentById" parameterType="Long" resultMap="BaseResultMap">
        select * from payment where id=#{id};
    </select>

    <resultMap id="BaseResultMap" type="com.sl.springcloud.Entity.payment" >
        <id  column="id" property="id" jdbcType="BIGINT"/>
        <id column="serial" property="serial" jdbcType="VARCHAR"/>
    </resultMap>

</mapper>
```

> ④service

```java
package com.sl.springcloud.Service;

import com.sl.springcloud.Entity.payment;
import org.apache.ibatis.annotations.Param;

public interface PaymentService {
    public int create(payment p); //写

    public payment getPaymentById(@Param("id") Long id);  //读取

}

```

```java
@Service
public class PaymentServiceImpl implements PaymentService {

    @Resource
    PaymentDao paymentDao;

    @Override
    public int create(payment p) {
        return paymentDao.create(p);
    }

    @Override
    public payment getPaymentById(Long id) {
        return paymentDao.getPaymentById(id);
    }
}

```

> ⑤controller

```java
@RestController
@Slf4j
public class PaymentController {
    @Resource
    private PaymentService paymentService;


@PostMapping(value = "/payment/create")
    public CommonResult create(payment p){
        int result=paymentService.create(p);
        log.info("****插入结果："+result);

        if (result>0){
            return  new CommonResult(200,"插入数据库成功",result);
        }else {
            return  new CommonResult(444,"插入数据库失败",null);
        }

    }

    @GetMapping(value = "/payment/get/{id}")
    public  CommonResult getPaymentById(@PathVariable("id") Long id){

            payment p=paymentService.getPaymentById(id);
            log.info("查询结果----："+p);
            if (p!=null){

                return  new CommonResult(200,"查询成功",p);
            }else {
                return new CommonResult(444,"没有对应记录，查询ID："+id,null);
            }




    }

}

```

> **6、测试**  
> http://localhost:8001/payment/get/31  
>   
> postman模拟post测试http://localhost:8001/payment/create\?serial=“gaga”