---
title: 上传到阿里云OSS的照片无法预览
date: 2021-01-15 11:17:46
tags: 
categories: 踩坑
---

<!--more-->

今天用阿里云OSS帮助文档的方式去上传图片到OSS。虽然上传成功了。但是在OSS上无法预览。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210115111555888.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**解决：换一种代码。`ossClient.putObject(bucketName,"文件名",inputStream);`文件名一定要带后缀，比如giao.png**

```java
// Endpoint以杭州为例，其它Region请按实际情况填写。
        String endpoint = "oss-cn-hangzhou.aliyuncs.com";
// 阿里云主账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM账号进行API访问或日常运维，请登录RAM控制台创建RAM账号。
        String accessKeyId = "xxxxhwdNctbaWKksL";
        String accessKeySecret = "xxxx9zudwou9VYIa";
        String bucketName = "你的bucket名字";

        OSS ossClient=new OSSClientBuilder().build(endpoint,accessKeyId,accessKeySecret);

//        上传文件流
        InputStream inputStream=new FileInputStream("文件的完整路径 C:\\Users\\xx\\Desktop\\xx.jpg");
		//文件名一定要带后缀啊。
        ossClient.putObject(bucketName,"文件名",inputStream);
// 关闭OSSClient。
        ossClient.shutdown();
        System.out.println("文件上传成功");
```