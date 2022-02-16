---
title: Redis数据淘汰策略redis.conf
date: 2020-09-06 11:02:35
tags: 
categories: Redis
---

<!--more-->

Redis官方给的警告，当**内存不足时**，Redis会根据配置的缓存策略淘汰部分Keys，以保证写入成功。当无淘汰策略时或没有找到适合淘汰的Key时，Redis直接返回out of memory错误。

---

最大缓存配置 在redis中，允许用户设置最大使用内存大小 maxmemory 512G

---

**建议：了解了Redis的淘汰策略之后，在平时使用时应尽量主动设置/更新key的expire时间，主动剔除不活跃的旧数据，有助于提升查询性能**