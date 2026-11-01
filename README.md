# LA Area Housing Map

大洛杉矶周边的住房成交地图。范围从 Santa Barbara 到南橙县沿海，一共 506 个网格。成交价来自 Redfin。

**打开地图：** https://hzcrayon.github.io/la-area-housing-map/

当前版本 **4.41**。

## 地图上能做什么

- 用颜色看成交中位价、平均价、最低价、最高价、每平方英尺均价，以及治安和到 USC 的车程
- 在近 3、6、9、12 个月之间切换
- 按价格、治安和到 USC 的车程筛选
- 点开一个格子，查看区域说明，并跳到它的 Redfin 页面

每一版改了什么，写在 `DEVELOPER_LOG.zh.md`。英文版是 `DEVELOPER_LOG.en.md`。

## 本地打开

请用启动脚本打开，浏览器这样才能读到旁边的 `housing_data.json`。

- Windows：双击 `start_windows.bat`，然后打开 http://localhost:8080
- Mac：双击 `start_mac.command`。也可以在本目录执行 `python3 -m http.server 8080`，再打开 http://localhost:8080

## 项目文件

- `index.html`：页面。标题、页眉徽章和 `application-version` 都是 `4.41`
- `housing_data.json`：506 个网格的成交价、简介、便利性、治安和到 USC 的车程
- `app.js`：地图、热力图、筛选和底图
- `start_windows.bat`：Windows 一键启动
- `serve_local.ps1`：没有 Python 时，由上面的 bat 调用
- `start_mac.command`：macOS / Linux 一键启动
- `DEVELOPER_LOG.zh.md`：中文功能说明与版本记录
- `DEVELOPER_LOG.en.md`：同一份日志的英文版

## 更新在线地图

在线地址就是上面的网址，内容和 `main` 分支是同一套文件。

1. 仓库 Settings → Pages：Source 选 **Deploy from a branch**，Branch 选 `main`，文件夹选 `/ (root)`。
2. 提交后 Push origin。通常一两分钟内，https://hzcrayon.github.io/la-area-housing-map/ 会更新。
3. 要拿回网站上的文件，先 Fetch origin，有更新再 Pull。
