---
title: 用Lombok注解class后发现class的boolean属性没有get方法
date: 2022-03-19 12:46:51
tags:
password:
categories: 踩坑
---

# 问题描述
今天有这么一段代码
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PetWarPeriodAwardDetail implements Serializable {
    private static final long serialVersionUID = -2969071324145901335L;

    /**
     * 伤害等级：{@link PetWarRewardEnum#getScoreLevel()}
     */
    private int scoreLevel;

    /**
     * 奖励名称：{@link PetWarRewardEnum#getRewardName()}
     */
    private String rewardName;

    /**
     * 奖励能量数目：{@link PetWarRewardEnum#getRewardEnergyNum()}
     */
    private String rewardEnergyNum;

    /**
     * 是否已经领取了奖励
     */
    private boolean reward;
}
```
我需要调用这个类的`getReward()` ，但是一直找不到
![在这里插入图片描述](https://img-blog.csdnimg.cn/8084b65719ca4b80bfa8b33f5e2e6983.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_19,color_FFFFFF,t_70,g_se,x_16)

# 原因
Java实体类中Boolean 类型的属相生成get方法时有些生成的是is而不是get。
![在这里插入图片描述](https://img-blog.csdnimg.cn/2c94453551014b50a2e4bb6cd5cf40a7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)