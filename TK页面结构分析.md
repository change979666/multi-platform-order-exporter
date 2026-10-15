# TikTok Shop 页面结构变化分析

## 🚨 问题描述

**错误日志**:
```
找到 0 个订单头部行 (包含 sc-bZgIus)
```

**原因**: TikTok Shop 的前端结构已更新，旧的 CSS 类名 `sc-bZgIus` 不再使用。

---

## 📊 当前页面结构信息

从日志中收集到的 `tr` 元素类名：

| 索引 | 类名 | 说明 |
|-----|------|------|
| 1 | `` (空) | 表头行？ |
| 2 | `sc-iwqaRn kGeeYs` | ? |
| 3 | `sc-dOpmdR gWpQqk` | ? |
| 4 | `sc-hWhWUk cRiTf` | ? |
| 5 | `sc-yNYQy jfyUmx` | ? |
| 6 | `sc-iwqaRn kGeeYs` | ? |

---

## 🔧 调试方法

### 步骤 1：收集完整的 HTML 结构

在浏览器控制台执行以下代码，获取当前页面的完整结构：

```javascript
// 输出所有 tr 的详细信息
const allTrs = document.querySelectorAll('tr');
console.log(`总共 ${allTrs.length} 个 tr 元素\n`);

allTrs.forEach((tr, idx) => {
  console.log(`\n=== TR #${idx + 1} ===`);
  console.log(`className: "${tr.className}"`);
  console.log(`HTML:`, tr.innerHTML.substring(0, 200));
  
  // 查看子 td 元素
  const tds = tr.querySelectorAll('td');
  console.log(`td 数量: ${tds.length}`);
  
  // 查看主要内容
  const orderIdSpan = tr.querySelector('span.order_id_number');
  if (orderIdSpan) {
    console.log(`✓ 订单号: ${orderIdSpan.textContent}`);
  }
  
  const nameText = tr.textContent.substring(0, 100);
  console.log(`内容摘要: ${nameText}`);
});
```

### 步骤 2：识别订单结构模式

观察输出，查找以下特征：

**订单头部行（第 1 行）应包含**:
- 订单号 (格式: 18位数字，如 581234375284720643)
- 客户用户名
- 订单日期/时间

**商品行（第 2 行）应包含**:
- SKU 信息 ("Seller SKU: XXX")
- 数量显示 ("× 2")
- 价格信息 ("฿ XX.XX")

**分隔行（第 3 行）**:
- 通常是空白行或分隔符

### 步骤 3：记录新的类名模式

打开浏览器开发者工具，执行上述脚本，然后：

1. 找出哪些 `tr` 是订单头部行
2. 它们都共有什么 CSS 类名？
3. 商品行有什么共同特征？

---

## 💡 常见的代码修复方案

### 方案 A：根据内容查找（最稳定）

如果 HTML 结构差异大，可用内容而非类名来定位：

```javascript
// 查找包含 18 位订单号的 tr（订单头部行）
const orderHeaderRows = Array.from(allTrElements).filter(tr => {
  const span = tr.querySelector('span.order_id_number');
  return span && /^\d{18}$/.test(span.textContent.trim());
});
```

### 方案 B：根据新的类名模式（如果存在统一的类名）

```javascript
// 如果新的订单头部都有 "sc-iwqaRn" 类
const orderHeaderRows = Array.from(allTrElements).filter(tr => 
  tr.className.includes('sc-iwqaRn') && 
  tr.querySelector('span.order_id_number')
);
```

### 方案 C：使用数据属性（如果有的话）

```javascript
// 如果页面使用数据属性来标记行类型
const orderHeaderRows = document.querySelectorAll('tr[data-row-type="order-header"]');
```

---

## 📋 需要提供的信息

请在浏览器控制台运行上述调试脚本，然后提供：

1. **完整的 tr 列表**（所有 `className` 和内容摘要）
2. **订单头部行的特征**（包含哪些元素？有什么特殊的类名或属性？）
3. **一个完整订单的 HTML 结构**（从头部行到分隔行的完整代码）

---

## 🔍 示例：预期的数据格式

当你执行调试脚本后，应该看到类似的输出：

```
=== TR #2 ===
className: "sc-iwqaRn kGeeYs"
td 数量: 5
✓ 订单号: 581234375284720643
内容摘要: 581234375284720643 joy.pornpen 17/11/2025 08:56:48 ...

=== TR #3 ===
className: "sc-dOpmdR gWpQqk"
td 数量: 1
内容摘要: Seller SKU: BD63-White × 1 ฿ 147.32 ...
```

---

## ✅ 修复后验证

修改代码后，调试窗口应显示：

```
✅ 找到 X 个订单头部行
✅ 开始处理 X 个订单...
✓ 订单号: 581234375284720643
✓ 客户名: joy.pornpen
✓ 日期转换成功: 2025-11-17 08:56
```

