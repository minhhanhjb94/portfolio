$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

# Add System.Web assembly to decode URL paths correctly
Add-Type -AssemblyName System.Web

try {
    $listener.Start()
    Write-Host ""
    Write-Host "🏰 ✨ Cozy Academy PowerShell Server Active! ✨ 🏰"
    Write-Host "👉 Local Portal Link: http://localhost:$port"
    Write-Host "Press [Ctrl + C] in the terminal to extinguish the fire and stop the server."
    Write-Host ""

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $rawPath = $request.Url.LocalPath
            $urlPath = [System.Web.HttpUtility]::UrlDecode($rawPath)
            
            if ($urlPath -eq "/" -or $urlPath -eq "") { 
                $urlPath = "/index.html" 
            }
            
            # Strip leading slash to get relative path
            $relPath = $urlPath.TrimStart('/')
            $filePath = Join-Path (Get-Location) $relPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html" }
                    ".css" { "text/css" }
                    ".js" { "text/javascript" }
                    ".png" { "image/png" }
                    ".jpg" { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg" { "image/svg+xml" }
                    ".ico" { "image/x-icon" }
                    default { "application/octet-stream" }
                }

                try {
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)
                    $response.ContentType = $mime
                    $response.SendChunked = $true
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } catch {
                    Write-Host "Error sending file $($relPath): $($_.Exception.Message)"
                }
            } else {
                $response.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>The requested file does not exist in this academy archive.</p>")
                $response.ContentType = "text/html"
                $response.ContentLength64 = $errBytes.Length
                try {
                    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                } catch {}
            }
            try {
                $response.Close()
            } catch {}
        } catch {
            Write-Host "Error handling request: $($_.Exception.Message)"
        }
    }
} catch {
    Write-Error $_
} finally {
    $listener.Stop()
}
