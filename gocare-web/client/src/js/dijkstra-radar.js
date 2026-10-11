import { api } from './api.js';

export function initDijkstraRadar() {
  const radarContainer = document.getElementById('radar-canvas-container');
  const routeDisplay = document.getElementById('route-result-display');
  const startSelect = document.getElementById('radar-start-select');
  const targetSelect = document.getElementById('radar-target-select');
  const btnCalculate = document.getElementById('btn-calculate-route');

  if (!radarContainer) return;

  async function loadAndComputeRoute() {
    const startNode = startSelect ? startSelect.value : 'thao-dien';
    const targetNode = targetSelect ? targetSelect.value : 'villas-thao-dien';

    try {
      const data = await api.getDispatchRoute(startNode, targetNode);
      renderRouteDetails(data);
      updateSvgPath(data);
    } catch (err) {
      console.error('Lỗi khi tính toán thuật toán Dijkstra:', err);
    }
  }

  function renderRouteDetails(data) {
    if (!routeDisplay) return;

    const pathNames = data.path.map(p => `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">${p.name}</span>`).join(' ➔ ');

    routeDisplay.innerHTML = `
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold text-primary text-sm">${data.algorithm}</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Độ trễ: ${data.latencySec}s</span>
            <span class="px-2 py-0.5 rounded bg-surface-container font-semibold">Tiết kiệm: ${data.timeSavedPercent}% thời gian</span>
          </div>
        </div>

        <div class="text-xs text-on-surface">
          <span class="text-on-surface-variant font-semibold block mb-1">Chuỗi Node tối ưu:</span>
          <div class="flex flex-wrap items-center gap-1.5">${pathNames}</div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-1">
          <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300">
            <span class="text-[11px] text-emerald-800 font-bold block">Tuyến Tối Ưu (Đã chọn)</span>
            <div class="font-bold text-emerald-900 text-base mt-0.5">${data.totalDistanceKm} km • ${data.estimatedMinutes} phút</div>
            <span class="text-[10px] text-emerald-700">${data.trafficStatus}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-red-50 border border-red-200">
            <span class="text-[11px] text-red-800 font-bold block">${data.alternativeRoute.name}</span>
            <div class="font-bold text-red-900 text-base mt-0.5">${data.alternativeRoute.distanceKm} km • ${data.alternativeRoute.estimatedMinutes} phút</div>
            <span class="text-[10px] text-red-700">${data.alternativeRoute.status}</span>
          </div>
        </div>
      </div>
    `;
  }

  function updateSvgPath(data) {
    const pulsePath = document.getElementById('svg-dijkstra-pulse');
    if (pulsePath) {
      pulsePath.classList.remove('animate-pulse');
      void pulsePath.offsetWidth; // trigger reflow
      pulsePath.classList.add('animate-pulse');
    }
  }

  if (btnCalculate) {
    btnCalculate.addEventListener('click', loadAndComputeRoute);
  }
  if (startSelect) startSelect.addEventListener('change', loadAndComputeRoute);
  if (targetSelect) targetSelect.addEventListener('change', loadAndComputeRoute);

  // Initial calculation
  loadAndComputeRoute();
}
