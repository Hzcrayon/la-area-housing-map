#!/bin/bash
echo "正在为您启动 LA Area Housing Map 本地服务器..."
cd "$(dirname "$0")"
if command -v python3 &>/dev/null; then
    (sleep 1 && open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null) &
    python3 -m http.server 8080
else
    echo "没有找到 python3。成交数据在 housing_data.json，需要本地服务器才能打开。"
    echo "请先安装 Python 3，然后重新运行本脚本。"
fi
