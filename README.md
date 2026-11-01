# LA Area Housing Map

LA 周边住房成交价格交互地图，当前版本 **1.3**。

地图覆盖大洛杉矶周边，向西北到 Santa Barbara，向东南到北橙县，共 78 个网格。功能、数据字段和各版本改动见 `DEVELOPER_LOG.md`。

## 项目文件

- `index.html`: 网站主页面。标题、页眉徽章和 `application-version` 都是 `1.3`
- `data.js`: 78 个网格的成交数据（可在里面修改或扩充）
- `app.js`: 地图交互、四维指标热力渲染、免 API Key 底图切换
- `start_windows.bat`: Windows 一键启动
- `start_mac.command`: macOS / Linux 一键启动
- `DEVELOPER_LOG.md`: 功能说明与版本记录

## 本地运行

直接双击 `index.html`，用 Chrome、Edge 或 Safari 打开即可。

也可以用本地服务器：

- Windows：双击 `start_windows.bat`，浏览器打开 `http://localhost:8080`
- Mac：在终端进入本目录，执行 `python3 -m http.server 8080`，然后打开 `http://localhost:8080`。也可以双击 `start_mac.command`

## 和网站同步

线上页面由 GitHub Pages 发布，内容和本仓库的 `main` 分支是同一套文件。

- **更新网站：** 改完代码后提交，并把 `main` 推到 GitHub。Pages 会用这次推送重新发布，通常一两分钟内能在网页上看到。
- **获取网站上的版本：** 在本目录执行拉取（GitHub Desktop 里点 Fetch origin，有更新再点 Pull）。拉下来的就是网站正在用的文件。

GitHub Desktop 打开本文件夹后，以后用 Push 推上去、用 Pull 取下来即可，不必再重新建仓库。
