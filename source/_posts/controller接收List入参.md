---
title: controller接收List入参
date: 2022-09-21 11:52:15
tags: java json 开发语言
categories: 踩坑
---

<!--more-->

# 问题描述

controller需要接受一个List传参，但是联调的时候发现断点断上了但是请求进不来。  
当时代码如下

```java
    @RequestMapping(value = "/api/xx/xxx/xxx/batch/edit")
    public boolean treasureGiftBatchEdit(
            @RequestParam(value = "treasureChestInfoList") List<A> treasureChestInfoList
    ) {
		return true;
}
```

# 问题产生原因

list入参一般不直接使用List来接收，而是采用String来接收再使用JSON工具转化成想要的类型

# 解决

修改代码为如下：

```java
    @RequestMapping(value = "/api/xx/xxx/xxx/batch/edit")
    public boolean treasureGiftBatchEdit(
            @RequestParam(value = "treasureChestInfoList") String treasureChestInfoList
    ) {
        List<A> treasureGiftEditRequests = JsonUtils.readObject(treasureChestInfoList, new TypeReference<List<A>>() {
        });

        return true;
    }
```