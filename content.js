// Content Script - 页面内容提取脚本 (Lazada/Shopee/TikTok)

console.log('📦 订单提取插件已注入页面');

// ============================================
// 订单展开功能 - 三个平台通用
// ============================================

/**
 * 虾皮（Shopee）平台 - 展开折叠的订单（5件以上）
 * 识别包含"สินค้ารวม"（共X项/件）的展开按钮
 */
function expandShopeeOrders() {
  return new Promise((resolve) => {
    try {
      console.log('🔍 虾皮平台：开始查找折叠的订单...');
      
      // 查找所有展开按钮
      const toggles = Array.from(
        document.querySelectorAll('.order-item-expand .order-item-expand-text')
      );
      
      let clicked = 0;
      
      toggles.forEach((textEl) => {
        const txt = (textEl.textContent || '').trim();
        // 检查是否为折叠状态（包含泰语"สินค้ารวม" - 意为"共X项/件"）
        const isCollapsed = /สินค้ารวม/i.test(txt);
        
        if (isCollapsed) {
          console.log(`📦 找到折叠订单: ${txt}`);
          // 找到可点击的父元素
          const inner = textEl.closest('.order-item-expand-inner') || textEl;
          // 模拟点击
          inner.dispatchEvent(new MouseEvent('click', { 
            bubbles: true, 
            cancelable: true 
          }));
          clicked++;
        }
      });
      
      console.log(`✅ 虾皮平台：展开了 ${clicked} 个折叠订单`);
      
      // 等待DOM更新
      if (clicked > 0) {
        setTimeout(resolve, 500); // 等待500ms确保展开动画完成
      } else {
        resolve();
      }
    } catch (error) {
      console.error('❌ 虾皮平台展开订单出错:', error);
      resolve(); // 即使出错也继续执行
    }
  });
}

/**
 * Lazada平台 - 展开折叠的订单（支持两种按钮样式）
 * 样式1: 包含"สินค้ารวม"（共X项/件）
 * 样式2: 包含"เพิ่มเติม"（更多）
 */
function expandLazadaOrders() {
  return new Promise((resolve) => {
    try {
      console.log('🔍 Lazada平台：开始查找折叠的订单...');
      
      let clicked = 0;
      
      // 样式1: 查找包含"สินค้ารวม"的展开按钮
      const style1Buttons = Array.from(
        document.querySelectorAll('.order-item-expand .order-item-expand-text')
      );
      
      style1Buttons.forEach((textEl) => {
        const txt = (textEl.textContent || '').trim();
        const isCollapsed = /สินค้ารวม/i.test(txt);
        
        if (isCollapsed) {
          console.log(`📦 找到折叠订单（样式1）: ${txt}`);
          const inner = textEl.closest('.order-item-expand-inner') || textEl;
          inner.dispatchEvent(new MouseEvent('click', { 
            bubbles: true, 
            cancelable: true 
          }));
          clicked++;
        }
      });
      
      // 样式2: 查找包含"เพิ่มเติม"（更多）的展开按钮
      const style2Buttons = Array.from(
        document.querySelectorAll('.expand-trigger, .next-btn[data-spm="d_expand"]')
      );
      
      style2Buttons.forEach((button) => {
        const btnText = button.textContent || '';
        const isExpandButton = /เพิ่มเติม/i.test(btnText);
        
        if (isExpandButton) {
          console.log(`📦 找到折叠订单（样式2）: ${btnText}`);
          try {
            button.click();
            clicked++;
          } catch (clickError) {
            console.error('点击备选按钮失败:', clickError);
          }
        }
      });
      
      console.log(`✅ Lazada平台：展开了 ${clicked} 个折叠订单`);
      
      // 等待DOM更新
      if (clicked > 0) {
        setTimeout(resolve, 500);
      } else {
        resolve();
      }
    } catch (error) {
      console.error('❌ Lazada平台展开订单出错:', error);
      resolve();
    }
  });
}

/**
 * TikTok Shop平台 - 展开"Show X more items"按钮
 * 支持新旧版本HTML结构
 */
function expandTikTokOrders() {
  return new Promise((resolve) => {
    try {
      console.log('🔍 TikTok平台：开始查找折叠的订单...');
      
      // 查找所有可能的按钮元素
      const allButtons = document.querySelectorAll(
        'button, div[role="button"], div[class*="button"], ' +
        'span[class*="button"], div, span, a'
      );
      
      // 过滤出展开按钮（包含"Show"+"more"+"item"）
      const showMoreButtons = Array.from(allButtons).filter(btn => {
        const text = btn.textContent || '';
        return (text.includes('Show') && text.includes('more') && text.includes('item'));
      });
      
      let clickedCount = 0;
      const MAX_CLICKS = 30; // 安全限制
      
      showMoreButtons.forEach(button => {
        // 跳过已处理的按钮
        if (button.dataset.tkExpanded === 'true') {
          return;
        }
        
        const buttonText = button.textContent || '';
        console.log(`📦 找到展开按钮: ${buttonText}`);
        
        // 标记为已处理
        button.dataset.tkExpanded = 'true';
        
        // 执行点击
        if (clickedCount < MAX_CLICKS) {
          try {
            button.click();
            clickedCount++;
          } catch (clickError) {
            console.error('点击展开按钮失败:', clickError);
          }
        }
      });
      
      console.log(`✅ TikTok平台：展开了 ${clickedCount} 个折叠订单`);
      
      // TikTok需要更长的等待时间
      if (clickedCount > 0) {
        setTimeout(resolve, 1000);
      } else {
        resolve();
      }
    } catch (error) {
      console.error('❌ TikTok平台展开订单出错:', error);
      resolve();
    }
  });
}

// 格式化HTML函数
function formatHTML(html) {
  var tab = '    ';
  var result = '';
  var indent= '';

  html.split(/>\s*</).forEach(function(element) {
    if (element.match( /^\/\w/ )) {
      indent = indent.substring(tab.length);
    }

    result += indent + '<' + element + '>\r\n';

    if (element.match( /^<?\w[^>]*[^\/]$/ ) && !element.startsWith("input")  ) { 
      indent += tab;              
    }
  });

  return result.substring(1, result.length-3);
}

// 创建调试日志窗口
let debugWindow = null;
let debugLogs = [];

/**
 * 创建调试面板 - 优化版
 * 特性：黑色半透明背景 + 蓝色主题 + 悬浮按钮 + 时间戳
 */
function createDebugWindow() {
  // 如果已存在则直接返回
  const existingDebug = document.getElementById('order-extractor-debug');
  if (existingDebug) {
    return;
  }
  
  // ========== 创建主面板 ==========
  debugWindow = document.createElement('div');
  debugWindow.id = 'order-extractor-debug';
  debugWindow.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 80px;
    width: 420px;
    max-height: 500px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.92);
    border: 2px solid #00aaff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    z-index: 2147483647;
    padding: 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    display: none;
  `;
  
  // ========== 创建标题栏 ==========
  const titleBar = document.createElement('div');
  titleBar.style.cssText = `
    color: #00aaff;
    font-weight: bold;
    font-size: 14px;
    padding: 12px 15px;
    border-bottom: 1px solid #00aaff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 1;
  `;
  
  const title = document.createElement('span');
  title.textContent = '🔍 订单提取调试';
  
  // 按钮容器
  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display: flex; gap: 5px;';
  
  // 复制按钮
  const copyBtn = document.createElement('button');
  copyBtn.textContent = '复制';
  copyBtn.style.cssText = `
    background: #00aa66;
    border: none;
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s;
  `;
  copyBtn.onmouseover = () => copyBtn.style.background = '#00cc88';
  copyBtn.onmouseout = () => copyBtn.style.background = '#00aa66';
  copyBtn.onclick = () => {
    const debugContent = document.getElementById('debug-content');
    if (debugContent) {
      const text = debugContent.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 1500);
      }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
    }
  };
  
  // 清空按钮
  const clearBtn = document.createElement('button');
  clearBtn.textContent = '清空';
  clearBtn.style.cssText = `
    background: #666;
    border: none;
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s;
  `;
  clearBtn.onmouseover = () => clearBtn.style.background = '#888';
  clearBtn.onmouseout = () => clearBtn.style.background = '#666';
  clearBtn.onclick = () => {
    const debugContent = document.getElementById('debug-content');
    if (debugContent) {
      debugContent.innerHTML = '';
      addDebugLog('日志已清空', 'info');
    }
  };
  
  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '关闭';
  closeBtn.style.cssText = `
    background: #ff4444;
    border: none;
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s;
  `;
  closeBtn.onmouseover = () => closeBtn.style.background = '#ff6666';
  closeBtn.onmouseout = () => closeBtn.style.background = '#ff4444';
  closeBtn.onclick = () => {
    debugWindow.style.display = 'none';
    const toggleBtn = document.getElementById('debug-toggle-btn');
    if (toggleBtn) toggleBtn.style.display = 'block';
  };
  
  btnGroup.appendChild(copyBtn);
  btnGroup.appendChild(clearBtn);
  btnGroup.appendChild(closeBtn);
  titleBar.appendChild(title);
  titleBar.appendChild(btnGroup);
  debugWindow.appendChild(titleBar);
  
  // ========== 创建内容容器 ==========
  const contentDiv = document.createElement('div');
  contentDiv.id = 'debug-content';
  contentDiv.style.cssText = `
    padding: 10px;
    color: white;
  `;
  
  debugWindow.appendChild(contentDiv);
  document.body.appendChild(debugWindow);
  
  // ========== 创建悬浮切换按钮（小虫图标）==========
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'debug-toggle-btn';
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 150px;
    right: 80px;
    width: 56px;
    height: 56px;
    background: rgba(0, 170, 255, 0.9);
    border: 2px solid #00aaff;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    z-index: 2147483646;
    cursor: pointer;
    font-size: 28px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    line-height: 1;
    padding: 0;
  `;
  toggleBtn.textContent = '📊';
  toggleBtn.title = '显示/隐藏订单提取调试信息';
  
  toggleBtn.onclick = () => {
    debugWindow.style.display = 'block';
    toggleBtn.style.display = 'none';
  };
  
  toggleBtn.onmouseover = () => {
    toggleBtn.style.transform = 'scale(1.15)';
    toggleBtn.style.boxShadow = '0 4px 15px rgba(0,170,255,0.6)';
  };
  
  toggleBtn.onmouseout = () => {
    toggleBtn.style.transform = 'scale(1)';
    toggleBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
  };
  
  document.body.appendChild(toggleBtn);
}

/**
 * 添加调试日志 - 优化版
 * 支持时间戳、颜色区分、自动滚动
 * @param {string} message - 要显示的消息
 * @param {string} type - 消息类型：'info'|'success'|'warning'|'error'
 */
function addDebugLog(message, type = 'info') {
  // 始终输出到控制台
  const consoleMethod = type === 'error' ? 'error' : 
                       type === 'warning' ? 'warn' : 'log';
  console[consoleMethod](`[订单提取] ${message}`);
  
  // 如果调试窗口不存在，尝试创建
  if (!debugWindow) {
    try {
      createDebugWindow();
    } catch (error) {
      console.error('创建调试窗口失败:', error);
      return;
    }
  }
  
  // 颜色映射
  const colorMap = {
    'info': '#00aaff',      // 蓝色 - 普通信息
    'success': '#00ff00',   // 绿色 - 成功
    'error': '#ff4444',     // 红色 - 错误
    'warning': '#ffaa00'    // 橙色 - 警告
  };
  
  // 图标映射
  const iconMap = {
    'info': 'ℹ️',
    'success': '✅',
    'warning': '⚠️',
    'error': '❌'
  };
  
  const color = colorMap[type] || colorMap['info'];
  const icon = iconMap[type] || iconMap['info'];
  
  const debugContent = document.getElementById('debug-content');
  if (debugContent) {
    // 获取时间戳
    const time = new Date().toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    // 创建消息元素
    const logEntry = document.createElement('div');
    logEntry.style.cssText = `
      padding: 6px 10px;
      margin: 3px 0;
      background: rgba(0, 0, 0, 0.6);
      border-left: 3px solid ${color};
      border-radius: 3px;
      font-size: 12px;
      color: white;
      word-wrap: break-word;
      line-height: 1.5;
      animation: fadeIn 0.2s ease-in;
    `;
    
    logEntry.innerHTML = `
      <span style="color: #888; font-size: 11px; margin-right: 8px;">[${time}]</span>
      <span style="font-size: 14px; margin-right: 5px;">${icon}</span>
      <span>${message}</span>
    `;
    
    debugContent.appendChild(logEntry);
    
    // 自动滚动到底部
    if (debugWindow) {
      debugWindow.scrollTop = debugWindow.scrollHeight;
    }
    
    // 限制最多显示100条消息
    while (debugContent.children.length > 100) {
      debugContent.removeChild(debugContent.firstChild);
    }
  }
}

// 添加淡入动画样式
if (!document.getElementById('debug-animation-style')) {
  const style = document.createElement('style');
  style.id = 'debug-animation-style';
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateX(10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageStructure') {
    try {
      // 根据平台选择合适的选择器
      let orderElement = null;
      switch (request.platform) {
        case 'shopee':
          orderElement = document.querySelector('div:has(span.order-sn)') || 
                        document.querySelector('a.order-card');
          break;
        case 'lazada':
          orderElement = document.querySelector('div.list-item');
          break;
        case 'tiktok':
          // 获取第一个订单组（3个tr）
          const rows = document.querySelectorAll('tr');
          if (rows.length >= 3) {
            orderElement = document.createElement('div');
            orderElement.appendChild(rows[0].cloneNode(true));
            orderElement.appendChild(rows[1].cloneNode(true));
            orderElement.appendChild(rows[2].cloneNode(true));
          }
          break;
      }

      if (!orderElement) {
        sendResponse({ success: false, message: '未找到订单元素' });
        return true;
      }

      // 格式化HTML
      const formattedHTML = formatHTML(orderElement.outerHTML);
      sendResponse({ success: true, data: formattedHTML });
    } catch (error) {
      console.error('获取页面结构失败:', error);
      sendResponse({ success: false, message: error.message });
    }
    return true;
  }
  
  if (request.action === 'extractOrders') {
    const platform = request.platform;
    
    // 创建调试窗口
    createDebugWindow();
    addDebugLog(`🚀 开始提取 ${platform} 平台订单...`, 'info');
    
    // 使用async函数处理
    (async () => {
      try {
        // ===== 步骤1: 先展开所有折叠的订单 =====
        addDebugLog(`📂 步骤1: 展开折叠的订单...`, 'info');
        
        switch (platform) {
          case 'lazada':
            await expandLazadaOrders();
            addDebugLog(`✅ Lazada订单展开完成`, 'success');
            break;
          case 'shopee':
            await expandShopeeOrders();
            addDebugLog(`✅ 虾皮订单展开完成`, 'success');
            break;
          case 'tiktok':
            await expandTikTokOrders();
            addDebugLog(`✅ TikTok订单展开完成`, 'success');
            break;
        }
        
        // 展开后再等待一小段时间，确保DOM完全更新
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // ===== 步骤2: 提取订单数据 =====
        addDebugLog(`📊 步骤2: 开始提取订单数据...`, 'info');
        
        let orders = [];
        
        switch (platform) {
          case 'lazada':
            orders = extractLazadaOrders();
            break;
          case 'shopee':
            orders = extractShopeeOrders();
            break;
          case 'tiktok':
            orders = await extractTikTokOrders(); // 等待Promise完成
            break;
          default:
            addDebugLog(`❌ 不支持的平台: ${platform}`, 'error');
            sendResponse({ success: false, message: '不支持的平台' });
            return;
        }
        
        addDebugLog(`✅ 成功提取 ${orders.length} 条订单`, 'success');
        
        if (orders.length === 0) {
          addDebugLog('⚠️ 未找到任何订单数据，请检查页面是否正确加载', 'warning');
        } else {
          addDebugLog(`📊 第一条订单示例: ${JSON.stringify(orders[0], null, 2)}`, 'info');
        }
        
        sendResponse({ success: true, data: orders });
      } catch (error) {
        addDebugLog(`❌ 提取订单出错: ${error.message}`, 'error');
        addDebugLog(`错误堆栈: ${error.stack}`, 'error');
        sendResponse({ success: false, message: error.message });
      }
    })();
    
    return true; // 保持消息通道开启
  }
  
  return true; // 保持消息通道开启
});

/**
 * Lazada 订单提取
 * 根据项目介绍中的CSS选择器精确提取
 */
function extractLazadaOrders() {
  const orders = [];
  const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // 获取所有订单容器
  const orderContainers = document.querySelectorAll('div.list-item');
  console.log(`📋 找到 ${orderContainers.length} 个 Lazada 订单容器`);
  
  // 定义月份映射
  const monthMap = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  orderContainers.forEach((container, containerIndex) => {
    try {
      // 提取订单级别的信息
      const orderNumber = extractText(container, 'a[data-spm="d_order_number"]');
      let customerName = extractText(container, 'div.order-header-chat-box span.next-btn-helper');
      
      // 提取并转换日期格式
      // Lazada有两种日期字段：
      // 1. order-field-create-time (创建时间) - 在"全部订单"或"待发货"页面
      // 2. order-field-update-time (更新时间) - 在"已发货"页面
      let orderDate = extractText(container, 'span.order-field-create-time a') || 
                     extractText(container, 'span.order-field-update-time a') ||
                     extractText(container, '.order-field-create-time a') ||
                     extractText(container, '.order-field-update-time a');
      
      // 如果上面的选择器都找不到，尝试直接查找包含日期格式的 a 标签
      if (!orderDate) {
        const dateLinks = container.querySelectorAll('a.aplus-auto-exp');
        for (const link of dateLinks) {
          const text = link.textContent.trim();
          // 检查是否匹配日期格式 (例如: "23 Oct 2025 16:06")
          if (/\d+\s+[A-Za-z]+\s+\d{4}/.test(text)) {
            orderDate = text;
            addDebugLog(`✓ 通过模式匹配找到日期: ${text}`, 'success');
            break;
          }
        }
      }
      
      let orderDateFormatted = ''; // 格式化后的日期，用于生成用户名
      
      if (orderDate) {
        try {
          // 清理日期字符串：移除&nbsp;等特殊字符，统一为普通空格
          orderDate = orderDate.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
          addDebugLog(`原始日期: ${orderDate}`, 'info');
          
          // 解析Lazada的日期格式，可能包含时间
          // 格式: "23 Oct 2025 16:06" 或 "23 Oct 2025"
          const match = orderDate.match(/(\d+)\s+([A-Za-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
          if (match) {
            const [_, day, month, year, hours = '00', minutes = '00'] = match;
            if (monthMap[month]) {
              // 格式化为 YYYY-MM-DD HH:mm
              const formattedDay = day.padStart(2, '0');
              const formattedHours = hours.padStart(2, '0');
              const formattedMinutes = minutes.padStart(2, '0');
              orderDateFormatted = `${year}-${monthMap[month]}-${formattedDay} ${formattedHours}:${formattedMinutes}`;
              orderDate = orderDateFormatted;
              addDebugLog(`✓ 日期转换成功: ${orderDate}`, 'success');
            } else {
              addDebugLog(`❌ 未识别的月份: ${month}`, 'error');
            }
          } else {
            addDebugLog(`❌ 日期格式不匹配: ${orderDate}`, 'error');
          }
        } catch (error) {
          console.error('日期转换出错:', error);
          addDebugLog(`❌ 日期转换异常: ${error.message}`, 'error');
          // 如果转换失败，保留原始日期
        }
      } else {
        addDebugLog('⚠️ 未找到订单日期元素', 'warning');
      }
      
      // 如果用户名为空，根据订单时间生成10位唯一编号
      if (!customerName || customerName.trim() === '') {
        if (orderDateFormatted) {
          // 从日期时间生成10位数字：年月日时分
          // 例如: 2025-11-14 12:30 → 2511141230
          const dateMatch = orderDateFormatted.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
          if (dateMatch) {
            const [_, year, month, day, hour, minute] = dateMatch;
            const shortYear = year.substring(2); // 取年份后两位
            customerName = `${shortYear}${month}${day}${hour}${minute}`; // 10位: 年月日时分
            addDebugLog(`⚠️ 用户名为空，生成临时编号: ${customerName}`, 'warning');
          } else {
            customerName = `USER${containerIndex.toString().padStart(6, '0')}`; // 备用方案
          }
        } else {
          customerName = `USER${containerIndex.toString().padStart(6, '0')}`; // 备用方案
        }
      }
      
      const shippingMethod = extractText(container, 'div.order-field-first-mile span.show-text');
      const trackingNumber = extractText(container, 'div.order-field-tracking-number span.show-text');
      let netSellingPrice = extractText(container, 'div.order-amount-col span.number-text-scope', 'title');
      // 移除金额中的逗号
      if (netSellingPrice) {
        netSellingPrice = netSellingPrice.replace(/,/g, '');
      }
      
      // 获取该订单下的所有商品
      const itemElements = container.querySelectorAll('div.order-item');
      console.log(`  订单 ${orderNumber}: 包含 ${itemElements.length} 个商品`);
      
      itemElements.forEach((item, itemIndex) => {
        try {
          // 提取并清理SKU
          let sku = extractText(item, 'div.order-field-seller-sku span.show-text');
          // 处理SKU末尾的连字符
          if (sku) {
            // 移除末尾的连字符
            sku = sku.replace(/-+$/, '');
            addDebugLog(`SKU清理: ${sku}`, 'info');
          }

          const quantity = extractText(item, 'div.order-item-count').replace('×', '').trim();
          let sellingPrice = extractText(item, 'div.order-item-price span.number-text-scope', 'title');
          // 移除金额中的逗号
          if (sellingPrice) {
            sellingPrice = sellingPrice.replace(/,/g, '');
          }
          
          orders.push({
            sku: sku,
            order_number: orderNumber,
            customer_name: customerName,
            order_date: orderDate,
            quantity: quantity,
            selling_price: sellingPrice, // 保留商品单价
            total_amount: itemIndex === 0 ? netSellingPrice : '' // 订单总金额只在第一行显示
          });
        } catch (error) {
          console.error(`  商品 ${itemIndex + 1} 提取失败:`, error);
        }
      });
    } catch (error) {
      console.error(`订单容器 ${containerIndex + 1} 提取失败:`, error);
    }
  });
  
  return orders;
}

/**
 * Shopee (虾皮) 订单提取
 * 自动判断待发货/已发货状态，使用对应的选择器
 */
function extractShopeeOrders() {
  const orders = [];
  const processedOrders = new Set(); // 用于记录已处理的订单号
  const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  addDebugLog('🔍 智能查找虾皮订单容器（支持新旧版本）...', 'info');

  // 1. 查找所有订单卡片（兼容新旧两种HTML结构）
  // 旧版: div[data-testid^="package-card-"]
  // 新版: a.order-card
  const orderCards = document.querySelectorAll('div[data-testid^="package-card-"], a.order-card');
  addDebugLog(`📋 找到 ${orderCards.length} 个订单卡片`, 'info');

  if (orderCards.length === 0) {
    addDebugLog('❌ 未找到订单卡片，请确保在正确的页面', 'error');
    return orders;
  }

  orderCards.forEach((card, index) => {
    try {
      // 1. 提取订单号（兼容新旧版本）
      // 尝试多种选择器
      let orderNumberEl = card.querySelector('span.order-sn');
      let orderNumber = '';
      
      if (orderNumberEl) {
        // 提取文本并去掉前面的泰语文字（หมายเลขคำสั่งซื้อ = 订单号）
        orderNumber = orderNumberEl.textContent.replace(/^.*\s+/, '').trim();
      }
      
      if (!orderNumber) {
        addDebugLog(`⚠️ 订单 #${index + 1} 未找到订单号，跳过`, 'warning');
        return;
      }
      
      // 检查订单是否已处理过
      if (processedOrders.has(orderNumber)) {
        addDebugLog(`⚠️ 跳过重复订单 ${orderNumber}`, 'warning');
        return;
      }
      
      addDebugLog(`\n━━━ 处理订单 #${index + 1} (${orderNumber}) ━━━`, 'info');
      
      // 2. 提取客户名（兼容新旧版本）
      let customerName = '';
      const customerNameEl = card.querySelector('div.buyer-username');
      if (customerNameEl) {
        customerName = customerNameEl.textContent.trim();
      }
      addDebugLog(`客户名: ${customerName}`, 'info');
      
      // 3. 提取订单总价（兼容新旧版本）
      let totalPrice = '0.00';
      // 尝试多种选择器
      const totalPriceEl = card.querySelector('div.total-price') || 
                          card.querySelector('.total-price') ||
                          card.querySelector('[class*="total-price"]');
      
      if (totalPriceEl) {
        totalPrice = totalPriceEl.textContent.replace('฿', '').trim();
        // 移除金额中的逗号
        totalPrice = totalPrice.replace(/,/g, '');
        addDebugLog(`✓ 订单总价: ${totalPrice}`, 'success');
      } else {
        addDebugLog(`❌ 未找到订单总价元素，尝试的选择器: div.total-price`, 'error');
        // 输出订单卡片的部分HTML用于调试
        const cardHTML = card.outerHTML.substring(0, 500);
        addDebugLog(`订单卡片HTML片段: ${cardHTML}...`, 'warning');
      }
      
      // 4. 解析订单日期
      const orderDate = parseShopeeOrderDate(orderNumber);
      addDebugLog(`订单日期: ${orderDate}`, 'info');

      // 5. 提取商品信息（兼容新旧版本）
      // 旧版: div.order-item-infos div.item
      // 新版: div.item-list .item
      const items = card.querySelectorAll('div.item-list .item, div.order-item-infos .item');
      addDebugLog(`发现 ${items.length} 个商品`, 'info');

      // 首先收集所有商品信息
      const itemsData = [];
      items.forEach((item, itemIndex) => {
        try {
          // 提取商品详细信息（兼容新旧版本）
          let itemName = '';
          let itemDesc = '';
          let quantity = '1';
          
          // 商品名称
          const itemNameEl = item.querySelector('div.item-name');
          if (itemNameEl) {
            itemName = itemNameEl.textContent.trim();
          }
          
          // 商品描述/SKU信息
          const itemDescEl = item.querySelector('div.item-description');
          if (itemDescEl) {
            itemDesc = itemDescEl.textContent.trim();
          }
          
          // 商品数量
          const quantityEl = item.querySelector('div.item-amount');
          if (quantityEl) {
            quantity = quantityEl.textContent.replace(/[x×]/gi, '').trim();
          }
          
          addDebugLog(`商品 ${itemIndex + 1}: 名称=${itemName.substring(0, 30)}..., 数量=${quantity}`, 'info');
          
          // 提取SKU
          let sku = '';
          
          // 从商品描述中提取方括号内的SKU
          const skuMatch = itemDesc.match(/\[(.*?)\]/);
          if (skuMatch) {
            let skuText = skuMatch[1].trim();
            
            // 检查是否包含空格（处理 "BD65 BD65-Dark Brown-110CM" 这样的格式）
            if (skuText.includes(' ')) {
              // 只在第一个空格处分割，取第二部分
              const parts = skuText.split(' ');
              // 如果分割后有第二部分，使用第二部分作为SKU
              if (parts.length > 1) {
                sku = parts.slice(1).join(' '); // 将第二部分后的所有内容合并（以防SKU中包含空格）
              } else {
                sku = skuText; // 如果分割失败，使用原始文本
              }
            } else {
              // 如果不包含空格，直接使用完整文本
              sku = skuText;
            }
            
            // 数据验证：确保SKU不是空的且不只包含数字
            if (!sku || /^\d+$/.test(sku)) {
              sku = skuText;
            }
            
            addDebugLog(`SKU提取: 原始文本=[${skuText}], 提取结果=${sku}`, 'info');
          }

          // 如果没有找到SKU，使用商品名称的第一个词
          if (!sku && itemName) {
            sku = itemName.split(' ')[0];
          }

          // 如果还是没有SKU，使用一个默认值
          if (!sku) {
            sku = `NO-SKU-${index}-${itemIndex}`;
          }

          // 将商品信息存储到临时数组
          itemsData.push({
            sku: sku,
            quantity: quantity,
            product_name: itemName,
            product_variant: itemDesc
          });

          addDebugLog(`✅ 商品 ${itemIndex + 1} 信息收集成功: ${sku}`, 'success');
        } catch (error) {
          addDebugLog(`❌ 商品 ${itemIndex + 1} 信息收集失败: ${error.message}`, 'error');
        }
      });

      // 为每个商品创建完整的订单记录
      itemsData.forEach((itemData, itemIndex) => {
        orders.push({
          sku: itemData.sku,
          order_number: orderNumber,
          customer_name: customerName,
          order_date: orderDate,
          quantity: itemData.quantity,
          selling_price: '0.00', // 虾皮平台不提供单价信息
          total_amount: itemIndex === 0 ? totalPrice : '' // 只在第一行显示订单总金额
        });

        addDebugLog(`✅ 商品 ${itemIndex + 1} 完整记录创建成功: ${itemData.sku}, 订单总价: ${itemIndex === 0 ? totalPrice : '(仅首行显示)'}`, 'success');
      });

      // 记录已处理的订单号
      processedOrders.add(orderNumber);
      addDebugLog(`✅ 订单 ${orderNumber} 处理完成（已添加到去重记录）`, 'success');
    } catch (error) {
      addDebugLog(`❌ 订单处理失败: ${error.message}`, 'error');
      console.error('错误详情:', error.stack);
    }
  });

  return orders;
}

/**
 * TikTok Shop 订单提取函数
 * 优化版本：改进错误处理，增强选择器兼容性，优化代码结构
 */
function extractTikTokOrders() {
  const orderList = [];
  const processedOrders = new Set(); // 用于记录已处理的订单号
  const processedOrderItems = new Set(); // 用于记录已处理的订单明细（订单号+SKU）

  return new Promise(async (resolve) => {
    try {
      // 0. 确保调试窗口存在
      if (!debugWindow) {
        createDebugWindow();
        // 等待DOM更新
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 1. 初始化调试日志
      addDebugLog('🔍 开始分析TikTok页面结构...', 'info');
      
      // 1.1 检查当前页面基本信息
      addDebugLog(`页面标题: ${document.title}`, 'info');
      addDebugLog(`当前URL: ${window.location.href}`, 'info');
      
      // 1.2 检查页面是否加载完成
      if (document.readyState !== 'complete') {
        addDebugLog('⚠️ 页面尚未完全加载', 'warning');
      } else {
        addDebugLog('✓ 页面已完全加载', 'success');
      }
      
      // 2. 定位并展开所有用户名（模拟真实用户点击）
      addDebugLog('📤 开始展开用户名...', 'info');
      
      // 使用精确的选择器直接定位"未展开"状态的眼睛图标
      // 这个选择器 [data-log_click_for="open_phone_plaintext"] 非常精确，专门寻找需要点击的图标
      const iconsToClick = document.querySelectorAll('svg[data-log_click_for="open_phone_plaintext"]');
      
      if (iconsToClick.length === 0) {
        addDebugLog('✅ 所有用户名已经是展开状态', 'success');
      } else {
        addDebugLog(`🔍 找到 ${iconsToClick.length} 个需要展开的用户名`, 'info');
        
        // 遍历并点击每一个图标
        let successCount = 0;
        for (let i = 0; i < iconsToClick.length; i++) {
          try {
            const icon = iconsToClick[i];
            
            // 使用 dispatchEvent 模拟点击 - 这是最可靠的方式
            // bubbles: true 使事件向上冒泡，确保父元素也能接收到
            icon.dispatchEvent(new MouseEvent('click', { 
              bubbles: true,
              cancelable: true,
              view: window
            }));
            
            successCount++;
            addDebugLog(`✓ 展开用户名 ${successCount}/${iconsToClick.length}`, 'success');
            
            // 每次点击后短暂暂停，给页面渲染留出时间，防止操作过快导致失败
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (err) {
            addDebugLog(`× 展开用户名 #${i + 1} 失败: ${err.message}`, 'warning');
          }
        }
        
        // 等待所有展开动画完成
        addDebugLog('等待用户名展开完成...', 'info');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 验证展开结果 - 使用更精确的选择器
        const stillHidden = document.querySelectorAll('svg[data-log_click_for="open_phone_plaintext"]');
        const nowVisible = document.querySelectorAll('svg[data-log_click_for="close_phone_plaintext"]');
        addDebugLog(`✅ 展开操作完成: ${nowVisible.length} 个已展开, ${stillHidden.length} 个仍未展开`, 'success');
      }

      // 3. 检查tr元素并按订单分组
      addDebugLog('正在查找订单行...', 'info');
      
      // ===== 新逻辑：先找订单头部行，再关联产品行 =====
      // 获取所有tr元素（基于HTML结构）
      const allTrElements = document.querySelectorAll('tbody tr');
      addDebugLog(`找到 ${allTrElements.length} 个tr元素`, 'info');
      
      // 第一步：找出所有订单头部行（包含订单号）
      const allOrderRows = Array.from(allTrElements);
      const orderHeaderIndices = [];  // 记录哪些行是订单头部
      const ordersByNumber = {};
      
      addDebugLog('\n第1步：识别订单头部行...', 'info');
      allOrderRows.forEach((row, idx) => {
        const orderIdSpan = row.querySelector('span.order_id_number');
        if (orderIdSpan) {
          const orderId = orderIdSpan.textContent.trim();
          if (/^\d{18}$/.test(orderId)) {
            orderHeaderIndices.push(idx);
            ordersByNumber[orderId] = [];  // 先初始化
            addDebugLog(`  行 #${idx}: 订单头部 - ${orderId}`, 'info');
          }
        }
      });
      
      addDebugLog(`✓ 找到 ${orderHeaderIndices.length} 个订单头部行`, 'success');
      
      // 第二步：给每个订单分配后续的产品行
      addDebugLog('\n第2步：为订单分配产品行...', 'info');
      orderHeaderIndices.forEach((headerIdx, orderIndex) => {
        const headerRow = allOrderRows[headerIdx];
        const orderIdSpan = headerRow.querySelector('span.order_id_number');
        const orderId = orderIdSpan.textContent.trim();
        
        // 此订单包含：头部行 + 后续行（直到下一个订单头部或表格末尾）
        const nextOrderHeaderIdx = orderIndex + 1 < orderHeaderIndices.length 
          ? orderHeaderIndices[orderIndex + 1] 
          : allOrderRows.length;
        
        // 收集此订单的所有行（从头部到下一个头部前）
        const ordersRowsInRange = allOrderRows.slice(headerIdx, nextOrderHeaderIdx);
        ordersByNumber[orderId] = ordersRowsInRange;
        
        addDebugLog(`  订单 ${orderId}: 行 #${headerIdx}-${nextOrderHeaderIdx - 1} (共 ${ordersRowsInRange.length} 行)`, 'info');
      });
      
      addDebugLog(`\n✓ 分组完成：${orderHeaderIndices.length} 个订单`, 'success');
      
      const uniqueOrderIds = Object.keys(ordersByNumber);
      
      if (uniqueOrderIds.length === 0) {
        throw new Error('未找到任何有效订单 - 请检查TikTok页面是否已正确加载');
      }

      // 4. 按订单分组处理
      addDebugLog(`\n开始处理 ${uniqueOrderIds.length} 个订单...`, 'info');
      
      for (let i = 0; i < uniqueOrderIds.length; i++) {
        const orderId = uniqueOrderIds[i];
        const rowsForThisOrder = ordersByNumber[orderId];
        
        try {
          addDebugLog(`\n━━━ 处理订单 #${i + 1} (${orderId}) ━━━`, 'info');
          addDebugLog(`此订单包含 ${rowsForThisOrder.length} 行数据`, 'info');
          
          // 第一行应该包含订单号、用户名、日期等信息
          const headerRow = rowsForThisOrder[0];
          
          if (processedOrders.has(orderId)) {
            addDebugLog(`⚠️ 订单 ${orderId} 已处理，跳过`, 'warning');
            continue;
          }
          processedOrders.add(orderId);
          
          // 2. 提取用户名（从订单号span的下一个兄弟元素或其他方式）
          let buyerName = '';
          const orderIdSpan = headerRow.querySelector('span.order_id_number');
          addDebugLog(`  调试: 找到订单ID span: ${orderIdSpan ? '是' : '否'}`, 'info');
          
          // 方法1：从TD容器中提取用户名
          // 原理：用户名通常在订单号之后、"Start chat"之前
          if (orderIdSpan) {
            let container = orderIdSpan.closest('td');
            if (container) {
              const fullText = container.textContent;
              
              // 查找订单号和"Start chat"的位置
              const orderIdIndex = fullText.indexOf(orderId);
              const startChatIndex = fullText.indexOf('Start chat');
              
              if (orderIdIndex !== -1 && startChatIndex !== -1 && startChatIndex > orderIdIndex) {
                // 在订单号和"Start chat"之间提取文本
                let candidateName = fullText
                  .substring(orderIdIndex + orderId.length, startChatIndex)
                  .trim();
                
                // 清理：移除多余空格和特殊字符
                candidateName = candidateName.replace(/\s+/g, ' ').trim();
                
                if (candidateName && candidateName.length > 1 && !candidateName.match(/^\d+$/)) {
                  buyerName = candidateName;
                  addDebugLog(`  ✓ 用户名提取（从订单号和Start chat之间）: ${buyerName}`, 'success');
                }
              }
            }
          }
          
          // 方法2：备用方案 - 查找合理的文本元素
          if (!buyerName) {
            addDebugLog(`  使用备用方案提取用户名`, 'warning');
            const allTextElements = Array.from(headerRow.querySelectorAll('span, div')).filter(el => {
              const text = el.textContent.trim();
              // 过滤条件：
              return text.length >= 2 && text.length < 50 && 
                     !/^\d{18}$/.test(text) &&                    // 不是订单号
                     !/\d{1,2}\/\d{1,2}\/\d{4}/.test(text) &&    // 不是日期
                     !text.includes('Seller SKU:') &&            // 不是SKU
                     !text.match(/^[×x\d\s]*$/) &&               // 不是纯数字或乘号
                     !text.includes('Order ID') &&               // 不包含"Order ID"
                     !text.includes('Start') &&                  // 不是"Start chat"
                     !text.includes('chat');                     // 不包含"chat"
            });
            if (allTextElements.length > 0) {
              buyerName = allTextElements[0].textContent.trim();
              addDebugLog(`  ✓ 用户名提取（从合理元素）: ${buyerName}`, 'success');
            }
          }
          
          // 最后保险：如果仍然是无效值，使用默认值
          if (!buyerName) {
            buyerName = `User_${orderId.substring(0, 6)}`;
            addDebugLog(`  ⚠️ 使用默认用户名: ${buyerName}`, 'warning');
          }
          
          addDebugLog(`✓ 客户名: ${buyerName}`, 'info');

          
          // 3. 提取订单日期（TikTok格式: MM/DD/YYYY HH:MM:SS AM/PM）
          let orderDate = '';
          rowsForThisOrder.forEach(row => {
            if (!orderDate) {
              // 查找日期文本（包含 / 和 :）
              const dateMatch = row.textContent.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?/i);
              if (dateMatch) {
                const [dateText, month, day, year, hours, minutes, _, ampm] = dateMatch;
                addDebugLog(`原始日期文本: ${dateText}`, 'info');
                
                // TikTok 美国格式：MM/DD/YYYY
                let hour24 = parseInt(hours);
                if (ampm) {
                  if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
                    hour24 += 12;
                  } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
                    hour24 = 0;
                  }
                  orderDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
                  addDebugLog(`✓ 日期转换成功(12小时制): ${orderDate}`, 'success');
                } else {
                  // 24小时制
                  orderDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
                  addDebugLog(`✓ 日期转换成功(24小时制): ${orderDate}`, 'success');
                }
              }
            }
          });
          
          // 4. 提取总价（从所有行中查找）
          let totalPrice = '0.00';
          rowsForThisOrder.forEach(row => {
            const textContent = row.textContent;
            if (textContent.includes('฿') && totalPrice === '0.00') {
              const priceMatch = textContent.match(/฿\s*([\d,]+\.?\d*)/);
              if (priceMatch) {
                totalPrice = priceMatch[1].replace(/,/g, '');
              }
            }
          });
          addDebugLog(`✓ 订单总价: ${totalPrice}`, 'info');
          
          // 调试：显示此订单的所有行摘要
          addDebugLog(`\n【订单行诊断】`, 'info');
          rowsForThisOrder.forEach((row, idx) => {
            const rowHTML = row.innerHTML.substring(0, 200).replace(/\n/g, ' ').replace(/\s+/g, ' ');
            const rowText = row.textContent.replace(/\n/g, ' ').substring(0, 80).trim();
            const hasSku = row.innerHTML.includes('Seller SKU');
            const hasQty = row.textContent.includes('×');
            const hasPrice = row.textContent.includes('฿');
            addDebugLog(`  行#${idx}: SKU=${hasSku?'✓':'×'} Qty=${hasQty?'✓':'×'} Price=${hasPrice?'✓':'×'} | 内容: ${rowText}...`, 'info');
          });
          addDebugLog(``, 'info');
          
          // 5. 提取所有商品（遍历订单的所有行）
          addDebugLog(`开始提取商品...`, 'info');
          let productCount = 0;
          
          rowsForThisOrder.forEach((productRow, rowIndex) => {
            // 调试：显示这一行的完整内容
            const rowText = productRow.textContent.replace(/\n/g, ' ').trim();
            const tdCount = productRow.querySelectorAll('td').length;
            const divCount = productRow.querySelectorAll('div').length;
            addDebugLog(`  【Row #${rowIndex}】 TD数:${tdCount}, DIV数:${divCount}`, 'info');
            addDebugLog(`  【Row #${rowIndex}】 完整内容: ${rowText.substring(0, 150)}${rowText.length > 150 ? '...' : ''}`, 'info');
            
            // 检查 HTML 中是否包含 Seller SKU（可能是文本或属性）
            const hasSkuInHTML = productRow.innerHTML.includes('Seller SKU');
            const hasSellerText = productRow.innerHTML.includes('Seller');
            addDebugLog(`  → HTML包含SKU: ${hasSkuInHTML ? '是' : '否'} | 包含'Seller': ${hasSellerText ? '是' : '否'}`, 'info');
            
            // 显示这一行中所有有意义的 div 内容
            const allDivs = Array.from(productRow.querySelectorAll('div')).filter(div => 
              div.textContent.trim().length > 0 && div.textContent.trim().length < 150
            );
            addDebugLog(`  → 此行包含 ${allDivs.length} 个 DIV`, 'info');
            
            // 显示前 10 个 div 的内容（增加到10个以获得更多信息）
            allDivs.slice(0, 10).forEach((div, idx) => {
              const divText = div.textContent.trim();
              if (divText.length > 0) {
                addDebugLog(`    [Div ${idx}] ${divText.substring(0, 80)}`, 'info');
              }
            });
            
            // 从这一行提取所有SKU - v1.3.0改进方法
            // 策略：先从DIV中找"Seller SKU"，再从textContent中精确提取
            const skuSet = new Set();  // 用Set去重
            
            // 方法1：从包含"Seller SKU"的DIV直接提取（最准确）
            const skuDivs = Array.from(productRow.querySelectorAll('div')).filter(div => {
              const text = div.textContent;
              return text.includes('Seller SKU:');
            });
            
            if (skuDivs.length > 0) {
              skuDivs.forEach(skuDiv => {
                // 从DIV的textContent中提取SKU
                const divText = skuDiv.textContent;
                // 允许 SKU 在 UI 中被换行/断行（例如 "BD14-Green-\nXL"）
                const skuMatch = divText.match(/Seller SKU:\s*([\s\S]+?)(?:Seller SKU:|Seller|×|฿|Affiliate|creator|In transit|Order|$)/i);
                if (skuMatch) {
                  let skuValue = skuMatch[1].trim();
                  // 移除末尾的可能的污染字符
                  // 只在明确是数量表达（×/x 后面跟数字）时才截断，避免把 SKU 里的 XL/XXL 等误判为乘号
                  skuValue = skuValue.replace(/\s+[×x]\s*\d+.*$/i, '').trim();
                  skuValue = skuValue.replace(/\s*฿.*$/i, '').trim();
                  skuValue = skuValue.replace(/\s+(Affiliate|creator|In transit|Order).*$/i, '').trim();  // 移除后面的常见词
                  skuValue = skuValue.replace(/[,;|]/g, '').trim();  // 移除分隔符
                  skuValue = skuValue.replace(/\s+/g, ' ').trim();  // 清理多余空格
                  // 去掉连字符两侧空格，避免 "- XL" 或 "-\nXL" 变成断裂 SKU
                  skuValue = skuValue.replace(/\s*-\s*/g, '-').trim();
                  
                  if (skuValue && skuValue.length > 0 && skuValue.length < 100) {
                    skuSet.add(skuValue);
                    addDebugLog(`  🔍 DIV SKU提取: "${skuValue}"`, 'info');
                  }
                }
              });
            }
            
            // 方法2：如果DIV提取失败，使用HTML正则（备用）
            if (skuSet.size === 0) {
              const htmlMatches = productRow.innerHTML.match(/Seller SKU:\s*([^<\n]+?)(?=<|$|Seller SKU)/gi);
              if (htmlMatches) {
                htmlMatches.forEach(match => {
                  const skuValue = match
                    .replace(/Seller SKU:\s*/i, '')
                    .replace(/<.*$/i, '')
                    .trim();
                  if (skuValue && skuValue.length > 0 && skuValue.length < 100) {
                    skuSet.add(skuValue);
                    addDebugLog(`  🔍 HTML SKU提取: "${skuValue}"`, 'info');
                  }
                });
              }
            }
            
            const uniqueSkus = Array.from(skuSet);
            addDebugLog(`  → 在此行找到 ${uniqueSkus.length} 个不同的SKU`, 'info');
            
            if (uniqueSkus.length === 0 && rowIndex > 0) {
              addDebugLog(`  → 此行未找到SKU，检查是否为产品行...`, 'info');
              const hasQuantity = productRow.textContent.match(/[×x]\s*\d+/);
              const hasPrice = productRow.textContent.includes('฿');
              if (hasQuantity || hasPrice) {
                addDebugLog(`  → 此行看起来包含产品信息但缺少SKU`, 'info');
              }
            }
            
            // 改进的数量提取逻辑：查找精确匹配 "x N" 的独立元素
            let foundQuantities = [];
            // 遍历所有子元素，寻找内容仅为 "x N" 的元素
            const allElements = productRow.querySelectorAll('*');
            allElements.forEach(el => {
              // 只检查没有子元素的末端节点
              if (el.children.length === 0 && el.textContent) {
                const text = el.textContent.trim();
                // 严格匹配：必须是 "x 1", "× 1", "x1", "×1" 这种格式
                // 排除 "15x15" 这种出现在标题里的情况
                if (/^[×x]\s*\d+$/i.test(text)) {
                  const num = text.match(/\d+/)[0];
                  foundQuantities.push(num);
                }
              }
            });

            const allQuantities = [];
            if (foundQuantities.length === uniqueSkus.length) {
              // 完美匹配：找到的数量个数 = SKU个数
              allQuantities.push(...foundQuantities);
            } else if (foundQuantities.length > 0) {
              // 找到了一些数量，但个数不匹配，使用第一个找到的数量
              const qtyToUse = foundQuantities[0];
              uniqueSkus.forEach(() => allQuantities.push(qtyToUse));
            } else {
              // 没找到严格匹配的独立元素，尝试回退到模糊搜索
              let fallbackQty = '1';
              
              // 策略 A: 优先查找 '×' (乘号 U+00D7)，这通常专门用于数量
              const multiplyMatch = productRow.textContent.match(/×\s*(\d+)/);
              
              if (multiplyMatch) {
                fallbackQty = multiplyMatch[1];
              } else {
                // 策略 B: 查找 'x' (字母)，但排除尺寸格式 (如 15x15)
                // 使用反向肯定预查(Lookbehind)确保 x 前面不是数字
                // (?<!\d\s?) 表示：前面不能是"数字"或"数字+空格"
                try {
                  const letterMatch = productRow.textContent.match(/(?<!\d\s?)[xX]\s*(\d+)/);
                  if (letterMatch) {
                    fallbackQty = letterMatch[1];
                  }
                } catch (e) {
                  // 如果浏览器不支持 Lookbehind，回退到简单匹配但要求前置空格
                  const simpleMatch = productRow.textContent.match(/(?:^|\s)[xX]\s*(\d+)/);
                  if (simpleMatch) {
                    fallbackQty = simpleMatch[1];
                  }
                }
              }
              
              // 安全检查：如果数量过大(>100)，可能是误判了年份或价格，重置为1
              if (parseInt(fallbackQty) > 100) {
                addDebugLog(`  ⚠️ 警告: 提取到数量 ${fallbackQty} 疑似误判，重置为 1`, 'warning');
                fallbackQty = '1';
              }

              uniqueSkus.forEach(() => allQuantities.push(fallbackQty));
            }
            
            addDebugLog(`  数量数组: [${allQuantities.join(', ')}] (SKU数: ${uniqueSkus.length})`, 'detail');
            
            // 提取价格（通常一行只有一个价格）
            let sellingPrice = '0.00';
            const priceMatch = productRow.textContent.match(/฿\s*([\d,]+\.?\d*)/);
            if (priceMatch) {
              sellingPrice = priceMatch[1].replace(/,/g, '');
            }
            addDebugLog(`  单价: ${sellingPrice}`, 'detail');
            
            // 提取所有SKU（但同一行的都用相同的数量）
            uniqueSkus.forEach((sku, skuIndex) => {
              if (!sku || sku.length === 0) {
                return;  // 跳过空SKU
              }
              
              productCount++;
              addDebugLog(`  → 商品 #${productCount} SKU: ${sku}`, 'info');
              
              // 获取此SKU对应的数量
              let quantity = allQuantities[skuIndex] || '1';
              addDebugLog(`  ✓ 数量: ${quantity}`, 'success');
              
              // 8. 创建订单项
              const itemKey = `${orderId}_${sku}`;
              if (!processedOrderItems.has(itemKey)) {
                processedOrderItems.add(itemKey);
                orderList.push({
                  platform: 'TikTok Shop',
                  order_number: orderId,
                  customer_name: buyerName,
                  order_date: orderDate,
                  sku: sku,
                  quantity: quantity,
                  selling_price: sellingPrice,
                  total_amount: totalPrice
                });
                addDebugLog(`  ✅ 已添加: ${itemKey}`, 'success');
              }
            });
          });
          
          addDebugLog(`✅ 订单 ${orderId} 处理完成，共 ${productCount} 个商品`, 'success');
          
        } catch (err) {
          addDebugLog(`❌ 处理订单 #${i + 1} 失败: ${err.message}`, 'error');
          console.error('订单处理错误:', err);
          continue;
        }
      }

      // 5. 完成处理
      if (orderList.length > 0) {
        // 计算总数量用于校验
        const totalQty = orderList.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
        
        addDebugLog(`🎉 成功提取 ${orderList.length} 条订单记录！`, 'success');
        addDebugLog(`📊 处理统计: ${processedOrders.size} 个订单, ${processedOrderItems.size} 个商品明细`, 'info');
        addDebugLog(`📊 数量校验: 所有商品数量总和为 ${totalQty} (UI应显示此值)`, 'info');
        addDebugLog(`📊 平均每订单: ${(processedOrderItems.size / processedOrders.size).toFixed(2)} 个商品`, 'info');
      } else {
        addDebugLog('⚠️ 未能提取到任何有效订单数据', 'warning');
      }
      
      resolve(orderList);
      
    } catch (err) {
      addDebugLog(`❌ 订单提取过程出错: ${err.message}`, 'error');
      console.error('错误详情:', err);
      resolve(orderList);
    }
  });
}

/**
 * 解析虾皮订单号中的日期
 * 例如: 251017AC38U19T -> 2025-10-17
 */
function parseShopeeOrderDate(orderNumber) {
  try {
    if (orderNumber.length < 6) return '';
    
    // 前6位: YYMMDD
    const year = '20' + orderNumber.substring(0, 2);
    const month = orderNumber.substring(2, 4);
    const day = orderNumber.substring(4, 6);
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日期解析失败:', error);
    return '';
  }
}

/**
 * 辅助函数 - 提取文本内容
 * @param {Element} element - 父元素
 * @param {string} selector - CSS选择器
 * @param {string} attr - 可选,提取属性值而非文本
 */
function extractText(element, selector, attr = null) {
  try {
    const target = element.querySelector(selector);
    if (!target) return '';
    
    if (attr) {
      return target.getAttribute(attr) || '';
    }
    
    return target.textContent.trim();
  } catch (error) {
    return '';
  }
}
