# Oil Monitoring System Deployment Script for Windows
# این اسکریپت برای استقرار خودکار پروژه监控系统 نفت روی ویندوز است

# رنگ‌ها برای خروجی
function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# تابع اصلی استقرار
function Deploy {
    Write-Info "شروع استقرار监控系统 نفت روی ویندوز..."
    
    # بررسی وجود Node.js
    if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js نصب نشده است. لطفاً ابتدا Node.js را نصب کنید."
        exit 1
    }
    
    # بررسی وجود npm
    if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
        Write-Error "npm نصب نشده است."
        exit 1
    }
    
    # نصب وابستگی‌ها
    Write-Info "نصب وابستگی‌ها..."
    npm ci
    
    # ساخت نسخه تولید
    Write-Info "ساخت نسخه تولید..."
    npm run build
    
    # به‌روزرسانی پایگاه داده
    Write-Info "به‌روزرسانی پایگاه داده..."
    npm run db:push
    
    # ایجاد دایرکتوری لاگ‌ها
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    
    # توقف نمونه‌های قبلی (در صورت وجود)
    if (Get-Command "pm2" -ErrorAction SilentlyContinue) {
        Write-Info "توقف نمونه‌های قبلی..."
        pm2 stop oil-monitoring-system 2>$null
        pm2 delete oil-monitoring-system 2>$null
    }
    
    # انتخاب روش استقرار
    Write-Host "لطفاً روش استقرار را انتخاب کنید:"
    Write-Host "1) PM2 (توصیه شده)"
    Write-Host "2) Docker"
    Write-Host "3) هر دو"
    
    $choice = Read-Host "گزینه را وارد کنید (1-3)"
    
    switch ($choice) {
        "1" { Deploy-PM2 }
        "2" { Deploy-Docker }
        "3" { 
            Deploy-PM2
            Deploy-Docker
        }
        default {
            Write-Error "گزینه نامعتبر است."
            exit 1
        }
    }
    
    Write-Info "استقرار با موفقیت انجام شد!"
    
    # نمایش اطلاعات دسترسی
    Write-Host ""
    Write-Host "=== اطلاعات دسترسی ==="
    Write-Host "برای دسترسی به سیستم:"
    Write-Host "- محلی: http://localhost:3000"
    Write-Host "- سلامت سیستم: http://localhost:3000/api/health"
    Write-Host ""
    Write-Host "برای مشاهده لاگ‌ها:"
    Write-Host "- PM2: pm2 logs oil-monitoring-system"
    Write-Host "- Docker: docker-compose logs -f"
    Write-Host ""
}

# استقرار با PM2
function Deploy-PM2 {
    Write-Info "استقرار با PM2..."
    
    # بررسی وجود PM2
    if (-not (Get-Command "pm2" -ErrorAction SilentlyContinue)) {
        Write-Warning "PM2 نصب نشده است. در حال نصب..."
        npm install -g pm2
    }
    
    # شروع برنامه با PM2
    pm2 start ecosystem.config.js
    
    Write-Info "برنامه با PM2 اجرا شد."
}

# استقرار با Docker
function Deploy-Docker {
    Write-Info "استقرار با Docker..."
    
    # بررسی وجود Docker
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Error "Docker نصب نشده است."
        return
    }
    
    # بررسی وجود Docker Compose
    if (-not (Get-Command "docker-compose" -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose نصب نشده است."
        return
    }
    
    # ساخت و اجرای کانتینرها
    docker-compose down 2>$null
    docker-compose up -d --build
    
    Write-Info "کانتینرهای Docker اجرا شدند."
}

# تابع توقف برنامه
function Stop {
    Write-Info "توقف برنامه..."
    
    # توقف PM2
    if (Get-Command "pm2" -ErrorAction SilentlyContinue) {
        pm2 stop oil-monitoring-system 2>$null
        pm2 delete oil-monitoring-system 2>$null
    }
    
    # توقف Docker
    if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        docker-compose down 2>$null
    }
    
    Write-Info "برنامه با موفقیت متوقف شد."
}

# تابع نمایش وضعیت
function Status {
    Write-Info "وضعیت برنامه:"
    
    # وضعیت PM2
    if (Get-Command "pm2" -ErrorAction SilentlyContinue) {
        Write-Host "--- PM2 Status ---"
        pm2 status oil-monitoring-system 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "PM2: برنامه در حال اجرا نیست"
        }
    }
    
    # وضعیت Docker
    if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        Write-Host "--- Docker Status ---"
        docker-compose ps 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Docker: کانتینرها در حال اجرا نیستند"
        }
    }
    
    # بررسی سلامت سیستم
    Write-Host "--- Health Check ---"
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5
        Write-Host "System: Healthy"
    } catch {
        Write-Host "System: Not responding"
    }
}

# تابع نمایش لاگ‌ها
function Logs {
    Write-Info "نمایش لاگ‌ها..."
    
    Write-Host "انتخاب منبع لاگ:"
    Write-Host "1) PM2"
    Write-Host "2) Docker"
    Write-Host "3) فایل‌های لاگ محلی"
    
    $choice = Read-Host "گزینه را وارد کنید (1-3)"
    
    switch ($choice) {
        "1" {
            if (Get-Command "pm2" -ErrorAction SilentlyContinue) {
                pm2 logs oil-monitoring-system
            } else {
                Write-Error "PM2 نصب نشده است."
            }
        }
        "2" {
            if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
                docker-compose logs -f
            } else {
                Write-Error "Docker Compose نصب نشده است."
            }
        }
        "3" {
            if (Test-Path "logs") {
                Get-ChildItem "logs\*.log" | ForEach-Object {
                    Write-Host "=== $($_.Name) ==="
                    Get-Content $_.FullName -Tail 50
                    Write-Host ""
                }
            } else {
                Write-Error "دایرکتوری لاگ‌ها وجود ندارد."
            }
        }
        default {
            Write-Error "گزینه نامعتبر است."
        }
    }
}

# پردازش آرگومان‌های خط فرمان
switch ($args[0]) {
    "deploy" { Deploy }
    "stop" { Stop }
    "status" { Status }
    "logs" { Logs }
    default {
        Write-Host "استفاده: .\deploy-windows.ps1 {deploy|stop|status|logs}"
        Write-Host ""
        Write-Host "دستورات:"
        Write-Host "  deploy  - استقرار برنامه"
        Write-Host "  stop    - توقف برنامه"
        Write-Host "  status  - نمایش وضعیت برنامه"
        Write-Host "  logs    - نمایش لاگ‌ها"
        exit 1
    }
}