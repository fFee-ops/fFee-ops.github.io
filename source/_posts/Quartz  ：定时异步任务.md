---
title: Quartz  ：定时异步任务
date: 2020-04-22 17:14:34
tags: 
categories: Spring
---

<!--more-->

### Quartz

- [独立使用](#_6)
- [Spring整合Quartz](#SpringQuartz_137)

  
一些基本概念：

任务：做什么事情… StudentService  
触发器：定义时间  
调度器：将任务、触发器 一一对应

# 独立使用

实现步骤：（独立使用）  
1.jar  
2.任务 :Job

```java

package org.cduck.service;

public class MeetingService {
    public void calClassMeeting(){
        System.out.println("需要提醒的任务(召开会议....)");
//        try {
//            Thread.sleep(5000);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
//        System.out.println("end.....");
    }
}

```

```java
public class PlanJob implements Job{
MeetingService service=new MeetingService();
	@Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        TriggerKey triggerkey =
                jobExecutionContext.getTrigger().getKey();

        JobKey jobKey = jobExecutionContext.getJobDetail().getKey();
        System.out.println("----");
        System.out.println(triggerkey+"\n"+jobKey);

        JobDataMap jobDataMap = jobExecutionContext.getJobDetail().getJobDataMap();
        List<String> infos = (List<String>)jobDataMap.get("infos");
        System.out.println(infos);



		//任务...
		  service.calClassMeeting();
       
    }

}
```

3.测试方法：Job 、 触发器 、调度器

```java
public class TestQuartz {

	public static void main(String[] args) throws SchedulerException, InterruptedException, ParseException {
		//PlanJob
		JobBuilder jobBuilder = JobBuilder.newJob(PlanJob.class);
		//产生实际使用的job
		JobDetail jobDetail = jobBuilder.withIdentity("meeting job", "group1").build();
		
        //向Job的execute()中传入一些参数。。。
//      JobDatMap
      JobDataMap jobDataMap = jobDetail.getJobDataMap();
      List<String> names = Arrays.asList(new String[]{"zs","ls","ww"});
      jobDataMap.put("infos",names);
		
		
		//触发器:时间规则  ，依赖两个对象（TriggerBuilder,Schedule）
		TriggerBuilder<Trigger> triggerBuilder = TriggerBuilder.newTrigger();
		triggerBuilder=triggerBuilder.withIdentity("meeting trigger", "group1");
		triggerBuilder.startNow();  //当满足条件，立刻执行
		
		SimpleDateFormat sdf=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		/*java.util.Date start=sdf.parse("2020-04-22 16:50:00");	
		java.util.Date end=sdf.parse("2020-04-22 16:50:45");	
		
		triggerBuilder.startAt(start);
		triggerBuilder.endAt(end);
		*/
		
		//scheduleBuilder：定执行的周期（什么时候执行）
		SimpleScheduleBuilder scheduleBuilder = SimpleScheduleBuilder.simpleSchedule();
		scheduleBuilder.withIntervalInSeconds(1);//每隔1秒执行一次
		scheduleBuilder.withRepeatCount(9);//把任务重复9次，一共是10次；
		/*
		
	上面的 SimpleScheduleBuilder还可以用CronScheduleBuilder来代替：

 	  CronScheduleBuilder cronScheduleBuilder = CronScheduleBuilder.cronSchedule("5,10,15,30,45 * * * * ? *");
 	  
 	    //产生触发器
        CronTrigger trigger = triggerBuilder.withSchedule(cronScheduleBuilder).build();
        
			*/ 
		
		//产生触发器
		SimpleTrigger trigger = triggerBuilder.withSchedule(scheduleBuilder).build();
		
		
		
		//调度器（由工厂产生）
		SchedulerFactory factory = new StdSchedulerFactory();
		//通过工厂产生实际使用的调度器
		Scheduler scheduler = factory.getScheduler();
		
		
		
		//通过调度器把任务和触发器整合在一起
		scheduler.scheduleJob(jobDetail, trigger);
		scheduler.start();
		
//		Thread.sleep(5000);
//		scheduler.shutdown();
		/*
		scheduler.shutdown()：立刻关闭
		scheduler.shutdown(false)：shutdown()立刻关闭
		scheduler.shutdown(true)：将当前任务执行完毕后 再关闭
		*/
	}
	
}

```

对于用CronScheduleBuilder，指定执行时机的语法解释：

```java
 	  CronScheduleBuilder X = CronScheduleBuilder
 	  .cronSchedule("5,10,15,30,45 * * * * ? *");
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200422171358282.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200422171410786.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200422171428869.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

# Spring整合Quartz

项目结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020042315153477.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
1.jar  
spring基础包\(spring-context-support.jar/spring-tx.jar\)+quartz  
2.  
a.将Job信息封装到一个 实体类中

```
存放JOBId等信息
package org.cduck.entity;

public class ScheduleJob {

	private String jobId;
	private String jobName;
	private String jobGroup;
	private String jobStatus;//0:禁用 1：启用
	private String cronExpression;
	public String getJobId() {
		return jobId;
	}
	public void setJobId(String jobId) {
		this.jobId = jobId;
	}
	public String getJobName() {
		return jobName;
	}
	public void setJobName(String jobName) {
		this.jobName = jobName;
	}
	public String getJobGroup() {
		return jobGroup;
	}
	public void setJobGroup(String jobGroup) {
		this.jobGroup = jobGroup;
	}
	public String getJobStatus() {
		return jobStatus;
	}
	public void setJobStatus(String jobStatus) {
		this.jobStatus = jobStatus;
	}
	public String getCronExpression() {
		return cronExpression;
	}
	public void setCronExpression(String cronExpression) {
		this.cronExpression = cronExpression;
	}
	 
}
```

```java
package org.cduck.job;

import org.cduck.entity.ScheduleJob;
import org.cduck.service.GameService;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class PlanJob implements Job {
GameService service=new GameService();
	@Override
	public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
		service.BeginGame();
		JobDataMap map = jobExecutionContext.getJobDetail().getJobDataMap();
		ScheduleJob job = (ScheduleJob) map.get("scheduleJob");
		System.out.println(job.getJobId());
		System.out.println(job.getJobName());
	}

}
---------------------------------------------------------------
package org.cduck.service;

public class GameService {
//任务事件
	public void BeginGame() {
		System.out.println("游戏开始....");
	}
}

```

b.spring配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">


<bean id="scheduleJobEntity" class="org.cduck.entity.ScheduleJob">
	<property name="jobId" value="job1"></property>
	<property name="jobName" value="firstjob"></property>
	<property name="jobStatus" value="1"></property>
	<property name="cronExpression" value="5,10,30,50 * * * * ? *"></property>
</bean>

<bean id="jobDetail" class="org.springframework.scheduling.quartz.JobDetailFactoryBean">
	<property name="jobDataAsMap">
		<map>
			<entry key="scheduleJob">
			<ref bean="scheduleJobEntity" />
			</entry>
		</map>
	</property>
	<property name="jobClass" value="org.cduck.job.PlanJob"></property>
</bean>


<!-- 触发器:定义时间规则 -->

<!--  
<bean id="cronTrigger" class="org.springframework.scheduling.quartz.CronTriggerFactoryBean">
	<property name="cronExpression" value="#{scheduleJobEntity.cronExpression}"></property>
	<property name="jobDetail" ref="jobDetail"></property>
</bean>
-->

<!-- simpleTrigger -->
<bean id="simpleTrigger" class="org.springframework.scheduling.quartz.SimpleTriggerFactoryBean">
	<property name="repeatInterval" value="2000"></property> <!-- 间隔两秒重复一次 -->
	<property name="repeatCount" value="10"></property><!-- 重复上10次 -->
	<property name="jobDetail" ref="jobDetail"></property>
</bean>

<!-- 调度器 -->
<bean id="scheduleFactoryBean" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
	<property name="triggers">
		<list>
			<ref bean="simpleTrigger"/>
		</list>
	</property>
</bean>
</beans>
```

_**和单独使用Quartz框架不同  
单独使用是：调度器将JOB和触发器连接起来  
而Spring整合则是调度器 去调用触发器（Job、执行时间），触发器内部包含了Job和执行时间，就等同于将Job与触发器连接起来。**_