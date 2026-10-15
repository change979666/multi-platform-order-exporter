// 虾皮订单提取调试脚本
// 在虾皮订单页面的浏览器控制台运行此脚本，查看实际的HTML结构

console.log('🔍 开始调试虾皮订单页面...');

// 测试1: 查找订单容器
console.log('\n=== 测试1: 订单容器 ===');
const containers1 = document.querySelectorAll('div[data-testid^="package-card-"]');
console.log(`找到 ${containers1.length} 个 package-card 容器`);

const containers2 = document.querySelectorAll('a.order-card');
console.log(`找到 ${containers2.length} 个 order-card 链接`);

const containers3 = document.querySelectorAll('[data-testid="order-item"]');
console.log(`找到 ${containers3.length} 个 order-item 元素`);

// 测试2: 如果找到了订单，分析第一个订单的结构
const firstContainer = containers1[0] || containers2[0] || containers3[0];
if (firstContainer) {
  console.log('\n=== 测试2: 第一个订单详情 ===');
  console.log('订单容器:', firstContainer);
  
  // 测试订单号
  const orderSn1 = firstContainer.querySelector('span.order-sn');
  const orderSn2 = firstContainer.querySelector('.order-sn');
  console.log('订单号元素1:', orderSn1?.textContent);
  console.log('订单号元素2:', orderSn2?.textContent);
  
  // 测试客户名
  const buyer1 = firstContainer.querySelector('div.buyer-username');
  const buyer2 = firstContainer.querySelector('.buyer-username');
  console.log('客户名元素1:', buyer1?.textContent);
  console.log('客户名元素2:', buyer2?.textContent);
  
  // 测试价格
  const price1 = firstContainer.querySelector('div.total-price');
  const price2 = firstContainer.querySelector('.total-price');
  console.log('价格元素1:', price1?.textContent);
  console.log('价格元素2:', price2?.textContent);
  
  // 测试SKU描述
  const desc1 = firstContainer.querySelector('div.item-description');
  const desc2 = firstContainer.querySelector('.item-description');
  console.log('商品描述1:', desc1?.textContent);
  console.log('商品描述2:', desc2?.textContent);
  
  // 测试数量
  const amount1 = firstContainer.querySelector('div.item-amount');
  const amount2 = firstContainer.querySelector('.item-amount');
  console.log('数量1:', amount1?.textContent);
  console.log('数量2:', amount2?.textContent);
  
  // 测试物流
  const shipping1 = firstContainer.querySelector('div.fulfilment-channel-name');
  const shipping2 = firstContainer.querySelector('div.maksed-channel-name');
  const shipping3 = firstContainer.querySelector('.fulfilment-channel-name');
  console.log('物流名称1 (fulfilment):', shipping1?.textContent);
  console.log('物流名称2 (maksed):', shipping2?.textContent);
  console.log('物流名称3 (class):', shipping3?.textContent);
  
  // 测试快递单号
  const trackingList = firstContainer.querySelector('div.tracking-number-list');
  const tracking = trackingList?.querySelector('div.tracking-number');
  console.log('快递单号列表:', trackingList);
  console.log('快递单号:', tracking?.textContent);
  
  console.log('\n=== 完整HTML结构 ===');
  console.log(firstContainer.outerHTML.substring(0, 1000) + '...');
} else {
  console.log('❌ 未找到任何订单容器！');
  console.log('页面可能未加载完成，或者结构已改变');
  console.log('\n尝试查找所有可能的订单相关元素:');
  
  const allDivs = document.querySelectorAll('div[data-testid]');
  console.log(`页面上有 ${allDivs.length} 个带 data-testid 的 div`);
  
  const testIds = new Set();
  allDivs.forEach(div => {
    const testId = div.getAttribute('data-testid');
    if (testId && (testId.includes('order') || testId.includes('package') || testId.includes('card'))) {
      testIds.add(testId);
    }
  });
  
  console.log('找到的订单相关 data-testid:', Array.from(testIds));
}

console.log('\n✅ 调试完成！请截图这些信息发给我。');
