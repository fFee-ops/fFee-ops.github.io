---
title: 基于Redis实现邮箱发送验证码功能
date: 2020-07-22 20:44:04
tags: 
categories: Redis
---

<!--more-->

### title

**需求：**  
用户在客户端输入邮箱，点击发送后随机生成4位数字码。有效期为40秒。  
输入验证码，点击验证，返回成功或者失败。

---

**前端页面**

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org" >
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<script src="jquery-3.4.1.js"></script>

<body>
<div style="text-align: center">
    请输入邮箱<input  id="email" type="text"/><button onclick="f()">发送验证码</button>
    验证码：<input id="authCode" type="text"/> <button onclick="f1()">验证</button>
</div>



<script>




    function f() {
        var email=$("#email").val();
        var authCode=$("#authCode").val();
    $.ajax({
        url:"/send",
        type: "post",
        data: {"email":email,"authCode":authCode},
        success(flag){

            alert(flag);
        }

    });

    }

    function f1() {
        var email=$("#email").val();
        var authCode=$("#authCode").val();
        $.ajax({
            url:"/check",
            type: "post",
            data: {"email":email,"authCode":authCode},
            success(flag){
                if (flag){
                    alert("校验成功");
                }else {
                    alert("校验失败");
                }

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
    @RequestMapping("/send")
    public  String  send(HttpServletRequest request) throws Exception {
        String email = request.getParameter("email");

        String authCodeInRedis = serviceImp.sendAuthCode(email);
    return "验证码发送成功";
    }


    @ResponseBody
    @RequestMapping("/check")
    public boolean check(HttpServletRequest request){
        String email = request.getParameter("email");
        String authCode = request.getParameter("authCode");
        if (authCode.equals(serviceImp.getAuthCode(email))){

            return  true;
        }else {
            return  false;
        }


    }

}

```

---

**Service**

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

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Logger
@Service
public class LettceServiceImp {
        private org.slf4j.Logger logger = LoggerFactory.getLogger(redisConfig.class);
    @Autowired
    private RedisTemplate<String,Object> redisTemplate;



//    ===========================
    SendEmailUtil send=new SendEmailUtil();//发送邮件功能

    public String sendAuthCode(String email) throws Exception {

            String fourRandom = LettceServiceImp.getFourRandom();
    //将得到邮箱的验证码存入到redis中，并且设置40s有效期。
            redisTemplate.opsForValue().set(email,fourRandom,40,TimeUnit.SECONDS);
            send.sendEmail(fourRandom,email);

            return fourRandom;
        }

public String getAuthCode(String email){
    System.out.println(redisTemplate.opsForValue().get(email));
       return (String) redisTemplate.opsForValue().get(email);
}




    /**
     * 产生4位随机数(0000-9999)
     * @return 4位随机数
     */
    public static String getFourRandom(){
        Random random = new Random();
        String fourRandom = random.nextInt(10000) +"";
        int randLength = fourRandom.length();
        if(randLength<4){
            for(int i=1; i<=4-randLength; i++)
                fourRandom = "0"+ fourRandom ;
        }
        return fourRandom;
    }

}

```

---

**lettuce配置类与上个博客相同**

---

**发送邮件工具类**

```java
package com.java_lettuce.Util;

import java.util.Properties;

import javax.mail.Address;
import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import com.sun.mail.util.MailSSLSocketFactory;

public class SendEmailUtil {

    public  void sendEmail(String authCode,String reciver) throws Exception {
        // 设置发送邮件的配置信息
        Properties props = new Properties();

        // 发送服务器需要身份验证
        props.setProperty("mail.smtp.auth", "true");
        // 设置邮件服务器主机名
        props.setProperty("mail.host", "smtp.qq.com");
        // 发送邮件协议名称
        props.setProperty("mail.transport.protocol", "smtp");
        //开启了 SSL 加密
        MailSSLSocketFactory sf = new MailSSLSocketFactory();
        sf.setTrustAllHosts(true);
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.ssl.socketFactory", sf);

        Session session = Session.getInstance(props);

        //邮件内容部分
        Message msg = new MimeMessage(session);
        msg.setSubject("您的验证码为：");
        msg.setText(authCode+"\t"+"注意：验证码有效期为40s");
        //邮件发送者
        msg.setFrom(new InternetAddress("发件人邮箱"));

        //发送邮件
        Transport transport = session.getTransport();
        //在邮箱的设置中开启POP3/SMTP服务得到授权码
        transport.connect("smtp.qq.com", "发件人邮箱", "授权码");

        transport.sendMessage(msg, new Address[] { new InternetAddress("收件人邮箱"+reciver) });
        transport.close();
    }
}
```