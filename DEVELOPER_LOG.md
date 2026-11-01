# 开发者日志 / Developer Log

**项目 / Project:** LA Area Housing Map  
**中文名 / Chinese name:** LA 周边住房地图

**当前版本 / Current version:** 1.3  
**页面入口 / Page entry:** `index.html`（标题、页眉徽章与 `<meta name="application-version">` 均为 `1.3`）  
**日志文件 / This file:** `DEVELOPER_LOG.md`

以后每一次功能、数据或底图更新，都要在本文第 3 节追加一条记录，并把 `index.html` 里的版本号改成同一个号。页面标题、页眉上的 `vX.Y` 徽章，以及 `application-version`，必须和这里的当前版本一致。

After every later change to features, data, or basemaps, append an entry in section 3 of this file and set the version in `index.html` to the same number. The page title, the header `vX.Y` badge, and `application-version` must match the current version recorded here.

---

## 1. 任务与功能概述 / Task and Features

### 中文

这个网站用来查看大洛杉矶到 Santa Barbara 一带的住房成交价格。地图以洛杉矶为中心，向西北覆盖 Santa Barbara，向东南覆盖北橙县，一共 78 个矩形网格。每个网格带有成交中位价、成交平均值、成交最低价、成交最高价，以及近 90 天成交量、每平方英尺均价和一段区域说明。

打开页面后，视野停在北纬 34.12、西经 118.55，缩放级别 9。右侧详情默认停在 Arcadia（亚凯迪亚，网格 `SGV-09`）。地图可以在 7 到 16 级之间缩放和拖动。

**四维价格切换。** 顶栏有四个按钮：(a) 成交中位价、(b) 成交平均值、(c) 成交最低价、(d) 成交最高价。点其中一项后，每个格子的填充色和格子上的短价格标签都改成这一项。左下角图例标题会写成当前指标。颜色分五档：低于 90 万美元为翠绿，90 万到 140 万美元为金黄，140 万到 220 万美元为橙色，220 万到 350 万美元为红色，高于 350 万美元为紫罗兰。

**底图切换。** 地图右上角有四种免费底图，不需要 API Key：

- 清爽街景：Esri 世界街道图，能看到道路、城市名和地形。
- 深色热力：Esri 深灰画布，上面再叠一层城市与边界标注。全景缩放时道路较淡，价格色块更醒目；放大后路网更清楚。
- OSM标准：OpenStreetMap 官方街道图。
- 卫星地形：Esri 卫星影像。

当前选中的底图按钮为靛蓝色。

**白天 / 夜间。** 顶栏有「白天模式 / 夜间模式」按钮。打开页面时是夜间：顶栏、侧栏、图例和弹窗都是深色，和原来的界面一致。点「白天模式」后，这些面板换成白底浅灰，文字改为深色，价格数字仍用靛蓝、绿色、天蓝和玫红区分。网格上的价格标签在白天是白底深字。地图底图本身不跟着翻转。再点「夜间模式」回到深色。选择会记在浏览器里，下次打开仍是上次的模式。

**分区筛选。** 顶栏下拉菜单可以只看某一个走廊：Santa Barbara（10 格）、Ventura / 101 走廊（10 格）、LA 西区与海滨（11 格）、圣费尔南多谷（10 格）、LA 中心城区（7 格）、圣盖博谷（14 格）、南湾（8 格）、北橙县 / 尔湾周边（8 格）。选中后地图飞到该走廊中心并放大到 10 级。选回「全部走廊区域」则回到最初的全景。

**中位价上限。** 滑杆从 60 万美元到 600 万美元，每步 10 万美元。拖到最右端显示「不限」，全部网格都保留。设得更低时，成交中位价高于该上限的网格会被藏起来。

**搜索。** 在搜索框输入城市、区名或网格编号的一部分，例如 `Arcadia` 或 `SGV-09`。名称和编号都不区分大小写，不匹配的网格会消失。

**网格标签。** 左下角「显示网格标签」默认勾选。勾选时，每个格子中心有一块深色短标签，例如 `$1.95M`。取消勾选后标签消失，只留下色块。

**悬停、点选和弹窗。** 鼠标移上格子时边框变粗、填充更实。点一下格子，右侧换成该区详情，格子边框变为白色。再点格子会弹出深色卡片，同时列出四项成交价。

**右侧详情。** 详情含走廊名、网格编号、中英文区名和一段说明；四张价格卡；一条从最低价到最高价的色带，白线标中位价、绿线标平均价，并写出均值相对中位价高多少；底部还有近 90 天成交量、每平方英尺均价和网格编号。

**候选对比。** 点「加入下方候选对比列表」，当前区会进入右下角表格，列出区块名、中位价、平均价和最低到最高的区间。同一区不会重复加入。点「清空」会清空表格。未选中任何区时，加入按钮是灰色的。

### English

This site shows closed-home prices from central Los Angeles out to Santa Barbara. The map is centered on Los Angeles, reaches Santa Barbara to the northwest, and reaches northern Orange County to the southeast. It is divided into 78 rectangular cells. Each cell carries a median sale price, an average sale price, a low, a high, a trailing-90-day sales count, a price per square foot, and a short area note.

On open, the view sits at latitude 34.12, longitude -118.55, zoom 9. The detail panel opens on Arcadia (`SGV-09`). The map can be panned and zoomed from level 7 through 16.

**Four price metrics.** The header has four buttons: (a) median, (b) average, (c) minimum, and (d) maximum. Choosing one repaints every cell and rewrites the short price tag on that metric. The legend title follows the same choice. Color breaks are: under $900K green, $900K to $1.4M gold, $1.4M to $2.2M orange, $2.2M to $3.5M red, and above $3.5M violet.

**Basemap switcher.** Four free basemaps sit at the map’s upper right. None of them needs an API key:

- Clean streets: Esri World Street Map, with roads, place names, and terrain.
- Dark heat: Esri’s dark gray canvas plus a label overlay. At the wide view, roads stay faint so the price colors read clearly; streets become easier to see when zoomed in.
- OSM standard: the official OpenStreetMap street tiles.
- Satellite terrain: Esri World Imagery.

The active basemap button is indigo.

**Day and night.** The header has a Day / Night button. The page opens in night mode: header, sidebar, legend, and popups stay dark, matching the original interface. Day mode turns those panels white and light gray, with dark text. Price figures stay indigo, green, sky, and rose so they can still be told apart. Cell price tags become white chips with dark type. The map basemap itself does not invert. Choosing Night returns to the dark interface. The choice is stored in the browser and kept on the next visit.

**Corridor filter.** The header menu can limit the map to one corridor: Santa Barbara (10 cells), Ventura / US-101 (10), LA Westside and coast (11), San Fernando Valley (10), Central LA (7), San Gabriel Valley (14), South Bay (8), or northern Orange County / Irvine (8). The map then flies to that corridor at zoom 10. Choosing all corridors returns to the original wide view.

**Median cap.** The slider runs from $600K to $6M in $100K steps. The right end is labeled unlimited and keeps every cell. A lower cap hides cells whose median is above that cap.

**Search.** Typing part of a city name, neighborhood, or cell id, such as `Arcadia` or `SGV-09`, hides cells that do not match. Matching ignores case and checks both the name and the id.

**Cell labels.** “显示网格标签” is on by default. Each cell then shows a dark tag such as `$1.95M`. Turning it off leaves only the colored cells.

**Hover, select, and popup.** Hovering a cell thickens its outline and deepens the fill. Clicking it loads that area in the side panel and turns the outline white. Clicking again opens a dark popup with all four prices.

**Detail panel.** The panel shows the corridor, cell id, bilingual name, and description; four price cards; a bar from the low to the high, with a white mark for the median and a green mark for the average, plus how far the average sits above the median; and the 90-day sales count, price per square foot, and cell id.

**Comparison list.** “加入下方候选对比列表” adds the current area to the table at the lower right: name, median, average, and low-to-high range. The same cell is not added twice. “清空” clears the table. The add button stays disabled until a cell is selected.

---

## 2. 代码结构说明 / Code Structure

### 中文

这是一个纯静态网站，没有构建步骤，也没有后端。浏览器按顺序加载 Leaflet、`data.js`、`app.js`。

| 文件 | 作用 |
|---|---|
| `index.html` | 页面骨架。顶栏放指标按钮、白天/夜间切换、走廊筛选、中位价滑杆和搜索框；中间是地图、底图开关和图例；右侧是详情和对比表。样式用 Tailwind CDN，地图用 Leaflet 1.9.4。标题、页眉徽章和 `application-version` 都写着当前版本 `1.3`。项目名称是 LA Area Housing Map。 |
| `data.js` | 声明 `HOUSING_GRID_DATA`，共 78 条。每条有 `id`、`name`、`region`、中心点 `lat`/`lng`、半宽 `dLat`/`dLng`、`median`、`avg`、`min`、`max`、`sales`、`ppsf` 和 `desc`。改价格或加网格只需要改这个文件。 |
| `app.js` | 地图初始化、四套免费瓦片、格子绘制、筛选、点选详情、对比表，以及白天/夜间切换。`createBasemap()` 按按钮创建单层或多层瓦片。深色底图是深灰底加标注层。 |
| `start_windows.bat` | Windows 启动脚本。有 Python 时在 8080 端口开本地服务并打开浏览器；没有 Python 时直接打开 `index.html`。 |
| `start_mac.command` | macOS / Linux 启动脚本。有 `python3` 时同样使用 8080 端口；否则直接打开 `index.html`。 |
| `README.md` | 给使用者的简短中文说明：文件清单和两种打开方式。 |
| `DEVELOPER_LOG.md` | 本开发者日志。记录功能、文件职责和版本。以后的更新写在这里。 |

### English

This is a static site. There is no build step and no backend. The browser loads Leaflet, then `data.js`, then `app.js`.

| File | Role |
|---|---|
| `index.html` | Page shell. The header holds the metric buttons, day/night switch, corridor filter, median slider, and search box. The center holds the map, basemap switcher, and legend. The right side holds the detail panel and comparison table. Styling comes from the Tailwind CDN. The map library is Leaflet 1.9.4. The title, header badge, and `application-version` all read `1.3`. The project name is LA Area Housing Map. |
| `data.js` | Declares `HOUSING_GRID_DATA`, 78 records. Each record has `id`, `name`, `region`, center `lat`/`lng`, half-size `dLat`/`dLng`, `median`, `avg`, `min`, `max`, `sales`, `ppsf`, and `desc`. Price edits and new cells belong in this file. |
| `app.js` | Map setup, the four free tile sources, cell drawing, filters, selection, the comparison table, and the day/night switch. `createBasemap()` builds one tile layer or a group. The dark style stacks a dark gray base under a label layer. |
| `start_windows.bat` | Windows launcher. With Python it serves the folder on port 8080 and opens a browser. Without Python it opens `index.html` directly. |
| `start_mac.command` | macOS / Linux launcher. With `python3` it also uses port 8080. Otherwise it opens `index.html` directly. |
| `README.md` | Short Chinese note for someone opening the project: file list and the two ways to run it. |
| `DEVELOPER_LOG.md` | This log. It records features, file roles, and versions. Later updates are written here. |

---

## 3. 版本更新记录 / Version History

以后若发生更新，在本节最上方追加新版本，不要另开一份日志。同时把 `index.html` 的版本号改成新版本：`<title>`、页眉 `vX.Y` 徽章、`<meta name="application-version">`。三者必须相同。

When the project changes again, add the new version at the top of this section. Do not start a second log. Also change the version in `index.html`: the `<title>`, the header `vX.Y` badge, and `<meta name="application-version">`. All three must match.

### 1.3 — 2026-10-31

**中文。** 项目名称改为 **LA Area Housing Map**（LA 周边住房地图）。页面标题、页眉、启动脚本、`data.js` / `app.js` 文件头，以及本日志和 `README.md` 里的项目名都改成这个名字。地图范围、走廊名称（包括 Santa Barbara）和 78 个网格的数据没有改动。本版本是准备推到 GitHub 的第一版。发布后用 GitHub Pages 从 `main` 分支提供网站：推送 `main` 会更新网站，拉取 `main` 会取回与网站相同的文件。

**English.** The project is now named **LA Area Housing Map**. The page title, header, launchers, the headers of `data.js` and `app.js`, this log, and `README.md` use that name. Map coverage, corridor names (including Santa Barbara), and the 78 cells are unchanged. This is the first version prepared for GitHub. After publishing, GitHub Pages serves the site from the `main` branch: pushing `main` updates the site, and pulling `main` retrieves the same files the site is built from.

### 1.2 — 2026-10-31

**中文。** 增加白天模式。顶栏新增切换按钮，默认仍是夜间模式。白天模式把顶栏、侧栏、筛选控件、图例、价格弹窗和网格标签改成浅色，地图瓦片保持原样。选择写入 `localStorage` 键 `la-housing-theme`。

**English.** Added a day theme. A header button switches modes, and night remains the default. Day mode lightens the header, sidebar, filters, legend, price popups, and cell tags. Map tiles stay as they are. The choice is stored under the `la-housing-theme` key in `localStorage`.

### 1.1 — 2026-10-31

**中文。** 修复底图上的 “API KEY REQUIRED” 水印。1.0 的「清爽街景」和「深色热力」使用 CARTO 栅格瓦片。自 2026-09-25 起，这两套地址在没有 API Key 时只返回水印图，街道和地名都看不到。「卫星地形」本来就使用 Esri 影像，因此一直正常。「OSM标准」使用 OpenStreetMap 官方瓦片，本身不需要 Key。

1.1 把街景换成 Esri World Street Map，把深色底图换成 Esri World Dark Gray Base，并叠上 World Dark Gray Reference 标注层。OSM 与卫星图保持原地址。四种底图都可以直接在浏览器里加载，不需要注册或填写密钥。页眉副标题改为「免费底图，无需 API Key」，页眉和标题标为 v1.1。

**English.** Removed the “API KEY REQUIRED” watermark. In 1.0, Clean Streets and Dark Heat used CARTO raster tiles. Since 2026-09-25 those endpoints return only a watermark image when no API key is sent, so streets and labels never appear. Satellite was already Esri imagery and kept working. OSM Standard uses the official OpenStreetMap tiles and never needed a key.

Version 1.1 points Clean Streets at Esri World Street Map, and Dark Heat at Esri World Dark Gray Base plus the World Dark Gray Reference label layer. OSM and satellite keep their previous URLs. All four basemaps load in the browser with no signup and no key. The header note now says the basemaps are free and need no API key, and the page is marked v1.1.

### 1.0 — 初始版本 / Initial release

**中文。** 第一个可用版本。按购房查看需求做成可交互地图：覆盖洛杉矶至 Santa Barbara 的 78 个网格，支持四项成交价切换、走廊筛选、中位价上限、搜索、热力色块、详情侧栏和候选对比。底图有清爽街景、深色热力、OSM 标准和卫星地形。其中街景与深色底图当时指向 CARTO，后来在 1.1 中替换。

**English.** First working release. An interactive map for comparing home prices: 78 cells from Los Angeles to Santa Barbara, four sale-price metrics, corridor filter, median cap, search, heat colors, a detail panel, and a comparison list. Basemaps were clean streets, dark heat, OSM standard, and satellite. Clean streets and dark heat still pointed at CARTO; 1.1 replaced those two.
