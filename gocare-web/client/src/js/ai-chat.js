import { api } from './api.js';

export function initAiChat() {
  const chatPopup = document.getElementById('floatingChatPopup');
  const toggleBtn = document.getElementById('btn-toggle-ai-chat');
  const closeBtn = document.getElementById('btn-close-ai-chat');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const chatMessages = document.getElementById('ai-chat-messages');
  const micBtn = document.getElementById('btn-ai-mic');

  if (!chatPopup || !chatForm) return;

  // Toggle Popup
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      chatPopup.classList.toggle('hidden');
      if (!chatPopup.classList.contains('hidden') && chatInput) {
        chatInput.focus();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chatPopup.classList.add('hidden');
    });
  }

  // Voice recording mock
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      micBtn.classList.toggle('text-error');
      micBtn.classList.toggle('animate-pulse');
      if (micBtn.classList.contains('text-error')) {
        chatInput.placeholder = 'Đang lắng nghe giọng nói của bạn...';
        setTimeout(() => {
          chatInput.value = 'Huyết áp sáng nay của bác đo được 145/90, có cần uống thêm thuốc không?';
          micBtn.classList.remove('text-error', 'animate-pulse');
          chatInput.placeholder = 'Nhập câu hỏi hoặc tâm sự cùng AI Care...';
        }, 2500);
      } else {
        chatInput.placeholder = 'Nhập câu hỏi hoặc tâm sự cùng AI Care...';
      }
    });
  }

  // Quick Chips
  document.querySelectorAll('.ai-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
      if (chatInput) {
        chatInput.value = text;
        submitChatMessage(text);
      }
    });
  });

  // Handle Form Submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    submitChatMessage(text);
  });

  async function submitChatMessage(text) {
    chatInput.value = '';

    // Append User Message
    appendMessage({
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    });

    // Loading indicator
    const loadingId = 'ai-loading-' + Date.now();
    const loadingEl = document.createElement('div');
    loadingEl.id = loadingId;
    loadingEl.className = 'flex items-start gap-2.5';
    loadingEl.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-primary text-gold-light flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-[18px]">smart_toy</span>
      </div>
      <div class="p-3 rounded-2xl bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-gold-accent animate-ping"></span>
        <span>AI GoCare đang phân tích triệu chứng lâm sàng...</span>
      </div>
    `;
    chatMessages.appendChild(loadingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const res = await api.sendAiMessage(text);
      const loadingNode = document.getElementById(loadingId);
      if (loadingNode) loadingNode.remove();

      appendMessage({
        sender: 'ai',
        text: res.reply,
        alertLevel: res.alertLevel,
        actions: res.suggestedActions,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      const loadingNode = document.getElementById(loadingId);
      if (loadingNode) loadingNode.remove();

      appendMessage({
        sender: 'ai',
        text: 'Xin lỗi bạn, kết nối máy chủ y tế tạm thời gián đoạn. Vui lòng gọi Hotline 1900 6868 nếu cần hỗ trợ khẩn cấp.',
        alertLevel: 'WARNING',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      });
    }
  }

  function appendMessage({ sender, text, alertLevel = 'NORMAL', actions = [], time }) {
    const isUser = sender === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = isUser ? 'flex items-start justify-end gap-2.5' : 'flex items-start gap-2.5';

    let alertBorder = '';
    if (alertLevel === 'EMERGENCY') alertBorder = 'border-2 border-red-500 bg-red-50 text-red-950';
    else if (alertLevel === 'WARNING') alertBorder = 'border border-amber-400 bg-amber-50/70 text-amber-950';
    else alertBorder = isUser ? 'bg-primary text-on-primary' : 'bg-surface-container-low border border-outline-variant/30 text-on-surface';

    const actionsHtml = actions.length > 0 ? `
      <div class="flex flex-wrap gap-1.5 pt-2 mt-1 border-t border-outline-variant/20">
        ${actions.map(act => `
          <button class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-gold-light text-primary text-[11px] font-bold transition-colors" onclick="window.handleAiAction('${act.action}')">
            ${act.text}
          </button>
        `).join('')}
      </div>
    ` : '';

    msgDiv.innerHTML = isUser ? `
      <div class="max-w-[80%] rounded-2xl rounded-tr-sm p-3.5 text-xs ${alertBorder} shadow-sm">
        <p class="leading-relaxed">${text}</p>
        <span class="text-[9px] opacity-75 block text-right mt-1">${time}</span>
      </div>
      <div class="w-8 h-8 rounded-xl bg-gold-accent text-brand-charcoal flex items-center justify-center shrink-0 font-bold shadow-sm">
        <span class="material-symbols-outlined text-[18px]">person</span>
      </div>
    ` : `
      <div class="w-8 h-8 rounded-xl bg-primary text-gold-light flex items-center justify-center shrink-0 shadow-sm">
        <span class="material-symbols-outlined text-[18px]">smart_toy</span>
      </div>
      <div class="max-w-[85%] rounded-2xl rounded-tl-sm p-3.5 text-xs ${alertBorder} shadow-sm space-y-1">
        <div class="font-bold text-[11px] text-primary flex items-center gap-1">
          <span class="material-symbols-outlined text-[13px] text-gold-accent">verified</span>
          Trợ lý AI GoCare:
        </div>
        <p class="leading-relaxed">${text}</p>
        ${actionsHtml}
        <span class="text-[9px] text-on-surface-variant block text-right mt-1">${time}</span>
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Global action handler for buttons returned by AI
  window.handleAiAction = function(action) {
    if (action === 'CALL_EMERGENCY') {
      window.location.href = 'tel:19006868';
    } else if (action === 'BOOK_CAREGIVER' || action === 'DISPATCH_DOCTOR' || action === 'BOOK_NURSE') {
      window.openBookingModal('ĐD. Trần Thị Hoài Thương', '8h', 720000);
    } else if (action === 'VIEW_EHR') {
      window.switchTab('cong-benh-nhan');
    } else if (action === 'BREATHING_GUIDE') {
      alert('Bài thở 4-7-8:\n1. Hít vào chậm qua mũi trong 4 giây.\n2. Giữ hơi thở trong 7 giây.\n3. Thở ra từ từ qua miệng trong 8 giây.\nLặp lại 4 lần để huyết áp và nhịp tim ổn định.');
    }
  };
}
