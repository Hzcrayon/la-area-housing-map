// LA Area Housing Map：Leaflet 免费底图切换 + 506个网格多边形渲染 + 总价与每平方英尺热力
// 成交数据不写在这里，启动时从 housing_data.json 读入。
let HOUSING_GRID_DATA = [];
let currentMetric = 'median';
let currentSpan = 3;
let showLabels = true;
let priceLabelsOn = true;
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
  max: '(d) 成交最高价',
  ppsf: '(e) 每平方英尺均价',
  safety: '(f) 治安',
  usc: '(g) 到 USC 车程'
};

const SPAN_LABELS = { 3: '近三个月', 6: '近六个月', 9: '近九个月', 12: '近十二个月' };

function spanValue(zone, field) {
  const source = currentSpan === 3 ? zone : (zone['m' + currentSpan] || {});
  const val = source[field];
  if (val == null || !isFinite(val)) return null;
  return val;
}

function valueAtSpan(zone, span, field) {
  const source = span === 3 ? zone : (zone['m' + span] || {});
  const val = source[field];
  if (val == null || !isFinite(val)) return null;
  return val;
}

const CHART_SPANS = [3, 6, 9, 12];
const CHART_SERIES = [
  { field: 'min', color: '#38bdf8', name: '最低价' },
  { field: 'max', color: '#fb7185', name: '最高价' },
  { field: 'avg', color: '#34d399', name: '平均价' },
  { field: 'median', color: '#818cf8', name: '中位价' }
];
let chartHoverSpan = null;
let chartXs = null;
let chartWidth = 320;

function chartBox() {
  const svg = document.getElementById('price-chart-svg');
  const displayed = svg ? Math.round(svg.getBoundingClientRect().width) : 0;
  const width = Math.max(220, displayed || 320);
  const height = Math.round(Math.min(250, Math.max(148, 118 + width * 0.12)));
  return { width, height };
}

function renderPriceChart(zone) {
  const svg = document.getElementById('price-chart-svg');
  if (!svg) return;
  const box = chartBox();
  const width = box.width;
  const height = box.height;
  chartWidth = width;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.height = height + 'px';
  const pad = { l: 52, r: 16, t: 12, b: 28 };
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  chartXs = {};
  CHART_SPANS.forEach((span, index) => {
    chartXs[span] = pad.l + (plotW * index) / (CHART_SPANS.length - 1);
  });

  const samples = [];
  CHART_SERIES.forEach((series) => {
    CHART_SPANS.forEach((span) => {
      const value = zone ? valueAtSpan(zone, span, series.field) : null;
      if (value != null) samples.push(value);
    });
  });
  let yMin = 0;
  let yMax = 1;
  if (samples.length) {
    yMin = Math.min.apply(null, samples);
    yMax = Math.max.apply(null, samples);
    if (yMin === yMax) {
      yMin = yMin * 0.85;
      yMax = yMax * 1.15 || 1;
    }
    const padY = (yMax - yMin) * 0.14;
    yMin = Math.max(0, yMin - padY);
    yMax += padY;
  }
  const yOf = (value) => pad.t + plotH - ((value - yMin) / (yMax - yMin)) * plotH;
  const focus = chartHoverSpan || currentSpan;
  const parts = [
    `<line class="axis" x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + plotH}"></line>`,
    `<line class="axis" x1="${pad.l}" y1="${pad.t + plotH}" x2="${width - pad.r}" y2="${pad.t + plotH}"></line>`
  ];
  if (samples.length) {
    [0, 0.5, 1].forEach((tick) => {
      const value = yMin + (yMax - yMin) * tick;
      const y = yOf(value);
      parts.push(`<line class="grid" x1="${pad.l}" y1="${y}" x2="${width - pad.r}" y2="${y}"></line>`);
      parts.push(`<text class="tick" x="${pad.l - 6}" y="${y + 3}" text-anchor="end">${formatShortUSD(value)}</text>`);
    });
  } else {
    parts.push(`<text class="tick" x="${pad.l + plotW / 2}" y="${pad.t + plotH / 2}" text-anchor="middle">尚无价格点</text>`);
  }
  CHART_SPANS.forEach((span) => {
    parts.push(`<text class="tick" x="${chartXs[span]}" y="${height - 8}" text-anchor="middle">${span}月</text>`);
  });
  const guideX = chartXs[focus];
  parts.push(`<line id="chart-guide" class="guide" x1="${guideX}" y1="${pad.t}" x2="${guideX}" y2="${pad.t + plotH}"></line>`);
  CHART_SERIES.forEach((series) => {
    const pts = CHART_SPANS.map((span) => ({ span, value: zone ? valueAtSpan(zone, span, series.field) : null }));
    let segment = [];
    const flush = () => {
      if (segment.length >= 2) {
        parts.push(`<polyline fill="none" stroke="${series.color}" stroke-width="2" points="${segment.join(' ')}"></polyline>`);
      }
      segment = [];
    };
    pts.forEach((point) => {
      if (point.value == null) {
        flush();
        return;
      }
      segment.push(`${chartXs[point.span]},${yOf(point.value)}`);
    });
    flush();
    pts.forEach((point) => {
      if (point.value == null) return;
      const marked = point.span === focus;
      const radius = marked ? 5 : 3.2;
      const ring = marked ? ` stroke="#ffffff" stroke-width="1.5"` : '';
      parts.push(`<circle cx="${chartXs[point.span]}" cy="${yOf(point.value)}" r="${radius}" fill="${series.color}"${ring}></circle>`);
    });
  });
  svg.innerHTML = parts.join('');
  const readout = document.getElementById('price-chart-readout');
  const bits = CHART_SERIES.map((series) => {
    const value = zone ? valueAtSpan(zone, focus, series.field) : null;
    return `${series.name} ${value == null ? '—' : formatShortUSD(value)}`;
  });
  readout.textContent = `${focus} 个月：${bits.join('　')}`;
}

document.getElementById('price-chart-svg').addEventListener('mousemove', (event) => {
  if (!chartXs || !selectedZone) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * chartWidth;
  let best = currentSpan;
  let bestDist = Infinity;
  CHART_SPANS.forEach((span) => {
    const dist = Math.abs(chartXs[span] - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = span;
    }
  });
  if (chartHoverSpan === best) return;
  chartHoverSpan = best;
  renderPriceChart(selectedZone);
});

document.getElementById('price-chart-svg').addEventListener('mouseleave', () => {
  if (chartHoverSpan == null) return;
  chartHoverSpan = null;
  if (selectedZone) renderPriceChart(selectedZone);
});

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
// 每平方英尺均价大多在 400 到 800 美元，所以这一段按 50 美元一档；两端再放宽。
const PPSF_STOPS = [
  { max: 300, color: '#075985', ink: '#ffffff', label: '<$300' },
  { max: 400, color: '#0891b2', ink: '#ffffff', label: '$300–400' },
  { max: 450, color: '#0e7490', ink: '#ffffff', label: '$400–450' },
  { max: 500, color: '#0f766e', ink: '#ffffff', label: '$450–500' },
  { max: 550, color: '#059669', ink: '#ffffff', label: '$500–550' },
  { max: 600, color: '#3f6212', ink: '#ffffff', label: '$550–600' },
  { max: 650, color: '#4d7c0f', ink: '#ffffff', label: '$600–650' },
  { max: 700, color: '#65a30d', ink: '#ffffff', label: '$650–700' },
  { max: 750, color: '#84cc16', ink: '#1a2e05', label: '$700–750' },
  { max: 800, color: '#eab308', ink: '#1c1917', label: '$750–800' },
  { max: 900, color: '#f59e0b', ink: '#1c1917', label: '$800–900' },
  { max: 1000, color: '#f97316', ink: '#1c1917', label: '$900–1,000' },
  { max: 1200, color: '#dc2626', ink: '#ffffff', label: '$1,000–1,200' },
  { max: 1500, color: '#e11d48', ink: '#ffffff', label: '$1,200–1,500' },
  { max: 1800, color: '#9333ea', ink: '#ffffff', label: '$1,500–1,800' },
  { max: Infinity, color: '#4c1d95', ink: '#ffffff', label: '≥$1,800' }
];
const SAFETY_STOPS = [
  { max: 2, color: '#166534', ink: '#ffffff', label: '1 非常安定' },
  { max: 3, color: '#65a30d', ink: '#1a2e05', label: '2 相对安定' },
  { max: 4, color: '#eab308', ink: '#1c1917', label: '3 中等' },
  { max: 5, color: '#ea580c', ink: '#ffffff', label: '4 需要留意' },
  { max: Infinity, color: '#b91c1c', ink: '#ffffff', label: '5 治安压力大' }
];
const USC_STOPS = [
  { max: 16, color: '#0e7490', ink: '#ffffff', label: '≤15 分钟' },
  { max: 31, color: '#0f766e', ink: '#ffffff', label: '16–30 分钟' },
  { max: 46, color: '#3f6212', ink: '#ffffff', label: '31–45 分钟' },
  { max: 61, color: '#84cc16', ink: '#1a2e05', label: '46–60 分钟' },
  { max: 76, color: '#eab308', ink: '#1c1917', label: '61–75 分钟' },
  { max: 91, color: '#f97316', ink: '#1c1917', label: '76–90 分钟' },
  { max: 106, color: '#dc2626', ink: '#ffffff', label: '91–105 分钟' },
  { max: Infinity, color: '#7e22ce', ink: '#ffffff', label: '≥106 分钟' }
];
const HEAT_EMPTY = { color: '#94a3b8', ink: '#0f172a', label: '无数据' };

function isCategoryMetric(metric) {
  return metric === 'safety' || metric === 'usc';
}

function activeHeatStops() {
  if (currentMetric === 'ppsf') return PPSF_STOPS;
  if (currentMetric === 'safety') return SAFETY_STOPS;
  if (currentMetric === 'usc') return USC_STOPS;
  return HEAT_STOPS;
}

function metricValueOf(zone) {
  if (currentMetric === 'safety') {
    return zone.safety == null || !isFinite(zone.safety) ? null : zone.safety;
  }
  if (currentMetric === 'usc') {
    return zone.uscMin == null || !isFinite(zone.uscMin) ? null : zone.uscMin;
  }
  return spanValue(zone, currentMetric);
}

function legendHeading() {
  if (currentMetric === 'safety') return '治安地图图例';
  if (currentMetric === 'usc') return '到 USC 车程图例';
  return `价格热力图例 ${metricLabels[currentMetric]}`;
}

function getHeatColor(val) {
  if (val == null || !isFinite(val)) return HEAT_EMPTY.color;
  const stops = activeHeatStops();
  for (let i = 0; i < stops.length; i += 1) {
    if (val < stops[i].max) return stops[i].color;
  }
  return stops[stops.length - 1].color;
}

function formatMetricShort(val) {
  if (val == null || !isFinite(val)) return '—';
  if (currentMetric === 'ppsf') return '$' + Math.round(val);
  if (currentMetric === 'safety') return String(val);
  if (currentMetric === 'usc') return val + '分';
  return formatShortUSD(val);
}

function labelIconSize() {
  if (currentMetric === 'safety') return { size: [22, 18], anchor: [11, 9] };
  if (currentMetric === 'usc') return { size: [46, 18], anchor: [23, 9] };
  return { size: [54, 18], anchor: [27, 9] };
}

function renderLegend() {
  const scale = document.getElementById('legend-scale');
  document.getElementById('legend-title').textContent = legendHeading();
  const chips = activeHeatStops().map(stop => (
    `<div class="legend-swatch" style="background:${stop.color};color:${stop.ink}">${stop.label}</div>`
  ));
  if (!isCategoryMetric(currentMetric)) {
    chips.push(`<div class="legend-swatch span-2" style="background:${HEAT_EMPTY.color};color:${HEAT_EMPTY.ink}">${HEAT_EMPTY.label}</div>`);
  }
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
  const safetyVal = document.getElementById('safety-filter').value;
  const uscMax = parseInt(document.getElementById('usc-slider').value, 10);
  const keyword = document.getElementById('search-input').value.trim().toLowerCase();

  HOUSING_GRID_DATA.forEach(zone => {
    if (regionVal !== 'ALL' && zone.region !== regionVal) return;
    if (priceCapHides(zone) || priceQueryHides(zone)) return;
    if (safetyVal !== 'ALL') {
      if (safetyVal.indexOf('LTE') === 0) {
        if (zone.safety > parseInt(safetyVal.slice(3), 10)) return;
      } else if (zone.safety !== parseInt(safetyVal, 10)) return;
    }
    if (uscMax < 120 && zone.uscMin > uscMax) return;
    if (keyword && !zone.name.toLowerCase().includes(keyword) && !zone.id.toLowerCase().includes(keyword)) return;

    const metricValue = metricValueOf(zone);
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
          <div class="flex justify-between"><span class="text-slate-400">(a) 成交中位价:</span><span class="text-indigo-300 font-bold">${formatUSD(spanValue(zone, 'median'))}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">(b) 成交平均值:</span><span class="text-emerald-300 font-bold">${formatUSD(spanValue(zone, 'avg'))}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">(c) 成交最低价:</span><span class="text-sky-300 font-bold">${formatUSD(spanValue(zone, 'min'))}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">(d) 成交最高价:</span><span class="text-rose-300 font-bold">${formatUSD(spanValue(zone, 'max'))}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">(e) 每平方英尺:</span><span class="text-amber-300 font-bold">${spanValue(zone, 'ppsf') == null ? '—' : '$' + spanValue(zone, 'ppsf')}</span></div>
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
      const iconBox = labelIconSize();
      const labelMarker = L.marker([zone.lat, zone.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div class="grid-label">${formatMetricShort(metricValue)}</div>`,
          iconSize: iconBox.size,
          iconAnchor: iconBox.anchor
        }),
        interactive: false
      });
      labelLayerGroup.addLayer(labelMarker);
    }
  });
}

function housingNote(zone) {
  const median = spanValue(zone, 'median');
  const avg = spanValue(zone, 'avg');
  const min = spanValue(zone, 'min');
  const max = spanValue(zone, 'max');
  const sales = spanValue(zone, 'sales');
  const ppsf = spanValue(zone, 'ppsf');
  const windowName = SPAN_LABELS[currentSpan];
  if (median == null && avg == null && min == null && max == null && sales == null && ppsf == null) {
    return `${windowName}的中位价、平均价、最低价、最高价、成交套数和每平方英尺均价都还没有写入。`;
  }
  const ppsfText = ppsf == null ? '每平方英尺价格未公布' : `每平方英尺均价 $${ppsf}`;
  const hasRange = avg != null && min != null && max != null;
  const rangeText = hasRange
    ? `平均价 ${formatUSD(avg)}，最低价 ${formatUSD(min)}，最高价 ${formatUSD(max)}。平均价与高低价来自该页返回的${windowName}成交。`
    : `${windowName}返回的成交不足以计算平均价、最低价和最高价。`;
  const salesText = sales == null ? '成交套数未公布' : `${windowName}成交 ${sales} 套`;
  return `中位价 ${formatUSD(median)}，${ppsfText}，${salesText}。${rangeText}中位价和每平方英尺价格来自 Redfin 公布值。`;
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
  document.getElementById('sales-caption').textContent = SPAN_LABELS[currentSpan] + '成交';
  const redfinLink = document.getElementById('redfin-link');
  if (zone.url) {
    redfinLink.href = zone.url;
    redfinLink.classList.remove('hidden');
  } else {
    redfinLink.href = '#';
    redfinLink.classList.add('hidden');
  }

  const median = spanValue(zone, 'median');
  const avg = spanValue(zone, 'avg');
  const min = spanValue(zone, 'min');
  const max = spanValue(zone, 'max');
  const sales = spanValue(zone, 'sales');
  const ppsf = spanValue(zone, 'ppsf');
  document.getElementById('val-median').textContent = formatUSD(median);
  document.getElementById('val-avg').textContent = formatUSD(avg);
  document.getElementById('val-min').textContent = formatUSD(min);
  document.getElementById('val-max').textContent = formatUSD(max);

  document.getElementById('val-sales').textContent = sales == null ? '—' : `${sales} 套`;
  document.getElementById('val-ppsf').textContent = ppsf == null ? '—' : `$${ppsf} /sqft`;
  document.getElementById('val-code').textContent = zone.id;

  const hasRange = min != null && max != null && avg != null && max > min;
  document.getElementById('marker-median').style.display = hasRange ? '' : 'none';
  document.getElementById('marker-avg').style.display = hasRange ? '' : 'none';
  if (hasRange) {
    const span = max - min;
    const medPct = Math.min(95, Math.max(5, ((median - min) / span) * 100));
    const avgPct = Math.min(95, Math.max(5, ((avg - min) / span) * 100));
    document.getElementById('marker-median').style.left = `${medPct}%`;
    document.getElementById('marker-avg').style.left = `${avgPct}%`;
    document.getElementById('bar-min-lbl').textContent = `Min: ${formatShortUSD(min)}`;
    document.getElementById('bar-max-lbl').textContent = `Max: ${formatShortUSD(max)}`;
    const diffPct = ((avg - median) / median) * 100;
    const diffSign = diffPct >= 0 ? '+' : '';
    document.getElementById('span-ratio').textContent = `均值较中位 ${diffSign}${diffPct.toFixed(1)}%`;
  } else {
    document.getElementById('bar-min-lbl').textContent = 'Min: —';
    document.getElementById('bar-max-lbl').textContent = 'Max: —';
    document.getElementById('span-ratio').textContent = currentSpan === 3 ? '近90天成交列表不足' : '这一周期还没有写入';
  }

  const btn = document.getElementById('add-compare-btn');
  btn.disabled = false;
  renderPriceChart(zone);
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
    const labelBox = document.getElementById('toggle-labels');
    if (isCategoryMetric(currentMetric)) {
      showLabels = false;
      labelBox.checked = false;
    } else {
      showLabels = priceLabelsOn;
      labelBox.checked = priceLabelsOn;
    }
    renderLegend();
    renderGrid();
  });
});

document.querySelectorAll('.span-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.span-btn').forEach(b => {
      b.className = 'span-btn px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white transition';
    });
    btn.className = 'span-btn px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 text-white transition';
    currentSpan = parseInt(btn.dataset.span, 10);
    renderGrid();
    renderCompareTable();
    if (selectedZone) selectZone(selectedZone);
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

const PRICE_CAPS = {
  median: { slider: 'budget-slider', label: 'budget-label', input: 'budget-cap-input', max: 6000000, editable: true },
  avg: { slider: 'avg-cap-slider', label: 'avg-cap-label', input: 'avg-cap-input', max: 10000000, editable: true },
  min: { slider: 'min-cap-slider', label: 'min-cap-label', input: 'min-cap-input', max: 3000000, editable: true },
  max: { slider: 'max-cap-slider', label: 'max-cap-label', input: 'max-cap-input', max: 20000000, editable: true }
};
const customCaps = { median: null, avg: null, min: null, max: null };

function readCap(field) {
  const spec = PRICE_CAPS[field];
  return parseInt(document.getElementById(spec.slider).value, 10);
}

function activeCap(field) {
  if (customCaps[field] != null) return customCaps[field];
  const spec = PRICE_CAPS[field];
  const cap = readCap(field);
  if (cap >= spec.max) return null;
  return cap;
}

function paintCapLabel(field) {
  const spec = PRICE_CAPS[field];
  const label = document.getElementById(spec.label);
  if (!label) return;
  if (customCaps[field] != null) {
    label.textContent = formatShortUSD(customCaps[field]);
    return;
  }
  const val = readCap(field);
  label.textContent = val >= spec.max ? '不限' : formatShortUSD(val);
}

function priceCapHides(zone) {
  const fields = ['median', 'avg', 'min', 'max'];
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    const cap = activeCap(field);
    if (cap == null) continue;
    const price = spanValue(zone, field);
    if (price == null || price > cap) return true;
  }
  return false;
}

function openCapEditor(field) {
  const spec = PRICE_CAPS[field];
  if (!spec.editable) return;
  const label = document.getElementById(spec.label);
  const input = document.getElementById(spec.input);
  const current = customCaps[field] != null ? customCaps[field] : activeCap(field);
  input.value = current == null ? '' : String(current);
  label.classList.add('hidden');
  input.classList.remove('hidden');
  input.focus();
  input.select();
}

function commitCapEditor(field, cancel) {
  const spec = PRICE_CAPS[field];
  const label = document.getElementById(spec.label);
  const input = document.getElementById(spec.input);
  if (!cancel) {
    const raw = input.value.trim();
    if (raw === '') {
      customCaps[field] = null;
      document.getElementById(spec.slider).value = String(spec.max);
    } else {
      const num = Number(raw);
      if (isFinite(num) && num > 0) customCaps[field] = num;
    }
  }
  input.classList.add('hidden');
  label.classList.remove('hidden');
  paintCapLabel(field);
  renderGrid();
}

function readQueryBound(id) {
  const raw = document.getElementById(id).value.trim();
  if (raw === '') return null;
  const num = Number(raw);
  return isFinite(num) ? num : null;
}

function priceQueryHides(zone) {
  const mode = document.getElementById('price-query-mode').value;
  if (mode === 'off') return false;
  const field = document.getElementById('price-query-metric').value;
  const price = spanValue(zone, field);
  if (price == null || !isFinite(price)) return true;
  const left = readQueryBound('price-query-a');
  const right = readQueryBound('price-query-b');
  if (mode === 'lt') return left != null && !(price < left);
  if (mode === 'gt') return left != null && !(price > left);
  if (mode === 'between') {
    if (left == null && right == null) return false;
    let lo = left;
    let hi = right;
    if (lo != null && hi != null && lo > hi) {
      const swap = lo;
      lo = hi;
      hi = swap;
    }
    if (lo != null && price < lo) return true;
    if (hi != null && price > hi) return true;
  }
  return false;
}

function syncPriceQueryInputs() {
  const mode = document.getElementById('price-query-mode').value;
  const field = document.getElementById('price-query-metric').value;
  const showA = mode === 'lt' || mode === 'gt' || mode === 'between';
  const showB = mode === 'between';
  const perFoot = field === 'ppsf';
  document.getElementById('price-query-a').classList.toggle('hidden', !showA);
  document.getElementById('price-query-b').classList.toggle('hidden', !showB);
  document.getElementById('price-query-and').classList.toggle('hidden', !showB);
  ['price-query-a', 'price-query-b'].forEach((id) => {
    const input = document.getElementById(id);
    input.step = perFoot ? '10' : '10000';
    input.placeholder = perFoot ? '美元/平方英尺' : '金额';
  });
}

document.querySelectorAll('.price-cap').forEach((slider) => {
  slider.addEventListener('input', () => {
    const field = slider.getAttribute('data-field');
    customCaps[field] = null;
    paintCapLabel(field);
    renderGrid();
  });
});

['median', 'avg', 'min', 'max'].forEach((field) => {
  const spec = PRICE_CAPS[field];
  document.getElementById(spec.label).addEventListener('click', () => openCapEditor(field));
  const input = document.getElementById(spec.input);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') input.blur();
    if (event.key === 'Escape') {
      input.dataset.cancel = '1';
      input.blur();
    }
  });
  input.addEventListener('blur', () => {
    const cancel = input.dataset.cancel === '1';
    input.dataset.cancel = '';
    commitCapEditor(field, cancel);
  });
});

['price-query-metric', 'price-query-mode'].forEach((id) => {
  document.getElementById(id).addEventListener('change', () => {
    syncPriceQueryInputs();
    renderGrid();
  });
});
['price-query-a', 'price-query-b'].forEach((id) => {
  document.getElementById(id).addEventListener('input', () => renderGrid());
});
syncPriceQueryInputs();

document.getElementById('safety-filter').addEventListener('change', () => renderGrid());

document.getElementById('usc-slider').addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  document.getElementById('usc-label').textContent = val >= 120 ? '不限' : (val <= 10 ? '10 分钟内' : val + ' 分钟内');
  renderGrid();
});

document.getElementById('search-input').addEventListener('input', () => renderGrid());
document.getElementById('toggle-labels').addEventListener('change', (e) => {
  showLabels = e.target.checked;
  if (!isCategoryMetric(currentMetric)) priceLabelsOn = showLabels;
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
      <td class="py-1.5 text-indigo-400 font-bold">${formatShortUSD(spanValue(z, 'median'))}</td>
      <td class="py-1.5 text-emerald-400">${formatShortUSD(spanValue(z, 'avg'))}</td>
      <td class="py-1.5 text-slate-300">${formatShortUSD(spanValue(z, 'min'))}-${formatShortUSD(spanValue(z, 'max'))}</td>
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
  if (open) requestAnimationFrame(() => renderPriceChart(selectedZone));
}

const panelStartsClosed = document.documentElement.classList.contains('panel-start-collapsed');
setPanelOpen(!panelStartsClosed);
document.getElementById('panel-toggle').addEventListener('click', () => {
  const open = document.getElementById('workspace').classList.contains('panel-collapsed');
  setPanelOpen(open);
});

function panelLimits() {
  const viewport = window.innerWidth;
  const overlay = viewport <= 800;
  const min = overlay ? 260 : 300;
  const max = overlay
    ? Math.max(min, viewport - 8)
    : Math.max(min, Math.min(1280, viewport - 200));
  return { min: Math.min(min, max), max };
}

function panelLayoutName(width) {
  if (width < 360) return 'stack';
  if (width >= 560) return 'row';
  return 'grid';
}

function applyPanelWidth(px) {
  const limits = panelLimits();
  const width = Math.max(limits.min, Math.min(limits.max, px));
  const panel = document.getElementById('detail-panel');
  panel.style.width = width + 'px';
  panel.dataset.layout = panelLayoutName(width);
  try { localStorage.setItem('la-housing-panel-width', String(width)); } catch (e) {}
  if (document.getElementById('price-chart-svg')) renderPriceChart(selectedZone);
  return width;
}

let initialPanelWidth = 384;
try {
  const savedWidth = parseInt(localStorage.getItem('la-housing-panel-width'), 10);
  const limits = panelLimits();
  if (savedWidth >= limits.min && savedWidth <= limits.max) initialPanelWidth = savedWidth;
} catch (e) {}
applyPanelWidth(initialPanelWidth);
window.addEventListener('resize', () => {
  const workspace = document.getElementById('workspace');
  if (workspace.classList.contains('panel-collapsed') || document.documentElement.classList.contains('panel-start-collapsed')) return;
  applyPanelWidth(document.getElementById('detail-panel').getBoundingClientRect().width);
});

const panelResizer = document.getElementById('panel-resizer');
panelResizer.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  try { panelResizer.setPointerCapture(event.pointerId); } catch (e) {}
  panelResizer.classList.add('dragging');
  const startX = event.clientX;
  const startWidth = document.getElementById('detail-panel').getBoundingClientRect().width;
  const previousUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = 'none';

  function stopDrag() {
    panelResizer.removeEventListener('pointermove', onMove);
    panelResizer.removeEventListener('pointerup', stopDrag);
    panelResizer.removeEventListener('pointercancel', stopDrag);
    panelResizer.classList.remove('dragging');
    document.body.style.userSelect = previousUserSelect;
    if (panelResizer.hasPointerCapture(event.pointerId)) {
      panelResizer.releasePointerCapture(event.pointerId);
    }
    refreshMapSize();
  }

  function onMove(moveEvent) {
    const limits = panelLimits();
    const next = startWidth + (startX - moveEvent.clientX);
    applyPanelWidth(next);
    refreshMapSize();
  }

  panelResizer.addEventListener('pointermove', onMove);
  panelResizer.addEventListener('pointerup', stopDrag);
  panelResizer.addEventListener('pointercancel', stopDrag);
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
