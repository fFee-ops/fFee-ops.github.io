---
title: JVM、GC
date: 2022-01-21 20:01:58
tags:
password: f0c3a40bc7adb2998a8ee70350e5d74ce7fa33f303f2b60f5e9ed13998af2d3d
categories: 私密文章
---

@[toc](JVM、GC)

#  CMS错标对象的修正算法(三色标记算法)
<font color=red>**fields：属性**</font>
![三色标记法](https://img-blog.csdnimg.cn/20201210105717132.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

但是这个方法有个问题，在我扫描完A将其标记成黑色后，再去扫描B，发现B-D连接消失了，但是此时A-D又建立了连接，但是因为A已经被标记成黑色了，就不会回头再扫描和A相连的节点了，也就是D虽然有A引用，但是GC发现不了，任然会把D当作垃圾给清除掉。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210105946211.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)


**CMS的解决方案：Incremental Update**

即当有一个新的引用产生的时候，二话不说就给你的A标记为灰色，到时候还要再扫描一次和A的属性有引用的节点（可以简单理解为和A相连的节点）。这样就能扫描到D了
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210110318778.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
但是上面这个解决方案隐含着一个巨大的BUG
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201210110945748.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

**所以在CMS的remake阶段，必须从头扫描一遍**





#  JVM调优第一步，了解JVM常用命令行参数
HotSpot参数分类
>标准： - 开头，所有的HotSpot都支持<br>
>非标准：-X 开头，特定版本HotSpot支持特定命令<br>
>不稳定：-XX 开头，下个版本可能取消

**调优前的基础概念：**
1. 吞吐量：用户代码时间 /（用户代码执行时间 + 垃圾回收时间）
2. 响应时间：STW越短，响应时间越好

**问题：**
所谓调优，首先确定，追求啥？吞吐量优先，还是响应时间优先？还是在满足一定的响应时间的情况下，要求达到多大的吞吐量...

>科学计算，吞吐量。数据挖掘，thrput。吞吐量优先的一般：（PS + PO）
>响应时间：网站 GUI API （1.8 G1）


**什么是调优**
1. 根据需求进行JVM规划和预调优
2. 优化运行JVM运行环境（慢，卡顿）
3. 解决JVM运行过程中出现的各种问题(OOM)



##  调优从规划开始
- 调优，从业务场景开始，没有业务场景的调优都是耍流氓
- 无监控（压力测试，能看到结果），不调优
- 步骤：
  1. 熟悉业务场景（没有最好的垃圾回收器，只有最合适的垃圾回收器）
     1. 响应时间、停顿时间 [CMS G1 ZGC] （需要给用户作响应）
     2. 吞吐量 = 用户时间 /( 用户时间 + GC时间) [PS]
  2. 选择回收器组合
  3. 计算内存需求（经验值 1.5G 16G）
  4. 选定CPU（越高越好）
  5. 设定年代大小、升级年龄
  6. 设定日志参数
     1. `-Xloggc:/opt/xxx/logs/xxx-xxx-gc-%t.log -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=20M -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCCause`
     2. 或者每天产生一个日志文件
  7. 观察日志情况

- 案例1：垂直电商，最高每日百万订单，处理订单系统需要什么样的服务器配置？

  > 这个问题比较业余，因为很多不同的服务器配置都能支撑(1.5G 16G)
  >
  > 1小时360000集中时间段， 100个订单/秒，（找一小时内的高峰期，1000订单/秒）
  >
  > 经验值，
  >
  > 非要计算：一个订单产生需要多少内存？512K * 1000 500M内存
  >
  > 专业一点儿问法：要求响应时间100ms
  >
  > 压测！

- 案例2：12306遭遇春节大规模抢票应该如何支撑？

  > 12306应该是中国并发量最大的秒杀网站：
  >
  > 号称并发量100W最高
  >
  > CDN -> LVS -> NGINX -> 业务系统 -> 每台机器1W并发（10K问题） 100台机器
  >
  > 普通电商订单 -> 下单 ->订单系统（IO）减库存 ->等待用户付款
  >
  > 12306的一种可能的模型： 下单 -> 减库存 和 订单(redis kafka) 同时异步进行 ->等付款
  >
  > 减库存最后还会把压力压到一台服务器
  >
  > 可以做分布式本地库存 + 单独服务器做库存均衡
  >
  > 大流量的处理方法：分而治之

- 怎么得到一个事务会消耗多少内存？

  > 1. 弄台机器，看能承受多少TPS？是不是达到目标？扩容或调优，让它达到
  > 2. 用压测来确定


##  优化环境
1. 有一个50万PV的资料类网站（从磁盘提取文档到内存）原服务器32位，1.5G的堆，用户反馈网站比较缓慢，因此公司决定升级，新的服务器为64位，16G的堆内存，结果用户反馈卡顿十分严重，反而比以前效率更低了
   1. 为什么原网站慢?
      很多用户浏览数据，很多数据load到内存，内存不足，频繁GC，STW长，响应时间变慢
   2. 为什么会更卡顿？
      内存越大，FGC时间越长
   3. 咋办？
      PS -> PN + CMS 或者 G1
2. 系统CPU经常100%，如何调优？(面试高频)
   CPU100%那么一定有线程在占用系统资源，
   1. 找出哪个进程cpu高（top）
   2. 该进程中的哪个线程cpu高（top -Hp）
   3. 导出该线程的堆栈 (jstack)
   4. 查找哪个方法（栈帧）消耗时间 (jstack)
   5. 工作线程占比高 | 垃圾回收线程占比高
3. 系统内存飙高，如何查找问题？（面试高频）
   1. 导出堆内存 (jmap)
   2. 分析 (jhat jvisualvm mat jprofiler ... )
4. 如何监控JVM
   1. jstat jvisualvm jprofiler arthas top...



##  解决JVM运行中的问题

###  一个案例理解常用工具
1. 测试代码：

   ```java
   import java.math.BigDecimal;
   import java.util.ArrayList;
   import java.util.Date;
   import java.util.List;
   import java.util.concurrent.ScheduledThreadPoolExecutor;
   import java.util.concurrent.ThreadPoolExecutor;
   import java.util.concurrent.TimeUnit;

   /**
    * 从数据库中读取信用数据，套用模型，并把结果进行记录和传输
    */

   public class T15_FullGC_Problem01 {

       private static class CardInfo {
           BigDecimal price = new BigDecimal(0.0);
           String name = "张三";
           int age = 5;
           Date birthdate = new Date();

           public void m() {}
       }

       private static ScheduledThreadPoolExecutor executor = new ScheduledThreadPoolExecutor(50,
               new ThreadPoolExecutor.DiscardOldestPolicy());

       public static void main(String[] args) throws Exception {
           executor.setMaximumPoolSize(50);

           for (;;){
               modelFit();
               Thread.sleep(100);
           }
       }

       private static void modelFit(){
           List<CardInfo> taskList = getAllCardInfo();
           taskList.forEach(info -> {
               // do something
               executor.scheduleWithFixedDelay(() -> {
                   //do sth with info
                   info.m();

               }, 2, 3, TimeUnit.SECONDS);
           });
       }

       private static List<CardInfo> getAllCardInfo(){
           List<CardInfo> taskList = new ArrayList<>();

           for (int i = 0; i < 100; i++) {
               CardInfo ci = new CardInfo();
               taskList.add(ci);
           }

           return taskList;
       }
   }

   ```

2. java -Xms200M -Xmx200M -XX:+PrintGC com.mashibing.jvm.gc.T15_FullGC_Problem01（<font color=gray size=3>将小程序跑起来</font>）

3. 一般是运维团队首先受到报警信息（CPU Memory）

4. top命令观察到问题：内存不断增长 CPU占用率居高不下

5. top -Hp 观察进程中的线程，哪个线程CPU和内存占比高

6. jps定位具体java进程
   jstack 定位线程状况，重点关注：WAITING BLOCKED
   eg.
   waiting on <0x0000000088ca3310> (a java.lang.Object)
   假如有一个进程中100个线程，很多线程都在waiting on <xx> ，一定要找到是哪个线程持有这把锁
   怎么找？搜索jstack dump的信息，找<xx> ，看哪个线程持有这把锁RUNNABLE
   作业：1：写一个死锁程序，用jstack观察 2 ：写一个程序，一个线程持有锁不释放，其他线程等待

7. 为什么阿里规范里规定，线程的名称（尤其是线程池）都要写有意义的名称
   怎么样自定义线程池里的线程名称？（自定义ThreadFactory）

8. jinfo pid 

9. jstat -gc 动态观察gc情况 / 阅读GC日志发现频繁GC / arthas观察 / jconsole/jvisualVM/ Jprofiler（最好用）
   jstat -gc 4655 500 : 每个500个毫秒打印GC的情况
   如果面试官问你是怎么定位OOM问题的？如果你回答用图形界面（错误）
   1：已经上线的系统不用图形界面用什么？（cmdline arthas）
   2：图形界面到底用在什么地方？测试！测试的时候进行监控！（压测观察）

10. jmap - histo 4655 | head -20，查找有多少对象产生

11. jmap -dump:format=b,file=xxx pid ：

    线上系统，内存特别大，jmap执行期间会对进程产生很大影响，甚至卡顿（电商不适合）
    1：设定了参数HeapDump，OOM的时候会自动产生堆转储文件（不是很专业，因为多有监控，内存增长就会报警）
    2：<font color='red'>很多服务器备份（高可用），停掉这台服务器对其他服务器不影响</font>
    3：在线定位(一般小点儿公司用不到)

    4：在测试环境中压测（产生类似内存增长问题，在堆还不是很大的时候进行转储）

12. java -Xms20M -Xmx20M -XX:+UseParallelGC -XX:+HeapDumpOnOutOfMemoryError com.mashibing.jvm.gc.T15_FullGC_Problem01

13. 使用MAT / jhat /jvisualvm 进行dump文件分析
    https://www.cnblogs.com/baihuitestsoftware/articles/6406271.html 
    jhat -J-mx512M xxx.dump

```
http://192.168.17.11:7000
拉到最后：找到对应链接
可以使用OQL查找特定问题对象
```

14. 找到代码的问题




#  JVM调优案例汇总
OOM产生的原因多种多样，有些程序未必产生OOM，不断FGC(CPU飙高，但内存回收特别少) （上面案例）

1. 硬件升级系统反而卡顿的问题（见上）

2. 线程池不当运用产生OOM问题（见上）
   不断的往List里加对象（实在太LOW）

3. smile jira问题
   实际系统不断重启
   解决问题 加内存 + 更换垃圾回收器 G1
   真正问题在哪儿？不知道

4. tomcat http-header-size过大问题（Hector）

5. lambda表达式导致方法区溢出问题(MethodArea / Perm Metaspace)
   LambdaGC.java     -XX:MaxMetaspaceSize=9M -XX:+PrintGCDetails

   ```java
   "C:\Program Files\Java\jdk1.8.0_181\bin\java.exe" -XX:MaxMetaspaceSize=9M -XX:+PrintGCDetails "-javaagent:C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2019.1\lib\idea_rt.jar=49316:C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2019.1\bin" -Dfile.encoding=UTF-8 -classpath "C:\Program Files\Java\jdk1.8.0_181\jre\lib\charsets.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\deploy.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\access-bridge-64.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\cldrdata.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\dnsns.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\jaccess.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\jfxrt.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\localedata.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\nashorn.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunec.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunjce_provider.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunmscapi.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunpkcs11.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\zipfs.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\javaws.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jce.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jfr.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jfxswt.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jsse.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\management-agent.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\plugin.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\resources.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\rt.jar;C:\work\ijprojects\JVM\out\production\JVM;C:\work\ijprojects\ObjectSize\out\artifacts\ObjectSize_jar\ObjectSize.jar" com.mashibing.jvm.gc.LambdaGC
   [GC (Metadata GC Threshold) [PSYoungGen: 11341K->1880K(38400K)] 11341K->1888K(125952K), 0.0022190 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
   [Full GC (Metadata GC Threshold) [PSYoungGen: 1880K->0K(38400K)] [ParOldGen: 8K->1777K(35328K)] 1888K->1777K(73728K), [Metaspace: 8164K->8164K(1056768K)], 0.0100681 secs] [Times: user=0.02 sys=0.00, real=0.01 secs] 
   [GC (Last ditch collection) [PSYoungGen: 0K->0K(38400K)] 1777K->1777K(73728K), 0.0005698 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
   [Full GC (Last ditch collection) [PSYoungGen: 0K->0K(38400K)] [ParOldGen: 1777K->1629K(67584K)] 1777K->1629K(105984K), [Metaspace: 8164K->8156K(1056768K)], 0.0124299 secs] [Times: user=0.06 sys=0.00, real=0.01 secs] 
   java.lang.reflect.InvocationTargetException
   	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
   	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
   	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
   	at java.lang.reflect.Method.invoke(Method.java:498)
   	at sun.instrument.InstrumentationImpl.loadClassAndStartAgent(InstrumentationImpl.java:388)
   	at sun.instrument.InstrumentationImpl.loadClassAndCallAgentmain(InstrumentationImpl.java:411)
   Caused by: java.lang.OutOfMemoryError: Compressed class space
   	at sun.misc.Unsafe.defineClass(Native Method)
   	at sun.reflect.ClassDefiner.defineClass(ClassDefiner.java:63)
   	at sun.reflect.MethodAccessorGenerator$1.run(MethodAccessorGenerator.java:399)
   	at sun.reflect.MethodAccessorGenerator$1.run(MethodAccessorGenerator.java:394)
   	at java.security.AccessController.doPrivileged(Native Method)
   	at sun.reflect.MethodAccessorGenerator.generate(MethodAccessorGenerator.java:393)
   	at sun.reflect.MethodAccessorGenerator.generateSerializationConstructor(MethodAccessorGenerator.java:112)
   	at sun.reflect.ReflectionFactory.generateConstructor(ReflectionFactory.java:398)
   	at sun.reflect.ReflectionFactory.newConstructorForSerialization(ReflectionFactory.java:360)
   	at java.io.ObjectStreamClass.getSerializableConstructor(ObjectStreamClass.java:1574)
   	at java.io.ObjectStreamClass.access$1500(ObjectStreamClass.java:79)
   	at java.io.ObjectStreamClass$3.run(ObjectStreamClass.java:519)
   	at java.io.ObjectStreamClass$3.run(ObjectStreamClass.java:494)
   	at java.security.AccessController.doPrivileged(Native Method)
   	at java.io.ObjectStreamClass.<init>(ObjectStreamClass.java:494)
   	at java.io.ObjectStreamClass.lookup(ObjectStreamClass.java:391)
   	at java.io.ObjectOutputStream.writeObject0(ObjectOutputStream.java:1134)
   	at java.io.ObjectOutputStream.defaultWriteFields(ObjectOutputStream.java:1548)
   	at java.io.ObjectOutputStream.writeSerialData(ObjectOutputStream.java:1509)
   	at java.io.ObjectOutputStream.writeOrdinaryObject(ObjectOutputStream.java:1432)
   	at java.io.ObjectOutputStream.writeObject0(ObjectOutputStream.java:1178)
   	at java.io.ObjectOutputStream.writeObject(ObjectOutputStream.java:348)
   	at javax.management.remote.rmi.RMIConnectorServer.encodeJRMPStub(RMIConnectorServer.java:727)
   	at javax.management.remote.rmi.RMIConnectorServer.encodeStub(RMIConnectorServer.java:719)
   	at javax.management.remote.rmi.RMIConnectorServer.encodeStubInAddress(RMIConnectorServer.java:690)
   	at javax.management.remote.rmi.RMIConnectorServer.start(RMIConnectorServer.java:439)
   	at sun.management.jmxremote.ConnectorBootstrap.startLocalConnectorServer(ConnectorBootstrap.java:550)
   	at sun.management.Agent.startLocalManagementAgent(Agent.java:137)

   ```

6. 直接内存溢出问题（少见）
   《深入理解Java虚拟机》P59，使用Unsafe分配直接内存，或者使用NIO的问题

7. 栈溢出问题
   -Xss设定太小

8. 比较一下这两段程序的异同，分析哪一个是更优的写法：

   ```java 
   Object o = null;
   for(int i=0; i<100; i++) {
       o = new Object();
       //业务处理
   }
   ```

   ```java
   for(int i=0; i<100; i++) {
       Object o = new Object();
   }
   ```

9. 重写finalize引发频繁GC
   小米云，HBase同步系统，系统通过nginx访问超时报警，最后排查，C++程序员重写finalize引发频繁GC问题
   为什么C++程序员会重写finalize？（new delete）
   finalize耗时比较长（200ms）

10. 如果有一个系统，内存一直消耗不超过10%，但是观察GC日志，发现FGC总是频繁产生，会是什么引起的？
  System.gc() (这个比较Low)

11. Distuptor有个可以设置链的长度，如果过大，然后对象大，消费完不主动释放，会溢出 (来自 死物风情)

12. 用jvm都会溢出，mycat用崩过，1.6.5某个临时版本解析sql子查询算法有问题，9个exists的联合sql就导致生成几百万的对象（来自 死物风情）

13. new 大量线程，会产生 native thread OOM，（low）应该用线程池，
    解决方案：减少堆空间（太TMlow了）,预留更多内存产生native thread
    JVM内存占物理内存比例 50% - 80%

14. 近期学生案例SQLLite的类库，批处理的时候会把所有的结果加载内存，有的人一下子更新几十万条数据，结果就产生了内存溢出，定位上用的是排除法，去掉这个模块就没问题，加上该模块就会出问题

15. java在线解压以及压缩文件造成的内存溢出

16. java使用opencv造成的卡顿与缓慢

17. 最容易引起崩溃的报表系统

18. 分库分表所引起的系统崩溃


#  JVM垃圾回收的时候如何确定垃圾？是否知道什么是GC Roots
①简单地说，内存中已经不再被使用到的空间就是垃圾
②Java中可作为GC Roots的对象：
>①虚拟机栈（栈帧中的局部变量表）中引用的对象
>②方法区中的静态属性引用的对象
>③方法区中常量引用的对象
>④本地方法栈JNI（Native方法）引用的对象
#  如何盘点查看JVM系统默认值
##  JVM参数类型
**①标配参数(在JDK之间各个版本都比较稳定，很少有大的变化)**
>-version
>-help
>java -showversion

**②x参数（了解）**
>-Xint：解释执行
>-Xcomp：第一次使用就编译成本地代码
>-Xmixed：混合模式

**③<font color=red >xx参数</font>**
Boolean类型
>公式`-XX：+或者- 某个属性(+表示开启、-表示关闭)`
>Case：开启打印GC收集细节`-XX:+PrintGCDetails`


KV设值类型
>公式：-XX:属性key=属性值value
>Case：-XX:MetaspaceSize=128m


##  jinfo举例，如何查看当前运行程序的配置
公式：①jinfo -flag 配置项 进程编号②jinfo -flags 进程编号


##  题外话（坑题）
两个经典参数：`-Xms和-Xmx`

>-Xms等价于-XX:InitialHeapSize
>-Xmx等价于-XX:MaxHeapSize

#  盘点家底，查看JVM默认值
##  -XX:+PrintFlagsInitial
主要查看初始默认值

公式①`java -XX:+PrintFlagsInitial -version`
②`java -XX:+PrintFlagsInitial`

##  -XX:+PrintFlagsfinal
公式：`java -XX:+PrintFlagsFinal -version`


PrintFlagsFinal举例，运行Java命令的同时打印出参数

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105094303232.png)
##  -XX:+PrintCommandLineFlags
也是查看程序使用的默认JVM参数
但是显示的参数比较少，我们一般用它来看默认的垃圾收集器


语法：`java -XX:+PrintCommandLineFlags -version`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105095034939.png)

#  强引用、软引用、弱引用、虚引用分别是什么
[强、软、弱、虚的简介](https://sliing.blog.csdn.net/article/details/108843246)

##  你知道弱引用的话，谈谈WeakHashMap
我们来看一个代码
```java
    public static void myHashMap() {
        HashMap hashMap = new HashMap();
        Integer key = new Integer(1);
        String value = "HashMap";

        hashMap.put(key, value);
        System.out.println(hashMap);

        key = null;
        System.out.println(hashMap);

        System.gc();
        System.out.println(hashMap + "\t" + hashMap.size());
    }
```
![运行结果](https://img-blog.csdnimg.cn/2021010510040188.png)
可以看到普通HashMap在gc对其无影响。
当然有个那个key = null;这是不影响HashMap的，因为已经存放进去了。

```java
 public static void myWeakHashMap() {
        WeakHashMap weakHashMap = new WeakHashMap();
        Integer key = new Integer(2);
        String value = "WeakHashMap";

        weakHashMap.put(key, value);
        System.out.println(weakHashMap);

        key = null;
        System.out.println(weakHashMap);

        System.gc();
        System.out.println(weakHashMap + "\t" + weakHashMap.size());
    }
```

![结果](https://img-blog.csdnimg.cn/20210105100622980.png)


可以看到如果用weakHashMap一旦GC就会被清除


#  请谈谈你对OOM的认识
![整体架构图](https://img-blog.csdnimg.cn/20210105101304320.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)




##  1、java.lang.StackOverflowError
```java
public static void main(String[] args) {
stackOverflow();
    }

private static void stackOverflow() {
stackOverflow();
    }
}
```


## 2、java.lang.OutOfMemoryError:Java heap space
![堆内存改小一点](https://img-blog.csdnimg.cn/20210105101417734.png)

```java
public class JavaHeapSpaceDemo {

public static void main(String[] args) {
byte[] bytes = new byte[20 * 1024 * 1024];
    }
}
```


## 3、java.lang.OutOfMemoryError:GC overhead limit exceeded


![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105101754105.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)


解决方法：
1、增加heap堆内存
2、增加对内存后错误依旧,获取heap内存快照，使用Eclipse MAT工具，找出内存泄露发生的原因并进行修复
3、优化代码以使用更少的内存或重用对象而不是创建新的对象,从而减少垃圾收集器运行的次数。如果代码中创建了许多临时对象(例如在循环中),应该尝试重用它们
4、升级JDK到1.8，使用G1 GC垃圾回收算法
5、除了使用命令-xms -xmx设置堆内存之外,尝试在启动脚本中加入配置
```shell
-XX: +UseG1GC -XX: G1HeapRegionsize=n -XX: MaxGCPauseMillis=m
-XX: ParallelGCThreads=n -XX: ConcGCThreads=n
```


## 4、java.lang.OutOfMemoryError:Direct buffer memory
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105102347597.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105102415844.png)
```java
public class DirectBufferMemoryDemo {

public static void main(String[] args) {
        System.out.println("配置的maxDirectMemory" + (sun.misc.VM.maxDirectMemory() / (double)1024 / 1024) + "MB");
        ByteBuffer byteBuffer = ByteBuffer.allocateDirect(6 * 1024 * 1024);
    }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105102502633.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)


## 5、java.lang.OutOfMemoryError:unable to create new native thread

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105102851255.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)



非root用户登录Linux系统测试：
把下面这个放到Linux中执行

```java
public class UnableCreateNewThreadDemo {

public static void main(String[] args) {
for (int i = 1; ; i++) {
            System.out.println(i);
new Thread(() -> {
try {
                    Thread.sleep(Integer.MAX_VALUE);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
```

**服务器级别调参调优:**
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105103053577.png)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105103109362.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105103118897.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

##  6、java.lang.OutOfMemoryError:Metaspace
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105103245253.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

```java
public class MetaSpaceOOMDemo {

static class OOMTest{}

public static void main(String[] args) {
int i = 0;
try {
while (true) {
                i++;
                Enhancer enhancer = new Enhancer();
                enhancer.setSuperclass(OOMTest.class);
                enhancer.setUseCache(false);
                enhancer.setCallback(new MethodInterceptor() {
@Override
public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
return methodProxy.invokeSuper(o, args);
                    }
                });
                enhancer.create();
            }
        } catch (Throwable e) {
            System.out.println("多少次后产生异常：" + i);
            e.printStackTrace();
        }

    }
}
```
>使用`java -XX:+PrintFlagsInitial`命令查看本机的初始化参数，-XX:MetaSpaceSize约为22M


#  GC垃圾回收算法和垃圾收集器的关系？分别是什么
GC算法（引用计数/复制/标记清除/标记整理）是内存回收的方法论，垃圾收集器是算法的落地实现

>1. Serial 收集器：历史最悠久，单线程工作，回收垃圾时，必须暂停所有其它线程——stop the world，采用<font color=red>**复制**算法；</font>
>2. ParNew收集器：本质为Serial收集器的多线程版本，采用<font color=red>**复制**算法；</font>
>3. Parallel scavenge：具备自使用调节功能，以提供最合适的暂停时间和吞吐量，采用<font color=red>复制算法；</font>
>4. Serial old 收集器：是Serial 收集器的老年代版本，同样为单线程，但采用的是<font color=red>“标记-整理”算法；</font>
>5. Parallel old 收集器：Parallel scavenge 收集器的老年代版本，多线程，采用的是<font color=red>“标记-整理”算法；</font>
>6. CMS 收集器：即Concurrent Mark Sweep收集器，以获取最短停顿时间为目标，采用<font color=red>“标记-清除”算法；</font>
>7. G1 收集器： 即Garbage-First收集器，是目前最新的收集器，采用与其它收集器完全不通的设计思想，历时十年才实现商用，采用了混合算法，<font color=red>兼有“复制”和“标记-整理”算法的特点；</font>


#  怎么看服务器默认的垃圾收集器是哪个？生产上如何配置垃圾收集器？ 谈谈你对垃圾收集器的理解
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105103848450.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105104250486.png)
**Server/Client模式分别是什么意思**
适用范围:只需要掌握 Server模式即可, Client模式基本不会用
>32操作系统:
>32位 Window操作系统,不论硬件如何都默认使用 Client的JVM模式
>32位其它操作系统,2G内存同时有2个cpu以上用 Server模式,低于该配置还是 Client模式
>64位 only server模式
>
>**[有关GC收集器的其余知识](https://sliing.blog.csdn.net/article/details/108849570)**

**[垃圾收集算法的其余知识](https://sliing.blog.csdn.net/article/details/108803930)**

#  生产环境服务器变慢，诊断思路和性能评估

>整机：`top`

>CPU：`vmstat`
>查看CPU
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105191421157.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105191442318.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>查看额外信息：
>①查看所有cpu核信息`mpstat -P ALL 2 （每两秒采样一次）`
>②每个进程使用cpu的用量分解信息`pidstat -u 1 -p 进程编号`

>内存：`free`
>应用程序可用内存数
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105191606359.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>查看额外：`pidstat -p 进程号 -r 采样间隔秒数`

>硬盘：`df`
>查看磁盘剩余空间数
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105191646222.png)
>加个`-h`是为了方便我们观看

>磁盘io：`iostat `
>磁盘IO性能评估：
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105191900837.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105191915565.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)


>网络io：`ifstat`
>默认本地没有，需要下载ifstat
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105192006529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
>查看网络IO
>![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105192029855.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)

#  假如生产环境出现CPU占用过高，请谈谈你的分析思路和定位
大体思路是结合JDK和Linux命令一块分析
**案例步骤：**
①先用`top`命令找出cpu占比最高的，记下PID
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105192127836.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)
②`ps -ef`或`jps`进一步定位
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105192206992.png)
③定位到具体的线程或代码
`ps -mp 进程号 -o THREAD,tid,time`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105192311246.png)
>-m 显示所有的线程
>-p pid进程使用cpu的时间
>-o 该参数后是用户自定义的格式

④将需要的线程ID转换为16进制格式（英文小写格式）
`printf "%x\n" 有问题的线程ID`
⑤`jstack 进程ID | grep tid（16进制线程ID小写英文）-A60`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105192448585.png)
>-A60 打印出前60行

#  一些常用的性能监控工具
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210105192538451.png)