# راهنمای استقرار پروژه监控系统 نفت

## مراحل استقرار و اتصال به دامنه

### 1. ساخت نسخه تولید (Build)

```bash
# ساخت نسخه تولید
npm run build

# ساخت پایگاه داده
npm run db:push
```

### 2. تنظیمات محیط تولید

ایجاد فایل `.env.production`:
```bash
# کپی فایل محیطی
cp .env.example .env.production
```

مقادیر زیر را در فایل `.env.production` تنظیم کنید:
```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# تنظیمات پایگاه داده
DATABASE_URL="file:./db/custom.db"

# تنظیمات دامنه (در صورت نیاز)
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 3. گزینه‌های استقرار

#### گزینه 1: استفاده از PM2 (توصیه شده)

نصب PM2:
```bash
npm install -g pm2
```

ایجاد فایل `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'oil-monitoring-system',
    script: 'server.ts',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    interpreter: 'tsx',
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

اجرای برنامه با PM2:
```bash
# شروع برنامه
pm2 start ecosystem.config.js

# ذخیره وضعیت PM2
pm2 save

# تنظیم برای شروع خودکار با سیستم
pm2 startup
```

#### گزینه 2: استفاده از Docker

ایجاد فایل `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# کپی فایل‌های پیکربندی
COPY package*.json ./
COPY prisma ./prisma/

# نصب وابستگی‌ها
RUN npm ci --only=production

# کپی کد منبع
COPY . .

# ساخت برنامه
RUN npm run build
RUN npm run db:push

# افشای پورت
EXPOSE 3000

# شروع برنامه
CMD ["npm", "start"]
```

ایجاد فایل `docker-compose.yml`:
```yaml
version: '3.8'

services:
  oil-monitoring:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

اجرای Docker:
```bash
docker-compose up -d
```

### 4. تنظیمات وب سرور (Nginx)

نمونه تنظیمات Nginx برای دامنه شما:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # ریدایرکت به HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # تنظیمات SSL (از Let's Encrypt استفاده کنید)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # تنظیمات امنیتی SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # پراکسی به برنامه Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # تنظیمات Socket.IO
    location /api/socketio/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # فایل‌های استاتیک
    location /_next/static/ {
        alias /app/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. دریافت SSL Certificate (Let's Encrypt)

```bash
# نصب Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# دریافت گواهی SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# تنظیم تمدید خودکار
sudo crontab -e
# اضافه کردن خط زیر:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. راه‌اندازی فایروال

```bash
# نصب UFW
sudo apt install ufw

# تنظیمات فایروال
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 7. مانیتورینگ و لاگ‌ها

#### با PM2:
```bash
# مشاهده وضعیت برنامه‌ها
pm2 status

# مشاهده لاگ‌ها
pm2 logs oil-monitoring-system

# مانیتورینگ منابع
pm2 monit
```

#### با Docker:
```bash
# مشاهده لاگ‌ها
docker-compose logs -f

# مشاهده وضعیت کانتینر
docker-compose ps
```

### 8. به‌روزرسانی برنامه

#### با PM2:
```bash
# کشیدن تغییرات جدید
git pull origin main

# نصب وابستگی‌های جدید
npm install

# ساخت نسخه جدید
npm run build

# راه‌اندازی مجدد برنامه
pm2 restart oil-monitoring-system
```

#### با Docker:
```bash
# ساخت و اجرای مجدد
docker-compose down
docker-compose up -d --build
```

### 9. عیب‌یابی رایج

#### مشکل: برنامه اجرا نمی‌شود
```bash
# بررسی وضعیت PM2
pm2 status

# بررسی لاگ‌ها
pm2 logs

# بررسی پورت‌های باز
sudo netstat -tulpn | grep :3000
```

#### مشکل: Socket.IO کار نمی‌کند
- مطمئن شوید تنظیمات Nginx برای WebSocket صحیح است
- بررسی کنید که پورت 3000 در فایروال باز است
- بررسی لاگ‌های سرور برای خطاهای Socket.IO

#### مشکل: دامنه کار نمی‌کند
- بررسی تنظیمات DNS دامنه
- مطمئن شوید A record به IP سرور اشاره دارد
- بررسی تنظیمات Nginx و SSL certificate

### 10. پشتیبان‌گیری

```bash
# پشتیبان‌گیری از پایگاه داده
cp db/custom.db backups/custom-$(date +%Y%m%d).db

# پشتیبان‌گیری از کل پروژه
tar -czf backups/project-$(date +%Y%m%d).tar.gz .
```

---

## تماس با پشتیبانی

در صورت بروز هرگونه مشکل در استقرار، با تیم پشتیبانی تماس بگیرید.