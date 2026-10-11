import { api } from './api.js';

export function initEhrPortal() {
  const ehrContainer = document.getElementById('ehr-content-container');
  if (!ehrContainer) return;

  loadPatientData();

  async function loadPatientData() {
    try {
      const patient = await api.getPatientEhr('GC-P-8842');
      renderEhrUI(patient);
    } catch (err) {
      console.error('Lỗi tải hồ sơ EHR:', err);
    }
  }

  function renderEhrUI(patient) {
    const latestVital = patient.vitalsHistory[patient.vitalsHistory.length - 1] || {};

    let statusPill = `<span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Chỉ Số Ổn Định (JCI A+)</span>`;
    if (latestVital.status === 'WARNING') {
      statusPill = `<span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">Cần Theo Dõi Thêm</span>`;
    } else if (latestVital.status === 'CRITICAL') {
      statusPill = `<span class="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold animate-pulse">Cảnh Báo Lâm Sàng</span>`;
    }

    ehrContainer.innerHTML = `
      <!-- Header Patient Card -->
      <div class="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 border border-outline-variant/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-start gap-4">
          <div class="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-gold-accent flex items-center justify-center font-serif text-3xl font-bold shadow-md shrink-0">
            A
            <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]">✓</span>
          </div>
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-headline-sm text-2xl font-serif text-primary font-bold">${patient.fullName}</h2>
              <span class="px-2.5 py-0.5 rounded-full bg-surface-container text-xs font-bold text-secondary">Mã BN: ${patient.id}</span>
              ${statusPill}
            </div>
            <p class="text-xs text-on-surface-variant">${patient.gender}, ${patient.age} tuổi • ${patient.room}</p>
            <p class="text-xs text-secondary font-medium"><span class="font-bold text-primary">Gói:</span> ${patient.package}</p>
            <p class="text-xs text-on-surface-variant"><span class="font-bold">Bác sĩ phụ trách:</span> ${patient.primaryDoctor} | <span class="font-bold">Điều dưỡng:</span> ${patient.primaryNurse}</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button class="btn-interactive px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm" onclick="window.openAddVitalModal()">
            <span class="material-symbols-outlined text-[18px]">add_chart</span>
            Ghi Chỉ Số Mới
          </button>
          <a class="btn-interactive px-4 py-2.5 rounded-xl bg-surface-container text-primary font-bold text-xs flex items-center justify-center gap-1.5 border border-outline-variant/40" href="tel:19006868">
            <span class="material-symbols-outlined text-[18px]">call</span>
            Gọi Bác Sĩ Trực
          </a>
        </div>
      </div>

      <!-- Live Vitals Telemetry Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-2 card-press-active">
          <div class="flex items-center justify-between text-xs text-on-surface-variant">
            <span class="font-bold uppercase tracking-wider">Huyết Áp (BP)</span>
            <span class="material-symbols-outlined text-rose-500 text-[20px]">favorite</span>
          </div>
          <div class="font-headline-md text-2xl sm:text-3xl font-bold text-primary">${latestVital.bpSys}/${latestVital.bpDia} <span class="text-xs font-normal text-on-surface-variant">mmHg</span></div>
          <span class="text-[11px] text-emerald-700 font-semibold block">✓ Mục tiêu: < 140/90 mmHg</span>
        </div>

        <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-2 card-press-active">
          <div class="flex items-center justify-between text-xs text-on-surface-variant">
            <span class="font-bold uppercase tracking-wider">Nhịp Tim (Pulse)</span>
            <span class="material-symbols-outlined text-emerald-600 text-[20px]">monitor_heart</span>
          </div>
          <div class="font-headline-md text-2xl sm:text-3xl font-bold text-primary">${latestVital.heartRate} <span class="text-xs font-normal text-on-surface-variant">nhịp/phút</span></div>
          <span class="text-[11px] text-emerald-700 font-semibold block">✓ Nhịp xoang đều đặn</span>
        </div>

        <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-2 card-press-active">
          <div class="flex items-center justify-between text-xs text-on-surface-variant">
            <span class="font-bold uppercase tracking-wider">Oxy Máu (SpO2)</span>
            <span class="material-symbols-outlined text-cyan-600 text-[20px]">air</span>
          </div>
          <div class="font-headline-md text-2xl sm:text-3xl font-bold text-primary">${latestVital.spO2}% <span class="text-xs font-normal text-on-surface-variant">bão hòa</span></div>
          <span class="text-[11px] text-emerald-700 font-semibold block">✓ Chuẩn hô hấp bình thường</span>
        </div>

        <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-2 card-press-active">
          <div class="flex items-center justify-between text-xs text-on-surface-variant">
            <span class="font-bold uppercase tracking-wider">Đường Huyết Đói</span>
            <span class="material-symbols-outlined text-amber-600 text-[20px]">water_drop</span>
          </div>
          <div class="font-headline-md text-2xl sm:text-3xl font-bold text-primary">${latestVital.glucose} <span class="text-xs font-normal text-on-surface-variant">mmol/L</span></div>
          <span class="text-[11px] text-emerald-700 font-semibold block">✓ Đo lúc ${new Date(latestVital.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <!-- Medical History & Prescriptions -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Vitals History Table (7 cols) -->
        <div class="lg:col-span-7 rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h3 class="font-title-md text-lg text-primary font-bold">Lịch Sử Đo Sinh Hiệu Thời Gian Thực</h3>
            <span class="text-xs text-secondary font-semibold">Cảm biến radar & điều dưỡng</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-container-low text-on-surface-variant uppercase font-bold text-[11px]">
                <tr>
                  <th class="p-2.5 rounded-l-lg">Thời Gian</th>
                  <th class="p-2.5">Huyết Áp</th>
                  <th class="p-2.5">Nhịp Tim</th>
                  <th class="p-2.5">SpO2</th>
                  <th class="p-2.5">Đường Huyết</th>
                  <th class="p-2.5 rounded-r-lg">Người Ghi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/20">
                ${patient.vitalsHistory.slice().reverse().map(v => `
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <td class="p-2.5 font-medium">${new Date(v.timestamp).toLocaleDateString('vi-VN')} ${new Date(v.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td class="p-2.5 font-bold ${v.bpSys >= 140 ? 'text-amber-700' : 'text-primary'}">${v.bpSys}/${v.bpDia}</td>
                    <td class="p-2.5">${v.heartRate} bpm</td>
                    <td class="p-2.5">${v.spO2}%</td>
                    <td class="p-2.5">${v.glucose}</td>
                    <td class="p-2.5 text-on-surface-variant">${v.recordedBy}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Prescriptions & Care Plan (5 cols) -->
        <div class="lg:col-span-5 rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h3 class="font-title-md text-lg text-primary font-bold">Lịch Uống Thuốc Hôm Nay</h3>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">Chuẩn JCI</span>
          </div>

          <div class="space-y-3">
            ${patient.medications.map(med => `
              <div class="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3">
                <div>
                  <div class="font-bold text-primary text-sm">${med.name}</div>
                  <p class="text-xs text-on-surface-variant">${med.dose} • ${med.schedule}</p>
                  <span class="text-[11px] text-secondary font-medium">${med.purpose}</span>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold ${med.status === 'TAKEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${med.status === 'TAKEN' ? '✓ Đã uống' : '⏰ Sắp uống'}
                </span>
              </div>
            `).join('')}
          </div>

          <div class="pt-2 border-t border-outline-variant/30">
            <h4 class="font-bold text-xs text-primary uppercase tracking-wide mb-1.5">Chế độ phục hồi & Dinh dưỡng</h4>
            <p class="text-xs text-on-surface-variant leading-relaxed">${patient.carePlan.nutrition}</p>
            <p class="text-xs text-on-surface-variant leading-relaxed mt-1">${patient.carePlan.physicalTherapy}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Global vital modal trigger
  window.openAddVitalModal = function() {
    const modal = document.getElementById('addVitalModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeAddVitalModal = function() {
    const modal = document.getElementById('addVitalModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  const addVitalForm = document.getElementById('add-vital-form');
  if (addVitalForm) {
    addVitalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bpSys = document.getElementById('vital-sys').value;
      const bpDia = document.getElementById('vital-dia').value;
      const heartRate = document.getElementById('vital-hr').value;
      const spO2 = document.getElementById('vital-spo2').value;
      const glucose = document.getElementById('vital-glu').value;

      try {
        await api.addPatientVitals('GC-P-8842', {
          bpSys, bpDia, heartRate, spO2, glucose,
          recordedBy: 'Thân nhân người bệnh (App GoCare)'
        });
        window.closeAddVitalModal();
        loadPatientData();
        alert('Cập nhật chỉ số sinh tồn thành công vào bệnh án điện tử EHR!');
      } catch (err) {
        alert('Lỗi khi cập nhật chỉ số: ' + err.message);
      }
    });
  }
}
