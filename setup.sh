#!/bin/bash

# Setup script for Oil Monitoring System
# این اسکریپت برای آماده‌سازی محیط استقرار است

set -e

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info "شروع آماده‌سازی محیط استقرار监控系统 نفت..."

# ایجاد دایرکتوری‌های لازم
print_info "ایجاد دایرکتوری‌های لازم..."
mkdir -p logs
mkdir -p backups
mkdir -p ssl
mkdir -p db

# کپی فایل محیطی اگر وجود ندارد
if [ ! -f .env ]; then
    print_info "ایجاد فایل محیطی..."
    cp .env.example .env
    print_warning "فایل .env ایجاد شد. لطفاً آن را ویرایش کرده و مقادیر مناسب را وارد کنید."
fi

# ایجاد دایرکتوری SSL با گواهی‌های تستی (فقط برای توسعه)
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    print_info "ایجاد گواهی‌های SSL تستی..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=IR/ST=Tehran/L=Tehran/O=Oil Monitoring/CN=localhost"
    print_warning "گواهی‌های SSL تستی ایجاد شدند. برای محیط تولید، گواهی‌های معتبر جایگزین کنید."
fi

# نصب وابستگی‌ها
print_info "نصب وابستگی‌ها..."
npm ci

# ساخت پایگاه داده
print_info "ساخت پایگاه داده..."
npm run db:push

# ساخت نسخه توسعه (برای تست)
print_info "ساخت نسخه توسعه..."
npm run build

print_info "آماده‌سازی محیط با موفقیت انجام شد!"
echo ""
echo "=== مراحل بعدی ==="
echo "1. فایل .env را ویرایش کرده و مقادیر مناسب را وارد کنید"
echo "2. برای استقرار برنامه، دستور زیر را اجرا کنید:"
echo "   ./deploy.sh deploy"
echo "3. پس از استقرار، سیستم از طریق آدرس زیر قابل دسترسی است:"
echo "   http://localhost:3000"
echo ""
print_warning "یادآوری: برای محیط تولید، گواهی‌های SSL معتبر و تنظیمات دامنه را فراموش نکنید."