---
title: svg转换到base64格式
date: 2022-12-06 10:26:16
tags:
password:
categories: 杂
---

# 需求背景
需要将端上传过来的svg文件解析为字符串，然后再生成jpeg格式图片，再将图片转成Base64格式进行使用

# 实现代码

首先引入如下以来。版本一定按照这个来，高版本会出现各种类丢失的问题。
```xml
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-svggen</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-awt-util</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-bridge</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-css</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-dom</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-gvt</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-parser</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-script</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-svg-dom</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-transcoder</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-util</artifactId>
            <version>1.6</version>
        </dependency>
        <dependency>
            <groupId>batik</groupId>
            <artifactId>batik-xml</artifactId>
            <version>1.6</version>
        </dependency>
        <!-- 此处不能使用2.9.1版本，使用2.9.1生成png会失败 -->
        <dependency>
            <groupId>xerces</groupId>
            <artifactId>xercesImpl</artifactId>
            <version>2.9.0</version>
        </dependency>
        <dependency>
            <groupId>org.axsl.org.w3c.dom.svg</groupId>
            <artifactId>svg-dom-java</artifactId>
            <version>1.1</version>
        </dependency>
        <dependency>
            <groupId>org.w3c.css</groupId>
            <artifactId>sac</artifactId>
            <version>1.3</version>
        </dependency>
```

再就是工具类代码
```java
package com.netease.music.sociallive.game.common.utils;

import com.netease.music.sociallive.game.common.constant.StreamConst;
import lombok.extern.slf4j.Slf4j;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.JPEGTranscoder;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
public class SvgImageUtil {

    private final static int BUF_SIZE = 1024;
    private final static String PREFIX = "data:image/jpeg;base64,";

    /**
     * 将svg字符串转为base64
     *
     * @param svgCode  svg字符串
     * @param filePath 临时存储文件的地址
     * @return base64格式表示的jpeg文件
     */
    public static String convertSvgToBase64(String svgCode, String filePath) {
        String base64Code = "";
        File file = new File(filePath);
        FileOutputStream outputStream = null;
        try {
            file.createNewFile();
            outputStream = new FileOutputStream(file);
            byte[] bytes = svgCode.getBytes(StandardCharsets.UTF_8);
            JPEGTranscoder t = new JPEGTranscoder();
            //压缩图片质量
            t.addTranscodingHint(JPEGTranscoder.KEY_QUALITY, 0.50f);
            TranscoderInput input = new TranscoderInput(new ByteArrayInputStream(bytes));
            TranscoderOutput output = new TranscoderOutput(outputStream);
            t.transcode(input, output);
            //将svg转为jpeg文件暂存在本地磁盘
            outputStream.flush();

            //本地jpeg文件读取后转化为base64格式
            base64Code = Base64.getEncoder().encodeToString(toByteArray(filePath));

            //删除本地暂存的文件
            File f = new File(filePath);
            if (f.isFile() && f.exists()) {
                f.delete();
            }
        } catch (Exception e) {
            log.error("@@图片处理@@ svg转化为base64失败", e);
        } finally {
            if (outputStream != null) {
                try {
                    outputStream.close();
                } catch (Exception e) {
                    log.error("@@图片处理@@ 关闭io流失败", e);
                }
            }
        }
        return PREFIX + base64Code;
    }


    /**
     * 将本地文件读取到字节数组中
     *
     * @param filePath 文件地址
     * @return res
     */
    private static byte[] toByteArray(String filePath) {
        File f = new File(filePath);
        if (!f.exists()) {
            log.error("@图片处理@@ 未找到本地图片");
            return new byte[0];
        }
        ByteArrayOutputStream bos = new ByteArrayOutputStream((int) f.length());
        BufferedInputStream in = null;
        try {
            in = new BufferedInputStream(new FileInputStream(f));

            byte[] buffer = new byte[BUF_SIZE];
            int len = StreamConst.NOTHING;
            while (-1 != (len = in.read(buffer, StreamConst.NOTHING, BUF_SIZE))) {
                bos.write(buffer, 0, len);
            }
        } catch (Exception e) {
            log.error("@图片处理@@ svg转化为base64失败", e);
        } finally {
            try {
                if (in != null) {
                    in.close();
                }
                bos.close();
            } catch (IOException e) {
                log.error("@@图片处理@@ 关闭io流失败", e);
            }
        }
        return bos.toByteArray();
    }

}

```

# 功能测试
```java
    public static void main(String[] args) {

        try {
            String svgCode = "<svg  height=\"210\" width=\"500\">\n" +
                    "  <polygon points=\"220,10 250,190 160,210\"\n" +
                    "  style=\"fill:lime;stroke:purple;stroke-width:1\"/>\n" +
                    "</svg>";
            System.out.println(convertSvgToBase64(svgCode, "/Users/fps/Desktop/" + Math.random() * 10 + ".jpeg"));
        } catch (Exception e) {
            log.error("e", e);
        }
    }
```
可以看到生成了base64字符串
![在这里插入图片描述](https://img-blog.csdnimg.cn/4641df3e8e0a4249a1423977c9981e40.png)
进行转化后能够复原出图片
![在这里插入图片描述](https://img-blog.csdnimg.cn/dad345f8811c4caab7909328b2ea09eb.png)
