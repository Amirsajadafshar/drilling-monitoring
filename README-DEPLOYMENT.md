# استقرار سریع监控系统 نفت

## راه‌اندازی سریع

### 1. استقرار با اسکریپت خودکار (توصیه شده)

```bash
# استقرار کامل
./deploy.sh deploy

# توقف برنامه
./deploy.sh stop

# مشاهده وضعیت
./deploy.sh status

# مشاهده لاگ‌ها
./deploy.sh logs
```

### 2. استقرار دستی

#### با PM2:
```bash
# نصب وابستگی‌ها
npm ci

# ساخت نسخه تولید
npm run build

# به‌روزرسانی پایگاه داده
npm run db:push

# نصب PM2 (در صورت عدم وجود)
npm install -g pm2

# شروع برنامه
pm2 start ecosystem.config.js

# ذخیره وضعیت
pm2 save

# تنظیم شروع خودکار
pm2 startup
```

#### با Docker:
```bash
# ساخت و اجرا
docker-compose up -d --build

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف
docker-compose down
```

## اتصال به دامنه

### 1. تنظیم DNS
- A record دامنه خود را به IP سرور اشاره دهید
- برای دامنه‌های فرعی، C record تنظیم کنید

### 2. تنظیم Nginx
فایل `nginx.conf` را ویرایش کرده و دامنه خود را جایگزین `localhost` کنید:

```nginx
server_name your-domain.com www.your-domain.com;
```

### 3. دریافت SSL Certificate
```bash
# نصب Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# دریافت گواهی
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 4. اجرا با Nginx
```bash
# اجرا با Docker و Nginx
docker-compose --profile with-proxy up -d
```

## دسترسی به سیستم

پس از استقرار، سیستم از طریق آدرس‌های زیر قابل دسترسی است:

- **محلی**: http://localhost:3000
- **با دامنه**: https://your-domain.com
- **سلامت سیستم**: https://your-domain.com/api/health
- **Socket.IO**: wss://your-domain.com/api/socketio

## عیب‌یابی

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
- مطمئن شوید تنظیمات Nginx برای WebSocket صحیح است
- بررسی کنید که پورت 3000 در فایروال باز است
- از سلامت Socket.IO اطمینان حاصل کنید

### دامنه کار نمی‌کند
- بررسی تنظیمات DNS
- اطمینان از صحت تنظیمات Nginx
- بررسی SSL certificate

## پشتیبان‌گیری

```bash
# پشتیبان‌گیری از پایگاه داده
cp db/custom.db backup-$(date +%Y%m%d).db

# پشتیبان‌گیری کامل
tar -czf backup-$(date +%Y%m%d).tar.gz ./
```

## به‌روزرسانی

```bash
# کشیدن تغییرات
git pull origin main

# استقرار مجدد
./deploy.sh deploy
```

---

## تماس با پشتیبانی

در صورت بروز مشکل، لاگ‌های سیستم را بررسی کرده و در صورت لزوم با تیم پشتیبانی تماس بگیرید.