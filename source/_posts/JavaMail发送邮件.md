---
title: JavaMail发送邮件
date: 2020-07-22 20:50:33
tags: 
categories: java
---

<!--more-->

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