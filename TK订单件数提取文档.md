# TikTok Shop 订单数量提取文档

## 📍 代码位置
- **文件**: [content.js](content.js#L1212-L1240)
- **函数**: `extractTikTokOrders()`
- **行号范围**: 1212-1240 行
- **版本**: v1.1.3+

---

## 🔍 提取逻辑概述

TikTok Shop 的数量提取采用**全行扫描 + 文本匹配**的方式，不依赖固定的 CSS 选择器，而是通过识别特定的文本格式来定位数量元素。

---

## 📊 详细提取步骤

### 第一步：获取商品行容器
```javascript
// 从商品行（productRow）中获取所有 div 元素
const allDivsInRow = productRow.querySelectorAll('div');
```

**说明**:
- `productRow` 是当前订单商品所在的行容器
- `querySelectorAll('div')` 获取该行内的所有 div 元素（包含所有子元素）

---

### 第二步：过滤匹配数量格式的元素

```javascript
const qtyElements = Array.from(allDivsInRow).filter(div => {
  const text = div.textContent.trim();
  // 匹配 "× 2" 或 "x 2" 这样的格式
  return /^[×x]\s*\d+$/i.test(text);
});
```

**匹配规则（正则表达式）**:
- **正则模式**: `/^[×x]\s*\d+$/i`
- **说明**:
  - `^` - 字符串开始
  - `[×x]` - 匹配 × 符号或 x 字母（`×` 是 U+00D7）
  - `\s*` - 匹配零个或多个空格
  - `\d+` - 匹配一个或多个数字（可支持 1-999 的数量）
  - `$` - 字符串结束
  - `i` - 不区分大小写

**匹配示例**:
| 文本内容 | 是否匹配 | 备注 |
|---------|--------|------|
| `× 2` | ✅ | 标准格式 |
| `× 10` | ✅ | 多位数 |
| `x 5` | ✅ | 小写 x |
| `× 2个` | ❌ | 末尾有其他文字 |
| `数量: × 2` | ❌ | 开头有其他文字 |

---

### 第三步：选择对应商品的数量

```javascript
if (qtyElements.length > 0) {
  // 如果找到多个数量元素，取第j个（与当前商品索引对应）
  const qtyElement = qtyElements[Math.min(j, qtyElements.length - 1)];
  const qtyText = qtyElement.textContent.trim();
```

**核心逻辑**:
- `j` 是当前处理的商品在订单中的索引（0、1、2...）
- `Math.min(j, qtyElements.length - 1)` 防止数组越界
  - 第 1 个商品 → 取第 1 个数量元素
  - 第 2 个商品 → 取第 2 个数量元素
  - 如果数量元素少于商品数 → 取最后一个元素

**处理多商品订单的例子**:
```
订单含 3 个商品，行中有 3 个数量元素 [× 2, × 1, × 3]
├─ 商品 #1 → qtyElements[0] = "× 2" → quantity = 2
├─ 商品 #2 → qtyElements[1] = "× 1" → quantity = 1
└─ 商品 #3 → qtyElements[2] = "× 3" → quantity = 3
```

---

### 第四步：提取数字值

```javascript
const qtyMatch = qtyText.match(/[×x]\s*(\d+)/i);
if (qtyMatch) {
  quantity = qtyMatch[1];  // 捕获分组，获取数字部分
}
```

**正则说明**:
- 同样识别 `×` 或 `x` 后跟数字的格式
- `(\d+)` 是捕获分组，`qtyMatch[1]` 返回分组内的数字
- 例: `"× 2"` → 提取出 `"2"`

---

## 🎯 选择器总结

| 层级 | 选择器 | 说明 |
|-----|--------|------|
| 1 | `productRow.querySelectorAll('div')` | 获取商品行中的所有 div |
| 2 | 正则 `/^[×x]\s*\d+$/i` | 过滤文本完全匹配数量格式的 div |
| 3 | `.textContent.trim()` | 提取并修剪 div 的文本内容 |
| 4 | 正则 `/[×x]\s*(\d+)/i` | 提取数字部分的捕获组 |

---

## 📝 特殊处理

### 1. 文本修剪
```javascript
const text = div.textContent.trim();
```
- 移除前后空格，确保正则匹配准确

### 2. 默认值处理
```javascript
if (qtyElements.length > 0) {
  // 提取数量
} else {
  // 未找到时，使用默认值 1
  quantity = '1';
}
```

### 3. 日志记录
```javascript
addDebugLog(`  → 在商品行中找到 ${qtyElements.length} 个数量元素`, 'info');
addDebugLog(`  → 数量元素 #${j} 文本: "${qtyText}"`, 'info');
addDebugLog(`  ✓ 成功提取数量: ${quantity}`, 'success');
```

---

## 💡 为什么采用文本匹配而非 CSS 选择器？

1. **HTML 结构变动性大**
   - TikTok 页面结构经常更新
   - CSS 类名频繁变化，固定选择器容易失效

2. **内容稳定**
   - 数量显示格式 `× N` 相对稳定
   - 不受样式变化影响

3. **适配多格式**
   - 支持 `× 2` 和 `x 2` 两种格式
   - 支持任意数位数字（1-999）

---

## 🧪 测试场景

| 场景 | 结果 | 说明 |
|-----|------|------|
| 单件订单 | ✅ quantity = "1" | 找不到数量元素，用默认值 |
| 多件商品 | ✅ quantity = "2" / "3" / ... | 正确提取 |
| 多个商品 | ✅ 按索引对应 | 每个商品匹配对应的数量 |
| 格式异常 | ⚠️ quantity = "1" | 降级到默认值 |

---

## 🔧 调试方法

打开插件的调试窗口（🔧 图标），查看数量提取过程：
```
→ 在商品行中找到 3 个数量元素
→ 数量元素 #0 文本: "× 2"
✓ 成功提取数量: 2
```

如果看到警告：
```
⚠️ 未找到数量元素(格式: × 数字)，使用默认值1
```

说明 TikTok 页面的数量显示格式可能已改变，需要更新正则表达式。

---

## 📌 相关代码位置

| 项目 | 行号 | 说明 |
|-----|------|------|
| 数量提取 | 1212-1240 | 核心提取逻辑 |
| SKU 提取 | 1175-1200 | 同一商品块中 |
| 日期提取 | 1090-1145 | 商品行头部 |
| 总价提取 | 1155-1162 | 每个订单一次 |
| 函数入口 | 950 | `extractTikTokOrders()` 函数开始 |

