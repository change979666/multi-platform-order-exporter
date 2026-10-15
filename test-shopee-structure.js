// 虾皮订单结构测试脚本
// 用于检测当前页面使用的是新版还是旧版HTML结构

console.log('=== 虾皮订单结构检测脚本 ===\n');

// 1. 检测订单卡片容器
console.log('1️⃣ 订单卡片容器检测:');
const oldCards = document.querySelectorAll('div[data-testid^="package-card-"]');
const newCards = document.querySelectorAll('a.order-card');
console.log(`   旧版容器 (div[data-testid^="package-card-"]): ${oldCards.length} 个`);
console.log(`   新版容器 (a.order-card): ${newCards.length} 个`);

if (oldCards.length > 0) {
  console.log('   ✅ 检测到旧版HTML结构');
} else if (newCards.length > 0) {
  console.log('   ✅ 检测到新版HTML结构');
} else {
  console.log('   ❌ 未检测到任何订单容器');
}

// 2. 检测订单号
console.log('\n2️⃣ 订单号选择器检测:');
const orderSnElements = document.querySelectorAll('span.order-sn');
console.log(`   span.order-sn: ${orderSnElements.length} 个`);
if (orderSnElements.length > 0) {
  console.log(`   示例文本: "${orderSnElements[0].textContent.trim()}"`);
}

// 3. 检测客户名
console.log('\n3️⃣ 客户名选择器检测:');
const buyerUsernames = document.querySelectorAll('div.buyer-username');
console.log(`   div.buyer-username: ${buyerUsernames.length} 个`);
if (buyerUsernames.length > 0) {
  console.log(`   示例文本: "${buyerUsernames[0].textContent.trim()}"`);
}

// 4. 检测订单总价
console.log('\n4️⃣ 订单总价选择器检测:');
const totalPrices = document.querySelectorAll('div.total-price');
console.log(`   div.total-price: ${totalPrices.length} 个`);
if (totalPrices.length > 0) {
  console.log(`   示例文本: "${totalPrices[0].textContent.trim()}"`);
}

// 5. 检测商品列表
console.log('\n5️⃣ 商品列表选择器检测:');
const itemsNew = document.querySelectorAll('div.item-list .item');
const itemsOld = document.querySelectorAll('div.order-item-infos .item');
console.log(`   新版 (div.item-list .item): ${itemsNew.length} 个`);
console.log(`   旧版 (div.order-item-infos .item): ${itemsOld.length} 个`);

// 6. 检测商品详细信息
console.log('\n6️⃣ 商品详细信息选择器检测:');
const itemNames = document.querySelectorAll('div.item-name');
const itemDescs = document.querySelectorAll('div.item-description');
const itemAmounts = document.querySelectorAll('div.item-amount');
console.log(`   div.item-name: ${itemNames.length} 个`);
console.log(`   div.item-description: ${itemDescs.length} 个`);
console.log(`   div.item-amount: ${itemAmounts.length} 个`);

if (itemNames.length > 0) {
  console.log(`   示例商品名: "${itemNames[0].textContent.trim().substring(0, 50)}..."`);
}
if (itemDescs.length > 0) {
  console.log(`   示例商品描述: "${itemDescs[0].textContent.trim()}"`);
  
  // 测试SKU提取
  const descText = itemDescs[0].textContent.trim();
  const skuMatch = descText.match(/\[(.*?)\]/);
  if (skuMatch) {
    console.log(`   ✅ SKU提取成功: "${skuMatch[1]}"`);
  } else {
    console.log(`   ⚠️ 未找到方括号内的SKU`);
  }
}
if (itemAmounts.length > 0) {
  console.log(`   示例数量: "${itemAmounts[0].textContent.trim()}"`);
}

// 7. 检测展开按钮（多件商品折叠功能）
console.log('\n7️⃣ 展开按钮检测（5件以上商品）:');
const expandButtons = document.querySelectorAll('.order-item-expand .order-item-expand-text');
console.log(`   .order-item-expand .order-item-expand-text: ${expandButtons.length} 个`);
if (expandButtons.length > 0) {
  expandButtons.forEach((btn, i) => {
    const text = btn.textContent.trim();
    if (/สินค้ารวม/i.test(text)) {
      console.log(`   按钮 ${i + 1}: "${text}" ✅ 需要展开`);
    }
  });
} else {
  console.log('   ℹ️ 当前页面没有折叠的订单');
}

// 8. 完整测试 - 提取第一个订单的信息
console.log('\n8️⃣ 完整测试 - 提取第一个订单:');
const firstCard = document.querySelector('div[data-testid^="package-card-"], a.order-card');
if (firstCard) {
  console.log('   ✅ 找到第一个订单卡片');
  
  // 订单号
  const orderSnEl = firstCard.querySelector('span.order-sn');
  if (orderSnEl) {
    const orderNumber = orderSnEl.textContent.replace(/^.*\s+/, '').trim();
    console.log(`   订单号: ${orderNumber}`);
  }
  
  // 客户名
  const customerEl = firstCard.querySelector('div.buyer-username');
  if (customerEl) {
    console.log(`   客户名: ${customerEl.textContent.trim()}`);
  }
  
  // 总价
  const priceEl = firstCard.querySelector('div.total-price');
  if (priceEl) {
    console.log(`   总价: ${priceEl.textContent.trim()}`);
  }
  
  // 商品
  const items = firstCard.querySelectorAll('div.item-list .item, div.order-item-infos .item');
  console.log(`   商品数量: ${items.length} 个`);
  
  items.forEach((item, i) => {
    const nameEl = item.querySelector('div.item-name');
    const descEl = item.querySelector('div.item-description');
    const qtyEl = item.querySelector('div.item-amount');
    
    if (nameEl && descEl && qtyEl) {
      console.log(`   商品 ${i + 1}:`);
      console.log(`     名称: ${nameEl.textContent.trim().substring(0, 40)}...`);
      console.log(`     描述: ${descEl.textContent.trim()}`);
      console.log(`     数量: ${qtyEl.textContent.trim()}`);
      
      // 提取SKU
      const descText = descEl.textContent.trim();
      const skuMatch = descText.match(/\[(.*?)\]/);
      if (skuMatch) {
        let skuText = skuMatch[1].trim();
        let sku = skuText;
        
        if (skuText.includes(' ')) {
          const parts = skuText.split(' ');
          if (parts.length > 1) {
            sku = parts.slice(1).join(' ');
          }
        }
        
        console.log(`     SKU: ${sku}`);
      }
    }
  });
} else {
  console.log('   ❌ 未找到订单卡片');
}

// 9. 总结
console.log('\n=== 检测总结 ===');
if (newCards.length > 0) {
  console.log('✅ 当前店铺使用【新版】HTML结构');
  console.log('   主要特征:');
  console.log('   - 订单容器: <a class="order-card">');
  console.log('   - 订单号: <span class="order-sn">');
  console.log('   - 客户名: <div class="buyer-username">');
  console.log('   - 商品列表: <div class="item-list">');
} else if (oldCards.length > 0) {
  console.log('✅ 当前店铺使用【旧版】HTML结构');
  console.log('   主要特征:');
  console.log('   - 订单容器: <div data-testid="package-card-...">');
  console.log('   - 订单号: <span class="order-sn">');
  console.log('   - 商品列表: <div class="order-item-infos">');
} else {
  console.log('❌ 未检测到有效的订单结构');
  console.log('   请确保:');
  console.log('   1. 已经打开虾皮卖家中心订单页面');
  console.log('   2. 页面已完全加载');
  console.log('   3. 有可见的订单列表');
}

console.log('\n✅ 插件已更新，同时支持新旧两种HTML结构');
