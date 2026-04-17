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
5. Required env vars for uploads:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### DB (VPS)
- Use `docker compose up -d` from root.
- Ensure `DATABASE_URL` points to VPS PostgreSQL.

## Option 2: Single VPS
- Build both apps with `npm run build`
- Run API + Next using PM2 and Nginx subdomains:
  - `api.yourdomain.com` -> API
  - `yourdomain.com` -> Next.js

## Option 3: Railway (API)

Use the committed `railway.toml` at the repository root.

### Required Build/Start Pipeline
- Build command: `npm install && npm run build --workspace @moqawalat/api`
- Start command: `cd apps/api && node dist/server.js`

### Required Environment Variables
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `WEB_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Version Verification
- The API logs these lines at startup:
   - `APP_VERSION: <commit-sha>`
   - `Cloudinary: true|false`
- Health endpoint exposes version state:
   - `GET /api/health`
   - Expected fields: `version`, `cloudinaryConfigured`

### Force Clean Redeploy (No Stale dist)
1. Open Railway service settings for the API.
2. Trigger a deployment with cache disabled/cleared ("Clear build cache" in Railway UI).
3. Redeploy from the latest commit on `main`.
4. Confirm build logs include both:
    - `npm install`
    - `npm run build --workspace @moqawalat/api`
5. Confirm deploy logs show start command resolves to `node dist/server.js` under `apps/api`.

## Option 4: Railway (Web + API as separate services)

If both apps are deployed on Railway, each service must use its own healthcheck path.

### Web service (`apps/web`)
- Build command: `npm install && npm run build --workspace @moqawalat/web`
- Start command: `cd apps/web && npm run start`
- Healthcheck path: `/api/health`
- Required env:
   - `API_URL=https://<your-api-service-domain>/api`
   - `NEXT_PUBLIC_API_URL=https://<your-api-service-domain>/api`
   - `NEXT_PUBLIC_SITE_URL=https://<your-web-domain>`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_PHONE_NUMBER`

### API service (`apps/api`)
- Build command: `npm install && npm run build --workspace @moqawalat/api`
- Start command: `cd apps/api && node dist/server.js`
- Healthcheck path: `/api/health`
- Required env:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `WEB_URL=https://<your-web-domain>`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

Important:
- In Railway, `DATABASE_URL` must NOT point to `localhost`.
- Prefer the PostgreSQL Internal/Private URL (for example `postgres.railway.internal`) over proxy/local URLs.
- API runtime now skips loading local `.env` files in managed environments and will fail fast if DB host is localhost.
