# راهنمای استقرار监控系统 نفت روی ویندوز

## پیش‌نیازها

### 1. نصب Node.js
1. به سایت [Node.js](https://nodejs.org/) بروید
2. نسخه LTS را دانلود و نصب کنید
3. پس از نصب، Command Prompt یا PowerShell را باز کنید و بررسی کنید:
```cmd
node --version
npm --version
```

### 2. نصب Git (اختیاری)
```cmd
# دانلود از https://git-scm.com/
# یا با Chocolatey:
choco install git
```

### 3. نصب PM2
```cmd
npm install -g pm2
```

### 4. نصب Docker Desktop (اختیاری)
1. به سایت [Docker Desktop](https://www.docker.com/products/docker-desktop) بروید
2. Docker Desktop for Windows را دانلود و نصب کنید
3. سیستم را ری‌استارت کنید

## مراحل استقرار

### 1. آماده‌سازی محیط
```powershell
# اجرای PowerShell به عنوان Administrator
cd "C:\path\to\your\project"

# اجرای اسکریپت آماده‌سازی
.\setup-windows.ps1

# ویرایش فایل محیطی
notepad .env
```

### 2. استقرار برنامه
```powershell
# استقرار با اسکریپت خودکار
.\deploy-windows.ps1 deploy
```

### 3. تنظیم فایروال
```powershell
# باز کردن پورت 3000
New-NetFirewallRule -DisplayName "Oil Monitoring System" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

# باز کردن پورت 80 و 443 (در صورت نیاز)
New-NetFirewallRule -DisplayName "Oil Monitoring HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "Oil Monitoring HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

## تنظیم دامنه

### 1. تنظیم DNS
- A record: `your-domain.com` → `Your_Public_IP`
- CNAME: `www` → `your-domain.com`

### 2. نصب IIS
```powershell
# نصب IIS و ماژول‌های مورد نیاز
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-ApplicationDevelopment -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Security -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Performance -All
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebSockets -All
```

### 3. نصب ماژول‌های IIS
1. [URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite)
2. [Application Request Routing](https://www.iis.net/downloads/microsoft/application-request-routing)

### 4. دریافت SSL Certificate
```powershell
# دانلود win-acme
Invoke-WebRequest -Uri "https://github.com/win-acme/win-acme/releases/latest/download/win-acme.v2.2.2.zip" -OutFile "win-acme.zip"

# استخراج و اجرا
Expand-Archive -Path "win-acme.zip" -DestinationPath "C:\win-acme"
cd "C:\win-acme"
.\wacs.exe --target manual --host your-domain.com --validation filesystem --webroot "C:\inetpub\wwwroot" --installationsiteId 1 --installation script
```

## دستورات مدیریت

### مدیریت با PM2
```powershell
# استقرار
.\deploy-windows.ps1 deploy

# توقف
.\deploy-windows.ps1 stop

# وضعیت
.\deploy-windows.ps1 status

# لاگ‌ها
.\deploy-windows.ps1 logs

# راه‌اندازی مجدد
pm2 restart oil-monitoring-system

# مانیتورینگ
pm2 monit
```

### مدیریت با Docker
```powershell
# ساخت و اجرا
docker-compose up -d --build

# لاگ‌ها
docker-compose logs -f

# توقف
docker-compose down

# وضعیت
docker-compose ps
```

## دسترسی به سیستم

- **محلی**: http://localhost:3000
- **با دامنه**: https://your-domain.com
- **سلامت سیستم**: https://your-domain.com/api/health
- **Socket.IO**: wss://your-domain.com/api/socketio

## عیب‌یابی

### برنامه اجرا نمی‌شود
```powershell
# بررسی وضعیت
.\deploy-windows.ps1 status

# بررسی لاگ‌ها
.\deploy-windows.ps1 logs

# بررسی پورت‌ها
netstat -an | findstr :3000

# بررسی فرآیندها
tasklist | findstr node
```

### مشکل پورت
```powershell
# بررسی فرآیند در حال استفاده از پورت
netstat -ano | findstr :3000

# توقف فرآیند
taskkill /PID <PID> /F

# بررسی فایروال
Get-NetFirewallRule -DisplayName "*Oil*"
```

### مشکل Socket.IO
- بررسی فعال بودن WebSocket در IIS
- بررسی تنظیمات web.config
- بررسی لاگ‌های مرورگر

## پشتیبان‌گیری

### پایگاه داده
```powershell
# پشتیبان‌گیری
Copy-Item "db\custom.db" "backups\custom-$(Get-Date -Format 'yyyyMMdd').db"

# بازگردانی
Copy-Item "backups\custom-20240101.db" "db\custom.db"
```

### پشتیبان‌گیری کامل
```powershell
$backupDate = Get-Date -Format 'yyyyMMdd'
Compress-Archive -Path ".\*" -DestinationPath "backup-$backupDate.zip"
```

## اجرای خودکار

### ایجاد Task Scheduler
```powershell
$action = New-ScheduledTaskAction -Execute "PowerShell" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$PWD\deploy-windows.ps1`" deploy" -WorkingDirectory $PWD
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
Register-ScheduledTask -TaskName "Oil Monitoring System" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest
```

---

## نکات مهم

1. **اجرا به عنوان Administrator**: برخی دستورات نیاز به دسترسی Administrator دارند
2. **فایروال**: مطمئن شوید پورت‌های لازم در فایروال باز هستند
3. **SSL**: برای محیط تولید حتماً از SSL معتبر استفاده کنید
4. **پشتیبان‌گیری**: به صورت منظم از پایگاه داده پشتیبان بگیرید
5. **به‌روزرسانی**: برنامه را به صورت منظم به‌روزرسانی کنید

## تماس با پشتیبانی

در صورت بروز مشکل، با تیم پشتیبانی تماس بگیرید:
- ایمیل: support@your-domain.com
- تلفن: +98-21-12345678