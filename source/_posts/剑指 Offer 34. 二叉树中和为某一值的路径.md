---
title: 剑指 Offer 34. 二叉树中和为某一值的路径
date: 2021-03-05 15:53:15
tags: 
categories: 力扣
---

<!--more-->

### 剑指 Offer 34. 二叉树中和为某一值的路径

- [解题思路](#_3)
- [代码](#_7)

# 解题思路

**本题使用回溯法**。主要思路是从根结点出发，用sum减去根节点的值，到达叶子节点后如果二者的差为0，证明本条路径满足要求。  
然后就是套`回溯模板`了

# 代码

```java
class Solution {
        List<List<Integer>> res = new ArrayList<>();
    public List<List<Integer>> pathSum(TreeNode root, int sum) {
        backtrack(root, sum, new ArrayList<>());
        return res;
    }

    public void backtrack(TreeNode root, int sum, List<Integer> list) {

        //如果节点为空直接返回
        if (root == null)
            return;

        //把当前节点的值加入到list
        list.add(root.val);

        //如果到达叶子节点，就不能往下走了，直接return
        if (root.left == null && root.right == null) {
            if (sum - root.val == 0) {//刚好把和抵消，证明这是一条合适的路径
//                list是引用传递，必须要新建一个
                res.add(new ArrayList(list));
            }
            //撤销选择：因为下面就return了，到不了撤销选择那步，所以在这里提前撤销一下选择
            list.remove(list.size() - 1);

            return;
        }

        //如果没到达叶子节点，就继续从他的左右两个子节点往下找，注意到
        //下一步的时候，sum值要减去当前节点的值
        backtrack(root.left, sum - root.val, list);
        backtrack(root.right, sum - root.val, list);

        //撤销选择
        list.remove(list.size() - 1);

    }
}
```