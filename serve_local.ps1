# 没有 Python 时，用这个脚本在 8080 端口打开地图，这样浏览器可以读取 housing_data.json。
$ErrorActionPreference = 'Stop'
$port = 8080
$prefix = "http://localhost:$port/"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
  $listener.Start()
} catch {
  Write-Output "8080 端口无法打开。如果地图已经在浏览器里，直接使用那个页面即可。"
  exit 1
}
Start-Process $prefix
Write-Output "LA Area Housing Map: $prefix"
Write-Output "按 Ctrl+C 停止。"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = $ctx.Request.Url.LocalPath
  if ($rel -eq '/') { $rel = '/index.html' }
  $file = Join-Path $root ($rel.TrimStart('/') -replace '/','\')
  if (Test-Path -LiteralPath $file) {
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = switch ($ext) {
      '.html' { 'text/html; charset=utf-8' }
      '.js' { 'text/javascript; charset=utf-8' }
      '.json' { 'application/json; charset=utf-8' }
      '.css' { 'text/css; charset=utf-8' }
      default { 'application/octet-stream' }
    }
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
  }
  $ctx.Response.Close()
}
