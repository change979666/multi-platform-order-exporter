# Lazada/Shopee/TikTok 订单提取助手 🛍️

一个专为东南亚电商卖家打造的强大浏览器扩展插件，可以快速提取 **Lazada**、**Shopee(虾皮)**、**TikTok Shop** 三大平台的订单信息，并自动导出为标准 Excel 格式。

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Lazada%20%7C%20Shopee%20%7C%20TikTok-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特点

### 🎯 多平台支持
- ✅ **Lazada**: 支持泰国、新加坡、马来西亚、越南、菲律宾站点
- ✅ **Shopee (虾皮)**: 支持所有东南亚站点
- ✅ **TikTok Shop**: 支持 TikTok 卖家中心

### 🚀 核心功能
- 📊 **一键提取**: 快速提取当前页面的所有订单信息
- 💾 **Excel 导出**: 将订单数据导出为标准 CSV 格式，兼容 Excel
- 🎨 **现代化 UI**: 渐变设计，操作简单直观，支持暗色主题
- 📈 **实时统计**: 自动统计订单数量、商品总数、订单总额
- 💾 **自动保存**: 提取的数据自动保存，关闭插件后不会丢失
- 🎯 **智能识别**: 自动识别当前平台，提供平台专属功能

### 🔧 智能处理
- 🗓️ **日期智能解析**: 自动从虾皮订单号中解析订单日期
- 💰 **价格自动处理**: 处理不同平台的价格格式（฿ 符号等）
- 📦 **物流信息拆分**: 自动拆分 TikTok 合并的快递公司与运单号
- ⏰ **时间戳记录**: 自动记录支付时间和交货时间

## 📦 安装方法

### Chrome / Edge 浏览器

1. **下载插件**
   ```bash
   git clone https://github.com/yourusername/order-extractor.git
   ```
   或直接下载 ZIP 压缩包并解压

2. **加载插件**
   - 打开浏览器，进入扩展程序页面:
     - Chrome: 输入 `chrome://extensions/`
     - Edge: 输入 `edge://extensions/`
   - 开启右上角的 "开发者模式"
   - 点击 "加载已解压的扩展程序"
   - 选择本项目的文件夹

3. **完成!** 
   - 插件图标会出现在浏览器工具栏
   - 点击图标即可开始使用

## 🎮 使用方法

### 基本使用流程

#### 1️⃣ 打开订单页面

**Lazada:**
- 登录 [Lazada 卖家中心](https://sellercenter.lazada.co.th/)
- 进入"我的订单"或"待处理订单"页面

**Shopee:**
- 登录 [Shopee 卖家中心](https://seller.shopee.co.th/)
- 进入订单管理页面

**TikTok Shop:**
- 登录 [TikTok Shop 卖家后台](https://seller-th.tiktok.com/)
- 访问订单列表页面

#### 2️⃣ 点击插件图标
在浏览器工具栏找到订单提取助手图标并点击

#### 3️⃣ 选择平台
点击对应的平台卡片 (Lazada/Shopee/TikTok)

#### 4️⃣ 提取订单
点击 **"提取订单数据"** 按钮，等待提取完成

#### 5️⃣ 导出数据
点击 **"导出 Excel"** 按钮，CSV 文件会自动下载

### 快捷操作

- **右键菜单**: 在订单页面右键，选择"提取订单"快速提取
- **自动保存**: 提取的数据会自动保存，下次打开插件可直接导出

## 📁 项目结构

```
订单提取插件/
├── manifest.json          # 插件配置文件 (Manifest V3)
├── popup.html            # 弹窗页面 (现代化UI)
├── popup.css             # 弹窗样式 (渐变设计)
├── popup.js              # 弹窗逻辑 (交互处理)
├── content.js            # 内容脚本 (数据提取核心)
├── background.js         # 后台服务 (消息处理)
├── generate_icons.py     # 图标生成脚本
├── icons/                # 图标文件夹
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── Lazada.txt           # Lazada 订单示例数据
├── 虾皮.txt              # Shopee 订单示例数据
├── TK.txt               # TikTok 订单示例数据
├── 项目介绍.md           # 详细技术文档
└── README.md            # 本文件
```

## 📝 导出数据格式

导出的Excel文件按以下顺序排列数据（不含字段名）：

1. SKU（商品编码）
2. 订单号
3. 客户名称
4. 订单日期
5. 数量
6. 销售单价
7. 订单总额（仅在每个订单的第一行显示）

### 各平台特点

```
BD34-02,1038...,In Finix,2025-10-17,1,55,54.25
BD11-02,1038...,In Finix,2025-10-17,2,55,
BD63-White,58079...,t*********k,2025-10-17,1,0.00,77.00
BD64-Black,58079...,t*********k,2025-10-17,1,0.00,
```

**特别说明：**
- Lazada：每个商品显示各自单价，总金额仅在订单首行显示
- Shopee/TikTok：商品单价为0，总金额仅在订单首行显示
- 日期格式统一为：YYYY-MM-DD

## 🔧 技术详解

### 各平台提取逻辑

#### 📘 Lazada 提取逻辑

```javascript
// 订单容器: div.list-item
// 订单号: a[data-spm="d_order_number"]
// 客户名: div.order-header-chat-box span.next-btn-helper
// 订单日期: span.order-field-create-time a
// SKU: div.order-field-seller-sku span.show-text
// 数量: div.order-item-count (去除×)
// 单价: div.order-item-price span.number-text-scope (title属性)
// 总额: div.order-amount-col span.number-text-scope (title属性)
// 快递: div.order-field-first-mile span.show-text
// 运单: div.order-field-tracking-number span.show-text
```

#### 🧡 Shopee (虾皮) 提取逻辑

```javascript
// 订单容器: div[data-testid^="package-card-"]
// 订单号: span.order-sn (需去除泰语前缀)
// 客户名: div.buyer-username
// 订单日期: 从订单号智能解析 (251017 -> 2025-10-17)
// SKU: div.item-description (提取[]内内容)
// 数量: div.item-amount (去除x)
// 单价: 0.00 (平台不提供)
// 总额: div.total-price (去除฿)
// 快递: div.fulfilment-channel-name
// 运单: div.tracking-number
```

#### 🎵 TikTok Shop 提取逻辑

```javascript
// 订单结构: 每3个tr为一组 (sc-bZgIus, sc-dPFVfm, sc-cSwLNi)
// 订单号: span.order_id_number
// 客户名: div._RowHeaderRight_j9zh9_12 div.line-clamp-2
// 订单日期: span.sc-jVOTke.fSFofC
// SKU: div.line-clamp-2 (包含"Seller SKU:"的元素)
// 数量: div.sc-brSOsn.iqakNZ (去除×)
// 单价: 0.00 (平台不提供)
// 总额: p.sc-jwExjx.eMpPma (去除฿)
// 快递+运单: div.line-clamp-2 (按逗号分割)
```

### 特殊处理

#### 🗓️ 虾皮订单日期解析

```javascript
// 订单号: 251017AC38U19T
// 前6位: 251017 = YY MM DD
// 解析为: 2025-10-17
function parseShopeeOrderDate(orderNumber) {
  const year = '20' + orderNumber.substring(0, 2);
  const month = orderNumber.substring(2, 4);
  const day = orderNumber.substring(4, 6);
  return `${year}-${month}-${day}`;
}
```

## ⚠️ 注意事项

### 使用前提
1. ✅ **登录状态**: 请确保已登录对应电商平台的卖家账号
2. ✅ **订单页面**: 必须在订单列表或订单管理页面使用
3. ✅ **页面加载**: 确保页面完全加载后再提取数据

### 常见问题

**Q: 提取失败怎么办？**
- A: 刷新页面后重试，确保在正确的订单页面

**Q: 数据不完整？**
- A: 某些字段可能因页面结构变化而提取失败，请查看控制台日志

**Q: 支持哪些国家站点？**
- A: 支持所有东南亚站点 (泰国、新加坡、马来西亚、越南、菲律宾等)

**Q: 数据保存在哪里？**
- A: 数据仅保存在浏览器本地存储，不会上传到任何服务器

### 页面结构变化

⚠️ 电商平台可能会更新页面结构，导致提取失败。如遇此问题：

1. 打开浏览器开发者工具 (F12)
2. 检查实际的 HTML 元素结构
3. 修改 `content.js` 中对应平台的 CSS 选择器
4. 提交 Issue 或 Pull Request 帮助改进

## 🔐 权限说明

插件需要以下权限：

- `activeTab`: 访问当前活动标签页 (仅在点击时)
- `storage`: 保存提取的订单数据到本地
- `tabs`: 检测和管理标签页
- `downloads`: 下载导出的 Excel 文件
- `host_permissions`: 访问指定电商平台的页面内容

**隐私保护**: 所有数据仅保存在本地浏览器，不会上传到任何服务器！

## 🛠️ 开发相关

### 重新生成图标

如需自定义图标样式，修改 `generate_icons.py` 后运行：

```bash
pip install pillow
python generate_icons.py
```

### 调试方法

1. 打开浏览器扩展程序页面
2. 找到本插件，点击"检查视图"中的"background.html"
3. 在订单页面按 F12 打开开发者工具
4. 查看 Console 中的日志信息

### 添加新平台

要添加新的电商平台支持：

1. 在 `manifest.json` 中添加新平台域名
2. 在 `content.js` 中添加新平台提取函数
3. 在 `popup.html` 中添加新平台按钮
4. 在 `background.js` 中添加平台检测逻辑

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果遇到问题或有功能建议，请在 GitHub 上提交 Issue。

## 📄 许可证

MIT License - 自由使用、修改和分发

## 🎉 更新日志

### v1.0.0 (2025-10-17)

- ✨ 初始版本发布
- 🎯 支持 Lazada、Shopee、TikTok Shop 三大平台
- 💾 支持标准 CSV 格式导出
- 🎨 现代化渐变 UI 设计
- 📊 订单统计功能
- 🗓️ 虾皮订单号日期智能解析
- 📦 TikTok 物流信息自动拆分

## 💡 使用技巧

- **批量提取**: 滚动页面加载更多订单后再提取
- **数据合并**: 可使用 Excel 的数据导入功能将多次导出合并
- **筛选分析**: 在 Excel 中可对导出数据进行筛选、排序、透视分析
- **定期备份**: 建议定期导出数据作为订单备份

## 📞 支持

如有问题，欢迎联系：
- 📧 Email: your@email.com
- 💬 GitHub Issues
- 🌐 项目主页

---

**Made with ❤️ for Southeast Asian E-commerce Sellers**

*让订单管理更简单，让数据提取更高效！* 🚀
