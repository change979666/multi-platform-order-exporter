# 更新日志

## v1.0.1 - 2025-10-23 - 数据格式优化

### 修复内容

#### 1. Lazada日期提取修复
- **问题**: Lazada日期格式已从 `15 Jan 2024` 变更为 `15 Sep 2025 09:05`，但代码未同步更新
- **修复**: 
  - 更新日期解析逻辑以支持新格式
  - 日期格式从 `YYYY-MM-DD-HH:mm` 改为 `YYYY-MM-DD HH:mm` (使用空格代替连字符分隔日期和时间)
  - 增加调试日志记录日期转换失败情况

#### 2. 金额格式优化（移除千位分隔符）
- **问题**: 金额字段包含逗号(如 `1,234.56`)，影响Excel数值计算
- **修复**: 为所有平台的金额字段添加逗号移除逻辑

**Lazada平台** (`extractLazadaOrders`):
- `netSellingPrice` (订单总金额) - 第648行
- `sellingPrice` (商品单价) - 第670行

**Shopee平台** (`extractShopeeOrders`):
- `totalPrice` (订单总价) - 第755行

**TikTok平台** (`extractTikTokOrders`):
- `totalPrice` (订单总价) - 第1063行 (已包含在原有代码中: `replace(/[฿,]/g, '')`)

### 技术细节

#### 日期格式变更
```javascript
// 旧格式: YYYY-MM-DD-HH:mm
// 示例: 2025-09-15-09:05

// 新格式: YYYY-MM-DD HH:mm  
// 示例: 2025-09-15 09:05
```

#### 金额处理代码示例
```javascript
// 移除金额中的千位分隔符
if (netSellingPrice) {
  netSellingPrice = netSellingPrice.replace(/,/g, '');
}
```

### 影响范围
- Lazada订单提取功能
- Shopee订单提取功能  
- TikTok订单提取功能
- Excel导出数据格式

### 测试建议
1. 验证Lazada日期是否正确显示在Excel中
2. 验证所有平台的金额字段在Excel中显示为数值类型(无逗号)
3. 确认Excel中可以直接对金额列进行求和等数值计算

### 文件变更
- `content.js` (4处修改)
  - 第616-641行: Lazada日期格式化逻辑
  - 第644-649行: Lazada订单总金额处理
  - 第668-671行: Lazada商品单价处理
  - 第752-757行: Shopee订单总价处理
