// Popup Script - 弹窗交互逻辑

let selectedPlatform = null;
let orderData = [];
let totalAmount = 0;
let totalItems = 0;

// DOM 元素
const platformCards = document.querySelectorAll('.platform-card');
const extractBtn = document.getElementById('extractBtn');
const exportBtn = document.getElementById('exportBtn');
const debugBtn = document.getElementById('debugBtn');
const statusMessage = document.getElementById('statusMessage');
const statusIndicator = document.querySelector('.status-indicator');
const orderCountEl = document.getElementById('orderCount');
const itemCountEl = document.getElementById('itemCount');
const totalAmountEl = document.getElementById('totalAmount');

// 平台选择
platformCards.forEach(card => {
  card.addEventListener('click', () => {
    // 移除其他卡片的激活状态
    platformCards.forEach(c => c.classList.remove('active'));
    // 激活当前卡片
    card.classList.add('active');
    
    selectedPlatform = card.dataset.platform;
    const platformNames = {
      'lazada': 'Lazada',
      'shopee': 'Shopee (虾皮)',
      'tiktok': 'TikTok Shop'
    };
    
    updateStatus(`已选择平台: ${platformNames[selectedPlatform]}`, 'success');
    extractBtn.disabled = false;
  });
});

// 提取订单按钮
extractBtn.addEventListener('click', async () => {
  if (!selectedPlatform) {
    updateStatus('请先选择平台', 'warning');
    return;
  }
  
  extractBtn.classList.add('loading');
  extractBtn.disabled = true;
  updateStatus('正在提取订单数据...', 'loading');
  
  try {
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 检查是否在正确的平台页面
    const url = tab.url.toLowerCase();
    const platformUrls = {
      'lazada': ['lazada.co.th', 'lazada.sg', 'lazada.com.my', 'lazada.vn', 'lazada.com.ph'],
      'shopee': ['shopee.co.th', 'shopee.sg', 'shopee.com.my', 'shopee.vn', 'shopee.ph'],
      'tiktok': ['tiktok.com', 'seller.tiktok.com', 'seller-th.tiktok.com']
    };
    
    const isCorrectPlatform = platformUrls[selectedPlatform].some(domain => url.includes(domain));
    if (!isCorrectPlatform) {
      updateStatus(`请先打开 ${selectedPlatform} 平台的订单页面`, 'error');
      extractBtn.classList.remove('loading');
      extractBtn.disabled = false;
      return;
    }
    
    // 发送消息给 content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'extractOrders',
      platform: selectedPlatform
    });
    
    if (response && response.success) {
      orderData = response.data;
      
      // 计算统计数据
      const uniqueOrders = new Set(orderData.map(order => order.order_number));
      totalItems = orderData.reduce((sum, order) => sum + parseInt(order.quantity || 0), 0);
      totalAmount = orderData.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      
      // 更新界面
      orderCountEl.textContent = uniqueOrders.size;
      itemCountEl.textContent = totalItems;
      totalAmountEl.textContent = `฿${totalAmount.toFixed(2)}`;
      
      updateStatus(`✅ 成功提取 ${uniqueOrders.size} 条订单，共 ${totalItems} 件商品`, 'success');
      
      // 启用导出按钮
      exportBtn.disabled = false;
      exportBtn.classList.add('success-animation');
      
      // 保存到 storage
      await chrome.storage.local.set({ 
        orderData, 
        selectedPlatform,
        lastUpdate: new Date().toISOString(),
        stats: { orders: uniqueOrders.size, items: totalItems, amount: totalAmount }
      });
    } else {
      updateStatus(response?.message || '提取失败，请刷新页面后重试', 'error');
    }
  } catch (error) {
    console.error('提取订单出错:', error);
    updateStatus('提取失败，请确保在正确的订单页面并刷新页面后重试', 'error');
  } finally {
    extractBtn.classList.remove('loading');
    extractBtn.disabled = false;
  }
});

// 导出 Excel 按钮
exportBtn.addEventListener('click', async () => {
  if (orderData.length === 0) {
    updateStatus('暂无数据可导出', 'warning');
    return;
  }
  
  try {
    updateStatus('正在生成 Excel 文件...', 'loading');
    
    // 使用 SheetJS 生成 Excel 文件
    const workbook = XLSX.utils.book_new();
    
    // 准备表头和数据
    const headers = ['sku', 'order_number', 'customer_name', 'order_date', 'quantity', 'selling_price', 'total_amount'];
    const excelData = [
      headers,  // 添加表头
      ...orderData.map(order => [
        order.sku || '',
        String(order.order_number || ''), // 强制转为字符串，防止科学计数法
        order.customer_name || '',
        order.order_date || '',
        parseInt(order.quantity || 0),    // 转换为数字类型，以便Excel求和
        parseFloat(order.selling_price || 0), // 转换为数字类型
        parseFloat(order.total_amount || 0)   // 转换为数字类型
      ])
    ];
    
    // 创建工作表（包含表头）
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    
    // 设置列宽
    const colWidths = [
      { wch: 20 },  // sku
      { wch: 20 },  // order_number
      { wch: 15 },  // customer_name
      { wch: 20 },  // order_date
      { wch: 10 },  // quantity
      { wch: 12 },  // selling_price
      { wch: 15 }   // total_amount
    ];
    worksheet['!cols'] = colWidths;
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    
    // 生成 Excel 文件的二进制数据
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // 创建 Blob 对象
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // 生成文件名：平台_日期.xlsx
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${selectedPlatform}_${timestamp}.xlsx`;
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    
    // 使用 Chrome 下载 API
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('下载失败:', chrome.runtime.lastError);
        updateStatus('导出失败，请重试', 'error');
      } else {
        console.log('下载成功, ID:', downloadId);
        updateStatus(`✅ 订单数据已导出: ${filename}`, 'success');
        // 清理 URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    });
    
  } catch (error) {
    console.error('导出失败:', error);
    updateStatus('导出失败，请重试', 'error');
  }
});

/**
 * 更新状态消息
 */
function updateStatus(message, type = 'info') {
  statusMessage.textContent = message;
  
  // 更新指示器样式
  statusIndicator.className = 'status-indicator';
  if (type === 'warning' || type === 'loading') {
    statusIndicator.classList.add('warning');
  } else if (type === 'error') {
    statusIndicator.classList.add('error');
  }
}

/**
 * 初始化 - 加载已保存的数据
 */
async function initialize() {
  try {
    const result = await chrome.storage.local.get(['orderData', 'selectedPlatform', 'lastUpdate', 'stats']);
    
    if (result.orderData && result.orderData.length > 0) {
      orderData = result.orderData;
      selectedPlatform = result.selectedPlatform;
      
      // 恢复统计数据
      if (result.stats) {
        orderCountEl.textContent = result.stats.orders;
        itemCountEl.textContent = result.stats.items;
        totalAmountEl.textContent = `฿${result.stats.amount.toFixed(2)}`;
      }
      
      // 恢复平台选择
      if (selectedPlatform) {
        const card = document.querySelector(`[data-platform="${selectedPlatform}"]`);
        if (card) {
          card.classList.add('active');
          extractBtn.disabled = false;
        }
      }
      
      // 启用导出按钮
      exportBtn.disabled = false;
      
      // 显示上次更新时间
      if (result.lastUpdate) {
        const lastTime = new Date(result.lastUpdate).toLocaleString('zh-CN');
        updateStatus(`上次提取: ${lastTime}`, 'success');
      }
    }
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

// 调试按钮事件
debugBtn.addEventListener('click', async () => {
  if (!selectedPlatform) {
    updateStatus('请先选择平台', 'warning');
    return;
  }

  debugBtn.classList.add('loading');
  debugBtn.disabled = true;
  updateStatus('正在获取页面结构...', 'loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 发送消息给 content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'getPageStructure',
      platform: selectedPlatform
    });

    if (response && response.success) {
      // 创建并下载文件
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const filename = `${selectedPlatform}_page_structure_${new Date().toISOString().split('T')[0]}.txt`;

      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          updateStatus('导出HTML结构失败，请重试', 'error');
        } else {
          updateStatus('✅ 页面结构已导出', 'success');
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      });
    } else {
      updateStatus(response?.message || '获取页面结构失败，请刷新页面后重试', 'error');
    }
  } catch (error) {
    console.error('获取页面结构出错:', error);
    updateStatus('获取页面结构失败，请确保在正确的页面并刷新后重试', 'error');
  } finally {
    debugBtn.classList.remove('loading');
    debugBtn.disabled = false;
  }
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initialize);
