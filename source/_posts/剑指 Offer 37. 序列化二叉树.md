---
title: 剑指 Offer 37. 序列化二叉树
date: 2021-03-10 16:28:53
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 37. 序列化二叉树

- [解题思路](#_2)
- [代码](#_5)

# 解题思路

都用**层级遍历**。  
详情见书`P257`

# 代码

```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode(int x) { val = x; }
 * }
 */
public class Codec {

    //用来作为分隔符
    String Sep = ",";

    // 使用前序遍历来序列化二叉树：将二叉树打平为字符串
    public String serialize(TreeNode root) {
        if (root == null) return "";
        StringBuilder sb = new StringBuilder();
        // 初始化队列，将 root 加入队列
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {

            for (int i = 0; i < q.size(); i++) {
                TreeNode cur = q.poll();
                /* 层级遍历代码位置 */
                if (cur == null) {
                    sb.append("null").append(Sep);
                    continue;
                }
                sb.append(cur.val).append(Sep);
                /*****************/

                q.offer(cur.left);
                q.offer(cur.right);
            }
        }
        //去掉最后的","
        sb.deleteCharAt(sb.length() - 1);
        return sb.toString();
    }


    // 层级遍历 反序列化
    public TreeNode deserialize(String data) {
        if (data.isEmpty()) {
            return null;
        }
        //去掉一下[]
        data.substring(1, data.length());
        String[] nodes = data.split(Sep);
        //第一个元素就是root的值
        TreeNode root = new TreeNode(Integer.parseInt(nodes[0]));

        //BFS模板
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);

        while (!q.isEmpty()) {

            //注意是用i记录子节点的索引，所以i从1开始，0是父节点嘛
            for (int i = 1; i < nodes.length; ) {
                // 队列中存的都是父节点
                TreeNode parent = q.poll();
                // 父节点对应的左侧子节点的值
                String left = nodes[i++];
                if (!left.equals("null")) {
                    parent.left = new TreeNode(Integer.parseInt(left));
                    q.offer(parent.left);
                } else {
                    parent.left = null;
                }
                // 父节点对应的右侧子节点的值
                String right = nodes[i++];
                if (!right.equals("null")) {
                    parent.right = new TreeNode(Integer.parseInt(right));
                    q.offer(parent.right);
                } else {
                    parent.right = null;
                }
            }
        }

        return root;
    }
}

// Your Codec object will be instantiated and called as such:
// Codec codec = new Codec();
// codec.deserialize(codec.serialize(root));
```