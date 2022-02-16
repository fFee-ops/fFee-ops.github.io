---
title: Tuple（元组）与Dictionary（字典）
date: 2020-09-14 11:00:42
tags: 
categories: Python基础
---

<!--more-->

### Tuple（元组）与Dictionary（字典）

- [元组](#_2)
- [Dictionary（字典）](#Dictionary_66)

# 元组

元组（tuple）与列表类似，不同之处在于元组的元素**不能修改**。元组写在**小括号 \(\)** 里，元素之间用逗号隔开。  
元组中的元素类型也可以不相同：

**示例：**

```python
#!/usr/bin/python3

tuple = ( 'abcd', 786 , 2.23, 'runoob', 70.2  )
tinytuple = (123, 'runoob')

print (tuple)             # 输出完整元组
print (tuple[0])          # 输出元组的第一个元素
print (tuple[1:3])        # 输出从第二个元素开始到第三个元素
print (tuple[2:])         # 输出从第三个元素开始的所有元素
print (tinytuple * 2)     # 输出两次元组
print (tuple + tinytuple) # 连接元组
```

输出结果

```
('abcd', 786, 2.23, 'runoob', 70.2)
abcd
(786, 2.23)
(2.23, 'runoob', 70.2)
(123, 'runoob', 123, 'runoob')
('abcd', 786, 2.23, 'runoob', 70.2, 123, 'runoob')
```

---

**其实，可以把字符串看作一种特殊的元组。**

例如：

```python
>>> tup = (1, 2, 3, 4, 5, 6)
>>> print(tup[0])
1
>>> print(tup[1:5])
(2, 3, 4, 5)
>>> tup[0] = 11  # 修改元组元素的操作是非法的
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'tuple' object does not support item assignment
>>>
```

**虽然tuple的元素不可改变，但它可以包含可变的对象，比如list列表。**

---

构造包含 0 个或 1 个元素的元组比较特殊，所以有一些额外的语法规则：

```python
tup1 = ()    # 空元组
tup2 = (20,) # 一个元素，需要在元素后添加逗号

```

---

**注意：**  
1、与字符串一样，元组的元素不能修改。  
2、元组也可以被索引和切片，方法一样。  
3、注意构造包含 0 或 1 个元素的元组的特殊语法规则。  
4、元组也可以使用+操作符进行拼接。  
5、string、list 和 tuple 都属于 sequence（序列）。

# Dictionary（字典）

字典（dictionary）是Python中另一个非常有用的内置数据类型。

列表是**有序的对象集合**，字典是**无序的对象集合**。  
两者之间的区别在于：字典当中的元素是通过键来存取的，而不是通过偏移存取。

字典是一种映射类型，字典用 \{ \} 标识，它是一个无序的 键\(key\) : 值\(value\) 的集合。

键\(key\)必须使用不可变类型（数字、字符串、元组）。

在同一个字典中，键\(key\)必须是唯一的。

---

例如

```python
#!/usr/bin/python3

dict = {}
dict['one'] = "1 - 菜鸟教程"
dict[2]     = "2 - 菜鸟工具"

tinydict = {'name': 'runoob','code':1, 'site': 'www.runoob.com'}


print (dict['one'])       # 输出键为 'one' 的值
print (dict[2])           # 输出键为 2 的值
print (tinydict)          # 输出完整的字典
print (tinydict.keys())   # 输出所有键
print (tinydict.values()) # 输出所有值
```

```
1 - 菜鸟教程
2 - 菜鸟工具
{'name': 'runoob', 'code': 1, 'site': 'www.runoob.com'}
dict_keys(['name', 'code', 'site'])
dict_values(['runoob', 1, 'www.runoob.com'])
```

另外，字典类型也有一些内置的函数，例如clear\(\)、keys\(\)、values\(\)等。

**注意：**  
1、字典是一种映射类型，它的元素是键值对类似于java中的map。  
2、字典的关键字必须为不可变类型，且不能重复。  
3、创建空字典使用 \{ \}。