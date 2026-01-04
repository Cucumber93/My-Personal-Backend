# Troubleshooting Guide

## Port Already in Use Error

If you see `EADDRINUSE: address already in use :::3000`:

1. **Find the process using port 3000:**
   ```bash
   netstat -ano | findstr :3000
   ```

2. **Kill the process:**
   ```bash
   taskkill /PID <PID_NUMBER> /F
   ```

3. **Or change the port in `.env`:**
   ```env
   PORT=3001
   ```

## MinIO Connection Issues

### Error: "S3 API Requests must be made to API port"

MinIO has two ports:
- **Port 9000** - API port (for S3 API calls)
- **Port 9001** - Console port (for web UI)

Make sure you're using port **9000** for the API:

```env
MINIO_PORT=9000
MINIO_PUBLIC_URL=http://143.198.95.222:9000
```

### MinIO Not Accessible

If MinIO is not accessible, the server will still start but image uploads won't work. Check:

1. **MinIO server is running:**
   ```bash
   # Check if MinIO is accessible
   curl http://143.198.95.222:9000/minio/health/live
   ```

2. **Firewall settings** - Ensure port 9000 is open

3. **Credentials** - Verify MINIO_ACCESS_KEY and MINIO_SECRET_KEY in `.env`

## Database Connection Issues

If you see database connection errors:

1. **Check database is accessible:**
   ```bash
   psql -h 143.198.95.222 -p 5432 -U admin -d db
   ```

2. **Verify credentials in `.env`:**
   ```env
   DB_HOST=143.198.95.222
   DB_PORT=5432
   DB_NAME=db
   DB_USER=admin
   DB_PASSWORD=ddd
   ```

3. **Check SSL settings** - If database requires SSL, set:
   ```env
   DB_SSL=true
   ```

## General Issues

### Module Not Found Errors

Run:
```bash
pnpm install
```

### TypeScript Errors

Run:
```bash
pnpm run build
```

### Server Won't Start

1. Check all environment variables are set in `.env`
2. Verify all services (PostgreSQL, MinIO) are running
3. Check logs for specific error messages


