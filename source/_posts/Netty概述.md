---
title: Netty概述
date: 2021-06-27 16:38:10
tags: 
categories: Netty
---

<!--more-->

### Netty概述

- [为什么会产生Netty\?](#Netty_2)
- [Netty的优点](#Netty_10)
- [Netty 版本说明](#Netty__18)

# 为什么会产生Netty\?

因为原生io存在巨多问题：

1.  NIO 的类库和 API 繁杂，使用麻烦。
2.  需要一些额外的技能，比如要熟悉Java多线程、网络编程
3.  开发难度大
4.  有一定的BUG,比如selector空轮询导致cpu100\%负载

# Netty的优点

1.  设计优雅：适用于各种传输类型的统一 API 阻塞和非阻塞 Socket；基于灵活且可扩展的事件模型，可以清晰地分离关注点；高度可定制的线程模型 - 单线程，一个或多个线程池.
2.  使用方便：详细记录的 Javadoc，用户指南和示例；没有其他依赖项，JDK 5（Netty 3.x）或 6（Netty 4.x）就足够了。
3.  高性能、吞吐量更高：延迟更低；减少资源消耗；最小化不必要的内存复制。
4.  安全：完整的 SSL/TLS 和 StartTLS 支持。
5.  社区活跃、不断更新：社区活跃，版本迭代周期短，发现的 Bug 可以被及时修复，同时，更多的新功能会被加入

# Netty 版本说明

netty 版本分为 netty3.x 和 netty4.x、netty5.x，因为 Netty5 出现重大 bug，已经被官网废弃了，目前推荐使用的是 Netty4.x 的稳定版本