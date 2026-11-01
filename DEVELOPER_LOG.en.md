# Developer Log

**Project:** LA Area Housing Map  
**Chinese name:** LA 周边住房地图

**Current version:** V4.0-History window format  
**Page entry:** `index.html` (the title, header badge, and `<meta name="application-version">` all read `4.0`)  
**This file:** `DEVELOPER_LOG.en.md`  
**Chinese log:** `DEVELOPER_LOG.zh.md`

After every later change to features, data, or basemaps, add an entry at the top of section 3. The heading must be `Vversion-name`, for example `V1.31-Day and night aligned`. Do not use the date as the heading. Put the date on the line under the heading. Write the same version number into the Chinese log, with a Chinese name. Also set the version in `index.html` to the same number. The page title, the header `vX.Y` badge, and `application-version` must match the current version number recorded here. Do not start a third log.

---

## 1. Task and Features

This site shows closed-home prices from central Los Angeles out to Santa Barbara. The map is centered on Los Angeles, reaches Santa Barbara to the northwest, and reaches the south Orange County coast to the southeast. It is divided into 506 rectangular cells. Thirty-five of them are the southeast Los Angeles ZIP cells added in V2.0. Each cell carries a median sale price, an average sale price, a low, a high, a sales count, a price per square foot, and a short area note. Those six figures on the record itself are the trailing three months. Each record also has `m6`, `m9`, and `m12` in the same shape for six, nine, and twelve months. Those three windows are null until the numbers are filled in.

On open, the view sits at latitude 34.12, longitude -118.55, zoom 9. The detail panel opens on Arcadia (`SG09`, ZIP 91006). The map can be panned and zoomed from level 7 through 16.

**History window.** Next to the metric buttons are 3 months, 6 months, 9 months, and 12 months. The heat map, cell tags, detail prices, price caps, and price search all follow the selected window. Three months uses the figures already stored on each record. Six, nine, and twelve months are empty, so those cells are gray 「无数据」 and the detail figures read 「—」. Later numbers can be filled into the same fields without another page change.

**Price heat.** The header has five buttons: (a) median, (b) average, (c) minimum, (d) maximum, and (e) price per square foot. Choosing one repaints every cell and rewrites the short price tag on that metric. The legend title follows the same choice. Chips sit in two columns. A cell with no figure for that metric is gray, labeled 「无数据」.

The four sale-price metrics share 16 dollar bins: under $400K, then $400–500K, $500–600K, $600–700K, $700–800K, $800–900K, $900K–$1.0M, $1.0–1.2M, $1.2–1.4M, $1.4–1.6M, $1.6–1.8M, $1.8–2.2M, $2.2–2.8M, $2.8–3.6M, $3.6–5.0M, and $5.0M or more. Colors run from cyan and green through yellow, orange, and red, then into purple.

Price per square foot uses its own 16 bins, in dollars per square foot: under $300, $300–400, $400–450, $450–500, $500–550, $550–600, $600–650, $650–700, $700–750, $750–800, $800–900, $900–1,000, $1,000–1,200, $1,200–1,500, $1,500–1,800, and $1,800 or more. Published figures mostly sit between $400 and $800, so that band steps by $50. The low is about $205 and the high is about $1,950. The color order matches the sale-price heat. This is the single per-square-foot figure Redfin already published and the database already stores. It is not split into a median, average, low, and high of its own.

**Basemap switcher.** Four free basemaps sit at the map’s upper right. None of them needs an API key:

- Clean streets: Esri World Street Map, with roads, place names, and terrain.
- Dark heat: Esri’s dark gray canvas plus a label overlay. At the wide view, roads stay faint so the price colors read clearly; streets become easier to see when zoomed in.
- OSM standard: the official OpenStreetMap street tiles.
- Satellite terrain: Esri World Imagery.

The active basemap button is indigo.

**Day and night.** The header button names the mode currently on screen. The page opens in day mode: header, sidebar, legend, and popups are white and light gray, and the button reads 「白天模式」. One click turns those panels dark and changes the button to 「夜间模式」. Clicking again returns to the light interface and 「白天模式」. Price figures stay indigo, green, sky, and rose so they can still be told apart. Cell price tags in day mode are white chips with dark type. The map basemap itself does not invert. The choice is stored in the browser and kept on the next visit. V1.31 clears the night default that older versions saved automatically, so the first open after that update is day mode.

**Corridor filter.** The header menu can limit the map to one corridor: Santa Barbara (10 cells), Ventura / US-101 (21), LA Westside and coast (26), Southwest LA (17), Beverly Hills (3), Culver City (2), Inglewood (5), San Fernando Valley (56), Burbank (5), Glendale (10), Pasadena (8), Altadena (1), Central LA (51), Downtown LA (6), USC (8), Southeast LA / Gateway Cities (41), San Gabriel Valley (39), South Bay (13), Torrance (6), Long Beach (22), Cerritos (1), Cypress (1), Buena Park (2), Costa Mesa (2), Tustin (2), Yorba Linda (2), Newport Beach (7), Fullerton (4), Brea (2), Anaheim (8), Garden Grove (5), Santa Ana (6), Huntington Beach (4), Irvine (9), Pomona (3), Ontario (3), Fontana (3), San Bernardino (7), Riverside (7), Moreno Valley (4), Corona (5), the Inland Empire interior (22), Santa Clarita (10), Orange and neighbors (8), South OC (20), or the smaller North OC cities (9). The map then flies to that corridor at zoom 10. Choosing all corridors returns to the original wide view.

**Price caps.** The header has four upper-limit sliders. The right end of each is unlimited. A lower setting hides cells whose figure for that metric is above the cap, and also hides cells that do not publish that figure.

- Median: $200K to $6M, in $50K steps.
- Average: $400K to $10M, in $100K steps. Published averages run from about $408K to $10.32M, and nearly all of them are under $10M.
- Low: $50K to $3M, in $50K steps. Published lows run from $50K to about $2.86M.
- High: $500K to $20M, in $250K steps. Published highs start around $695K, most sit in the low millions, and a few estate sales reach above $50M, so the slider stops at $20M and anything higher stays available at the unlimited end.

**Price search.** A separate control can test the median, average, low, high, or price per square foot: less than, greater than, or between two amounts. Less than and greater than do not include an equal value. Between includes both ends, and the two amounts are ordered automatically if they are entered backwards. An empty amount is ignored. Choosing unlimited turns this search off. It applies together with the four sale-price caps. A cell with no published figure for the chosen metric does not pass a numeric condition. When the metric is price per square foot, the boxes are filled in dollars per square foot.

**Safety tiers.** The header can filter five relative tiers: 1 very settled, 2 fairly settled, 3 typical, 4 use caution, and 5 high pressure. It can also keep only tiers 1–2, or 1–3. The tier is a reading of years of news plus publicly reported police patterns. It is not an official ranking, and it does not describe every block.

**Drive time to USC.** The header slider runs from within 10 minutes to unlimited at the right end (about two hours and beyond stay visible). The time is a typical daytime drive with a car, estimated from distance and the main roads. The evening peak is usually longer. It is not a live navigation result.

**Search.** Typing part of a city name, neighborhood, or cell id, such as `Arcadia` or `SG09`, hides cells that do not match. Matching ignores case and checks both the name and the id.

**Cell labels.** 「显示网格标签」 is on by default. Each cell then shows a dark tag such as `$1.95M`. Turning it off leaves only the colored cells.

**Hover, select, and popup.** Hovering a cell thickens its outline and deepens the fill. Clicking it loads that area in the side panel and turns the outline white. Clicking again opens a popup with all four prices.

**Side panel.** Under the basemap buttons, 「收起说明」 / 「显示说明」 hides or shows the whole right column (the write-up and the comparison list). The column’s left edge can be dragged. On a wide screen the narrowest open width is about 300 pixels and the widest is about 560 pixels, and never more than half the window. Dragging stops at the minimum width and does not close the column. Only 「收起说明」 hides it. On a wide screen the column starts open. At 800 pixels wide and below it starts closed; opening it lays the column over the map, and the map keeps its full width. Selecting a cell still updates the write-up while the column is closed.

**Detail panel.** Under the place name is an introduction: what the area is like, a rough population, the kind of neighborhood, and a landmark, campus, beach, or old town. Next come errands (a small market, or a larger chain such as Costco, Walmart, Ralphs, Target, Trader Joe's, or 99 Ranch, plus CVS and coffee), the safety tier, and the approximate drive to USC. Below that are the four price cards, the bar from low to high (green at the low end, red at the high end), and the trailing-three-month sales, price per square foot, and cell id. A small gray note under those figures restates the sale numbers.

**Comparison list.** 「加入下方候选对比列表」 adds the current area to the table at the lower right: name, median, average, and low-to-high range. The same cell is not added twice. 「清空」 clears the table. The add button stays disabled until a cell is selected.

---

## 2. Code Structure

This is a static site. There is no build step and no backend. The browser loads Leaflet and `app.js`. `app.js` then reads `housing_data.json`.

| File | Role |
|---|---|
| `index.html` | Page shell. The header holds the metric buttons, day/night switch, corridor filter, four price-cap sliders, the price search, and the place search box. The center holds the map, basemap switcher, and legend. The right side holds the detail panel and comparison table. Styling comes from the Tailwind CDN. The map library is Leaflet 1.9.4. The title, header badge, and `application-version` all read `4.0`. The project name is LA Area Housing Map. |
| `housing_data.json` | The sales database, 506 records, kept out of the page code. Each record has `id`, `name`, `region`, center `lat`/`lng`, half-size `dLat`/`dLng`, `median`, `avg`, `min`, `max`, `sales`, `ppsf`, `m6`, `m9`, `m12`, `url`, `desc`, `shops`, `safety`, and `uscMin`. The top-level `sales` and `ppsf` are the trailing three months. `m6`, `m9`, and `m12` each hold the same six figures and are `null` until collected. `ppsf` is dollars per square foot as published by Redfin, not per square meter. |
| `app.js` | Map setup, the four free tile sources, cell drawing, filters, selection, the comparison table, and the day/night switch. `createBasemap()` builds one tile layer or a group. The dark style stacks a dark gray base under a label layer. |
| `start_windows.bat` | Windows launcher. With Python it serves the folder on port 8080 and opens a browser. Without Python it runs `serve_local.ps1`. |
| `serve_local.ps1` | Local server used when Python is missing. It also uses port 8080. |
| `start_mac.command` | macOS / Linux launcher. With `python3` it uses port 8080. |
| `README.md` | Short Chinese note for someone opening the project: file list and the two ways to run it. |
| `DEVELOPER_LOG.zh.md` | The Chinese developer log. |
| `DEVELOPER_LOG.en.md` | This English developer log. Both files keep the same version number. Each uses a name in its own language. |

---

## 3. Version History

When the project changes again, add the new version at the top of this section. The heading is `Vversion-name`. Do not use the date as the heading, and do not start a third log. Also change the version in `index.html`: the `<title>`, the header `vX.Y` badge, and `<meta name="application-version">`. All three must match. The Chinese log uses the same version number and its own Chinese name.

### V4.0-History window format

**Date:** 2026-11-01

Each cell gained a format for six, nine, and twelve months beside the existing three-month figures. `m6`, `m9`, and `m12` each have `median`, `avg`, `min`, `max`, `sales`, and `ppsf`, matching the six numbers already stored for three months. All of those new values are null. No historical pages were fetched.

The header has buttons for 3, 6, 9, and 12 months. The heat map, tags, detail prices, cap sliders, and price search follow the selected window. An unfilled window draws gray cells and 「—」 in the detail panel. The existing three-month numbers are unchanged.

### V3.6-Price per square foot heat

**Date:** 2026-11-01

The heat map gained a second scale: price per square foot. It uses the `ppsf` value already stored on each record. No new pages were fetched. 486 cells have the figure and 20 do not; the missing ones stay gray. The bins follow those numbers. From $400 to $800 the step is $50, and the ends are wider, for 16 bins in the same legend layout as the sale-price heat. Cell tags in this mode show a whole dollar amount rather than a shortened total such as “$1K”.

The price search can use price per square foot with less than, greater than, or between. The four sale-price buttons still switch only the total-price heat. Price per square foot is not split into four statistics.

The notes column now stops at its minimum width instead of closing. Hiding it still takes the 「收起说明」 button.

### V3.5-Price caps and price search

**Date:** 2026-11-01

The header now caps the average, the low, and the high as well as the median. The ranges and steps follow the 506 published figures: average from $400K to $10M in $100K steps, low from $50K to $3M in $50K steps, and high from $500K to $20M in $250K steps. The right end of each slider is unlimited.

A price search can also test any of the four figures: less than, greater than, or between two amounts. Less than and greater than exclude an equal value. Between includes both ends. The search and the four caps apply together. If a figure is unpublished, the cell is hidden once that cap leaves unlimited or the price search is on. The sale numbers themselves are unchanged.

### V3.4-Errands and the notes panel

**Date:** 2026-11-01

The errands line no longer says that an area usually has no Costco. A store is mentioned only when it is there. Costco is written as nearby when a published warehouse is within about 2 miles, and as a few minutes’ drive when one is within about 4 miles. Asian supermarkets, Thai or Vietnamese markets, the Japanese shops on Sawtelle, beach streets, hillside houses, and downtown commercial streets are described separately. Ordinary residential cells still say Ralphs, Vons, or Albertsons, plus CVS and coffee, so those sentences stay similar. That repetition is the store network, not a filler line about a store that is absent.

The low-to-high sale bar now runs from green to red. Green is the low end and red is the high end.

The notes column can be resized from its left edge. On a wide screen it stays between about 300 and 560 pixels, and it never takes more than half the window. Dragging it narrower than the minimum closes it. The existing show/hide button remains. The cell count and the sale prices are unchanged.

### V3.3-Denser central grid

**Date:** 2026-11-01

175 cells were added to the existing 331, for 506 in total. The new cells sit mainly inside the disk from downtown Los Angeles out to Irvine: Hollywood, East Hollywood, Westlake, Lincoln Heights, El Sereno, Palms, Sawtelle, Century City, plus Echo Park, Silver Lake, Los Feliz, Koreatown, Boyle Heights, Westwood, Venice, and the Long Beach neighborhoods. A smaller set was added around the edge: Santa Clarita, the Conejo Valley, Simi Valley, Camarillo, Redlands, Highland, Orange, and south Orange County down to San Clemente.

Prices still come only from figures Redfin publishes. Median, price per square foot, and the trailing-three-month sales count use the 2026-09-30 period. Average, low, and high are stored only when the returned sales from the last 90 days are a large enough sample and the median falls between the low and the high. Neighborhoods with no monthly series for that period were left out. Autocomplete hits in North Carolina, Northern California, San Diego, and the Lake Tahoe area were dropped.

Each new cell uses the same fields as the others: an introduction, errands, a five-tier safety reading, and a daytime drive to USC. The safety tier is still a relative reading of news and publicly reported police patterns, not an official ranking. A neighborhood cell may sit inside an existing ZIP cell, which is how the center of the map gets denser. No older cell was removed, and no older price was changed. ZIPs such as Newhall, Castaic, Topanga, and Laguna Beach still use the real bounding-box half-extent, so some of those cells are large.

The filter gained Santa Clarita, Orange and its neighbors, South OC, and the smaller North OC cities.

### V3.2-Errands, safety, and drive time

**Date:** 2026-11-01

Each area note now has three more parts. Errands say whether groceries are a small market or a larger chain such as Costco, Walmart, Ralphs, Target, Trader Joe's, or 99 Ranch, and whether CVS and coffee are nearby. Pharmacies are written as CVS.

Safety is five tiers. The header can show one tier, tiers 1–2, or tiers 1–3. Tier 1 is very settled and tier 5 is high pressure. The grade reads years of news and publicly reported police patterns. The panel says it is not an official ranking.

Drive time to USC assumes a car and a typical daytime trip. The slider’s left end is within 10 minutes and the right end is unlimited. The median cap now starts at $200K and moves in $50K steps. The right end is still unlimited. The sale figures are unchanged.

### V3.1-Area introductions

**Date:** 2026-11-01

The lines under each place name no longer explain where the sale figures came from. All 331 cells now have an area introduction in the `desc` field of `housing_data.json`: the character of the place, an approximate population, the kind of neighborhood, and a mall, campus, beach, or old town where that fits. Populations are rounded, not written as exact headcounts.

The median, price per square foot, trailing-three-month sales, average, low, and high now also appear in small gray type under the housing figures, with a note that the numbers come from Redfin. The large figures on the price cards stay. The cell count and the sale numbers are unchanged.

### V3.0-Collapsible notes and heat bins

**Date:** 2026-10-31

The right-hand notes column can be collapsed. The button sits under the basemap switcher. It reads 「收起说明」 while the column is open and 「显示说明」 while it is closed. A wide screen opens with the column visible. At 800 pixels and below it starts closed, and opening it covers the right side of the map while the map stays full width. Selecting a cell still writes into the panel.

The price heat scale grew from 5 bins to 16. All four price metrics share the same dollar breaks. The lowest median is about $425K, and nearly half the cells sit between $400K and $1.0M, so that band is split every $100K. From $1.0M to $1.8M the step is $200K. Above that the steps widen, and $5.0M or more is the top bin. Cells with no figure are gray. The cell count and the sales figures are unchanged.

### V2.9-Data separated

**Date:** 2026-10-31

The sales figures are no longer written into the page code. All 331 cells — median, average, low, high, trailing-three-month sales, and price per square foot — live in `housing_data.json`. `app.js` reads that file on startup and then draws the map. Later number changes belong in the JSON. `ppsf` remains Redfin’s price per square foot, not per square meter. Open the site with a launcher. Opening `index.html` directly will not load the JSON. The cell count and the V2.8 ZIP coverage are unchanged.

### V2.8-Greater LA ZIP grid

**Date:** 2026-10-31

Brought the rest of greater Los Angeles down to one ZIP per cell, and filled the gaps. The map grew from 270 cells to 331. The Santa Barbara and Ventura corridors were left as they were.

On the west side, added Playa Vista 90094, Playa del Rey 90293, Westchester 90045, Westmont 90047, Hawthorne 90250, and Lawndale 90260, plus Ladera Heights, View Park, Athens, and South LA 90003, 90044, and 90061. El Segundo is no longer paired with Playa Vista.

On the south side, split San Pedro from Harbor City, Hermosa Beach from Redondo Beach, and Palos Verdes Estates from Rancho Palos Verdes. Added Lomita 90717, Harbor City 90710, and Wilmington 90744.

On the southeast side, split Cerritos from Cypress. Cypress 90630 and Buena Park 90620 and 90621 are their own cells. La Palma, Artesia, and Hawaiian Gardens were added to Southeast LA.

On the east side, split West Covina from Glendora, Hacienda Heights from Rowland Heights, El Monte from Rosemead, and Monrovia from Bradbury. Added Avocado Heights, La Puente, Baldwin Park, Azusa, Covina, Glendora, and San Dimas. The other San Gabriel Valley city cells are now ZIPs too: South Pasadena, San Marino, Alhambra, Monterey Park, San Gabriel, Temple City, and Arcadia.

The westside coast, central LA, Costa Mesa and Tustin, Yorba Linda, Newport Beach, and Calabasas are ZIP cells as well. Each new rectangle is the bounding box of that ZIP’s polygon on Redfin. The median and price per square foot are Redfin’s published figures for the period ending September 2026. `sales` is the sum of the July, August, and September 2026 published counts. Average, low, and high follow the V2.1 rule. Each link is `https://www.redfin.com/zipcode/<zip>/housing-market`.

### V2.7-North valley

**Date:** 2026-10-31

Split the area enclosed by Glendale, Pasadena, Altadena, Burbank, North Hollywood, Valley Glen, Sun Valley, Panorama City, San Fernando, North Hills, Granada Hills, Chatsworth, West Hills, Canoga Park, Warner Center, Reseda, and Lake Balboa to ZIP cells at the same density as the downtown grid. The map grew from 226 cells to 270. Calabasas stays as the original single cell, outside this ring.

Removed the city-wide Burbank cell (`SFV-09`), the merged Glendale and La Crescenta cell (`SFV-10`), the city-wide Pasadena cell (`SGV-01`), and the Hastings Ranch cell (`SGV-02`). Merged valley cells were split as well: Woodland Hills and Warner Center, Chatsworth and Porter Ranch, Tarzana and Reseda, and Studio City and Toluca Lake. Northridge, Encino, and Sherman Oaks are now ZIP cells. Places that had no cell were added: North Hollywood, Valley Village, Valley Glen, Panorama City, Van Nuys, Lake Balboa, Sun Valley, San Fernando, Pacoima, Sylmar, North Hills, Granada Hills, Mission Hills, West Hills, Canoga Park, and Winnetka. Altadena is its own cell.

The San Fernando Valley filter now has 35 cells. Burbank has five: 91501, 91502, 91504, 91505, 91506. Glendale has nine: 91201 through 91208, plus La Crescenta 91214. Pasadena has six: 91101, 91103, 91104, 91105, 91106, 91107. Altadena is 91001.

Each new rectangle is the bounding box of that ZIP’s polygon on Redfin. The median and price per square foot are Redfin’s published figures for the period ending September 2026. `sales` is the sum of the July, August, and September 2026 published counts. Average, low, and high follow the V2.1 rule and use only the closed sales that page returns. Each link is `https://www.redfin.com/zipcode/<zip>/housing-market`.

### V2.6-Inland Empire

**Date:** 2026-10-31

Filled the area enclosed by Pomona, Ontario, Fontana, San Bernardino, Riverside, Moreno Valley, Corona, and Fullerton with ZIP cells at the same density as the downtown grid. Fullerton was already split in V2.5 and is left as it is. The map grew from 180 cells to 226.

That area previously had almost no cells. The only nearby cell merged Walnut and Diamond Bar (`SGV-14`). It is now 91789 and 91765. The interior is also filled, rather than left blank: Montclair, Chino, Chino Hills, Rialto, Colton, Grand Terrace, Loma Linda, Bloomington, Jurupa Valley, Eastvale, and Norco.

Pomona is three cells: 91766, 91767, 91768. Ontario is three: 91761, 91762, 91764. Fontana is three: 92335, 92336, 92337. San Bernardino is seven: 92401, 92404, 92405, 92407, 92408, 92410, 92411. Riverside is seven: 92501, 92503, 92504, 92505, 92506, 92507, 92508. Moreno Valley is four: 92551, 92553, 92555, 92557. Corona is five: 92879, 92880, 92881, 92882, 92883. The interior is thirteen cells under the filter `Inland Empire`.

Each new rectangle is the bounding box of that ZIP’s polygon on Redfin. The median and price per square foot are Redfin’s published figures for the period ending September 2026. `sales` is the sum of the July, August, and September 2026 published counts. Average, low, and high follow the V2.1 rule and use only the closed sales that page returns. Each link is `https://www.redfin.com/zipcode/<zip>/housing-market`.

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
