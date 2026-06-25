# start_project.ps1
# This script starts the MongoDB, Backend, and Frontend of the Ride Aggregator project.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "    Starting Vahanm Ride Aggregator Project  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Paths configuration
$NodeDir = "$env:USERPROFILE\.node\node-v22.12.0-win-x64"
$MongoBaseDir = "$env:USERPROFILE\.mongodb"
$MongoDataDir = "$MongoBaseDir\data"
$MongoLogFile = "$MongoBaseDir\log\mongod.log"

# 2. Check and configure Node
if (-not (Test-Path $NodeDir)) {
    Write-Host "[*] Node.js not found locally. Downloading..." -ForegroundColor Yellow
    $NodeZip = "$env:TEMP\node.zip"
    curl.exe -L -o $NodeZip "https://nodejs.org/dist/v22.12.0/node-v22.12.0-win-x64.zip"
    Write-Host "[*] Extracting Node.js..." -ForegroundColor Yellow
    Expand-Archive -Path $NodeZip -DestinationPath "$env:USERPROFILE\.node" -Force
    Remove-Item $NodeZip -Force
    Write-Host "[+] Node.js configured successfully." -ForegroundColor Green
} else {
    Write-Host "[+] Node.js found at: $NodeDir" -ForegroundColor Green
}

# Add local Node to PATH for this script session
$env:PATH = "$NodeDir;" + $env:PATH

# 3. Check and configure MongoDB
if (-not (Test-Path $MongoBaseDir)) {
    New-Item -ItemType Directory -Path $MongoBaseDir -Force | Out-Null
}

$ExtractedFolder = Get-ChildItem -Path $MongoBaseDir -Directory | Where-Object { $_.Name -like "mongodb-*" } | Select-Object -First 1
if (-not $ExtractedFolder) {
    Write-Host "[*] MongoDB not found locally. Extracting zip..." -ForegroundColor Yellow
    $MongoZip = "$env:TEMP\mongodb.zip"
    if (-not (Test-Path $MongoZip)) {
        Write-Host "[*] Downloading MongoDB zip..." -ForegroundColor Yellow
        curl.exe -L -o $MongoZip "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.3.zip"
    }
    Write-Host "[*] Extracting MongoDB..." -ForegroundColor Yellow
    Expand-Archive -Path $MongoZip -DestinationPath $MongoBaseDir -Force
    $ExtractedFolder = Get-ChildItem -Path $MongoBaseDir -Directory | Where-Object { $_.Name -like "mongodb-*" } | Select-Object -First 1
}

if ($ExtractedFolder) {
    $MongoDir = $ExtractedFolder.FullName
    Write-Host "[+] MongoDB binaries found at: $MongoDir" -ForegroundColor Green
} else {
    Write-Error "Could not locate extracted MongoDB binaries folder."
    exit 1
}

# Ensure MongoDB directories exist
if (-not (Test-Path $MongoDataDir)) {
    New-Item -ItemType Directory -Path $MongoDataDir -Force | Out-Null
}
if (-not (Test-Path (Split-Path $MongoLogFile))) {
    New-Item -ItemType Directory -Path (Split-Path $MongoLogFile) -Force | Out-Null
}

# 4. Start MongoDB
$MongoPort = 27017
$IsMongoRunning = Get-NetTCPConnection -LocalPort $MongoPort -ErrorAction SilentlyContinue

if (-not $IsMongoRunning) {
    Write-Host "[*] Starting MongoDB on port $MongoPort..." -ForegroundColor Yellow
    $MongodPath = "$MongoDir\bin\mongod.exe"
    Start-Process -FilePath $MongodPath -ArgumentList "--dbpath `"$MongoDataDir`"", "--logpath `"$MongoLogFile`"", "--port $MongoPort" -NoNewWindow
    # Wait for Mongo to start
    Start-Sleep -Seconds 5
    Write-Host "[+] MongoDB started successfully." -ForegroundColor Green
} else {
    Write-Host "[+] MongoDB is already running on port $MongoPort." -ForegroundColor Green
}

# 5. Start Backend
$BackendPort = 8080
$IsBackendRunning = Get-NetTCPConnection -LocalPort $BackendPort -ErrorAction SilentlyContinue

if (-not $IsBackendRunning) {
    Write-Host "[*] Starting Spring Boot Backend on port $BackendPort..." -ForegroundColor Yellow
    
    # We set SPRING_DATA_MONGODB_URI
    $env:SPRING_DATA_MONGODB_URI = "mongodb://localhost:$MongoPort/vahanm"
    
    # Run maven in a new window so the user can see log output
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:SPRING_DATA_MONGODB_URI='mongodb://localhost:$MongoPort/vahanm'; cd '$PSScriptRoot\vahanm\backend'; mvn spring-boot:run"
    
    Write-Host "[+] Backend start command triggered in a new window." -ForegroundColor Green
} else {
    Write-Host "[+] Port $BackendPort is already in use. Assuming backend is running." -ForegroundColor Green
}

# 6. Start Frontend
$FrontendPort = 5173
$IsFrontendRunning = Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue

if (-not $IsFrontendRunning) {
    Write-Host "[*] Starting Vite Frontend on port $FrontendPort..." -ForegroundColor Yellow
    
    # Run npm dev server in a new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='$NodeDir;' + `$env:PATH; cd '$PSScriptRoot\vahanm\frontend'; npm run dev"
    
    Write-Host "[+] Frontend dev server start command triggered in a new window." -ForegroundColor Green
} else {
    Write-Host "[+] Port $FrontendPort is already in use. Assuming frontend is running." -ForegroundColor Green
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Setup complete! Access the app in browser: " -ForegroundColor Cyan
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host " Backend:  http://localhost:8080" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
