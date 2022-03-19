---
title: 'xx available:expected single matching bean but found 2:xx,xx'
date: 2022-03-19 12:48:30
tags:
password:
categories: 踩坑
---

# 问题描述
今天部署环境的时候一直部署失败，出现报错如下：
<font color=red>'PetWarRewardDao' available: expected single matching bean but found 2: PetWarRewardDao,petWarRewardDaoSqlImpl</font>

但是我很纳闷，`PetWarRewardDao`的两个实现类我都标了注解
![在这里插入图片描述](https://img-blog.csdnimg.cn/479faf2546b74ac89f3ef5d96ef51367.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/dd769e649b424b53b31710ca83d40589.png)
然后使用的地方也是用了`@Resource` ，为什么还会报错呢？
![在这里插入图片描述](https://img-blog.csdnimg.cn/53729e86e73a44bab0c8a3497e786ce3.png)
# 原因
原来`@resource` 虽然是按照名字去注入，它默认是按照名称注入，如果没有指定特别的名称，那么它会以变量名，也就是`petWarRewardDao`作为name。而bean容器中只有`PetWarRewardDao`。

# 解决
将`@Repository("PetWarRewardDao")`换为`@Repository("petWarRewardDao")` 