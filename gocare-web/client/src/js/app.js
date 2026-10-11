import { api } from './api.js';
import { initDijkstraRadar } from './dijkstra-radar.js';
import { initAiChat } from './ai-chat.js';
import { initEhrPortal } from './ehr.js';
import { initBookingModule } from './booking.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Interactive Button Ripple Waves
  initRippleEffects();

  // 2. Interactive Image Click Animations & Lightbox
  initImageInteractions();

  // 3. Tab Switching
  initNavigationTabs();

  // 4. Caregiver Filters
  initCaregiverFilters();

  // 5. Initialize Subsystems
  initDijkstraRadar();
  initAiChat();
  initEhrPortal();
  initBookingModule();
});

/**
 * Ripple Waves for .btn-interactive
 */
function initRippleEffects() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-interactive');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    const size = Math.max(rect.width, rect.height);
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

/**
 * Interactive Image Click Animations & Lightbox Viewer
 */
function initImageInteractions() {
  const lightboxModal = document.getElementById('imageLightboxModal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  document.querySelectorAll('.img-interactive').forEach(img => {
    img.addEventListener('click', () => {
      if (!lightboxModal) return;
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || img.getAttribute('data-alt') || 'Không gian y khoa cao cấp GoCare';

      if (lightboxImg) lightboxImg.src = src;
      if (lightboxCaption) lightboxCaption.textContent = alt;

      lightboxModal.classList.remove('hidden');
      lightboxModal.classList.add('flex');
    });
  });

  window.closeLightbox = function() {
    if (lightboxModal) {
      lightboxModal.classList.add('hidden');
      lightboxModal.classList.remove('flex');
    }
  };
}

/**
 * Tab Navigation (Trang Chủ, Điều Dưỡng CCHN & GPS, Wellness & Pharmacy, Cổng Bệnh Nhân)
 */
function initNavigationTabs() {
  window.switchTab = function(tabId) {
    // Hide all tab views
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.add('hidden');
    });

    // Show target tab view
    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
      targetView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav link active classes
    document.querySelectorAll('.nav-tab').forEach(tab => {
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('text-primary', 'font-bold', 'border-b-2', 'border-gold-accent');
        tab.classList.remove('text-on-surface');
      } else {
        tab.classList.remove('text-primary', 'font-bold', 'border-b-2', 'border-gold-accent');
        tab.classList.add('text-on-surface');
      }
    });
  };

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = tab.getAttribute('data-tab');
      if (tabId) window.switchTab(tabId);
    });
  });
}

/**
 * Dynamic Caregiver Directory Filters
 */
async function initCaregiverFilters() {
  const grid = document.getElementById('caregiverGrid');
  const specialtySelect = document.getElementById('specialtyFilter');
  const locationSelect = document.getElementById('locationFilter');
  const resultCount = document.getElementById('resultCount');

  let currentShift = '8h';

  window.setShiftFilter = function(btn, shift) {
    document.querySelectorAll('.shift-filter-btn').forEach(b => {
      b.classList.remove('bg-primary', 'text-on-primary', 'border-primary', 'active');
      b.classList.add('border-outline-variant', 'text-on-surface-variant');
    });
    btn.classList.add('bg-primary', 'text-on-primary', 'border-primary', 'active');
    btn.classList.remove('border-outline-variant', 'text-on-surface-variant');
    currentShift = shift;
    fetchAndRenderCaregivers();
  };

  window.setSpecialtyChip = function(specialtyVal, pill) {
    document.querySelectorAll('.quick-pill').forEach(p => {
      p.classList.remove('bg-primary', 'text-on-primary', 'active');
      p.classList.add('bg-surface-container', 'text-on-surface');
    });
    pill.classList.add('bg-primary', 'text-on-primary', 'active');
    pill.classList.remove('bg-surface-container', 'text-on-surface');

    if (specialtySelect) {
      specialtySelect.value = specialtyVal;
    }
    fetchAndRenderCaregivers();
  };

  if (specialtySelect) specialtySelect.addEventListener('change', fetchAndRenderCaregivers);
  if (locationSelect) locationSelect.addEventListener('change', fetchAndRenderCaregivers);

  async function fetchAndRenderCaregivers() {
    if (!grid) return;
    const spec = specialtySelect ? specialtySelect.value : 'all';
    const loc = locationSelect ? locationSelect.value : 'all';

    try {
      const res = await api.getCaregivers({ specialty: spec, location: loc });
      const items = res.data;

      if (resultCount) {
        resultCount.innerHTML = `Tìm thấy <strong>${items.length}</strong> chuyên gia điều dưỡng & bác sĩ có CCHN`;
      }

      grid.innerHTML = items.map(c => {
        const shiftPrice = (c.shifts && c.shifts[currentShift]) || 720000;
        return `
          <article class="doctor-card rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between" data-specialty="${c.specialty}" data-location="${c.location}">
            <div class="space-y-4">
              <!-- Top Row: Avatar & CCHN Verified Badge -->
              <div class="flex items-start gap-4">
                <div class="relative w-16 h-16 rounded-2xl overflow-hidden bg-primary shrink-0 ring-2 ring-gold-accent/40 shadow-sm avatar-zoom img-interactive">
                  <img src="${c.avatar}" alt="${c.name}" class="w-full h-full object-cover">
                  <span class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <h3 class="font-title-md text-base font-bold text-primary">${c.name}</h3>
                    <span class="material-symbols-outlined text-[17px] text-emerald-600">verified</span>
                  </div>
                  <p class="font-label-md text-xs text-on-surface-variant font-medium">${c.title}</p>
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px] font-bold">
                    ✓ ${c.cchn.split(' ')[0]}
                  </span>
                </div>
              </div>

              <!-- Specialty & Location -->
              <div class="p-3 rounded-xl bg-surface-container-low space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-on-surface-variant font-semibold">Chuyên môn:</span>
                  <span class="font-bold text-primary">${c.specialtyName}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-on-surface-variant font-semibold">Kinh nghiệm:</span>
                  <span class="font-bold text-secondary">${c.experienceYears} năm thực hành</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-on-surface-variant font-semibold">Đánh giá:</span>
                  <span class="font-bold text-amber-700 flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[14px]">star</span>
                    ${c.rating} (${c.reviewCount} lượt)
                  </span>
                </div>
              </div>

              <!-- Bio -->
              <p class="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                ${c.bio}
              </p>

              <!-- Skills tags -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                ${c.skills.slice(0, 3).map(s => `<span class="px-2 py-0.5 rounded bg-surface-container text-[10px] text-on-surface-variant font-medium">${s}</span>`).join('')}
              </div>
            </div>

            <!-- Bottom Price & CTA -->
            <div class="pt-5 mt-4 border-t border-outline-variant/30 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-on-surface-variant uppercase font-semibold block">Phí ca ${currentShift}:</span>
                <span class="font-headline-sm text-base font-bold text-primary">${shiftPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <button class="btn-interactive px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5" onclick="window.openBookingModal('${c.name}', '${currentShift}', ${shiftPrice})">
                <span class="material-symbols-outlined text-[16px]">calendar_month</span>
                Đặt Lịch
              </button>
            </div>
          </article>
        `;
      }).join('');
    } catch (err) {
      console.error('Lỗi lấy danh sách điều dưỡng:', err);
    }
  }

  fetchAndRenderCaregivers();
}
