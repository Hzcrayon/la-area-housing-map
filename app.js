// LA Area Housing Map：Leaflet 免费底图切换 + 331个网格多边形渲染 + 四维参数动态联动
let currentMetric = 'median';
let showLabels = true;
let selectedZone = null;
const compareList = [];

const metricLabels = {
  median: '(a) 成交中位价',
  avg: '(b) 成交平均值',
  min: '(c) 成交最低价',
  max: '(d) 成交最高价'
};

function formatUSD(num) {
  if (num == null || !isFinite(num)) return '—';
  return '$' + num.toLocaleString('en-US');
}

function formatShortUSD(num) {
  if (num == null || !isFinite(num)) return '—';
  if (num >= 1000000) {
    return '$' + (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
  }
  return '$' + Math.round(num / 1000) + 'K';
}

function getHeatColor(val) {
  if (val == null || !isFinite(val)) return '#94a3b8';
  if (val < 900000) return '#22c55e';      // 翠绿 < $900K
  if (val < 1400000) return '#eab308';     // 金黄 $900K - $1.4M
  if (val < 2200000) return '#f97316';     // 橙色 $1.4M - $2.2M
  if (val < 3500000) return '#ef4444';     // 红色 $2.2M - $3.5M
  return '#a855f7';                        // 紫罗兰 > $3.5M
}

// 初始化地图 (视野中心涵盖 LA 至 Santa Barbara)
const map = L.map('map', {
  center: [34.12, -118.55],
  zoom: 9,
  minZoom: 7,
  maxZoom: 16
});

// 免费、无需 API Key 的栅格底图。
// CARTO 自 2026-09-25 起，不带 key 的 voyager / dark 瓦片只返回 “API KEY REQUIRED” 水印。
// 街景与深色底图改用 Esri 公开瓦片（与原本可用的卫星图同一服务，浏览器直接请求，无需注册）。
// OSM 标准图继续用 OpenStreetMap 官方瓦片，同样不需要 key。
const TILE_SOURCES = {
  voyager: {
    urls: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
    ],
    attr: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom',
    maxZoom: 19
  },
  dark: {
    urls: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
    ],
    attr: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  },
  osm: {
    urls: [
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],
    attr: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  },
  sat: {
    urls: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ],
    attr: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxZoom: 19
  }
};

function createBasemap(tileKey) {
  const source = TILE_SOURCES[tileKey];
  const layers = source.urls.map((url, index) => L.tileLayer(url, {
    attribution: index === 0 ? source.attr : '',
    maxZoom: source.maxZoom,
    maxNativeZoom: source.maxZoom
  }));
  return layers.length === 1 ? layers[0] : L.layerGroup(layers);
}

let baseTileLayer = createBasemap('voyager').addTo(map);

const gridLayerGroup = L.layerGroup().addTo(map);
const labelLayerGroup = L.layerGroup().addTo(map);

function renderGrid() {
  gridLayerGroup.clearLayers();
  labelLayerGroup.clearLayers();

  const regionVal = document.getElementById('region-filter').value;
  const maxBudget = parseInt(document.getElementById('budget-slider').value, 10);
  const keyword = document.getElementById('search-input').value.trim().toLowerCase();

  HOUSING_GRID_DATA.forEach(zone => {
    if (regionVal !== 'ALL' && zone.region !== regionVal) return;
    if (maxBudget < 6000000 && zone.median > maxBudget) return;
    if (keyword && !zone.name.toLowerCase().includes(keyword) && !zone.id.toLowerCase().includes(keyword)) return;

    const metricValue = zone[currentMetric];
    const color = getHeatColor(metricValue);

    const bounds = [
      [zone.lat - zone.dLat / 2, zone.lng - zone.dLng / 2],
      [zone.lat + zone.dLat / 2, zone.lng + zone.dLng / 2]
    ];

    const rect = L.rectangle(bounds, {
      color: selectedZone && selectedZone.id === zone.id ? '#ffffff' : color,
      weight: selectedZone && selectedZone.id === zone.id ? 3 : 1.5,
      fillColor: color,
      fillOpacity: 0.52
    });

    const popupHTML = `
      <div class="p-1 min-w-[230px]">
        <div class="text-[10px] text-indigo-400 font-semibold">${zone.region} · ${zone.id}</div>
        <a href="${zone.url}" target="_blank" rel="noopener noreferrer" class="block text-sm font-bold text-white underline mb-2">${zone.name}</a>
        <div class="space-y-1 text-xs font-mono">
          <div class="flex justify-between"><span class="text-slate-400">(a) 成交中位价:</span><span class="text-indigo-300 font-bold">${formatUSD(zone.median)}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">(b) 成交平均值:</span><span class="text-emerald-300 font-bold">${formatUSD(zone.avg)}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">(c) 成交最低价:</span><span class="text-sky-300 font-bold">${formatUSD(zone.min)}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">(d) 成交最高价:</span><span class="text-rose-300 font-bold">${formatUSD(zone.max)}</span></div>
        </div>
        <a href="${zone.url}" target="_blank" rel="noopener noreferrer" class="inline-block mt-2 text-xs font-semibold text-indigo-300 underline">在 Redfin 打开该地区</a>
      </div>
    `;

    rect.bindPopup(popupHTML);

    rect.on('mouseover', function () {
      this.setStyle({ weight: 3, fillOpacity: 0.75 });
    });
    rect.on('mouseout', function () {
      const isSelected = selectedZone && selectedZone.id === zone.id;
      this.setStyle({ weight: isSelected ? 3 : 1.5, fillOpacity: 0.52 });
    });
    rect.on('click', function () {
      selectZone(zone);
    });

    gridLayerGroup.addLayer(rect);

    if (showLabels) {
      const labelMarker = L.marker([zone.lat, zone.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div class="grid-label">${formatShortUSD(metricValue)}</div>`,
          iconSize: [54, 18],
          iconAnchor: [27, 9]
        }),
        interactive: false
      });
      labelLayerGroup.addLayer(labelMarker);
    }
  });
}

function selectZone(zone) {
  selectedZone = zone;
  document.getElementById('detail-region').textContent = `${zone.region} · 网格编号 ${zone.id}`;
  document.getElementById('detail-name').textContent = zone.name;
  document.getElementById('detail-desc').textContent = zone.desc;
  const redfinLink = document.getElementById('redfin-link');
  if (zone.url) {
    redfinLink.href = zone.url;
    redfinLink.classList.remove('hidden');
  } else {
    redfinLink.href = '#';
    redfinLink.classList.add('hidden');
  }

  document.getElementById('val-median').textContent = formatUSD(zone.median);
  document.getElementById('val-avg').textContent = formatUSD(zone.avg);
  document.getElementById('val-min').textContent = formatUSD(zone.min);
  document.getElementById('val-max').textContent = formatUSD(zone.max);

  document.getElementById('val-sales').textContent = `${zone.sales} 套`;
  document.getElementById('val-ppsf').textContent = zone.ppsf == null ? '—' : `$${zone.ppsf} /sqft`;
  document.getElementById('val-code').textContent = zone.id;

  const hasRange = zone.min != null && zone.max != null && zone.avg != null && zone.max > zone.min;
  document.getElementById('marker-median').style.display = hasRange ? '' : 'none';
  document.getElementById('marker-avg').style.display = hasRange ? '' : 'none';
  if (hasRange) {
    const span = zone.max - zone.min;
    const medPct = Math.min(95, Math.max(5, ((zone.median - zone.min) / span) * 100));
    const avgPct = Math.min(95, Math.max(5, ((zone.avg - zone.min) / span) * 100));
    document.getElementById('marker-median').style.left = `${medPct}%`;
    document.getElementById('marker-avg').style.left = `${avgPct}%`;
    document.getElementById('bar-min-lbl').textContent = `Min: ${formatShortUSD(zone.min)}`;
    document.getElementById('bar-max-lbl').textContent = `Max: ${formatShortUSD(zone.max)}`;
    const diffPct = ((zone.avg - zone.median) / zone.median) * 100;
    const diffSign = diffPct >= 0 ? '+' : '';
    document.getElementById('span-ratio').textContent = `均值较中位 ${diffSign}${diffPct.toFixed(1)}%`;
  } else {
    document.getElementById('bar-min-lbl').textContent = 'Min: —';
    document.getElementById('bar-max-lbl').textContent = 'Max: —';
    document.getElementById('span-ratio').textContent = '近90天成交列表不足';
  }

  const btn = document.getElementById('add-compare-btn');
  btn.disabled = false;
  renderGrid();
}

// 绑定指标按钮切换
document.querySelectorAll('.metric-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.metric-btn').forEach(b => {
      b.className = 'metric-btn px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white transition';
    });
    btn.className = 'metric-btn px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 text-white transition';
    currentMetric = btn.dataset.metric;
    document.getElementById('legend-title').textContent = `价格热力图例 (${metricLabels[currentMetric]})`;
    renderGrid();
  });
});

// 绑定底图切换
document.querySelectorAll('.tile-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tile-btn').forEach(b => {
      b.className = 'tile-btn px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800';
    });
    btn.className = 'tile-btn px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600 text-white';
    const tileKey = btn.dataset.tile;
    map.removeLayer(baseTileLayer);
    baseTileLayer = createBasemap(tileKey).addTo(map);
  });
});

// 筛选器事件
document.getElementById('region-filter').addEventListener('change', (e) => {
  renderGrid();
  const val = e.target.value;
  if (val !== 'ALL') {
    const sub = HOUSING_GRID_DATA.filter(z => z.region === val);
    if (sub.length > 0) {
      const avgLat = sub.reduce((s, x) => s + x.lat, 0) / sub.length;
      const avgLng = sub.reduce((s, x) => s + x.lng, 0) / sub.length;
      map.flyTo([avgLat, avgLng], 10, { duration: 0.8 });
    }
  } else {
    map.flyTo([34.12, -118.55], 9, { duration: 0.8 });
  }
});

document.getElementById('budget-slider').addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  document.getElementById('budget-label').textContent = val >= 6000000 ? '不限' : formatShortUSD(val);
  renderGrid();
});

document.getElementById('search-input').addEventListener('input', () => renderGrid());
document.getElementById('toggle-labels').addEventListener('change', (e) => {
  showLabels = e.target.checked;
  renderGrid();
});

// 对比列表
document.getElementById('add-compare-btn').addEventListener('click', () => {
  if (!selectedZone) return;
  if (!compareList.find(z => z.id === selectedZone.id)) {
    compareList.push(selectedZone);
    renderCompareTable();
  }
});

document.getElementById('clear-compare').addEventListener('click', () => {
  compareList.length = 0;
  renderCompareTable();
});

function renderCompareTable() {
  document.getElementById('compare-count').textContent = compareList.length;
  const tbody = document.getElementById('compare-tbody');
  if (compareList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-slate-500 font-sans">点击上方按钮将心仪区域加入横向对比</td></tr>';
    return;
  }
  tbody.innerHTML = compareList.map(z => `
    <tr class="hover:bg-slate-900">
      <td class="py-1.5 font-sans font-semibold text-white">${z.name.split(' ')[0]}</td>
      <td class="py-1.5 text-indigo-400 font-bold">${formatShortUSD(z.median)}</td>
      <td class="py-1.5 text-emerald-400">${formatShortUSD(z.avg)}</td>
      <td class="py-1.5 text-slate-300">${formatShortUSD(z.min)}-${formatShortUSD(z.max)}</td>
    </tr>
  `).join('');
}

function applyTheme(theme) {
  const isDay = theme === 'day';
  document.documentElement.setAttribute('data-theme', isDay ? 'day' : 'night');
  const btn = document.getElementById('theme-toggle');
  btn.setAttribute('aria-pressed', isDay ? 'false' : 'true');
  document.getElementById('theme-toggle-icon').textContent = isDay ? '☀' : '☾';
  document.getElementById('theme-toggle-label').textContent = isDay ? '白天模式' : '夜间模式';
  try { localStorage.setItem('la-housing-theme', isDay ? 'day' : 'night'); } catch (e) {}
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'day' ? 'night' : 'day');
});

applyTheme(document.documentElement.getAttribute('data-theme') === 'day' ? 'day' : 'night');

// 默认选中 Arcadia 作为初始展示
renderGrid();
selectZone(HOUSING_GRID_DATA.find(z => z.id === 'SG09'));
