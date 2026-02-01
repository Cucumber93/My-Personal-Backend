# Nginx MinIO Proxy Setup

## 📋 Configuration ที่คุณใช้

คุณใช้ path-based proxy สำหรับ MinIO:

```nginx
location ^~ /minio/ {
  proxy_pass http://127.0.0.1:9000/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

## ✅ การตั้งค่า

### 1. ตั้งค่า Environment Variable

ใน `.env` บน server:

```env
MINIO_PUBLIC_URL=https://cucumber-dashboard.win/minio
```

### 2. URL ที่จะถูกสร้าง

เมื่อ upload รูปภาพ URL ที่ได้จะเป็น:
```
https://cucumber-dashboard.win/minio/project-images/filename.png
```

### 3. Nginx Config ที่สมบูรณ์

```nginx
server {
    listen 443 ssl http2;
    server_name cucumber-dashboard.win;

    ssl_certificate /etc/letsencrypt/live/cucumber-dashboard.win/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cucumber-dashboard.win/privkey.pem;

    # MinIO Proxy
    location ^~ /minio/ {
        proxy_pass http://127.0.0.1:9000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (ถ้าต้องการ)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }

    # Backend API (ถ้ามี)
    location /api/ {
        proxy_pass http://127.0.0.1:3100/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (ถ้ามี)
    location / {
        proxy_pass http://127.0.0.1:3200/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 วิธีทำงาน

### Request Flow

1. **Browser Request:**
   ```
   https://cucumber-dashboard.win/minio/project-images/file.png
   ```

2. **Nginx Proxy:**
   - Match `location ^~ /minio/`
   - Remove `/minio/` prefix
   - Forward to: `http://127.0.0.1:9000/project-images/file.png`

3. **MinIO Response:**
   - Serve file from bucket `project-images`
   - Return through nginx with HTTPS

## ✅ ข้อดี

- ✅ ใช้ HTTPS (แก้ Mixed Content error)
- ✅ ใช้ domain name แทน IP
- ✅ ไม่ต้องตั้งค่า subdomain เพิ่ม
- ✅ ใช้ SSL certificate เดียวกัน

## 🔧 Troubleshooting

### รูปภาพไม่แสดง

1. **ตรวจสอบ Nginx config:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

2. **ตรวจสอบ MinIO ทำงาน:**
   ```bash
   curl http://127.0.0.1:9000/project-images/test.png
   ```

3. **ตรวจสอบ Nginx proxy:**
   ```bash
   curl https://cucumber-dashboard.win/minio/project-images/test.png
   ```

4. **ตรวจสอบ logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

### CORS Error

ถ้ามี CORS error เพิ่ม headers ใน nginx:

```nginx
location ^~ /minio/ {
    proxy_pass http://127.0.0.1:9000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS headers
    add_header Access-Control-Allow-Origin * always;
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    # Handle preflight
    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

## 📝 สรุป

- ✅ Code รองรับ path-based proxy แล้ว
- ✅ ตั้งค่า `MINIO_PUBLIC_URL=https://cucumber-dashboard.win/minio`
- ✅ Restart backend เพื่อใช้ config ใหม่
- ✅ Upload รูปภาพใหม่เพื่อได้ HTTPS URL

---

**พร้อมใช้งาน!** 🎉

