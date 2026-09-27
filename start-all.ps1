# E-Shopping Zone — Automated Startup Script
# Run in PowerShell: .\start-all.ps1

$baseDir = $PSScriptRoot
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-8.0.504.1-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;C:\Users\Asus\.m2\apache-maven-3.8.8\bin;$env:PATH"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   E-Shopping Zone — Full Stack Microservices Launcher" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check / Start MySQL
Write-Host "`n[1/8] Checking MySQL daemon..." -ForegroundColor Yellow
$mysqlProc = Get-Process *mysqld* -ErrorAction SilentlyContinue
if (-not $mysqlProc) {
    Start-Process -FilePath "C:\xampp\mysql\bin\mysqld.exe" -ArgumentList "--defaults-file=C:\xampp\mysql\bin\my.ini --standalone" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "MySQL started." -ForegroundColor Green
} else {
    Write-Host "MySQL is already running." -ForegroundColor Green
}

# 2. Start Eureka Server (Port 8761)
Write-Host "`n[2/8] Starting Eureka Discovery Server (Port 8761)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; `$env:PATH='$env:PATH'; cd '$baseDir\backend\eureka-server'; mvn spring-boot:run"
Write-Host "Waiting 12 seconds for Eureka to initialize..."
Start-Sleep -Seconds 12

# 3. Start Profile Service (Port 8081)
Write-Host "`n[3/8] Starting Profile Service (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; `$env:PATH='$env:PATH'; cd '$baseDir\backend\profile-service'; mvn spring-boot:run"

# 4. Start Product Service (Port 8082)
Write-Host "`n[4/8] Starting Product Service (Port 8082)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; `$env:PATH='$env:PATH'; cd '$baseDir\backend\product-service'; mvn spring-boot:run"

# 5. Start Cart Service (Port 8083)
Write-Host "`n[5/8] Starting Cart Service (Port 8083)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; `$env:PATH='$env:PATH'; cd '$baseDir\backend\cart-service'; mvn spring-boot:run"

# 6. Start Wallet Service (Port 8085)
Write-Host "`n[6/8] Starting Wallet Service (Port 8085)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; `$env:PATH='$env:PATH'; cd '$baseDir\backend\wallet-service'; mvn spring-boot:run"

# 7. Start Order Service (Port 8084)
Write-Host "`n[7/8] Starting Order Service (Port 8084)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; `$env:PATH='$env:PATH'; cd '$baseDir\backend\order-service'; mvn spring-boot:run"

Write-Host "Waiting 15 seconds for microservices to register with Eureka..."
Start-Sleep -Seconds 15

# 8. Start API Gateway (Port 8080)
Write-Host "`n[8/8] Starting Spring Cloud API Gateway (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; `$env:PATH='$env:PATH'; cd '$baseDir\backend\api-gateway'; mvn spring-boot:run"

# 9. Start React Frontend (Port 5173)
Write-Host "`nStarting Frontend Vite Dev Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$baseDir\frontend'; npm run dev"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   All Services Launched Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Frontend URL:       http://localhost:5173" -ForegroundColor White
Write-Host "API Gateway:        http://localhost:8080" -ForegroundColor White
Write-Host "Eureka Dashboard:   http://localhost:8761" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
