#!/bin/bash

# Oil Monitoring System Deployment Script
# این اسکریپت برای استقرار خودکار پروژه监控系统 نفت است

set -e

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# توابع چاپ پیام‌ها
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# تابع اصلی استقرار
deploy() {
    print_info "شروع استقرار监控系统 نفت..."
    
    # بررسی وجود Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js نصب نشده است. لطفاً ابتدا Node.js را نصب کنید."
        exit 1
    fi
    
    # بررسی وجود npm
    if ! command -v npm &> /dev/null; then
        print_error "npm نصب نشده است."
        exit 1
    fi
    
    # نصب وابستگی‌ها
    print_info "نصب وابستگی‌ها..."
    npm ci
    
    # ساخت نسخه تولید
    print_info "ساخت نسخه تولید..."
    npm run build
    
    # به‌روزرسانی پایگاه داده
    print_info "به‌روزرسانی پایگاه داده..."
    npm run db:push
    
    # ایجاد دایرکتوری لاگ‌ها
    mkdir -p logs
    
    # توقف نمونه‌های قبلی (در صورت وجود)
    if command -v pm2 &> /dev/null; then
        print_info "توقف نمونه‌های قبلی..."
        pm2 stop oil-monitoring-system || true
        pm2 delete oil-monitoring-system || true
    fi
    
    # انتخاب روش استقرار
    echo "لطفاً روش استقرار را انتخاب کنید:"
    echo "1) PM2 (توصیه شده)"
    echo "2) Docker"
    echo "3) هر دو"
    
    read -p "گزینه را وارد کنید (1-3): " choice
    
    case $choice in
        1)
            deploy_pm2
            ;;
        2)
            deploy_docker
            ;;
        3)
            deploy_pm2
            deploy_docker
            ;;
        *)
            print_error "گزینه نامعتبر است."
            exit 1
            ;;
    esac
    
    print_info "استقرار با موفقیت انجام شد!"
    
    # نمایش اطلاعات دسترسی
    echo ""
    echo "=== اطلاعات دسترسی ==="
    echo "برای دسترسی به سیستم:"
    echo "- محلی: http://localhost:3000"
    echo "- سلامت سیستم: http://localhost:3000/api/health"
    echo ""
    echo "برای مشاهده لاگ‌ها:"
    echo "- PM2: pm2 logs oil-monitoring-system"
    echo "- Docker: docker-compose logs -f"
    echo ""
}

# استقرار با PM2
deploy_pm2() {
    print_info "استقرار با PM2..."
    
    # بررسی وجود PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 نصب نشده است. در حال نصب..."
        npm install -g pm2
    fi
    
    # شروع برنامه با PM2
    pm2 start ecosystem.config.js
    
    # ذخیره وضعیت PM2
    pm2 save
    
    # تنظیم شروع خودکار (در صورت امکان)
    if command -v systemctl &> /dev/null; then
        pm2 startup
    fi
    
    print_info "برنامه با PM2 اجرا شد."
}

# استقرار با Docker
deploy_docker() {
    print_info "استقرار با Docker..."
    
    # بررسی وجود Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker نصب نشده است."
        return 1
    fi
    
    # بررسی وجود Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose نصب نشده است."
        return 1
    fi
    
    # ساخت و اجرای کانتینرها
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build
    
    print_info "کانتینرهای Docker اجرا شدند."
}

# تابع توقف برنامه
stop() {
    print_info "توقف برنامه..."
    
    # توقف PM2
    if command -v pm2 &> /dev/null; then
        pm2 stop oil-monitoring-system || true
        pm2 delete oil-monitoring-system || true
    fi
    
    # توقف Docker
    if command -v docker-compose &> /dev/null; then
        docker-compose down || true
    fi
    
    print_info "برنامه با موفقیت متوقف شد."
}

# تابع نمایش وضعیت
status() {
    print_info "وضعیت برنامه:"
    
    # وضعیت PM2
    if command -v pm2 &> /dev/null; then
        echo "--- PM2 Status ---"
        pm2 status oil-monitoring-system || echo "PM2: برنامه در حال اجرا نیست"
    fi
    
    # وضعیت Docker
    if command -v docker-compose &> /dev/null; then
        echo "--- Docker Status ---"
        docker-compose ps || echo "Docker: کانتینرها در حال اجرا نیستند"
    fi
    
    # بررسی سلامت سیستم
    echo "--- Health Check ---"
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "System: Healthy"
    else
        echo "System: Not responding"
    fi
}

# تابع نمایش لاگ‌ها
logs() {
    print_info "نمایش لاگ‌ها..."
    
    echo "انتخاب منبع لاگ:"
    echo "1) PM2"
    echo "2) Docker"
    echo "3) فایل‌های لاگ محلی"
    
    read -p "گزینه را وارد کنید (1-3): " choice
    
    case $choice in
        1)
            if command -v pm2 &> /dev/null; then
                pm2 logs oil-monitoring-system
            else
                print_error "PM2 نصب نشده است."
            fi
            ;;
        2)
            if command -v docker-compose &> /dev/null; then
                docker-compose logs -f
            else
                print_error "Docker Compose نصب نشده است."
            fi
            ;;
        3)
            tail -f logs/*.log
            ;;
        *)
            print_error "گزینه نامعتبر است."
            ;;
    esac
}

# پردازش آرگومان‌های خط فرمان
case "$1" in
    "deploy")
        deploy
        ;;
    "stop")
        stop
        ;;
    "status")
        status
        ;;
    "logs")
        logs
        ;;
    *)
        echo "استفاده: $0 {deploy|stop|status|logs}"
        echo ""
        echo "دستورات:"
        echo "  deploy  - استقرار برنامه"
        echo "  stop    - توقف برنامه"
        echo "  status  - نمایش وضعیت برنامه"
        echo "  logs    - نمایش لاگ‌ها"
        exit 1
        ;;
esac