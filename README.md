# مقاولات عامة الدمام - Production Platform

منصة SaaS كاملة لخدمات المقاولات في المنطقة الشرقية (الدمام، الخبر، الظهران) تشمل:
- موقع تسويقي عربي SEO-ready
- لوحة إدارة CMS + CRM
- API احترافي (Node.js + Express)
- قاعدة بيانات PostgreSQL عبر Prisma
- إدارة العملاء المحتملين + Analytics

---

## 1) Project Structure

```text
Moqawalat Web/
  apps/
    api/
      src/
        controllers/
        middlewares/
        routes/
        services/
        app.ts
        server.ts
      package.json
      tsconfig.json
      .env.example
    web/
      app/
        (public)/
          page.tsx
          about/page.tsx
          services/page.tsx
          services/[slug]/page.tsx
          projects/page.tsx
          blog/page.tsx
          blog/[slug]/page.tsx
          contact/page.tsx
        admin/
          login/page.tsx
          dashboard/page.tsx
        api/
          auth/login/route.ts
          auth/logout/route.ts
          track/route.ts
        layout.tsx
        globals.css
        sitemap.ts
        robots.ts
      components/
        Header.tsx
        Footer.tsx
        StickyActions.tsx
        QuoteForm.tsx
        ServiceCard.tsx
        AdminDashboard.tsx
      lib/
        api.ts
        types.ts
      middleware.ts
      package.json
      next.config.mjs
      tsconfig.json
      .env.example
  prisma/
    schema.prisma
    seed.ts
  docker-compose.yml
  API_ROUTES.md
  package.json
  .env.example
```

---

## 2) Dependencies & Install

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL)
- npm 10+

### Install
```bash
npm install
```

---

## 3) Environment Variables

### Root `.env`
Copy `.env.example` to `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/moqawalat?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
API_PORT=4000
WEB_URL="http://localhost:3000"
API_URL="http://localhost:4000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
WHATSAPP_NUMBER="966500000000"
DEFAULT_PHONE="966500000000"
```

### Web `.env.local`
Copy `apps/web/.env.example` to `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="966500000000"
NEXT_PUBLIC_PHONE_NUMBER="966500000000"
```

### API `.env`
Copy `apps/api/.env.example` to `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/moqawalat?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
API_PORT=4000
WEB_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

Important:
- استخدم `postgresql://` فقط في `DATABASE_URL`.
- Cloudinary is required for all uploads. The API fails fast when Cloudinary variables are missing.

---

## 4) Database Setup (PostgreSQL + Prisma)

### Start database
```bash
docker compose up -d
```

### Generate client + migrate + seed
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### Run maintenance scripts safely
```bash
npm run cleanup:images
```

Notes:
- السكربتات تحمل `.env` تلقائيا من الجذر/الـ API وتتحقق من `DATABASE_URL` قبل أي اتصال.
- يتم تسجيل وضع الاتصال (`DIRECT` أو `INVALID`) مع عنوان اتصال منقح بدون كلمات مرور.

Seed creates:
- Owner user: `owner@moqawalat.sa`
- Password: `Admin@12345`
- Default services and site settings

---

## 5) Run in Development

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api
- Admin login: http://localhost:3000/admin/login

---

## 6) Build for Production

```bash
npm run build
npm run start
```

Validated builds:
- API build passed (TypeScript compile)
- Web build passed (Next production build)

---

## 7) SEO Implementation Included

- Dynamic metadata on pages and dynamic routes
- Arabic keyword-focused titles/descriptions
- JSON-LD LocalBusiness on homepage
- Auto-generated `sitemap.xml`
- `robots.txt`
- Clean URLs (`/services/[slug]`, `/blog/[slug]`)

---

## 8) Conversion Optimization Included

- Sticky call button
- Sticky WhatsApp button
- Instant quote form with image upload
- Form anti-spam (honeypot + submission timing)
- CTA blocks on home and contact
- Click tracking (`call`, `whatsapp`, `quote`)

---

## 9) Security Included

- Helmet secure headers
- API rate limiting
- Input validation (`express-validator`)
- JWT authentication
- Role-based access (ADMIN, OWNER)
- Restricted admin routes on backend

---

## 10) Performance Included

- Next.js App Router
- SSG/ISR for public pages
- Image optimization via `next/image` (WebP/AVIF enabled)
- Lazy image loading in gallery
- Minimal JS for static pages
- Fetch caching with revalidate

---

## 11) Vercel + VPS Deployment Steps

### A) Frontend on Vercel
1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure root directory to `apps/web`.
4. Set env vars in Vercel:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api`
   - `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER=9665...`
   - `NEXT_PUBLIC_PHONE_NUMBER=9665...`
5. Deploy.

### B) Backend on VPS (Ubuntu + PM2 + Nginx)
1. Install Node.js 20+, Nginx, PM2, Docker.
2. Clone repo on VPS.
3. Configure `.env` in root and `apps/api/.env`.
4. Start PostgreSQL via Docker:
   ```bash
   docker compose up -d
   ```
5. Install + build:
   ```bash
   npm install
   npm run prisma:generate
  npm run prisma:migrate -- --name prod
   npm run prisma:seed
   npm run build --workspace @moqawalat/api
   ```
6. Start API with PM2:
   ```bash
   pm2 start apps/api/dist/server.js --name moqawalat-api
   pm2 save
   pm2 startup
   ```
7. Nginx reverse proxy to `localhost:4000` and enable HTTPS.

Example Nginx server block:
```nginx
server {
  server_name api.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

---

## 12) Testing Steps

### Functional test checklist
1. Open home page and verify RTL layout and sticky action buttons.
2. Submit quote form with and without image.
3. Confirm lead appears in admin dashboard.
4. Login via `/admin/login` using owner seed credentials.
5. Create/update service, project, and blog post.
6. Change lead status and CRM notes.
7. Click call/WhatsApp buttons and verify analytics counters increase.
8. Open:
   - `/sitemap.xml`
   - `/robots.txt`
   - dynamic pages `/services/{slug}`, `/blog/{slug}`
9. Check API health at `/api/health`.

### Build test
```bash
npm run build --workspace @moqawalat/api
npm run build --workspace @moqawalat/web
```

---

## 13) Database Tables (Prisma)

- `users`
- `leads`
- `services`
- `projects`
- `blog_posts` (model name `BlogPost`)
- `settings`
- `click_events` (analytics tracking)

Schema source: `prisma/schema.prisma`

---

## 14) Notes

- Uploads are Cloudinary-only and must always be stored as `https://res.cloudinary.com/...` URLs.
- Keep `JWT_SECRET` strong and private.
