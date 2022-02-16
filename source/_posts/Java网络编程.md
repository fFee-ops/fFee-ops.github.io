---
title: Java网络编程
date: 2020-05-14 13:05:26
tags: 
categories: java
---

<!--more-->

### Java网络编程

- [InetAddress](#InetAddress_4)
- [InetSocketAddress](#InetSocketAddress_66)
- [URL类](#URL_85)
- [基于TCP协议的Socket编程和通信](#TCPSocket_170)
- - [“请求-响应”模式：](#_173)
  - [通过Socket的编程顺序：](#Socket_191)
  - [聊天室](#_482)
- [UDP通讯的实现](#UDP_682)
- - [DatagramSocket：用于发送或接收数据报包](#DatagramSocket_683)
  - [DatagramPacket：数据容器\(封包\)的作用](#DatagramPacket_700)
  - [UDP通信编程基本步骤：](#UDP_716)

Java为了可移植性，不允许直接调用操作系统，而是由java.net包来提供网络功能。Java虚拟机负责提供与操作系统的实际连接。下面介绍几个java.net包中的常用的类。

# InetAddress

**作用:**  
封装计算机的IP地址和DNS\(没有端口信息\)。  
注：DNS是Domain Name System，域名系统。

**特点：**  
这个类没有构造方法。如果要得到对象，只能通过静态方法：getLocalHost\(\)、getByName\(\)、 getAllByName\(\)、 getAddress\(\)、getHostName\(\)。

**使用getLocalHost方法创建InetAddress对象**

```java
import java.net.InetAddress;
import java.net.UnknownHostException;

public class Ip {
	 public static void main(String[] args) throws UnknownHostException {
	        InetAddress addr = InetAddress.getLocalHost();
	        //返回IP地址：Xxx
	        System.out.println(addr.getHostAddress()); 
	        //输出计算机名：xx
	        System.out.println(addr.getHostName());     
	    }
}
```

**根据域名得到InetAddress对象**

```java
import java.net.InetAddress;
import java.net.UnknownHostException;

public class Ip {
	public static void main(String[] args) throws UnknownHostException {
        InetAddress addr = InetAddress.getByName("www.baidu.com");
        // 返回 baidu服务器的IP:183.232.231.174
        System.out.println(addr.getHostAddress());
        // 输出：www.baidu.com
        System.out.println(addr.getHostName());
    }
}

```

**根据IP得到InetAddress对象**

```java
import java.net.InetAddress;
import java.net.UnknownHostException;

public class Ip {
	   public static void main(String[] args) throws UnknownHostException {
	        InetAddress addr = InetAddress.getByName("183.232.231.172");
	        // 返回baidu服务器的IP：183.232.231.172
	        System.out.println(addr.getHostAddress());
	        /*
	         * 输出ip而不是域名。如果这个IP地址不存在或DNS服务器不允许进行IP地址
	         * 和域名的映射，getHostName方法就直接返回这个IP地址。
	         */
	        System.out.println(addr.getHostName());
	    }
}

```

# InetSocketAddress

作用：包含IP和端口信息，常用于Socket通信。此类实现 IP 套接字地址\(IP 地址 + 端口号\)，不依赖任何协议。

**InetSocketAddress的使用**

```java
import java.net.InetSocketAddress;

public class Ip {
	  public static void main(String[] args) {
	        InetSocketAddress socketAddress = new InetSocketAddress("127.0.0.1", 8080);
	        InetSocketAddress socketAddress2 = new InetSocketAddress("localhost", 9000);
	        System.out.println(socketAddress.getHostName());
	        System.out.println(socketAddress2.getAddress());
	    }
}

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051413051422.png)

# URL类

IP地址唯一标识了Internet上的计算机，而URL则标识了这些计算机上的资源。类 URL 代表一个统一资源定位符，它是指向互联网“资源”的指针。资源可以是简单的文件或目录，也可以是对更为复杂的对象的引用，例如对数据库或搜索引擎的查询。

**URL类的使用**

```java
import java.net.MalformedURLException;
import java.net.URL;
public class Test5 {
    public static void main(String[] args) throws MalformedURLException {
        URL u = new URL("http://www.google.cn:80/webhp#aa?canhu=33");
        System.out.println("获取与此url关联的协议的默认端口：" + u.getDefaultPort());
        System.out.println("getFile:" + u.getFile()); // 端口号后面的内容
        System.out.println("主机名：" + u.getHost()); // www.google.cn
        System.out.println("路径：" + u.getPath()); // 端口号后，参数前的内容
        // 如果www.google.cn:80则返回80.否则返回-1
        System.out.println("端口：" + u.getPort()); 
        System.out.println("协议：" + u.getProtocol());
        System.out.println("参数部分：" + u.getQuery());
        System.out.println("锚点：" + u.getRef());
 
        URL u1 = new URL("http://www.abc.com/aa/");
        URL u2 = new URL(u, "2.html"); // 相对路径构建url对象
        System.out.println(u2.toString()); // http://www.abc.com/aa/2.html
    }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200514155910763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**最简单的网络爬虫**

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URL;

public class Ip {
	 public static void main(String[] args) {
	        basicSpider();
	    }
	    //网络爬虫
	    static void basicSpider() {
	        URL url = null;
	        InputStream is = null;
	        BufferedReader br = null;
	        StringBuilder sb = new StringBuilder();
	        String temp = "";
	        try {
	            url = new URL("http://www.baidu.com");
	            is = url.openStream();
	            br = new BufferedReader(new InputStreamReader(is));
	            /* 
	             * 这样就可以将网络内容下载到本地机器。
	             * 然后进行数据分析，建立索引。这也是搜索引擎的第一步。
	             */
	            while ((temp = br.readLine()) != null) {
	                sb.append(temp);
	            }
	            System.out.println(sb);
	        } catch (MalformedURLException e) {
	            e.printStackTrace();
	        } catch (IOException e) {
	            e.printStackTrace();
	        } finally {
	            try {
	                br.close();
	            } catch (IOException e) {
	                e.printStackTrace();
	            }
	            try {
	                is.close();
	            } catch (IOException e) {
	                e.printStackTrace();
	            }
	        }
	    }
}

```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200514160009100.png)

# 基于TCP协议的Socket编程和通信

在网络通讯中，第一次主动发起通讯的程序被称作客户端\(Client\)程序，简称客户端，而在第一次通讯中等待连接的程序被称作服务器端\(Server\)程序，简称服务器。一旦通讯建立，则客户端和服务器端完全一样，没有本质的区别。

## “请求-响应”模式：

1.  Socket类：发送TCP消息。

2.  ServerSocket类：创建服务器。

套接字是一种进程间的数据交换机制。这些进程既可以在同一机器上，也可以在通过网络连接的不同机器上。换句话说，套接字起到通信端点的作用。单个套接字是一个端点，而一对套接字则构成一个双向通信信道，使非关联进程可以在本地或通过网络进行数据交换。一旦建立套接字连接，数据即可在相同或不同的系统中双向或单向发送，直到其中一个端点关闭连接。**套接字与主机地址和端口地址相关联。主机地址就是客户端或服务器程序所在的主机的IP地址。端口地址是指客户端或服务器程序使用的主机的通信端口。**

在客户端和服务器中，分别创建独立的Socket，并通过Socket的属性，将两个Socket进行连接，这样，客户端和服务器通过套接字所建立的连接使用输入输出流进行通信。

TCP/IP套接字是最可靠的双向流协议，使用TCP/IP可以发送任意数量的数据。

实际上，套接字只是计算机上已编号的端口。如果发送方和接收方计算机确定好端口，他们就可以通信了。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/2020051418372344.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzIxMDQwNTU5,size_16,color_FFFFFF,t_70)  
**TCP/IP通信连接的简单过程：**  
位于A计算机上的TCP/IP软件向B计算机发送包含端口号的消息，B计算机的TCP/IP软件接收该消息，并进行检查，查看是否有它知道的程序正在该端口上接收消息。如果有，他就将该消息交给这个程序。

```
  要使程序有效地运行，就必须有一个客户端和一个服务器。
```

## 通过Socket的编程顺序：

```
  1. 创建服务器ServerSocket，在创建时，定义ServerSocket的监听端口(在这个端口接收客户端发来的消息)。

  2. ServerSocket调用accept()方法，使之处于阻塞状态。

  3. 创建客户端Socket，并设置服务器的IP及端口。

  4. 客户端发出连接请求，建立连接。

  5. 分别取得服务器和客户端Socket的InputStream和OutputStream。

  6. 利用Socket和ServerSocket进行数据传输。

  7. 关闭流及Socket。
```

---

**示例：TCP：单向通信Socket之服务器端**

```java
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;
/*
 * 最简单的服务端代码
 */
public class service {
	public static void main(String[] args) {
        Socket socket = null;
        BufferedWriter bw = null;
        try {
            // 建立服务器端套接字：指定监听的接口
            ServerSocket serverSocket = new ServerSocket(8888);
            System.out.println("服务端建立监听");
            // 监听，等待客户端请求，并愿意接收连接
            socket = serverSocket.accept();
            // 获取socket的输出流，并使用缓冲流进行包装
            bw = new BufferedWriter(new     
                                    OutputStreamWriter(socket.getOutputStream()));
            // 向客户端发送反馈信息
            bw.write("hhhh");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            // 关闭流及socket连接
            if (bw != null) {
                try {
                    bw.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (socket != null) {
                try {
                    socket.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}

```

**TCP：单向通信Socket之客户端**

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.Socket;
/*
 * 最简单的客户端
 */
public final class client {
	 public static void main(String[] args) {
	        Socket socket = null;
	        BufferedReader br = null;
	        try {
	            /*
	             * 创建Scoket对象：指定要连接的服务器的IP和端口而不是自己机器的
	             * 端口。发送端口是随机的。
	             */
	            socket = new Socket(InetAddress.getLocalHost(), 8888);
	            //获取scoket的输入流，并使用缓冲流进行包装
	            br = new BufferedReader(new  
	                                   InputStreamReader(socket.getInputStream()));
	            //接收服务器端发送的信息
	            System.out.println(br.readLine());
	        } catch (Exception e) {
	            e.printStackTrace();
	        } finally {
	            // 关闭流及socket连接
	            if (br != null) {
	                try {
	                    br.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	            if (socket != null) {
	                try {
	                    socket.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	        }
	    }
}

```

先运行服务端，再运行客户端。  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200514184614731.png)  
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200514184624826.png)

---

**TCP：双向通信Socket之服务器端**

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;
/*
 * 最简单的服务端代码
 */
public class service {
	 public static void main(String[] args){
	        Socket socket = null;
	        BufferedReader in = null;
	        BufferedWriter out = null;
	        BufferedReader br = null;
	        try {
	            //创建服务器端套接字：指定监听端口
	            ServerSocket server = new ServerSocket(8888);
	            //监听客户端的连接
	            socket = server.accept();
	            //获取socket的输入输出流接收和发送信息
	            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
	            out = new BufferedWriter(new 
	                                   OutputStreamWriter(socket.getOutputStream()));
	            br = new BufferedReader(new InputStreamReader(System.in));
	            while (true) {
	                //接收客户端发送的信息
	                String str = in.readLine();
	                System.out.println("客户端说：" + str);
	                String str2 = "";
	                //如果客户端发送的是“end”则终止连接 
	                if (str.equals("end")){
	                    break;
	                }
	                //否则，发送反馈信息
	                str2 = br.readLine(); // 读到\n为止，因此一定要输入换行符！
	                out.write(str2 + "\n");
	                out.flush();
	            }
	        } catch (IOException e) {
	            e.printStackTrace();
	        } finally {
	            //关闭资源
	            if(in != null){
	                try {
	                    in.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	            if(out != null){
	                try {
	                    out.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	            if(br != null){
	                try {
	                    br.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	            if(socket != null){
	                try {
	                    socket.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	        }
	    }
}

```

**TCP：双向通信Socket之客户端**

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
/*
 * 最简单的客户端
 */
public final class client {
	  public static void main(String[] args) {
	        Socket socket = null;
	        BufferedReader in = null;
	        BufferedWriter out = null;
	        BufferedReader wt = null;
	        try {
	            //创建Socket对象，指定服务器端的IP与端口
	            socket = new Socket(InetAddress.getLocalHost(), 8888);
	            //获取scoket的输入输出流接收和发送信息
	            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
	            out = new BufferedWriter(new 
	                                   OutputStreamWriter(socket.getOutputStream()));
	            wt = new BufferedReader(new InputStreamReader(System.in));
	            while (true) {
	                //发送信息
	                String str = wt.readLine();
	                out.write(str + "\n");
	                out.flush();
	                //如果输入的信息为“end”则终止连接
	                if (str.equals("end")) {
	                    break;
	                }
	                //否则，接收并输出服务器端信息
	                System.out.println("服务器端说：" + in.readLine());
	            }
	        } catch (UnknownHostException e) {
	            e.printStackTrace();
	        } catch (IOException e) {
	            e.printStackTrace();
	        } finally {
	            // 关闭资源
	            if (out != null) {
	                try {
	                    out.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	            if (in != null) {
	                try {
	                    in.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	            if (wt != null) {
	                try {
	                    wt.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	            if (socket != null) {
	                try {
	                    socket.close();
	                } catch (IOException e) {
	                    e.printStackTrace();
	                }
	            }
	        }
	    }
}

```

---

上面这个程序，必须按照安排好的顺序，服务器和客户端一问一答\!不够灵活\!\!可以使用多线程实现更加灵活的双向通讯\!\!

```
  服务器端：一个线程专门发送消息，一个线程专门接收消息。

  客户端：一个线程专门发送消息，一个线程专门接收消息。
```

## 聊天室

**TCP：聊天室之服务器端**

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;
 
public class ChatServer {
    public static void main(String[] args) {
        ServerSocket server = null;
        Socket socket = null;
        BufferedReader in = null;
        try {
            server = new ServerSocket(8888);
            socket = server.accept();
            //创建向客户端发送消息的线程，并启动
            new ServerThread(socket).start();
            // main线程负责读取客户端发来的信息
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            while (true) {
                String str = in.readLine();
                System.out.println("客户端说：" + str);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (in != null) {
                    in.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                if (socket != null) {
                    socket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
 
/**
 * 专门向客户端发送消息的线程
 * 
 * @author Administrator
 *
 */
class ServerThread extends Thread {
    Socket ss;
    BufferedWriter out;
    BufferedReader br;
 
    public ServerThread(Socket ss) {
        this.ss = ss;
        try {
            out = new BufferedWriter(new OutputStreamWriter(ss.getOutputStream()));
            br = new BufferedReader(new InputStreamReader(System.in));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
 
    public void run() {
        try {
            while (true) {
                String str2 = br.readLine();
                out.write(str2 + "\n");
                out.flush();
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if(out != null){
                out.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                if(br != null){
                    br.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

**TCP：聊天室之客户端**

```java
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
 
public class ChatClient {
    public static void main(String[] args) {
        Socket socket = null;
        BufferedReader in = null;
        try {
            socket = new Socket(InetAddress.getByName("127.0.1.1"), 8888);
            // 创建向服务器端发送信息的线程，并启动
            new ClientThread(socket).start();
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            // main线程负责接收服务器发来的信息
            while (true) {
                System.out.println("服务器说：" + in.readLine());
            }
        } catch (UnknownHostException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (socket != null) {
                    socket.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                if (in != null) {
                    in.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
 
/**
 * 用于向服务器发送消息
 * 
 * @author Administrator
 *
 */
class ClientThread extends Thread {
    Socket s;
    BufferedWriter out;
    BufferedReader wt;
 
    public ClientThread(Socket s) {
        this.s = s;
        try {
            out = new BufferedWriter(new OutputStreamWriter(s.getOutputStream()));
            wt = new BufferedReader(new InputStreamReader(System.in));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
 
    public void run() {
        try {
            while (true) {
                String str = wt.readLine();
                out.write(str + "\n");
                out.flush();
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (wt != null) {
                    wt.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                if (out != null) {
                    out.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200514191736907.png)  
注意每按下一次回车控制台会自动切换一次（从客户端到服务端或者朝相反）。

# UDP通讯的实现

## DatagramSocket：用于发送或接收数据报包

当服务器要向客户端发送数据时，需要在服务器端产生一个DatagramSocket对象，在客户端产生一个DatagramSocket对象。服务器端的DatagramSocket将DatagramPacket发送到网络上，然后被客户端的DatagramSocket接收。

DatagramSocket有两种常用的构造函数。一种是无需任何参数的，常用于客户端;另一种需要指定端口，常用于服务器端。如下所示：

- DatagramSocket\(\) ：构造数据报套接字并将其绑定到本地主机上任何可用的端口。

- DatagramSocket\(int port\) ：创建数据报套接字并将其绑定到本地主机上的指定端口。

**常用方法：**

```
  Ø send(DatagramPacket p) ：从此套接字发送数据报包。

  Ø receive(DatagramPacket p) ：从此套接字接收数据报包。

  Ø close() ：关闭此数据报套接字。
```

## DatagramPacket：数据容器\(封包\)的作用

此类表示数据报包。 数据报包用来实现封包的功能。

**常用方法：**

```
  Ø DatagramPacket(byte[] buf, int length) ：构造数据报包，用来接收长度为 length 的数据包。

  Ø DatagramPacket(byte[] buf, int length, InetAddress address, int port) ：构造数据报包，用来将长度为 length 的包发送到指定主机上的指定端口号。

  Ø getAddress() ：获取发送或接收方计算机的IP地址，此数据报将要发往该机器或者是从该机器接收到的。

  Ø getData() ：获取发送或接收的数据。

  Ø setData(byte[] buf) ：设置发送的数据。
```

## UDP通信编程基本步骤：

```
  1. 创建客户端的DatagramSocket，创建时，定义客户端的监听端口。

  2. 创建服务器端的DatagramSocket，创建时，定义服务器端的监听端口。

  3. 在服务器端定义DatagramPacket对象，封装待发送的数据包。

  4. 客户端将数据报包发送出去。

  5. 服务器端接收数据报包。
```

---

**示例：UDP：单向通信之客户端**

```java
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
 
public class Client {
    public static void main(String[] args) throws Exception {
        byte[] b = "你好啊".getBytes();
        //必须告诉数据报包要发到哪台计算机的哪个端口，发送的数据以及数据的长度
        DatagramPacket dp = new DatagramPacket(b,b.length,new 
InetSocketAddress("localhost",8999));
        //创建数据报套接字：指定发送信息的端口
        DatagramSocket ds = new DatagramSocket(9000);
        //发送数据报包
        ds.send(dp);
        //关闭资源
        ds.close();
    }
}
```

**示例：UDP：单向通信之服务器端**

```java
import java.net.DatagramPacket;
import java.net.DatagramSocket;
 
public class Server {
    public static void main(String[] args) throws Exception {
        //创建数据报套接字：指定接收信息的端口
        DatagramSocket ds = new DatagramSocket(8999);
        byte[] b = new byte[1024];
        //创建数据报包，指定要接收的数据的缓存位置和长度
        DatagramPacket dp = new DatagramPacket(b, b.length);
        //接收客户端发送的数据报
        ds.receive(dp); // 阻塞式方法
        //dp.getLength()返回实际收到的数据的字节数
        String string = new String(dp.getData(), 0, dp.getLength());
        System.out.println(string);
        //关闭资源
        ds.close();
    }
}
```

---

通过字节数组流ByteArrayInputStream、ByteArrayOutputStream与数据流ObjectInputStream、ObjectOutputStream联合使用可以传递对象。

**示例：Person类**

```java
import java.io.Serializable;
public class Person implements Serializable{
    private static final long serialVersionUID = 1L;
    int age;
    String name;
    public Person(int age, String name) {
        super();
        this.age = age;
        this.name = name;
    }
    @Override
    public String toString() {
        return "Person [age=" + age + ", name=" + name + "]";
    }
}
```

**示例：UDP：对象的传递之客户端**

```java
import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
 
public class Client {
    public static void main(String[] args) throws Exception {
        //创建要发送的对象
        Person person = new Person(18, "高淇");
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);
        oos.writeObject(person);
        //获取字节数组流中的字节数组（我们要发送的数据）
        byte[] b = bos.toByteArray();
        //必须告诉数据报包要发到哪台计算机的哪个端口，发送的数据以及数据的长度
        DatagramPacket dp = new DatagramPacket(b,b.length,new 
                                             InetSocketAddress("localhost",8999));
        //创建数据报套接字：指定发送信息的端口
        DatagramSocket ds = new DatagramSocket(9000);
        //发送数据报包
        ds.send(dp);
        //关闭资源
        oos.close();
        bos.close();
        ds.close();
    }
}  
```

**示例：UDP：对象的传递之服务器端**

```java

import java.io.ByteArrayInputStream;
import java.io.ObjectInputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
 
public class Server {
    public static void main(String[] args) throws Exception {
        //创建数据报套接字：指定接收信息的端口
        DatagramSocket ds = new DatagramSocket(8999);
        byte[] b = new byte[1024];
        //创建数据报包，指定要接收的数据的缓存位置和长度
        DatagramPacket dp = new DatagramPacket(b, b.length);
        //接收客户端发送的数据报
        ds.receive(dp); // 阻塞式方法
        //dp.getData():获取客户端发送的数据，返回值是一个字节数组
        ByteArrayInputStream bis = new ByteArrayInputStream(dp.getData());
        ObjectInputStream ois = new ObjectInputStream(bis);
        System.out.println(ois.readObject());
        //关闭资源
        ois.close();
        bis.close();
        ds.close();
    }
}
```