# แก้ไข Mixed Content Error

## 🔴 ปัญหา

หน้าเว็บโหลดผ่าน HTTPS (`https://cucumber-dashboard.win`) แต่รูปภาพถูกเรียกจาก HTTP (`http://143.198.95.222:9000`) ซึ่ง browser จะ block

**Error:**
```
Mixed Content: The page at 'https://cucumber-dashboard.win/personal-management/' 
was loaded over HTTPS, but requested an insecure image 
'http://143.198.95.222:9000/project-images/...'
```

## ✅ วิธีแก้ไข

### วิธีที่ 1: ใช้ MINIO_PUBLIC_URL (แนะนำ)

ตั้งค่า environment variable `MINIO_PUBLIC_URL` ใน `.env`:

```env
# MinIO Public URL (HTTPS + Domain)
MINIO_PUBLIC_URL=https://images.cucumber-dashboard.win
# หรือ
MINIO_PUBLIC_URL=https://cucumber-dashboard.win/images
```

**ข้อดี:**
- ✅ ใช้ HTTPS
- ✅ ใช้ domain name แทน IP
- ✅ ไม่มี Mixed Content error
- ✅ ง่ายต่อการจัดการ

### วิธีที่ 2: ตั้งค่า MinIO ให้ใช้ HTTPS

1. **ตั้งค่า MinIO SSL:**
   ```env
   MINIO_USE_SSL=true
   MINIO_ENDPOINT=images.cucumber-dashboard.win
   MINIO_PORT=443
   ```

2. **ตั้งค่า Reverse Proxy (Nginx):**
   ```nginx
   server {
       listen 443 ssl;
       server_name images.cucumber-dashboard.win;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:9000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### วิธีที่ 3: ใช้ Domain Name แทน IP

ตั้งค่า DNS:
```
images.cucumber-dashboard.win  →  143.198.95.222
```

แล้วใช้:
```env
MINIO_PUBLIC_URL=https://images.cucumber-dashboard.win
```

## 📝 การตั้งค่า

### 1. แก้ไข `.env` บน Server

```env
# MinIO Configuration
MINIO_ENDPOINT=143.198.95.222
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=project-images

# MinIO Public URL (สำหรับ HTTPS)
MINIO_PUBLIC_URL=https://images.cucumber-dashboard.win
# หรือถ้าใช้ subdirectory
# MINIO_PUBLIC_URL=https://cucumber-dashboard.win/images
```

### 2. Restart Backend

```bash
docker-compose restart backend
# หรือ
docker-compose up -d --build backend
```

### 3. ตรวจสอบ

1. Upload รูปภาพใหม่
2. ตรวจสอบ URL ที่ได้ - ควรเป็น HTTPS
3. ตรวจสอบใน browser - ไม่ควรมี Mixed Content error

## 🔧 ตั้งค่า Nginx Reverse Proxy (ถ้าต้องการ)

### สร้าง Nginx Config

```nginx
# /etc/nginx/sites-available/minio-images
server {
    listen 443 ssl http2;
    server_name images.cucumber-dashboard.win;

    ssl_certificate /etc/letsencrypt/live/images.cucumber-dashboard.win/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/images.cucumber-dashboard.win/privkey.pem;

    # MinIO proxy
    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/minio-images /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d images.cucumber-dashboard.win
```

## 🎯 สรุป

**วิธีที่ง่ายที่สุด:**
1. ตั้งค่า DNS: `images.cucumber-dashboard.win` → `143.198.95.222`
2. ตั้งค่า Nginx reverse proxy (HTTPS)
3. ตั้งค่า `.env`: `MINIO_PUBLIC_URL=https://images.cucumber-dashboard.win`
4. Restart backend

**ผลลัพธ์:**
- ✅ รูปภาพใช้ HTTPS
- ✅ ไม่มี Mixed Content error
- ✅ Browser ไม่ block images

---

**Code ได้รับการแก้ไขแล้ว! เพียงตั้งค่า `MINIO_PUBLIC_URL` ใน `.env`** 🎉

