@echo off
chcp 65001 >nul
echo 正在为您启动 LA Area Housing Map 本地服务器...
where python >nul 2>nul
if %errorlevel%==0 (
    start http://localhost:8080
    python -m http.server 8080
) else (
    echo 未检测到 Python，正在直接用默认浏览器打开 index.html...
    start index.html
)
