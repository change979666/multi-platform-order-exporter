# TikTok Shop 订单页面格式变化与修复记录

**最后更新**: 2025年12月17日  
**当前版本**: v1.2.9  
**状态**: ✅ 修复完成

---

## 🔍 问题背景

TikTok Shop 前端频繁更新，之前依赖的 CSS 类名 `sc-bZgIus` 等已失效。通过深度调试发现，订单页面的HTML结构发生了显著变化，导致订单提取插件提取0个商品。

---

## 📊 页面结构变化分析

### **之前（旧版本）**
```
假设：1行 = 1个订单（订单号 + 用户名 + 日期 + SKU + 价格）
实际：❌ 这个假设是错的
```

### **现在（新版本）**
```
实际发现：1个订单 = 多行 (3-4行)

行#0 [订单头部]
├─ 包含: Order ID（18位数字）
├─ 包含: 用户名
├─ 包含: 日期 (MM/DD/YYYY HH:MM:SS AM/PM)
└─ 不包含: SKU 或产品数据

行#1 [产品行]  ← 关键！这才是SKU数据所在
├─ 包含: 产品描述
├─ 包含: Seller SKU: XXX
├─ 包含: 颜色/尺寸等属性
├─ 包含: 数量标记 (× 1)
└─ 包含: 价格 (฿ XX.XX)

行#2 [分隔行]
├─ 可能为空
└─ 或包含其他信息

行#3 [分隔行或下一订单]
```

**关键发现**: 产品数据在单独的 `<tr>` 行中，不在订单头部行中！

---

## 🛠️ 修复过程

### **v1.2.0 - 完全重写（初始尝试）**
- ❌ 问题: 仍然假设1行 = 1订单
- ❌ 结果: 提取0个商品

### **v1.2.6 - 增强诊断（问题排查）**
```javascript
// 添加详细的调试日志
- 显示每行的 TD 和 DIV 数量
- 检查 HTML 中是否包含 'Seller SKU'
- 显示前8个 DIV 的内容
```
**诊断结果**:
```
找到 24 个tr元素
此订单包含 1 行数据        ← ❌ 问题！应该是3-4行
【Row #0】 完整内容: Order ID: ...
→ 此行HTML包含SKU: 否      ← ❌ SKU在别的行！
→ 在此行找到 0 个SKU
```

### **v1.2.7 - 修复分组逻辑（突破性改进）**

**核心改变**: 不再假设1行 = 1订单，而是真正实现多行分组

```javascript
// 第1步：先找出所有订单头部行（包含订单号）
const orderHeaderIndices = [];
allOrderRows.forEach((row, idx) => {
  const orderIdSpan = row.querySelector('span.order_id_number');
  if (orderIdSpan && /^\d{18}$/.test(orderIdSpan.textContent.trim())) {
    orderHeaderIndices.push(idx);  // 记录头部行的索引
  }
});

// 第2步：为每个订单分配后续所有行（直到下一个订单头部）
orderHeaderIndices.forEach((headerIdx, orderIndex) => {
  const nextOrderHeaderIdx = orderIndex + 1 < orderHeaderIndices.length
    ? orderHeaderIndices[orderIndex + 1]
    : allOrderRows.length;
  
  // 收集所有行：从当前头部到下一个头部（或表格末尾）
  const orderRows = allOrderRows.slice(headerIdx, nextOrderHeaderIdx);
  ordersByNumber[orderId] = orderRows;  // 可能是3-4行！
});
```

**结果**:
```
✅ 从 0 行/订单 → 3-4 行/订单
✅ 成功提取 10 条订单
✅ 但有污染: SKU = "BD44-BlackAffiliate creator" ❌
```

### **v1.2.8 - 修复SKU污染与去重**

**问题1: SKU值污染**
```javascript
// ❌ v1.2.7 方法：用textContent（包含所有嵌套内容）
const skuDivs = Array.from(productRow.querySelectorAll('div'))
  .filter(div => div.textContent.includes('Seller SKU:'));

// 结果
div.textContent = "Seller SKU: BD44-BlackAffiliate creator× 1"
                   ↑                         ↑
                 期望                    污染来自嵌套元素
```

**解决方案**: 使用正则表达式从HTML直接提取

```javascript
// ✅ v1.2.8 方法：从HTML源代码中精确提取
const skuMatches = productRow.innerHTML
  .match(/Seller SKU:\s*([^<\n]+?)(?:<|$)/gi);
// 关键：[^<\n]+? 只匹配 `<` 之前的内容，避免嵌套污染

const skuSet = new Set();
skuMatches.forEach(match => {
  const skuValue = match
    .replace(/Seller SKU:\s*/i, '')
    .replace(/<.*$/i, '')
    .trim();
  if (skuValue && skuValue.length < 100) {
    skuSet.add(skuValue);  // Set自动去重
  }
});
```

**结果**:
```
✅ SKU污染解决: "BD47-01" (清晰！)
✅ 自动去重: 7个重复 → 3个唯一值
✅ 但用户名错误: "chat12/17/2025" ❌（应该是"ying_2310"）
```

### **v1.2.9 - 修复用户名提取（最终优化）**

**问题**: 用户名提取不准确

```
原始文本结构:
Order ID: 581692361473688792ying_2310Start chat12/17/2025 9:16:01 AM
                              ↑          ↑
                          用户名    "Start chat"按钮
```

**v1.2.8 错误方法**:
```javascript
// ❌ 分割字符导致混淆
const allText = container.textContent.split(/\s+/);
// 结果：提取了"chat"或日期部分
```

**v1.2.9 正确方法**:
```javascript
// ✅ 使用精确的字符串位置查找
const fullText = container.textContent;
const orderIdIndex = fullText.indexOf(orderId);
const startChatIndex = fullText.indexOf('Start chat');

if (orderIdIndex !== -1 && startChatIndex !== -1) {
  // 在订单号和"Start chat"之间提取
  let candidateName = fullText
    .substring(orderIdIndex + orderId.length, startChatIndex)
    .trim();
  // 结果：精确提取 "ying_2310"
}
```

**结果**:
```
✅ 用户名正确: "ying_2310"
✅ 成功提取 10 条订单
✅ 全流程无污染、无错误
```

---

## 📐 最终解决方案架构

### **1. 多行订单分组**
```
输入: 24 个 <tr> 元素（混杂订单头部、产品行、分隔行）
     ↓
处理: 按订单号span识别头部行 → 为每个订单分配后续所有行
     ↓
输出: 6 个订单，每个包含 3-4 行数据
```

### **2. SKU精确提取**
```
输入: productRow.innerHTML（完整HTML）
     ↓
处理: 用正则 /Seller SKU:\s*([^<\n]+?)(?:<|$)/gi 精确匹配
     → 只提取 `<` 之前的内容（避免嵌套污染）
     → 用 Set 自动去重
     ↓
输出: 唯一的、清晰的 SKU 值
```

### **3. 用户名精确提取**
```
输入: 容器的完整文本（包含订单号、用户名、"Start chat"、日期）
     ↓
处理: 查找订单号位置和"Start chat"位置
     → 提取两者之间的文本
     → 清理空格
     ↓
输出: 真实用户名（如 "ying_2310"）
```

---

## 🔧 关键技术要点

### **1. 不依赖CSS类名（它们会变）**
```javascript
// ❌ 不推荐
const rows = document.querySelectorAll('tr.sc-bZgIus');  // 下次更新就失效

// ✅ 推荐
const rows = document.querySelectorAll('tbody tr');
const orderIdSpan = row.querySelector('span.order_id_number');
if (orderIdSpan && /^\d{18}$/.test(orderIdSpan.textContent)) {
  // 这是一个有效的订单头部行
}
```

### **2. 用正则表达式从HTML精确提取（不用textContent）**
```javascript
// ❌ 容易污染
const text = div.textContent;  // 包含所有嵌套内容

// ✅ 精确且安全
const matches = element.innerHTML.match(/pattern/g);
// 只提取匹配的部分，不含嵌套元素的其他内容
```

### **3. 使用Set进行去重**
```javascript
const skuSet = new Set();
skuMatches.forEach(match => {
  const sku = extractSku(match);
  skuSet.add(sku);  // 自动去重，无需手动检查
});
const uniqueSkus = Array.from(skuSet);
```

### **4. 字符串位置查找比分割更精确**
```javascript
// ❌ 容易混淆
const parts = text.split(/\s+/);

// ✅ 精确定位
const startIdx = text.indexOf('Start');
const endIdx = text.indexOf('End');
const middle = text.substring(startIdx, endIdx);
```

---

## 📋 完整改进历程表

| 版本 | 日期 | 改进点 | 状态 |
|------|------|--------|------|
| 1.2.0 | 12-16 | 重写TikTok提取逻辑 | ❌ 提取0个商品 |
| 1.2.1-1.2.5 | 12-16 | 日期格式修复、用户名优化 | ⚠️ 部分改进 |
| 1.2.6 | 12-17 | 添加诊断日志 | 🔍 问题诊断完成 |
| 1.2.7 | 12-17 | 多行订单分组 | ✅ 提取10个商品 |
| 1.2.8 | 12-17 | SKU去污、去重 | ✅ 清晰SKU值 |
| 1.2.9 | 12-17 | 用户名精确提取 | ✅ **最终完成** |

---

## 📊 测试结果对比

### **v1.2.6（诊断阶段）**
```
找到 24 个tr元素
找到 6 个有订单号的行
每个订单 1 行 → SKU = 0
结果: ❌ 0 个商品
```

### **v1.2.7（分组修复）**
```
找到 24 个tr元素
按订单头部识别分组
每个订单 3-4 行 ✅
结果: ✅ 24 个商品（但有污染）
```

### **v1.2.8（SKU修复）**
```
SKU 污染: BD44-BlackAffiliate creator ❌ → BD44-Black ✅
SKU 去重: 7个重复 → 3个唯一值 ✅
用户名: chat12/17/2025 ❌
结果: ✅ 10 个订单, SKU清晰
```

### **v1.2.9（用户名修复）**
```
用户名精确提取: ying_2310 ✅
无污染、无错误
结果: ✅ **10 个订单完美提取**
```

---

## 🎯 导出数据示例

### **单条订单记录**
```json
{
  "platform": "TikTok Shop",
  "order_number": "581692361473688792",
  "customer_name": "ying_2310",
  "order_date": "2025-12-17 09:16",
  "sku": "BD44-Black",
  "quantity": "1",
  "selling_price": "46.00",
  "total_amount": "46.00"
}
```

### **多商品订单示例**
```
订单号: 581691614925522385
客户: j*******3
日期: 2025-12-17 08:06

商品 #1: BD47-01 × 1 = ฿62.68
商品 #2: BD47-03 × 1 = ฿62.68
商品 #3: BD47-05 × 1 = ฿62.68

总价: ฿188.04
```

---

## 💡 后续维护建议

### **如果TikTok再更新**

1. **先检查诊断日志**
   - 查看 `【订单行诊断】` 部分
   - 检查 `SKU=✓/✗` 标记
   - 查看完整内容是否合理

2. **检查order_id_number span是否仍然存在**
   ```javascript
   // 如果这个span不再存在，需要找新的订单号定位方式
   const orderIdSpan = row.querySelector('span.order_id_number');
   ```

3. **检查"Seller SKU:"文本是否仍然存在**
   ```javascript
   // 如果文本变了，更新正则表达式
   const matches = productRow.innerHTML.match(/Seller SKU:\s*([^<\n]+?)(?:<|$)/gi);
   ```

4. **检查用户名位置**
   ```javascript
   // 如果用户名的位置变了（不再在订单号和"Start chat"之间）
   const startChatIndex = fullText.indexOf('Start chat');
   ```

---

## 📚 相关文件

- `content.js` - 核心提取逻辑（1463行）
- `manifest.json` - v1.2.9 版本
- `popup.html` / `popup.js` - UI界面
- 调试窗口 - 黑色透明背景，蓝色边框，支持复制日志

---

**记录人**: GitHub Copilot  
**完成日期**: 2025年12月17日 13:14  
**总耗时**: ~3小时（v1.2.6 → v1.2.9）
