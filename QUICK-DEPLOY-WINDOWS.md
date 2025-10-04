# راهنمای استقرار سریع监控系统 نفت روی ویندوز

## خلاصه مراحل استقرار

### 1. پیش‌نیازها
```cmd
# نصب Node.js از https://nodejs.org/
# نصب PM2
npm install -g pm2

# نصب Docker Desktop (اختیاری)
# دانلود از https://www.docker.com/products/docker-desktop
```

### 2. آماده‌سازی محیط
```powershell
# اجرای PowerShell به عنوان Administrator
cd "C:\path\to\your\project"

# آماده‌سازی محیط
.\setup-windows.ps1

# ویرایش فایل محیطی
notepad .env
```

### 3. استقرار برنامه
```powershell
# استقرار با اسکریپت خودکار
.\deploy-windows.ps1 deploy
```

### 4. تنظیم فایروال
```powershell
# باز کردن پورت‌ها
New-NetFirewallRule -DisplayName "Oil Monitoring System" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "Oil Monitoring HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "Oil Monitoring HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

### 5. دسترسی به سیستم
- **محلی**: http://localhost:3000
- **سلامت سیستم**: http://localhost:3000/api/health

## دستورات مفید

### مدیریت برنامه
```powershell
# استقرار
.\deploy-windows.ps1 deploy

# توقف
.\deploy-windows.ps1 stop

# وضعیت
.\deploy-windows.ps1 status

# لاگ‌ها
.\deploy-windows.ps1 logs
```

### مدیریت پایگاه داده
```powershell
# پشتیبان‌گیری
Copy-Item "db\custom.db" "backups\custom-$(Get-Date -Format 'yyyyMMdd').db"

# بازگردانی
Copy-Item "backups\custom-20240101.db" "db\custom.db"
```

### عیب‌یابی سریع
```powershell
# بررسی وضعیت
.\deploy-windows.ps1 status

# بررسی پورت‌ها
netstat -an | findstr :3000

# بررسی فرآیندها
tasklist | findstr node
```

## تنظیم دامنه (اختیاری)

### 1. تنظیم DNS
- A record: `your-domain.com` → `Your_Public_IP`

### 2. نصب IIS
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -All
```

### 3. دریافت SSL
```powershell
# استفاده از win-acme
.\wacs.exe --target manual --host your-domain.com --validation filesystem --webroot "C:\inetpub\wwwroot"
```

### 4. دسترسی با دامنه
- **آدرس اصلی**: https://your-domain.com
- **سلامت سیستم**: https://your-domain.com/api/health

---

## نکات مهم

1. **Administrator**: برخی دستورات نیاز به دسترسی Administrator دارند
2. **فایروال**: مطمئن شوید پورت‌های لازم باز هستند
3. **PM2**: برای مدیریت فرآیندها توصیه می‌شود
4. **پشتیبان‌گیری**: به صورت منظم پشتیبان بگیرید

## تماس با پشتیبانی

در صورت بروز مشکل، مستندات کامل را در `DEPLOYMENT-WINDOWS.md` مطالعه کنید.