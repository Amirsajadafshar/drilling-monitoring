# Setup script for Oil Monitoring System on Windows
# این اسکریپت برای آماده‌سازی محیط استقرار روی ویندوز است

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

Write-Info "شروع آماده‌سازی محیط استقرار监控系统 نفت روی ویندوز..."

# ایجاد دایرکتوری‌های لازم
Write-Info "ایجاد دایرکتوری‌های لازم..."
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}
if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
}
if (-not (Test-Path "ssl")) {
    New-Item -ItemType Directory -Path "ssl" | Out-Null
}
if (-not (Test-Path "db")) {
    New-Item -ItemType Directory -Path "db" | Out-Null
}

# کپی فایل محیطی اگر وجود ندارد
if (-not (Test-Path ".env")) {
    Write-Info "ایجاد فایل محیطی..."
    Copy-Item ".env.example" ".env"
    Write-Warning "فایل .env ایجاد شد. لطفاً آن را ویرایش کرده و مقادیر مناسب را وارد کنید."
}

# ایجاد گواهی‌های SSL تستی (فقط برای توسعه)
if ((-not (Test-Path "ssl\cert.pem")) -or (-not (Test-Path "ssl\key.pem"))) {
    Write-Info "ایجاد گواهی‌های SSL تستی..."
    
    # بررسی وجود OpenSSL
    if (-not (Get-Command "openssl" -ErrorAction SilentlyContinue)) {
        Write-Warning "OpenSSL یافت نشد. برای ایجاد گواهی‌های SSL، OpenSSL را نصب کنید یا از گواهی‌های موجود استفاده کنید."
        Write-Info "می‌توانید OpenSSL را از طریق Chocolatey نصب کنید: choco install openssl"
    } else {
        try {
            openssl req -x509 -newkey rsa:4096 -keyout "ssl\key.pem" -out "ssl\cert.pem" -days 365 -nodes -subj "/C=IR/ST=Tehran/L=Tehran/O=Oil Monitoring/CN=localhost"
            Write-Warning "گواهی‌های SSL تستی ایجاد شدند. برای محیط تولید، گواهی‌های معتبر جایگزین کنید."
        } catch {
            Write-Warning "خطا در ایجاد گواهی‌های SSL. لطفاً به صورت دستی ایجاد کنید."
        }
    }
}

# نصب وابستگی‌ها
Write-Info "نصب وابستگی‌ها..."
npm ci

# ساخت پایگاه داده
Write-Info "ساخت پایگاه داده..."
npm run db:push

# ساخت نسخه توسعه (برای تست)
Write-Info "ساخت نسخه توسعه..."
npm run build

Write-Info "آماده‌سازی محیط با موفقیت انجام شد!"
Write-Host ""
Write-Host "=== مراحل بعدی ==="
Write-Host "1. فایل .env را ویرایش کرده و مقادیر مناسب را وارد کنید"
Write-Host "2. برای استقرار برنامه، دستور زیر را اجرا کنید:"
Write-Host "   .\deploy-windows.ps1 deploy"
Write-Host "3. پس از استقرار، سیستم از طریق آدرس زیر قابل دسترسی است:"
Write-Host "   http://localhost:3000"
Write-Host ""
Write-Warning "یادآوری: برای محیط تولید، گواهی‌های SSL معتبر و تنظیمات دامنه را فراموش نکنید."