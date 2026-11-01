// LA Area Housing Map：Leaflet 免费底图切换 + 506个网格多边形渲染 + 四维参数动态联动
// 成交数据不写在这里，启动时从 housing_data.json 读入。
let HOUSING_GRID_DATA = [];
let currentMetric = 'median';
let showLabels = true;
let selectedZone = null;
const compareList = [];

const SAFETY_TIERS = {
  1: ['1 非常安定', '公开报道里的暴力犯罪较少，多为安静住宅区或小城。'],
  2: ['2 相对安定', '日常更常见的是财物类案件，暴力犯罪报道不多。'],
  3: ['3 中等', '和洛杉矶盆地的一般城区接近，需要普通的城市防范。'],
  4: ['4 需要留意', '财物犯罪和街头案件的报道明显更多，街区之间差别大。'],
  5: ['5 治安压力大', '暴力犯罪相关报道长期较多，看房时要具体到街区。']
};

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

// 四项价格共用这一套金额分档。中位价大多落在 40 万到 180 万美元，所以这一段分得更细。
const HEAT_STOPS = [
  { max: 400000, color: '#075985', ink: '#ffffff', label: '<$400K' },
  { max: 500000, color: '#0891b2', ink: '#ffffff', label: '$400–500K' },
  { max: 600000, color: '#0f766e', ink: '#ffffff', label: '$500–600K' },
  { max: 700000, color: '#059669', ink: '#ffffff', label: '$600–700K' },
  { max: 800000, color: '#3f6212', ink: '#ffffff', label: '$700–800K' },
  { max: 900000, color: '#84cc16', ink: '#1a2e05', label: '$800–900K' },
  { max: 1000000, color: '#eab308', ink: '#1c1917', label: '$900K–1.0M' },
  { max: 1200000, color: '#9a3412', ink: '#ffffff', label: '$1.0–1.2M' },
  { max: 1400000, color: '#fb923c', ink: '#1c1917', label: '$1.2–1.4M' },
  { max: 1600000, color: '#dc2626', ink: '#ffffff', label: '$1.4–1.6M' },
  { max: 1800000, color: '#e11d48', ink: '#ffffff', label: '$1.6–1.8M' },
  { max: 2200000, color: '#db2777', ink: '#ffffff', label: '$1.8–2.2M' },
  { max: 2800000, color: '#c026d3', ink: '#ffffff', label: '$2.2–2.8M' },
  { max: 3600000, color: '#9333ea', ink: '#ffffff', label: '$2.8–3.6M' },
  { max: 5000000, color: '#6d28d9', ink: '#ffffff', label: '$3.6–5.0M' },
  { max: Infinity, color: '#4c1d95', ink: '#ffffff', label: '≥$5.0M' }
];
const HEAT_EMPTY = { color: '#94a3b8', ink: '#0f172a', label: '无数据' };

function getHeatColor(val) {
  if (val == null || !isFinite(val)) return HEAT_EMPTY.color;
  for (let i = 0; i < HEAT_STOPS.length; i += 1) {
    if (val < HEAT_STOPS[i].max) return HEAT_STOPS[i].color;
  }
  return HEAT_STOPS[HEAT_STOPS.length - 1].color;
}

function renderLegend() {
  const scale = document.getElementById('legend-scale');
  const chips = HEAT_STOPS.map(stop => (
    `<div class="legend-swatch" style="background:${stop.color};color:${stop.ink}">${stop.label}</div>`
  ));
  chips.push(`<div class="legend-swatch span-2" style="background:${HEAT_EMPTY.color};color:${HEAT_EMPTY.ink}">${HEAT_EMPTY.label}</div>`);
  scale.innerHTML = chips.join('');
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
  const safetyVal = document.getElementById('safety-filter').value;
  const uscMax = parseInt(document.getElementById('usc-slider').value, 10);
  const keyword = document.getElementById('search-input').value.trim().toLowerCase();

  HOUSING_GRID_DATA.forEach(zone => {
    if (regionVal !== 'ALL' && zone.region !== regionVal) return;
    if (maxBudget < 6000000 && zone.median > maxBudget) return;
    if (safetyVal !== 'ALL') {
      if (safetyVal.indexOf('LTE') === 0) {
        if (zone.safety > parseInt(safetyVal.slice(3), 10)) return;
      } else if (zone.safety !== parseInt(safetyVal, 10)) return;
    }
    if (uscMax < 120 && zone.uscMin > uscMax) return;
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
      fillOpacity: 0.62
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
      this.setStyle({ weight: 3, fillOpacity: 0.84 });
    });
    rect.on('mouseout', function () {
      const isSelected = selectedZone && selectedZone.id === zone.id;
      this.setStyle({ weight: isSelected ? 3 : 1.5, fillOpacity: 0.62 });
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

function housingNote(zone) {
  const ppsfText = zone.ppsf == null ? '每平方英尺价格未公布' : `每平方英尺均价 $${zone.ppsf}`;
  const hasRange = zone.avg != null && zone.min != null && zone.max != null;
  const rangeText = hasRange
    ? `平均价 ${formatUSD(zone.avg)}，最低价 ${formatUSD(zone.min)}，最高价 ${formatUSD(zone.max)}。平均价与高低价来自该页返回的近 90 天成交。`
    : '近 90 天返回的成交不足以计算平均价、最低价和最高价。';
  return `中位价 ${formatUSD(zone.median)}，${ppsfText}，近三个月成交 ${zone.sales} 套。${rangeText}中位价和每平方英尺价格来自 Redfin 公布值。`;
}

function selectZone(zone) {
  selectedZone = zone;
  document.getElementById('detail-region').textContent = `${zone.region} · 网格编号 ${zone.id}`;
  document.getElementById('detail-name').textContent = zone.name;
  document.getElementById('detail-desc').textContent = zone.desc;
  document.getElementById('detail-shops').textContent = zone.shops || '';
  const tier = SAFETY_TIERS[zone.safety] || ['—', ''];
  document.getElementById('detail-safety').textContent = tier[0];
  document.getElementById('detail-safety-note').textContent = tier[1]
    ? tier[1] + ' 这是根据多年新闻和各地警方公开的案件分布做的相对分级，不是官方排名。'
    : '';
  const driveText = zone.uscMin <= 10
    ? '一般白天开车大约 10 分钟以内。'
    : `一般白天开车大约 ${zone.uscMin} 分钟。`;
  document.getElementById('detail-usc').textContent = driveText + ' 晚高峰往往会更久。这是大概车程，不是导航的实时结果。';
  document.getElementById('housing-note').textContent = housingNote(zone);
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
    document.getElementById('legend-title').textContent = `价格热力图例 ${metricLabels[currentMetric]}`;
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

document.getElementById('safety-filter').addEventListener('change', () => renderGrid());

document.getElementById('usc-slider').addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  document.getElementById('usc-label').textContent = val >= 120 ? '不限' : (val <= 10 ? '10 分钟内' : val + ' 分钟内');
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

function refreshMapSize() {
  requestAnimationFrame(() => {
    map.invalidateSize();
    setTimeout(() => map.invalidateSize(), 60);
  });
}

function setPanelOpen(open) {
  document.getElementById('workspace').classList.toggle('panel-collapsed', !open);
  document.documentElement.classList.remove('panel-start-collapsed');
  const btn = document.getElementById('panel-toggle');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.getElementById('panel-toggle-label').textContent = open ? '收起说明' : '显示说明';
  refreshMapSize();
}

const panelStartsClosed = document.documentElement.classList.contains('panel-start-collapsed');
setPanelOpen(!panelStartsClosed);
document.getElementById('panel-toggle').addEventListener('click', () => {
  const open = document.getElementById('workspace').classList.contains('panel-collapsed');
  setPanelOpen(open);
});

renderLegend();

async function loadHousingData() {
  const response = await fetch('housing_data.json');
  if (!response.ok) throw new Error('无法读取 housing_data.json');
  const database = await response.json();
  HOUSING_GRID_DATA = database.areas || [];
  renderGrid();
  selectZone(HOUSING_GRID_DATA.find(z => z.id === 'SG09'));
}

loadHousingData().catch(() => {
  const name = document.getElementById('detail-name');
  const desc = document.getElementById('detail-desc');
  if (name) name.textContent = '数据未加载';
  if (desc) desc.textContent = '成交数据在 housing_data.json。请用 start_windows.bat 或 start_mac.command 打开。直接双击 index.html 时，浏览器不会读取旁边的 JSON 文件。';
});
