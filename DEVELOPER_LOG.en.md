# Developer Log

**Project:** LA Area Housing Map  
**Chinese name:** LA 周边住房地图

**Current version:** V2.5-North Orange County cities  
**Page entry:** `index.html` (the title, header badge, and `<meta name="application-version">` all read `2.5`)  
**This file:** `DEVELOPER_LOG.en.md`  
**Chinese log:** `DEVELOPER_LOG.zh.md`

After every later change to features, data, or basemaps, add an entry at the top of section 3. The heading must be `Vversion-name`, for example `V1.31-Day and night aligned`. Do not use the date as the heading. Put the date on the line under the heading. Write the same version number into the Chinese log, with a Chinese name. Also set the version in `index.html` to the same number. The page title, the header `vX.Y` badge, and `application-version` must match the current version number recorded here. Do not start a third log.

---

## 1. Task and Features

This site shows closed-home prices from central Los Angeles out to Santa Barbara. The map is centered on Los Angeles, reaches Santa Barbara to the northwest, and reaches northern Orange County to the southeast. It is divided into 180 rectangular cells. Thirty-five of them are the southeast Los Angeles ZIP cells added in V2.0. Each cell carries a median sale price, an average sale price, a low, a high, a trailing-90-day sales count, a price per square foot, and a short area note.

On open, the view sits at latitude 34.12, longitude -118.55, zoom 9. The detail panel opens on Arcadia (`SGV-09`). The map can be panned and zoomed from level 7 through 16.

**Four price metrics.** The header has four buttons: (a) median, (b) average, (c) minimum, and (d) maximum. Choosing one repaints every cell and rewrites the short price tag on that metric. The legend title follows the same choice. Color breaks are: under $900K green, $900K to $1.4M gold, $1.4M to $2.2M orange, $2.2M to $3.5M red, and above $3.5M violet.

**Basemap switcher.** Four free basemaps sit at the map’s upper right. None of them needs an API key:

- Clean streets: Esri World Street Map, with roads, place names, and terrain.
- Dark heat: Esri’s dark gray canvas plus a label overlay. At the wide view, roads stay faint so the price colors read clearly; streets become easier to see when zoomed in.
- OSM standard: the official OpenStreetMap street tiles.
- Satellite terrain: Esri World Imagery.

The active basemap button is indigo.

**Day and night.** The header button names the mode currently on screen. The page opens in day mode: header, sidebar, legend, and popups are white and light gray, and the button reads 「白天模式」. One click turns those panels dark and changes the button to 「夜间模式」. Clicking again returns to the light interface and 「白天模式」. Price figures stay indigo, green, sky, and rose so they can still be told apart. Cell price tags in day mode are white chips with dark type. The map basemap itself does not invert. The choice is stored in the browser and kept on the next visit. V1.31 clears the night default that older versions saved automatically, so the first open after that update is day mode.

**Corridor filter.** The header menu can limit the map to one corridor: Santa Barbara (10 cells), Ventura / US-101 (10), LA Westside and coast (10), Beverly Hills (3), Culver City (2), Inglewood (5), San Fernando Valley (10), Central LA (8), Downtown LA (6), USC (6), Southeast LA / Gateway Cities (35), San Gabriel Valley (14), South Bay (5), Torrance (5), Long Beach (11), the remaining northern Orange County cities (4), Fullerton (4), Brea (2), Anaheim (7), Garden Grove (5), Santa Ana (6), Huntington Beach (4), or Irvine (8). The map then flies to that corridor at zoom 10. Choosing all corridors returns to the original wide view.

**Median cap.** The slider runs from $600K to $6M in $100K steps. The right end is labeled unlimited and keeps every cell. A lower cap hides cells whose median is above that cap.

**Search.** Typing part of a city name, neighborhood, or cell id, such as `Arcadia` or `SGV-09`, hides cells that do not match. Matching ignores case and checks both the name and the id.

**Cell labels.** 「显示网格标签」 is on by default. Each cell then shows a dark tag such as `$1.95M`. Turning it off leaves only the colored cells.

**Hover, select, and popup.** Hovering a cell thickens its outline and deepens the fill. Clicking it loads that area in the side panel and turns the outline white. Clicking again opens a dark popup with all four prices.

**Detail panel.** The panel shows the corridor, cell id, bilingual name, and description; four price cards; a bar from the low to the high, with a white mark for the median and a green mark for the average, plus how far the average sits above the median; and the 90-day sales count, price per square foot, and cell id.

**Comparison list.** 「加入下方候选对比列表」 adds the current area to the table at the lower right: name, median, average, and low-to-high range. The same cell is not added twice. 「清空」 clears the table. The add button stays disabled until a cell is selected.

---

## 2. Code Structure

This is a static site. There is no build step and no backend. The browser loads Leaflet, then `data.js`, then `app.js`.

| File | Role |
|---|---|
| `index.html` | Page shell. The header holds the metric buttons, day/night switch, corridor filter, median slider, and search box. The center holds the map, basemap switcher, and legend. The right side holds the detail panel and comparison table. Styling comes from the Tailwind CDN. The map library is Leaflet 1.9.4. The title, header badge, and `application-version` all read `2.5`. The project name is LA Area Housing Map. |
| `data.js` | Declares `HOUSING_GRID_DATA`, 180 records. Each record has `id`, `name`, `region`, center `lat`/`lng`, half-size `dLat`/`dLng`, `median`, `avg`, `min`, `max`, `sales`, `ppsf`, `url`, and `desc`. `url` is that cell’s Redfin area page. |
| `app.js` | Map setup, the four free tile sources, cell drawing, filters, selection, the comparison table, and the day/night switch. `createBasemap()` builds one tile layer or a group. The dark style stacks a dark gray base under a label layer. |
| `start_windows.bat` | Windows launcher. With Python it serves the folder on port 8080 and opens a browser. Without Python it opens `index.html` directly. |
| `start_mac.command` | macOS / Linux launcher. With `python3` it also uses port 8080. Otherwise it opens `index.html` directly. |
| `README.md` | Short Chinese note for someone opening the project: file list and the two ways to run it. |
| `DEVELOPER_LOG.zh.md` | The Chinese developer log. |
| `DEVELOPER_LOG.en.md` | This English developer log. Both files keep the same version number. Each uses a name in its own language. |

---

## 3. Version History

When the project changes again, add the new version at the top of this section. The heading is `Vversion-name`. Do not use the date as the heading, and do not start a third log. Also change the version in `index.html`: the `<title>`, the header `vX.Y` badge, and `<meta name="application-version">`. All three must match. The Chinese log uses the same version number and its own Chinese name.

### V2.5-North Orange County cities

**Date:** 2026-10-31

Split Fullerton, Anaheim, Garden Grove, Santa Ana, Huntington Beach, and Irvine to ZIP cells at the same density as the downtown grid. The map grew from 148 cells to 180.

Removed the merged Fullerton and Brea cell (`OC-02`), the city-wide Huntington Beach cell (`OC-04`), and the two Irvine neighborhood cells that only covered Orchard Hills and Turtle Rock (`OC-06`, `OC-07`). Anaheim, Garden Grove, and Santa Ana had no cells before. Brea is no longer paired with Fullerton. Cerritos, Yorba Linda, Costa Mesa and Tustin, and Newport Beach stay under the remaining northern Orange County filter.

Fullerton is four cells: 92831, 92832, 92833, 92835. Brea is two: 92821, 92823. Anaheim is seven: 92801, 92802, 92804, 92805, 92806, 92807, 92808. Garden Grove is five: 92840, 92841, 92843, 92844, 92845. Santa Ana is six: 92701, 92703, 92704, 92705, 92706, 92707. Huntington Beach is four: 92646, 92647, 92648, 92649. Irvine is eight: 92602, 92603, 92604, 92606, 92612, 92614, 92618, 92620. Anaheim 92825 and the Irvine campus mail ZIPs 92617 and 92697 have no separate sales series, so they are not their own cells.

Each new rectangle is the bounding box of that ZIP’s polygon on Redfin. The median and price per square foot are Redfin’s published figures for the period ending September 2026. `sales` is the sum of the July, August, and September 2026 published counts. Average, low, and high follow the V2.1 rule and use only the closed sales that page returns. Each link is `https://www.redfin.com/zipcode/<zip>/housing-market`.

### V2.4-Downtown and USC

**Date:** 2026-10-31

Split Downtown Los Angeles and the USC area out of the old merged cells. The map grew from 135 cells to 148. The grain is still one ZIP per cell. These downtown ZIPs are smaller than the Torrance and Long Beach ZIPs, so the grid is a little tighter.

Removed the single downtown cell (`LAC-05`) and the cell that combined USC, Mid-City, and Baldwin Hills (`LAC-07`). Baldwin Hills (90008), West Adams (90016), and Mid-City (90019) stay in Central LA and are no longer paired with the campus.

Downtown is six cells under the filter `Downtown LA`: 90012, 90013, 90014, 90015, 90017, and 90021. The USC area is six cells under `USC`: 90007 (University Park, the main DPS patrol area), 90006, 90018, 90037, 90062, and 90011. Bunker Hill 90071 and the campus mail ZIP 90089 have no separate sales series and are too small to place, so they are not their own cells.

Each new rectangle is the bounding box of that ZIP’s polygon on Redfin. The median and price per square foot are Redfin’s published figures for the period ending September 2026. ZIP 90013 does not publish a price per square foot. `sales` is the sum of the July, August, and September 2026 published counts. Average, low, and high follow the V2.1 rule and use only the closed sales that page returns. Each link is `https://www.redfin.com/zipcode/<zip>/housing-market`.

### V2.3-Torrance and Long Beach

**Date:** 2026-10-31

Split Torrance and Long Beach to ZIP cells at the same density as the earlier ZIP grids. The map grew from 122 cells to 135.

Removed the city-wide Torrance cell (`SBY-04`), the merged Torrance North & Gardena cell (`SBY-05`), and the merged Long Beach downtown and Belmont Shore cell (`SBY-08`). Gardena stays on the V2.0 cells 90247 and 90248, and is no longer paired with Torrance.

Torrance is now five cells under the filter `Torrance`: 90501, 90502, 90503, 90504, and 90505. Long Beach is now eleven cells under `Long Beach`: 90802, 90803, 90804, 90805, 90806, 90807, 90808, 90810, 90813, 90814, and 90815. The other five South Bay cells stay in `South Bay`: El Segundo, Manhattan Beach, Hermosa Beach, Palos Verdes Estates, and Central San Pedro.

Each new rectangle is the bounding box of that ZIP’s polygon on Redfin. The median and price per square foot are Redfin’s published figures for the period ending September 2026. `sales` is the sum of the July, August, and September 2026 published counts. Average, low, and high follow the V2.1 rule and use only the closed sales that page returns. Each link is `https://www.redfin.com/zipcode/<zip>/housing-market`.

### V2.2-Beverly Hills, Culver City, and Inglewood

**Date:** 2026-10-31

Split three areas that were one cell, or two places merged into one cell, down to ZIP cells at the same density as the V2.0 southeast Los Angeles grid. The map grew from 113 cells to 122.

Removed the single-city Beverly Hills cell (`LAW-09`) and the merged Culver City & Mar Vista cell (`LAW-11`). Beverly Hills is now 90210, 90211, and 90212, under the filter `Beverly Hills`. Culver City is now 90230 and 90232, under `Culver City`. Mar Vista, which had been merged into Culver City, is its own cell at ZIP 90066 and stays in LA Westside and coast. Inglewood is new: 90301, 90302, 90303, and 90305, plus Lennox at 90304 as its own cell rather than folded into downtown Inglewood. The filter name is `Inglewood`.

Each new rectangle is the bounding box of that ZIP’s polygon on Redfin. The median and price per square foot are Redfin’s published figures for the period ending September 2026. `sales` is the sum of the July, August, and September 2026 published counts. Average, low, and high follow the V2.1 rule: only the closed sales that page returns for the past 90 days, and those fields stay empty when too few sales come back. 90210, 90211, and 90212 did not return enough sales for a range, so they have a median only. Each link is `https://www.redfin.com/zipcode/<zip>/housing-market`.

### V2.1-Original cells use Redfin sales

**Date:** 2026-10-31

The 78 cells from before V2.0 used approximate simulated prices. This version replaces those prices with Redfin closed-sale figures. The 35 southeast Los Angeles ZIP cells added in V2.0 were not recalculated.

Every cell now has a `url`. After a map cell is clicked, the place name in the popup and the sidebar control 「在 Redfin 打开该地区」 open that Redfin city, neighborhood, or ZIP page in a new tab.

For the original cells, the median and the price per square foot are the latest month Redfin publishes on the housing-market page (September 2026 for most areas, earlier for some small ones). `sales` is the sum of the three latest published monthly counts. Average, low, and high come from the closed sales that area page returns for the past three months, after dropping prices under $50,000. That list is often shorter than the quarterly count. When too few sales come back, or when the low and high do not contain the published median, average, low, and high are left empty and the page shows an em dash instead of a filled-in estimate. Ellwood, Newbury Park, and Studio City do not publish a monthly median, so the median is the median of the returned sales, and the cell note says so.

Where an old cell covered two places, the link and the figures follow one Redfin area, and the note names that area. Walnut & Diamond Bar uses Walnut. Torrance North & Gardena uses North Torrance. Hermosa & Redondo uses Hermosa Beach.

### V2.0-Southeast LA cells

**Date:** 2026-10-31

Added 35 ZIP cells in southeast Los Angeles under the region `Southeast LA`, labeled 「东南洛杉矶 / 门户城市」 in the filter. The grid grew from 78 cells to 113. Coverage is East Los Angeles (90022, 90023, 90063), Boyle Heights (90033), Commerce (90040), Montebello (90640), Pico Rivera (90660), Whittier / West Whittier / South Whittier (90601, 90606, 90605), Santa Fe Springs (90670), Florence-Graham (90001), Huntington Park (90255), Maywood (90270), Bell / Bell Gardens / Cudahy (90201), South Gate (90280), Downey (90240, 90241, 90242), Watts (90002), Lynwood (90262), Compton (90220, 90221, 90222), Willowbrook (90059), Paramount (90723), Gardena (90247, 90248), Bellflower (90706), Norwalk (90650), La Mirada (90638), Carson (90745, 90746), and Lakewood (90712, 90713).

None of the new figures were estimated by hand. Median sale price and median price per square foot come from the Redfin housing-market page for all home types, period ending 2026-09-30, which Redfin also describes as the three months ending September. `sales` is the sum of Redfin’s published homes-sold counts for July, August, and September 2026. Average, low, and high are calculated from `Closed Sale` records returned by Redfin’s map API on 2026-10-31 for the prior 90 days, after dropping any price under $50,000. That returned list is shorter than the quarterly sales count, so the low, high, and average describe those returned sales rather than every MLS transfer. A few ZIPs share an identical published median, including 90033 and 90063 at $674,802, and 90605, 90606, and 90201 at $824,758; those figures are copied as published. Each rectangle is the bounding box of that ZIP’s polygon on the Redfin page. Gardena 90247 overlaps the existing `SBY-05` cell, Torrance North & Gardena.

### V1.31-Day and night aligned

**Date:** 2026-10-31

Fixed the reversed day and night modes. The page now opens light, and the button names the current mode: 「白天模式」 on the light theme and 「夜间模式」 on the dark theme. Clicking 「白天模式」 switches to dark and relabels the button 「夜间模式」; clicking again returns to light. The first open clears the night value older versions stored in `la-housing-theme`, so a refresh does not stay dark. Later choices are still stored under that same key.

### V1.3-Renamed LA Area Housing Map

**Date:** 2026-10-31

The project is now named **LA Area Housing Map**. The page title, header, launchers, the headers of `data.js` and `app.js`, and the docs use that name. Map coverage, corridor names (including Santa Barbara), and the 78 cells then on the map were unchanged. This was the first version prepared for GitHub. After publishing, GitHub Pages serves the site from the `main` branch: pushing `main` updates the site, and pulling `main` retrieves the same files the site is built from.

### V1.2-Day theme added

**Date:** 2026-10-31

Added a day theme. A header button switches modes, and night remains the default. Day mode lightens the header, sidebar, filters, legend, price popups, and cell tags. Map tiles stay as they are. The choice is stored under the `la-housing-theme` key in `localStorage`.

### V1.1-Free basemaps without watermark

**Date:** 2026-10-31

Removed the “API KEY REQUIRED” watermark. In V1.0, Clean Streets and Dark Heat used CARTO raster tiles. Since 2026-09-25 those endpoints return only a watermark image when no API key is sent, so streets and labels never appear. Satellite was already Esri imagery and kept working. OSM Standard uses the official OpenStreetMap tiles and never needed a key.

This version points Clean Streets at Esri World Street Map, and Dark Heat at Esri World Dark Gray Base plus the World Dark Gray Reference label layer. OSM and satellite keep their previous URLs. All four basemaps load in the browser with no signup and no key. The header note now says the basemaps are free and need no API key, and the page is marked v1.1.

### V1.0-Initial interactive map

**Date:** 2026-10-31

First working release. An interactive map for comparing home prices: 78 cells from Los Angeles to Santa Barbara, four sale-price metrics, corridor filter, median cap, search, heat colors, a detail panel, and a comparison list. Basemaps were clean streets, dark heat, OSM standard, and satellite. Clean streets and dark heat still pointed at CARTO; V1.1 replaced those two.
