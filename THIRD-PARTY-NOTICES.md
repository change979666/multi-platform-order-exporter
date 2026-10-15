# 第三方组件声明 / Third-Party Notices

本项目的原创代码以 MIT License 发布（见 `LICENSE`）。但仓库中包含以下第三方组件，
**它们不随本项目的 MIT 协议重新授权**，必须保留其原始许可与版权声明。

This project's original code is licensed under MIT (see `LICENSE`). The following
third-party component is NOT covered by that MIT license and must be redistributed
under its own original license.

## SheetJS Community Edition (xlsx.full.min.js)

- **文件**: `xlsx.full.min.js`
- **用途**: 在浏览器端把提取到的订单数据生成 `.xlsx`（Excel）文件（由 `popup.js` 调用 `XLSX.utils.*` / `XLSX.write`）。
- **版权**: `xlsx.js (C) 2013-present SheetJS — http://sheetjs.com`
- **来源**: https://sheetjs.com/ ，社区版（Community Edition）官方发行包。
- **许可**: Apache License, Version 2.0。
  - 该文件头部保留了原始版权声明 `/*! xlsx.js (C) 2013-present SheetJS -- http://sheetjs.com */`。
  - 再分发时请保留此头部声明；Apache-2.0 文本见 https://www.apache.org/licenses/LICENSE-2.0 。
- **说明**: SheetJS 社区版为 Apache-2.0，可在本扩展中自由使用、修改与再分发；但其版权与许可归 SheetJS 所有，不因为被打包进本仓库而变更为 MIT。

除此之外，仓库中的图标（`icons/`）、平台页面结构选择器等均为针对 Lazada/Shopee/TikTok 卖家中心页面的适配代码；
电商平台本身的商标、页面与数据版权归各平台所有，本扩展仅在用户登录授权后于其本地浏览器内读取订单页面。
