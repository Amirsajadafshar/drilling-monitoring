# راهنمای استقرار سریع监控系统 نفت

## خلاصه مراحل استقرار

### 1. آماده‌سازی محیط
```bash
# اجرای اسکریپت آماده‌سازی
./setup.sh

# ویرایش فایل محیطی
nano .env
```

### 2. استقرار برنامه
```bash
# استقرار با اسکریپت خودکار
./deploy.sh deploy
```

### 3. تنظیم دامنه
1. **تنظیم DNS**:
   - A record: `your-domain.com` → `IP_SERVER`
   - CNAME: `www` → `your-domain.com`

2. **تنظیم Nginx**:
   ```nginx
   server_name your-domain.com www.your-domain.com;
   ```

3. **دریافت SSL**:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

### 4. دسترسی به سیستم
- **آدرس اصلی**: https://your-domain.com
- **سلامت سیستم**: https://your-domain.com/api/health
- **Socket.IO**: wss://your-domain.com/api/socketio

## دستورات مفید

### مدیریت برنامه
```bash
# استقرار
./deploy.sh deploy

# توقف
./deploy.sh stop

# وضعیت
./deploy.sh status

# لاگ‌ها
./deploy.sh logs
```

### مدیریت پایگاه داده
```bash
# پشتیبان‌گیری
cp db/custom.db backups/custom-$(date +%Y%m%d).db

# بازگردانی
cp backups/custom-20240101.db db/custom.db
```

### به‌روزرسانی
```bash
# کشیدن تغییرات
git pull origin main

# استقرار مجدد
./deploy.sh deploy
```

## عیب‌یابی سریع

### برنامه اجرا نمی‌شود
```bash
# بررسی وضعیت
./deploy.sh status

# بررسی لاگ‌ها
./deploy.sh logs

# بررسی پورت‌ها
sudo netstat -tulpn | grep :3000
```

### Socket.IO کار نمی‌کند
- بررسی تنظیمات Nginx برای WebSocket
- بررسی پورت 3000 در فایروال
- بررسی لاگ‌های سرور

### دامنه کار نمی‌کند
- بررسی تنظیمات DNS
- بررسی تنظیمات Nginx
- بررسی SSL certificate

## پیکربندی پیشنهادی سرور

### حداقل منابع
- CPU: 2 هسته
- RAM: 4GB
- Storage: 50GB SSD
- OS: Ubuntu 20.04/22.04

### پورت‌های لازم
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (Application)

### نرم‌افزارهای مورد نیاز
- Node.js 18+
- PM2 (برای مدیریت فرآیندها)
- Nginx (برای reverse proxy)
- Docker (اختیاری)

---

## تماس با پشتیبانی

در صورت بروز مشکل، با تیم پشتیبانی تماس بگیرید:
- ایمیل: support@your-domain.com
- تلفن: +98-21-12345678