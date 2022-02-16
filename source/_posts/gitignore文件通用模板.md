---
title: .gitignore文件通用模板
date: 2021-12-02 23:06:53
tags: intellij-idea java maven
categories: Git
---

<!--more-->

### .gitignore文件通用模板

文件 .gitignore 的格式规范如下：

 -    所有空行或者以注释符号 ＃ 开头的行都会被 Git 忽略。
 -    可以使用标准的 glob 模式匹配。
 -    匹配模式最后跟反斜杠（/）说明要忽略的是目录。
 -    要忽略指定模式以外的文件或目录，可以在模式前加上惊叹号（\!）取反。

```
######################
# 解决java产生文件
######################
*.class

# Mobile Tools for Java (J2ME)
.mtj.tmp/

# Package Files #
*.jar
*.war
*.ear

# virtual machine crash logs, see http://www.java.com/en/download/help/error_hotspot.xml
hs_err_pid*

######################
# 解决maven产生的文件
######################

target/
**/target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties

######################
# 解决各类编辑器自动产生的文件
######################

*.iml

## Directory-based project format:
.idea/
# if you remove the above rule, at least ignore the following:

# User-specific stuff:
# .idea/workspace.xml
# .idea/tasks.xml
# .idea/dictionaries

# Sensitive or high-churn files:
# .idea/dataSources.ids
# .idea/dataSources.xml
# .idea/sqlDataSources.xml
# .idea/dynamic.xml
# .idea/uiDesigner.xml

# Gradle:
# .idea/gradle.xml
# .idea/libraries

# Mongo Explorer plugin:
# .idea/mongoSettings.xml

## File-based project format:
*.ipr
*.iws

## Plugin-specific files:

# IntelliJ
/out/
/target/

# mpeltonen/sbt-idea plugin
.idea_modules/

# JIRA plugin
atlassian-ide-plugin.xml

# Crashlytics plugin (for Android Studio and IntelliJ)
com_crashlytics_export_strings.xml
crashlytics.properties
crashlytics-build.properties

```