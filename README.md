# LA Area Housing Map

LA 周边住房成交价格交互地图，当前版本 **2.6**。

地图覆盖大洛杉矶周边，向西北到 Santa Barbara，向东南到内陆帝国，共 226 个网格。V2.6 把波莫纳、安大略、丰塔纳、圣贝纳迪诺、里弗赛德、莫雷诺谷、科罗纳围起来的这一片拆成单独邮编格子。成交价来自 Redfin，点开区块可以跳到对应页面。版本名称写在 `DEVELOPER_LOG.zh.md`。英文说明在 `DEVELOPER_LOG.en.md`。

## 项目文件

- `index.html`: 网站主页面。标题、页眉徽章和 `application-version` 都是 `2.6`
- `data.js`: 226 个网格的成交数据（可在里面修改或扩充）
- `app.js`: 地图交互、四维指标热力渲染、免 API Key 底图切换
- `start_windows.bat`: Windows 一键启动
- `start_mac.command`: macOS / Linux 一键启动
- `DEVELOPER_LOG.zh.md`: 中文功能说明与版本记录。每条版本标题是 `V版本号-名称`
- `DEVELOPER_LOG.en.md`: 同一份日志的英文版

## 本地运行

直接双击 `index.html`，用 Chrome、Edge 或 Safari 打开即可。

也可以用本地服务器：

- Windows：双击 `start_windows.bat`，浏览器打开 `http://localhost:8080`
- Mac：在终端进入本目录，执行 `python3 -m http.server 8080`，然后打开 `http://localhost:8080`。也可以双击 `start_mac.command`

## 和网站同步

仓库发布到 GitHub 之后，在仓库的 Settings → Pages 里把 Source 设为 **Deploy from a branch**，Branch 选 `main`，文件夹选 `/ (root)`，然后保存。网站地址是 `https://<你的用户名>.github.io/la-area-housing-map/`。页面内容和 `main` 分支是同一套文件。

- **更新网站：** 在 GitHub Desktop 里提交，再点 Push origin。Pages 会用这次推送重新发布，通常一两分钟内能在网页上看到。
- **获取网站上的版本：** 点 Fetch origin，有更新再点 Pull。拉下来的就是网站正在用的文件。
