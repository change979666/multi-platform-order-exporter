// Background Service Worker - 后台服务脚本

console.log('🚀 订单提取插件后台服务已启动');

// 插件安装或更新时触发
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('✅ 订单提取插件已安装');
    
    // 设置初始配置
    chrome.storage.local.set({
      installDate: new Date().toISOString(),
      version: chrome.runtime.getManifest().version
    });
    
    // 可以打开欢迎页面
    // chrome.tabs.create({ url: 'welcome.html' });
  } else if (details.reason === 'update') {
    const version = chrome.runtime.getManifest().version;
    console.log(`🔄 订单提取插件已更新到版本: ${version}`);
  }
});

// 监听来自 content script 或 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📬 收到消息:', request);
  
  if (request.action === 'saveOrders') {
    // 保存订单数据
    chrome.storage.local.set({
      orderData: request.data,
      platform: request.platform,
      lastUpdate: new Date().toISOString()
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getOrders') {
    // 获取订单数据
    chrome.storage.local.get(['orderData', 'platform', 'lastUpdate'], (result) => {
      sendResponse({
        success: true,
        data: result.orderData || [],
        platform: result.platform,
        lastUpdate: result.lastUpdate
      });
    });
    return true;
  }
  
  if (request.action === 'clearOrders') {
    // 清除订单数据
    chrome.storage.local.remove(['orderData', 'platform', 'lastUpdate', 'stats'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = tab.url.toLowerCase();
    
    // 检测是否在支持的电商平台页面
    const platforms = [
      { name: 'Lazada', patterns: ['lazada.co.th', 'lazada.sg', 'lazada.com.my', 'lazada.vn', 'lazada.com.ph'] },
      { name: 'Shopee', patterns: ['shopee.co.th', 'shopee.sg', 'shopee.com.my', 'shopee.vn', 'shopee.ph'] },
      { name: 'TikTok Shop', patterns: ['seller.tiktok.com', 'seller-th.tiktok.com'] }
    ];
    
    for (const platform of platforms) {
      if (platform.patterns.some(pattern => url.includes(pattern))) {
        console.log(`🌐 检测到 ${platform.name} 页面`);
        
        // 更新图标徽章
        chrome.action.setBadgeText({ 
          text: '✓', 
          tabId: tabId 
        });
        chrome.action.setBadgeBackgroundColor({ 
          color: '#4CAF50', 
          tabId: tabId 
        });
        
        break;
      }
    }
  }
});

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  // Lazada 菜单
  chrome.contextMenus.create({
    id: 'extractLazada',
    title: '提取 Lazada 订单',
    contexts: ['page'],
    documentUrlPatterns: [
      '*://*.lazada.co.th/*',
      '*://*.lazada.sg/*',
      '*://*.lazada.com.my/*',
      '*://*.lazada.vn/*',
      '*://*.lazada.com.ph/*'
    ]
  });
  
  // Shopee 菜单
  chrome.contextMenus.create({
    id: 'extractShopee',
    title: '提取 Shopee 订单',
    contexts: ['page'],
    documentUrlPatterns: [
      '*://*.shopee.co.th/*',
      '*://*.shopee.sg/*',
      '*://*.shopee.com.my/*',
      '*://*.shopee.vn/*',
      '*://*.shopee.ph/*'
    ]
  });
  
  // TikTok 菜单
  chrome.contextMenus.create({
    id: 'extractTikTok',
    title: '提取 TikTok Shop 订单',
    contexts: ['page'],
    documentUrlPatterns: [
      '*://*.tiktok.com/*',
      '*://seller.tiktok.com/*',
      '*://seller-th.tiktok.com/*'
    ]
  });
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const platformMap = {
    'extractLazada': 'lazada',
    'extractShopee': 'shopee',
    'extractTikTok': 'tiktok'
  };
  
  const platform = platformMap[info.menuItemId];
  if (!platform) return;
  
  // 发送消息到 content script 提取订单
  chrome.tabs.sendMessage(tab.id, {
    action: 'extractOrders',
    platform: platform
  }, (response) => {
    if (response && response.success) {
      // 保存数据
      chrome.storage.local.set({
        orderData: response.data,
        platform: platform,
        lastUpdate: new Date().toISOString()
      });
      
      // 通知用户提取成功
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '订单提取成功',
        message: `已提取 ${response.data.length} 条订单数据`
      });
    } else {
      // 提取失败通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '订单提取失败',
        message: response?.message || '请刷新页面后重试'
      });
    }
  });
});

// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === 'extract-orders') {
    // 获取当前活动标签页并尝试提取订单
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = tabs[0].url.toLowerCase();
        let platform = null;
        
        if (url.includes('lazada')) platform = 'lazada';
        else if (url.includes('shopee')) platform = 'shopee';
        else if (url.includes('tiktok')) platform = 'tiktok';
        
        if (platform) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'extractOrders',
            platform: platform
          });
        }
      }
    });
  }
});
