---
title: Skywalking Agent与Byte Buddy的使用及原理
date: 2021-12-04 20:14:52
tags: jar java 开发语言
categories: Skywalking
---

<!--more-->

### Skywalking Agent与Byte Buddy的使用及原理

- [1 agent原理](#1_agent_2)
- - [1.1 Java Agent](#11_Java_Agent_5)
  - [1.2 定义自己的agent](#12_agent_24)
  - [1.3 自定义方法耗时统计](#13__133)
- [2 Byte Buddy](#2_Byte_Buddy_308)
- - [2.1 Byte Buddy应用场景](#21_Byte_Buddy_312)
  - [2.2 ByteBuddy语法](#22_ByteBuddy_325)
  - [2.3 ByteBuddy创建代理](#23_ByteBuddy_378)
  - [2.4 ByteBuddy程序中的应用](#24_ByteBuddy_450)

# 1 agent原理

使用Skywalking的时候，并没有修改程序中任何一行 Java 代码，这里便使用到了 Java Agent 技术

## 1.1 Java Agent

Java Agent 是从 JDK1.5 开始引入的，算是一个比较老的技术了。作为 Java 的开发工程师，我们常用的命令之一就是 java 命令，而 Java Agent 本身就是 java 命令的一个参数（即 \-javaagent）。正如上一课时接入 SkyWalking Agent 那样，-javaagent 参数之后需要指定一个 jar 包，这个 jar 包需要同时满足下面两个条件：

1.  在 META-INF 目录下的 MANIFEST.MF 文件中必须指定 premain-class 配置项。
2.  premain-class 配置项指定的类必须提供了 premain\(\) 方法。

在 Java 虚拟机启动时，执行 main\(\) 函数之前，虚拟机会先找到 \-javaagent 命令指定 jar 包，然后执行premain-class 中的 premain\(\) 方法。用一句概括其功能的话就是：**main\(\) 函数之前的一个拦截器。**

使用 Java Agent 的步骤大致如下：

1.  定义一个 MANIFEST.MF 文件，在其中添加 premain-class 配置项。
2.  创建 premain-class 配置项指定的类，并在其中实现 premain\(\) 方法，方法签名如下：
    ```java
    public static void premain(String agentArgs, Instrumentation inst){
    //...
    }
    ```
3.  将 MANIFEST.MF 文件和 premain-class 指定的类一起打包成一个 jar 包。
4.  使用 -javaagent 指定该 jar 包的路径即可执行其中的 premain\(\) 方法。

## 1.2 定义自己的agent

工程结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/293e99b93c72485eb9186fd3ef4a6256.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_14,color_FFFFFF,t_70,g_se,x_16)  
**1\)探针工程**  
创建工程 `hailtaxi-agent` 用来编写agent包，该类需要用 `maven-assembly-plugin` 打包，我们先引入该插件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.itheima</groupId>
    <artifactId>hailtaxi-agent</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>net.bytebuddy</groupId>
            <artifactId>byte-buddy</artifactId>
            <version>1.9.2</version>
        </dependency>
        <dependency>
            <groupId>net.bytebuddy</groupId>
            <artifactId>byte-buddy-agent</artifactId>
            <version>1.9.2</version>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <artifactId>maven-assembly-plugin</artifactId>
                <configuration>
                    <appendAssemblyId>false</appendAssemblyId>
                    <descriptorRefs>
                        <descriptorRef>jar-with-dependencies</descriptorRef>
                    </descriptorRefs>
                    <archive> <!--自动添加META-INF/MANIFEST.MF -->
                        <manifest>
                            <!-- 添加 mplementation-*和Specification-*配置项-->
                            <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
                            <addDefaultSpecificationEntries>true</addDefaultSpecificationEntries>
                        </manifest>
                        <!-- 将 premain-class 配置项设置为com.itheima.LoginAgent-->
                        <manifestEntries>
                            <Premain-Class>com.itheima.LoginAgent</Premain-Class>
                            <!--<Premain-Class>com.itheima.AgentByteBuddy</Premain-Class>-->
                        </manifestEntries>
                    </archive>
                </configuration>
                <executions>
                    <execution>
                        <id>make-assembly</id>
                        <phase>package</phase>
                        <goals>
                            <goal>single</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

在该工程中编写一个类 com.itheima.LoginAgent ：

```java
public class LoginAgent {

    /***
     * 执行方法拦截
     * @param agentArgs：-javaagent 命令携带的参数。在前面介绍 SkyWalking Agent 接入时提到
     *                 agent.service_name 这个配置项的默认值有三种覆盖方式，
     *                 其中，使用探针配置进行覆盖，探针配置的值就是通过该参数传入的。
     * @param inst：java.lang.instrumen.Instrumentation 是 Instrumention 包中定义的一个接口，它提供了操作类定义的相关方法。
     */
    public static void premain(String agentArgs, Instrumentation inst){
        System.out.println("参数:" + agentArgs);
    }
}
```

再把该工程打成jar包,此时我们把jar包解压， MANIFEST.MF 内容如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/eb875cd4eee745b981453074ade62d1c.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a3328a2bae84412981941537013df138.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

**2\)普通工程**  
我们再创建一个普通工程 `hailtaxi-user` ，在该工程中创建一个普通类  
com.itheima.agent.UserInfo 并编写main方法：

```java
public class UserInfo {

    public static void main(String[] args) throws InterruptedException {
        System.out.println("张三是个中国人！");
    }
```

我们再将如下参数配置到IDEA中：

```xml
-javaagent:D:\IDEAworkspace\skywalking\hailtaxi-agent\target\hailtaxi-agent-1.0-SNAPSHOT.jar=hailtaxi-user
```

如果是多个参数，可以这么写 `-javaagent:/xxx.jar=option1=value1,option2=value2`  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b38096dc04ef4242813f2bd228b3e837.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
此时运行效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1f8e576e020847269684e90f07da660b.png)

## 1.3 自定义方法耗时统计

`Java Agent` 能做的事情非常多，而刚才打印一句日志只是一个能功能展示。要想使用 java agent 做更多事，这里需要关注一下 premain\(\) 方法中的第二个参数：`Instrumentation` 。Instrumentation 位于`java.lang.instrument`包中，通过这个工具包，我们可以编写一个强大的Java Agent 程序。

下面先来简单介绍一下 Instrumentation 中的核心 API 方法：

- **addTransformer\(\)/removeTransformer\(\)** 方法：注册/注销一个 ClassFileTransformer 类的实例，该 Transformer 会在类加载的时候被调用，可用于修改类定义。
- **redefineClasses**\(\) 方法：该方法针对的是已经加载的类，它会对传入的类进行重新定义。
- **getAllLoadedClasses**\(\)方法：返回当前 JVM 已加载的所有类。
- **getInitiatedClasses**\(\) 方法：返回当前 JVM 已经初始化的类。
- **getObjectSize**\(\)方法：获取参数指定的对象的大小。

我们要想实现更复杂的功能，需要先学习下`Byte Buddy` ，我们接下来学习下byte buddy并且基于bytebuddy写出更多复杂应用。

**1\)Byte Buddy介绍**  
Byte Buddy 是一个开源 Java 库，其主要功能是帮助用户屏蔽字节码操作，以及复杂的`Instrumentation API` 。Byte Buddy 提供了一套类型安全的 API 和注解，我们可以直接使用这些 API 和注解轻松实现复杂的字节码操作。另外，Byte Buddy 提供了针对 Java Agent 的额外 API，帮助开发人员在 Java Agent 场景轻松增强已有代码。

学习完上面方法后，我们基于java agent写一个统计方法耗时流程，此时我们需要将 Java Agent 与Byte Buddy 结合使用，统计`com.itheima.agent.UserInfo`下所有方法的耗时。

**2\)引入依赖**  
在 hailtaxi-agent 中引入byte buddy依赖：

```xml
<dependencies>
		<dependency>
				<groupId>net.bytebuddy</groupId>
				<artifactId>byte-buddy</artifactId>
				<version>1.9.2</version>
		</dependency>
		<dependency>
				<groupId>net.bytebuddy</groupId>
				<artifactId>byte-buddy-agent</artifactId>
				<version>1.9.2</version>
		</dependency>
</dependencies>
```

**3\)创建统计拦截器**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/daef9896584c4948a486aec65c49d0ad.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_18,color_FFFFFF,t_70,g_se,x_16)

创建`com.itheima.TimeInterceptor` 实现统计拦截，代码如下：

```java
public class TimeInterceptor {

    /***
     * 拦截方法
     * @RuntimeType：返回类型绑定，让返回结果和被调用的原对象方法返回结果类型保持一致
     * @Origin：原方法参数类型绑定
     * @SuperCall：绑定被调用对象的代理对象
     * @param method：拦截的方法
     * @param callable：调用对象的代理对象
     * @return
     * @throws Exception
     */
    @RuntimeType
    public static Object intercept(@Origin Method method,
                                   @SuperCall Callable<?> callable) throws Exception {
        //时间统计开始
        long start = System.currentTimeMillis();
        // 执行原函数
        Object result = callable.call();
        //执行时间统计
        System.out.println(method.getName() + ":" + (System.currentTimeMillis() - start) + "ms");
        return result;
    }
}
```

这里整体实现类似动态代理执行过程，也类似SpringAop中的环绕通知，其中几个注解我们一起来学习一下：

- **\@RuntimeType** 注解：告诉 Byte Buddy 不要进行严格的参数类型检测，在参数匹配失败时，尝试使用类型转换方式（runtime type casting）进行类型转换，匹配相应方法。
- **\@Origin** 注解：注入目标方法对应的 Method 对象。如果拦截的是字段的话，该注解应该标注到 Field类型参数。
- **\@SuperCall**：这个注解比较特殊，我们要在 intercept\(\) 方法中调用目标方法的话，需要通过这种方式注入，与 Spring AOP 中的ProceedingJoinPoint.proceed\(\) 方法有点类似，需要注意的是，这里不能修改调用参数，从上面的示例的调用也能看出来，参数不用单独传递，都包含在其中了。另外，\@SuperCall注解还可以修饰 Runnable 类型的参数，只不过目标方法的返回值就拿不到了。

**4\)agent拦截配置**  
![在这里插入图片描述](https://img-blog.csdnimg.cn/201cd10798f245aeb1102ab26c7b31b1.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)

创建Java Agent和Byte Buddy结合处理方法拦截配置流程，创建 `com.itheima.AgentByteBuddy`，在该类中配置拦截的类和方法：

```java
public class AgentByteBuddy {

    /***
     * 执行方法拦截
     * @param agentArgs：-javaagent 命令携带的参数。在前面介绍 SkyWalking Agent 接入时提到
     *                 agent.service_name 这个配置项的默认值有三种覆盖方式，
     *                 其中，使用探针配置进行覆盖，探针配置的值就是通过该参数传入的。
     * @param inst：java.lang.instrumen.Instrumentation 是 Instrumention 包中定义的一个接口，它提供了操作类定义的相关方法。
     */
    public static void premain(String agentArgs, Instrumentation inst) throws IllegalAccessException, InstantiationException {
        //动态构建操作，根据transformer规则执行拦截操作
        AgentBuilder.Transformer transformer = new AgentBuilder.Transformer() {
            @Override
            public DynamicType.Builder<?> transform(DynamicType.Builder<?> builder,
                                                    TypeDescription typeDescription,
                                                    ClassLoader classLoader,
                                                    JavaModule javaModule) {
                //构建拦截规则
                return builder
                        //method()指定哪些方法需要被拦截，ElementMatchers.any()表示拦截所有方法
                        .method(ElementMatchers.<MethodDescription>any())
                        //intercept()指定拦截上述方法的拦截器
                        .intercept(MethodDelegation.to(TimeInterceptor.class));
            }
        };

        //采用Byte Buddy的AgentBuilder结合Java Agent处理程序
        new AgentBuilder
                //采用ByteBuddy作为默认的Agent实例
                .Default()
                //拦截匹配方式：类以com.itheima开始（其实即使com.itheima包下的所有类）
                .type(ElementMatchers.nameStartsWith("com.itheima"))
                //拦截到的类由transformer处理
                .transform(transformer)
                //安装到 Instrumentation
                .installOn(inst);


        // 创建ByteBuddy对象
        String str = new ByteBuddy()
                // subclass增强方式
                .subclass(Object.class)
                // 新类型的类名
                .name("com.itheima.Type")
                // 拦截其中的toString()方法
                .method(ElementMatchers.named("toString"))
                // 让toString()方法返回固定值
                .intercept(FixedValue.value("Hello World!"))
                .make()
                // 加载新类型，默认WRAPPER策略
                .load(ByteBuddy.class.getClassLoader())
                .getLoaded()
                // 通过 Java反射创建 com.xxx.Type实例
                .newInstance()
                // 调用 toString()方法
                .toString();

        // 指定方法名称
        ElementMatchers.named("toString")
                // 指定方法的返回值
                .and(ElementMatchers.returns(String.class))
                // 指定方法参数
                .and(ElementMatchers.takesArguments(0));
    }
}
```

同时将pom.xml中的`premain-class`替换成 AgentByteBuddy。（这步是用起来这个拦截器的关键！）

```xml
                        <manifestEntries>
                            <Premain-Class>com.itheima.AgentByteBuddy</Premain-Class>
                        </manifestEntries>
```

修改 hailtaxi-user 中的 UserInfo 添加测试方法：

```java
public class UserInfo {

    public static void main(String[] args) throws InterruptedException {
        System.out.println("张三是个中国人！");
        //调用say()方法
        say();
        TimeUnit.SECONDS.sleep(2);
    }

    /***
     * 测试时间
     * @throws InterruptedException
     */
    public static void say() throws InterruptedException {
        System.out.println("hello!");
        TimeUnit.SECONDS.sleep(5);
    }
}

```

**测试：**  
把`hailtaxi-agent`重新打个jar包，再参数配置到IDEA中然后启动：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/555fd9380353462f86e5350004ccd8c8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
测试效果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f6c52ed50a884ab791f47ecdecf06882.png)

# 2 Byte Buddy

在前面学习 Java Agent 技术时，结合 Byte Buddy 技术实现了统计方法执行时间的功能。 Byte Buddy在Skywalking中被广泛使用，接下来继续学习Byte Buddy，为后续分析 SkyWalking Agent打下基础。

## 2.1 Byte Buddy应用场景

Java 是一种强类型的编程语言，即要求所有变量和对象都有一个确定的类型，如果在赋值操作中出现类型不兼容的情况，就会抛出异常。强类型检查在大多数情况下是可行的，然而在某些特殊场景下，强类型检查则成了巨大的障碍。

我们在做一些通用工具封装的时候，类型检查就成了很大障碍。比如我们编写一个通用的Dao实现数据操作，我们根本不知道用户要调用的方法会传几个参数、每个参数是什么类型、需求变更又会出现什么类型，几乎没法在方法中引用用户方法中定义的任何类型。我们绝大多数通用工具封装都采用了反射机制，通过反射可以知道用户调用的方法或字段，但是Java反射有很多缺陷：

1.  反射性能很差
2.  反射能绕开类型安全检查，不安全，比如权限暴力破解

学完agent后，我们可以基于agent做出一些改变，运行时代码生成在 Java 应用启动之后再动态生成一些类定义，这样就可以模拟一些只有使用动态编程语言编程才有的特性，同时也不丢失 Java 的强类型检查。在运行时生成代码需要特别注意的是 Java 类型被 JVM 加载之后，一般不会被垃圾被回收，因此不应该过度使用代码生成。

java编程语言代码生成库不止 Byte Buddy 一个，以下代码生成库在 Java 中也很流行：（下面图中的几种其实都可以大致理解为动态代理）  
![在这里插入图片描述](https://img-blog.csdnimg.cn/666d87b81deb4e6aba5c256e00c7e1a0.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
上面所有代码生成技术中，我们推荐使用Byte Buddy，因为Byte Buddy代码生成可的性能最高，Byte Buddy 的主要侧重点在于生成更快速的代码，如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/6fcab68c2a164c06a09a429237d781e6.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2.2 ByteBuddy语法

任何一个由 Byte Buddy 创建/增强的类型都是通过 ByteBuddy 类的实例来完成的，我们先来学习一下ByteBuddy类，如下代码：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/d5fa835c2ec94c1ca1a178ea65bb398e.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
Byte Buddy 动态增强代码总共有三种方式：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/9b89139a96fd41efb3705329e5fe9102.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
通过上述三种方式完成类的增强之后，我们得到的是`DynamicType.Unloaded` 对象，表示的是一个未加载的类型，我们可以使用 `ClassLoadingStrategy` 加载此类型。Byte Buddy 提供了几种类加载策略，这些策略定义在 `ClassLoadingStrategy.Default`中，其中：

- **WRAPPER** 策略（默认）：创建一个新的 ClassLoader 来加载动态生成的类型。
- **CHILD\_FIRST** 策略：创建一个子类优先加载的 ClassLoader，即打破了双亲委派模型。
- **INJECTION** 策略：使用反射将动态生成的类型直接注入到当前 ClassLoader 中。

实现如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/611889cd6adf4f32846eb1d8d4e08406.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)  
前面动态生成的 com.itheima.Type 类型只是简单的继承了 Object 类，在实际应用中动态生成新类型的一般目的就是为了增强原始的方法，下面通过一个示例展示 Byte Buddy 如何增强 toString\(\) 方法：

```java
 // 创建ByteBuddy对象
        String str = new ByteBuddy()
                // subclass增强方式
                .subclass(Object.class)
                // 新类型的类名
                .name("com.itheima.Type")
                // 拦截其中的toString()方法
                .method(ElementMatchers.named("toString"))
                // 让toString()方法返回固定值
                .intercept(FixedValue.value("Hello World!"))
                .make()
                // 加载新类型，默认WRAPPER策略
                .load(ByteBuddy.class.getClassLoader())
                .getLoaded()
                // 通过 Java反射创建 com.xxx.Type实例
                .newInstance()
                // 调用 toString()方法
                .toString();
        /*
        首先需要关注这里的 method() 方法，method() 方法可以通过传入的 ElementMatchers 参数匹配多个
需要修改的方法，这里的 ElementMatchers.named("toString") 即为按照方法名匹配 toString() 方法。
如果同时存在多个重载方法，则可以使用 ElementMatchers 其他 API 描述方法的签名，如下所示：
         */


// 指定方法名称
        ElementMatchers.named("toString")
                // 指定方法的返回值
                .and(ElementMatchers.returns(String.class))
                // 指定方法参数
                .and(ElementMatchers.takesArguments(0));
```

接下来需要关注的是 intercept\(\) 方法，通过 method\(\) 方法拦截到的所有方法会由 Intercept\(\)方法指定的 Implementation 对象决定如何增强。这里的 FixValue.value\(\) 会将方法的实现修改为固定值，上例中就是固定返回 “Hello World\!” 字符串。

Byte Buddy 中可以设置多个 method\(\) 和 Intercept\(\) 方法进行拦截和修改， Byte Buddy 会按照栈的顺序来进行拦截。

## 2.3 ByteBuddy创建代理

我们先创建一个普通类，再为该类创建代理类，创建代理对方法进行拦截做处理  
工程结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/b6510c8a0df04c409b009fb128bd3dfa.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_17,color_FFFFFF,t_70,g_se,x_16)

**1\)普通类**  
创建`com.itheima.service.UserService`

```java
public class UserService {

    //方法1
    public String username(){
        return "张三";
    }

    //方法2
    public String address(String username){
        return username+"来自 【湖北省武汉市】";
    }

    //方法3
    public String address(String username,String city){
        return username+"来自 【湖北省"+city+"】";
    }


}

```

**2\)代理创建**  
工程结构图  
![在这里插入图片描述](https://img-blog.csdnimg.cn/03ffe34b77574d6480a485b2b8cf7390.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_17,color_FFFFFF,t_70,g_se,x_16)  
创建`com.itheima.ByteBuddyLogAspect`

```java
public class ByteBuddyLogAspect {

    public static void main(String[] args) throws Exception {
        //创建ByteBuddy
        UserService userService = new ByteBuddy()
                //指定创建UserServiceImpl对象的子类
                .subclass(UserService.class)
                //匹配方法,所有方法均被拦截
                .method(ElementMatchers.isDeclaredBy(UserService.class))
                //任何拦截都返回一个固定值
                .intercept(FixedValue.value("我被拦截了！"))

                //为特定方法添加拦截(比如下面我们特定拦截只含有一个入参的address方法)
                .method(ElementMatchers.named("address").and(ElementMatchers.takesArguments(1)))
                //拦截后返回固定值
                .intercept(FixedValue.value("我被拦截了，但是我是特别关照的"))
                //创建动态对象
                .make()
                .load(ByteBuddy.class.getClassLoader(),
                        ClassLoadingStrategy.Default.INJECTION)
                .getLoaded()
                .newInstance();

        //会被拦截，返回固定值：我被拦截了！
        System.out.println(userService.username());
        System.out.println(userService.address("王五", "武汉"));

        //会被拦截，返回固定值：我被拦截了，但是我是特别关照的
        System.out.println(userService.address("张三"));
    }
}

```

此时我们运行`com.itheima.ByteBuddyLogAspect`，结果如下图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/0f509fd0be8a498cbf5b6fd36e9b81ce.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/f573ea7b839545db8e804bf495d3290e.png)

## 2.4 ByteBuddy程序中的应用

上面我们创建代理的案例中，把返回值设置成了固定值，并没有什么实际的意义。  
在真实程序汇总通常是要做特定业务流程处理，比如事务、日志、权限校验等，此时我们需要用到`ByteBuddy`的`MethodDelegation`对象，它可以将拦截的目标方法委托给其他对象处理，这里有几个注解我们先进行说明：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/a2531b8a04544b57be3c8e526a9e75fb.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

工程结构图：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/1fb8302c29ff4f948a0ca8d0f3f50686.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_16,color_FFFFFF,t_70,g_se,x_16)

**1\)修改案例方法**  
我们对`com.itheima.service.UserService`进行修改添加日志打印：

```java
public class UserService {

    //方法1
    public String username(){
        System.out.println("com.itheima.service.UserService.username.....");
        return "张三";
    }

    //方法2
    public String address(String username){
        System.out.println("com.itheima.service.UserService.address(String username).....");
        return username+"来自 【湖北省武汉市】";
    }

    //方法3
    public String address(String username,String city){
        System.out.println("com.itheima.service.UserService.address(String username,String city).....");
        return username+"来自 【湖北省"+city+"】";
    }


}
```

**2\)修改代理类**  
我们对`com.itheima.ByteBuddyLogAspect`进行修改：

```java
public class ByteBuddyLogAspect {

    public static void main(String[] args) throws Exception {
        //创建ByteBuddy
        UserService userService = new ByteBuddy()
                //指定创建UserServiceImpl对象的子类
                .subclass(UserService.class)
                //匹配方法,所有方法均被拦截
                .method(ElementMatchers.isDeclaredBy(UserService.class))
                //任何拦截都返回一个固定值
                .intercept(MethodDelegation.to(new AspectLog()))
                //创建动态对象
                .make()
                .load(ByteBuddy.class.getClassLoader(),
                        ClassLoadingStrategy.Default.INJECTION)
                .getLoaded()
                .newInstance();

        userService.username();
        userService.address("王五","武汉");
        userService.address("张三");
    }
}
```

**3\)创建拦截器**  
创建`com.itheima.log.AspectLog`。作用：当`ByteBuddyLogAspect`拦截方法后，会先来执行`AspectLog`中的操作。

```java
public class AspectLog {

    @RuntimeType
    public Object intercept(
            // 目标对象
            @This Object obj,
            // 注入目标方法的全部参数
            @AllArguments Object[] allArguments,
            // 调用目标方法，必不可少
            @SuperCall Callable<?> zuper,
            // 目标方法
            @Origin Method method,
            // 目标对象
            @Super Object instance
    ) throws Exception {
        //目标方法执行前执行日志记录
        System.out.println("准备执行Method="+method.getName());
        // 调用目标方法
        Object result = zuper.call();
        //目标方法执行后执行日志记录
        System.out.println("方法执行完成Method="+method.getName());
        return result;
    }
}
```

此时再运行`ByteBuddyLogAspect`，结果如下：  
![在这里插入图片描述](https://img-blog.csdnimg.cn/362906429c1242f0a102fedb39741634.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAZkZlZS1vcHM=,size_20,color_FFFFFF,t_70,g_se,x_16)

> 对**2.4**进行一个小总结：  
> 如果要使用Byte Buddy来增强一个对象的话大概步骤分为以下几步：
> 
> 1.  先创建需要被增强的方法，比如本例中的`UserService`
> 2.  创建`Byte Buddy`代理用来拦截特定的方法，比如本例中的`ByteBuddyLogAspect`
> 3.  拦截后需要怎么增强呢？那就交给一个拦截器，在拦截器中去实现增强逻辑，并且在`Byte Buddy`代理中指定使用这个拦截器即可，比如本例中的`AspectLog`