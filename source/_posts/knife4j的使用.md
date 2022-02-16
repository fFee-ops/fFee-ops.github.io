---
title: knife4j的使用
date: 2022-02-10 13:15:58
tags:
password:
categories: 杂
---

# 什么是knife4j
Knife4j的前身是`swagger-bootstrap-ui`,前身`swagger-bootstrap-ui`是一个纯`swagger-ui`的ui皮肤项目。简单来说就是给我们平常用的swagger换个UI。
而Knife4j提供了一些增强型的功能。我之所以用Knife4j还是因为swagger的UI界面让我觉得难以使用。


# 整合步骤
**①引入依赖**
在pom.xml中引入以下依赖
>我只引入了`knife4j-spring-ui`，因为我只想替换一下UI而已。
```xml
        <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>knife4j-spring-ui</artifactId>
            <version>3.0.2</version>
        </dependency>
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger2</artifactId>
            <version>2.9.2</version>
        </dependency>
```

如果之后想更换回swagger2原生UI，把依赖替换为：
```xml
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger2</artifactId>
	<version>2.9.2</version>
</dependency>
<dependency>
	<groupId>io.springfox</groupId>
	<artifactId>springfox-swagger-ui</artifactId>
	<version>2.9.2</version>
</dependency>

```


**②编写控制类**
>只是换了个UI，控制类写法和swagger2还是一样的
```java
@Configuration
@EnableSwagger2
public class Knife4jConfiguration {

    @Bean
    public Docket createRestApi() {
        Docket docket = new Docket(DocumentationType.SWAGGER_2);

        //用于在Swagger界面上添加各种信息
        docket.apiInfo(apiInfo());

        // ApiSelectorBuilder 用来设置哪些类中的方法会生成到REST API中
        ApiSelectorBuilder selectorBuilder = docket.select();
        selectorBuilder.paths(PathSelectors.any()); //所有包下的类
        //使用@ApiOperation的方法会被提取到REST API中
        selectorBuilder.apis(RequestHandlerSelectors.withMethodAnnotation(ApiOperation.class));
        docket = selectorBuilder.build();
        /*
         * 下面的语句是开启对JWT的支持，当用户用Swagger调用受JWT认证保护的方法，
         * 必须要先提交参数（例如令牌）
         */
        //存储用户必须提交的参数
        List<ApiKey> apikey = new ArrayList();
        //规定用户需要输入什么参数
        apikey.add(new ApiKey("token", "token", "header"));
        docket.securitySchemes(apikey);

        //如果用户JWT认证通过，则在Swagger中全局有效
        AuthorizationScope scope = new AuthorizationScope("global", "accessEverything");
        AuthorizationScope[] scopeArray = {scope};
        //存储令牌和作用域
        SecurityReference reference = new SecurityReference("token", scopeArray);
        List refList = new ArrayList();
        refList.add(reference);
        SecurityContext context = SecurityContext.builder().securityReferences(refList).build();
        List cxtList = new ArrayList();
        cxtList.add(context);
        docket.securityContexts(cxtList);

        return docket;
    }

    private ApiInfo apiInfo() {

        return new ApiInfoBuilder()
                .title("我是title")
                .description("我是描述")
                .termsOfServiceUrl("http://localhost:8999/")
                .version("1.0")
                .build();
    }
}

```


**③我们来写个controller进行测试**
```java
@RestController
@Api("测试接口")
public class testController {

    @GetMapping("/test")
    @ApiOperation("测试方法")
    public String testSwagger(){
        return "我是测试";
    }

    @PostMapping("base/test2")
    @ApiOperation("第二个测试接口")
    public  String test2(int id){
        return "你好，用户"+id;
    }
}
```

**④启动项目访问localhost:8080/doc.html**
![在这里插入图片描述](https://img-blog.csdnimg.cn/2fe94d0c3b7c43bd95905c36a1485ee2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/25824e3ac9e244c0af293e89ce3dd18f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)
相比之前的原生UI我个人感觉看着更舒服了。

还有很多增强功能，这里就不一一展示了，详见官方文档：[https://doc.xiaominfo.com/knife4j/documentation/description.html](https://doc.xiaominfo.com/knife4j/documentation/description.html)