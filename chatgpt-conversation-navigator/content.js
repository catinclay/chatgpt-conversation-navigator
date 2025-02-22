// 創建側邊欄容器
function createSidebar() {
  // 創建一個小標記和導航面板
  const navigator = document.createElement('div');
  navigator.id = 'chat-navigator';
  navigator.innerHTML = `
    <div id="nav-trigger" class="nav-trigger">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 9h18M3 15h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    <div id="nav-panel" class="nav-panel hidden">
      <div class="nav-header">
        <h3>對話導航</h3>
        <div class="nav-controls">
          <button class="theme-toggle" title="切換主題">
            <svg class="theme-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path class="sun-icon" d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" stroke-width="2"/>
              <path class="sun-icon" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
              <path class="moon-icon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button class="nav-close">×</button>
        </div>
      </div>
      <div class="conversation-nodes"></div>
      <div class="resize-handle"></div>
    </div>
  `;
  document.body.appendChild(navigator);

  // 設置初始位置
  const trigger = navigator.querySelector('#nav-trigger');
  trigger.style.position = 'fixed';
  trigger.style.top = '40px';
  trigger.style.right = '24px';
  
  const panel = navigator.querySelector('#nav-panel');
  const handle = navigator.querySelector('.resize-handle');
  
  // 追蹤拖曳狀態
  let dragStartX = 0;
  let dragStartY = 0;
  let isDragging = false;
  let triggerInitialX = 0;
  let triggerInitialY = 0;
  let isMouseDown = false;  // 新增：追蹤滑鼠按下狀態
  
  // 點擊外部關閉面板
  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('hidden') && 
        !panel.contains(e.target) && 
        !trigger.contains(e.target)) {
      panel.classList.add('hidden');
    }
  });

  // 修改拖曳邏輯
  trigger.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    triggerInitialX = trigger.offsetLeft;
    triggerInitialY = trigger.offsetTop;
    isDragging = false;
    
    // 添加拖曳時的視覺反饋
    trigger.style.cursor = 'grabbing';
    trigger.style.opacity = '1';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;  // 改用 isMouseDown 檢查

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    if (dragDistance > 10) {
      isDragging = true;
    }
    // 計算新位置
    const newX = triggerInitialX + dx;
    const newY = triggerInitialY + dy;
    
    // 確保不超出視窗範圍
    const maxX = window.innerWidth - trigger.offsetWidth;
    const maxY = window.innerHeight - trigger.offsetHeight;
    
    trigger.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
    trigger.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    
    // 如果面板是展開的，更新面板位置
    if (!panel.classList.contains('hidden')) {
      updatePanelPosition();
    }
  });

  document.addEventListener('mouseup', () => {
    isMouseDown = false;  // 重置滑鼠按下狀態
    if (isDragging) {
      trigger.style.cursor = 'grab';
      trigger.style.opacity = '0.6';
    }
  });

  // 修改點擊邏輯
  trigger.addEventListener('click', (e) => {
    if (!isDragging) {
      e.stopPropagation();
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) {
        updatePanelPosition();
      }
    }
  });

  // 防止面板的點擊事件冒泡到文檔
  panel.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // 添加關閉按鈕功能
  const closeButton = navigator.querySelector('.nav-close');
  closeButton.addEventListener('click', () => {
    panel.classList.add('hidden');
  });
  
  // 使面板可拖曳
  makeDraggable(panel, '.nav-header');
  
  // 使面板可調整高度
  makeResizable(panel, handle);
  
  // 添加主題切換功能
  const themeToggle = navigator.querySelector('.theme-toggle');
  
  // 檢查並設置初始主題
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  panel.classList.toggle('light-theme', !prefersDark);
  trigger.classList.toggle('light-theme', !prefersDark);  // 同時設置浮動圖標的主題
  
  themeToggle.addEventListener('click', () => {
    panel.classList.toggle('light-theme');
    trigger.classList.toggle('light-theme');  // 切換浮動圖標的主題
  });
  
  // 更新面板位置的函數
  function updatePanelPosition() {
    const triggerRect = trigger.getBoundingClientRect();
    panel.style.top = `${triggerRect.top}px`;
    panel.style.right = `${window.innerWidth - triggerRect.left + 10}px`; // 從右側計算位置
  }

  return navigator;
}

// 改進拖曳功能
function makeDraggable(element, handleSelector = null, onDragCallback = null) {
  const dragHandle = handleSelector ? element.querySelector(handleSelector) : element;
  let isDragging = false;
  let startX;
  let startY;
  let initialX;
  let initialY;
  
  function onMouseDown(e) {
    // 檢查是否是從正確的元素開始拖曳
    if (e.target === dragHandle || dragHandle.contains(e.target)) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialX = element.offsetLeft;
      initialY = element.offsetTop;
      
      // 添加拖曳時的視覺反饋
      element.style.cursor = 'grabbing';
      if (element.classList.contains('nav-trigger')) {
        element.style.opacity = '1';
      }
    }
  }
  
  function onMouseMove(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    const newX = initialX + dx;
    const newY = initialY + dy;
    
    // 確保不超出視窗範圍
    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = window.innerHeight - element.offsetHeight;
    
    element.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
    element.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
    
    // 如果有回調函數，則調用它
    if (onDragCallback) {
      onDragCallback(newX, newY);
    }
  }
  
  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      element.style.cursor = '';
      if (element.classList.contains('nav-trigger')) {
        element.style.opacity = '0.6';
      }
    }
  }
  
  dragHandle.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

// 使面板可調整高度
function makeResizable(element, handle) {
  let isResizing = false;
  let initialHeight;
  let initialY;
  
  handle.addEventListener('mousedown', resizeStart);
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', resizeEnd);
  
  function resizeStart(e) {
    isResizing = true;
    initialHeight = element.offsetHeight;
    initialY = e.clientY;
  }
  
  function resize(e) {
    if (isResizing) {
      const deltaY = e.clientY - initialY;
      const newHeight = initialHeight + deltaY;
      
      // 設置最小和最大高度
      const minHeight = 200;
      const maxHeight = window.innerHeight - element.offsetTop - 20;
      
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        element.style.height = `${newHeight}px`;
      }
    }
  }
  
  function resizeEnd() {
    isResizing = false;
  }
}

// 解析對話內容
function parseConversation() {
  try {
    console.log('開始解析對話...');
    const messages = document.querySelectorAll('[data-message-author-role]');
    console.log('找到對話消息數量:', messages.length);
    const nodes = [];
    
    messages.forEach((message, index) => {
      const role = message.getAttribute('data-message-author-role');
      console.log(`處理第 ${index + 1} 條消息, 角色:`, role);
      let content = '';
      
      // 根據不同角色獲取內容，增加更多選擇器
      if (role === 'user') {
        content = message.querySelector('.whitespace-pre-wrap, .text-message')?.textContent;
      } else if (role === 'assistant') {
        content = message.querySelector('.prose, .markdown, .text-message')?.textContent;
      }
      
      console.log(`消息內容長度: ${content?.length || 0}`);
      
      if (content) {
        nodes.push({
          id: index,
          role: role,
          element: message,
          summary: generateSummary(content)
        });
      }
    });
    
    console.log('解析完成，總節點數:', nodes.length);
    return nodes;
  } catch (error) {
    console.error('解析對話時發生錯誤:', error);
    return [];
  }
}

// 生成簡短摘要
function generateSummary(content) {
  const cleanContent = content.trim()
    .replace(/\s+/g, ' ')
    .replace(/[「」『』]/g, '')  // 移除中文引號
    .replace(/[.,!?。，！？]/g, ' ');  // 將標點符號替換為空格
  
  // 取前20個字符，如果內容被截斷則添加省略號
  const summary = cleanContent.substring(0, 20);
  return summary + (cleanContent.length > 20 ? '...' : '');
}

// 渲染節點
function renderNodes(nodes, container) {
  const scrollTop = container.scrollTop;
  
  // 每2個對話(問答)為一組
  const groups = [];
  for (let i = 0; i < nodes.length; i += 2) {
    const question = nodes[i];
    const answer = nodes[i + 1];
    if (question && answer) {
      groups.push({ question, answer });
    } else if (question) {
      groups.push({ question }); // 處理最後一個單獨的問題
    }
  }
  
  container.innerHTML = groups.map((group, groupIndex) => `
    <div class="conversation-pair">
      <div class="conversation-node user" data-id="${group.question.id}">
        <div class="node-role">問</div>
        <div class="node-summary">${group.question.summary}</div>
      </div>
      ${group.answer ? `
        <div class="conversation-node assistant" data-id="${group.answer.id}">
          <div class="node-role">答</div>
          <div class="node-summary">${group.answer.summary}</div>
        </div>
      ` : ''}
    </div>
  `).join('');
  
  container.scrollTop = scrollTop;
  
  // 改進點擊滾動邏輯
  container.querySelectorAll('.conversation-node').forEach(node => {
    node.addEventListener('click', () => {
      const id = node.dataset.id;
      const targetElement = nodes[id].element;
      
      // 滾動到元素，將其置於視窗中間
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'  // 將元素滾動到視窗中間
      });
      
      // 然後稍微向上調整
      setTimeout(() => {
        window.scrollBy({
          top: -150,  // 向上偏移，調整到合適的位置
          behavior: 'smooth'
        });
      }, 100);
      
      // 添加高亮效果
      targetElement.classList.add('highlight-message');
      setTimeout(() => {
        targetElement.classList.remove('highlight-message');
      }, 2000);
    });
  });
}

function waitForChat(nodesContainer) {
  console.log('等待聊天容器載入...');
  
  // 檢查聊天容器和對話內容
  function checkContent() {
    const chatContainer = document.querySelector('main');
    const messages = document.querySelectorAll('[data-message-author-role]');
    console.log('檢查中 - 聊天容器:', !!chatContainer, '消息數量:', messages.length);
    
    if (!chatContainer || messages.length === 0) {
      console.log('內容未完全載入，0.5秒後重試');
      setTimeout(checkContent, 500);
      return;
    }
    
    console.log('找到聊天容器和對話內容，開始初始化');
    initializeChat(chatContainer, nodesContainer);
  }
  
  function initializeChat(chatContainer, nodesContainer) {
    // 初始解析
    let currentNodes = parseConversation(); // 保存當前節點引用
    renderNodes(currentNodes, nodesContainer);

    // 監聽對話更新
    const observer = new MutationObserver((mutations) => {
      console.log('檢測到 DOM 變化，mutations:', mutations.length);
      
      requestAnimationFrame(() => {
        const hasRelevantChanges = mutations.some(mutation => {
          const hasNewMessage = Array.from(mutation.addedNodes).some(node => 
            node.nodeType === 1 && (
              node.hasAttribute('data-message-author-role') ||
              node.querySelector('[data-message-author-role]')
            )
          );
          const hasRemovedMessage = Array.from(mutation.removedNodes).some(node =>
            node.nodeType === 1 && (
              node.hasAttribute('data-message-author-role') ||
              node.querySelector('[data-message-author-role]')
            )
          );
          
          if (hasNewMessage) console.log('檢測到新消息');
          if (hasRemovedMessage) console.log('檢測到消息被刪除');
          
          return hasNewMessage || hasRemovedMessage;
        });

        if (hasRelevantChanges) {
          console.log('有相關變化，重新解析對話');
          currentNodes = parseConversation(); // 更新節點引用
          renderNodes(currentNodes, nodesContainer);
        }
      });
    });

    observer.observe(chatContainer, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }

  // 開始檢查
  checkContent();
}

// 初始化
function init() {
  console.log('開始初始化擴展...');
  const navigator = createSidebar();
  const nodesContainer = navigator.querySelector('.conversation-nodes');
  
  // 將 nodesContainer 作為參數傳遞給 waitForChat
  function startWaitingForChat() {
    waitForChat(nodesContainer);
  }
  
  startWaitingForChat();
}

// 在頁面載入完成後初始化
window.addEventListener('load', () => {
  console.log('頁面載入完成，延遲 1 秒後初始化擴展');
  setTimeout(init, 1000);
}); 