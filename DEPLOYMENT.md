# Deployment Quick Guide

## Option 1: Vercel (Web) + VPS (API + DB)

### Web (Vercel)
- Root directory: `apps/web`
- Build command: `npm run build`
- Output: Next.js default
- Required env:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_WHATSAPP_NUMBER`
  - `NEXT_PUBLIC_PHONE_NUMBER`

### API (VPS)
1. Build API:
   - `npm run build --workspace @moqawalat/api`
2. Run with PM2:
   - `pm2 start apps/api/dist/server.js --name moqawalat-api`
3. Configure Nginx reverse proxy to `127.0.0.1:4000`
4. Configure SSL with Certbot

### DB (VPS)
- Use `docker compose up -d` from root.
- Ensure `DATABASE_URL` points to VPS PostgreSQL.

## Option 2: Single VPS
- Build both apps with `npm run build`
- Run API + Next using PM2 and Nginx subdomains:
  - `api.yourdomain.com` -> API
  - `yourdomain.com` -> Next.js
