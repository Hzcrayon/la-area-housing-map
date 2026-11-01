# LA Area Housing Map

LA 周边住房成交价格交互地图，当前版本 **4.1**。

地图覆盖大洛杉矶周边，向西北到 Santa Barbara，向东南到南橙县沿海，共 506 个网格。V2.8 把大洛杉矶里还偏粗的格子拆到邮编，并补上西侧、南侧、东南和东侧的空白。V2.9 把成交数据从页面代码里拆到 `housing_data.json`。V3.0 让右侧说明框可以收起，并把价格热力图分成 16 档。V3.1 把每个地区的说明改成区域简介，成交数字的文字说明改到房价旁边。V3.2 补上便利性、五档治安和到 USC 的大约车程，中位价上限改为 20 万美元起、每步 5 万美元。V3.3 在市中心到尔湾这一圈继续加密，并酌情补了周边邮编，成交价仍来自 Redfin。V3.4 改写了便利性，没有的店不再写上；成交跨度标尺改为绿到红；右侧说明栏可以拖动调整宽度，拖得过窄会收起。V3.5 为平均价、最低价和最高价各加一条上限滑杆，并可以按小于、高于或介于两个金额来搜这四项价格。V3.6 增加按每平方英尺均价着色的热力图，价格条件也可以筛这个数；说明栏拖到最窄就停住，不再自动收起。V4.0 为每个格子补上近 6、9、12 个月的空字段，并可以在顶栏切换周期；这三个周期的数字以后再填。V4.1 让中位价、最低价、最高价的「不限」可以点开输入自定义上限，并在说明栏画出四条价格随 3、6、9、12 个月变化的曲线；没写入的月份先空着。点开区块可以跳到对应页面。版本名称写在 `DEVELOPER_LOG.zh.md`。英文说明在 `DEVELOPER_LOG.en.md`。

## 项目文件

- `index.html`: 网站主页面。标题、页眉徽章和 `application-version` 都是 `4.1`
- `housing_data.json`: 506 个网格的成交数据库、区域简介、便利性、治安和到 USC 的车程。改价格、成交量或简介时改这个文件
- `app.js`: 读取上面的 JSON，负责地图交互、四维指标热力渲染、免 API Key 底图切换
- `start_windows.bat`: Windows 一键启动
- `serve_local.ps1`: 没有 Python 时，由上面的 bat 调用
- `start_mac.command`: macOS / Linux 一键启动
- `DEVELOPER_LOG.zh.md`: 中文功能说明与版本记录。每条版本标题是 `V版本号-名称`
- `DEVELOPER_LOG.en.md`: 同一份日志的英文版

## 本地运行

成交数据在 `housing_data.json`，需要通过本地服务器打开，不要直接双击 `index.html`。

- Windows：双击 `start_windows.bat`，浏览器打开 `http://localhost:8080`
- Mac：双击 `start_mac.command`。也可以在终端进入本目录，执行 `python3 -m http.server 8080`，然后打开 `http://localhost:8080`

## 和网站同步

仓库发布到 GitHub 之后，在仓库的 Settings → Pages 里把 Source 设为 **Deploy from a branch**，Branch 选 `main`，文件夹选 `/ (root)`，然后保存。网站地址是 `https://<你的用户名>.github.io/la-area-housing-map/`。页面内容和 `main` 分支是同一套文件。

- **更新网站：** 在 GitHub Desktop 里提交，再点 Push origin。Pages 会用这次推送重新发布，通常一两分钟内能在网页上看到。
- **获取网站上的版本：** 点 Fetch origin，有更新再点 Pull。拉下来的就是网站正在用的文件。
