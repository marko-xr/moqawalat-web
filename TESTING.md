# Testing Checklist

## Manual QA
- [ ] Public pages open correctly (Home, Services, About, Projects, Blog, Contact)
- [ ] RTL rendering is correct on desktop/mobile
- [ ] Quote form sends lead successfully
- [ ] Quote form blocks honeypot spam submissions
- [ ] Image upload works on lead form
- [ ] New admin uploads are saved as `https://res.cloudinary.com/...` URLs in DB
- [ ] Uploaded images load with HTTP 200 on public pages
- [ ] Uploaded images still load after redeploy
- [ ] Sticky call/WhatsApp buttons work
- [ ] Click analytics increase for call/whatsapp/quote
- [ ] Admin login works with seeded owner credentials
- [ ] Services CRUD works
- [ ] Projects CRUD works
- [ ] Blog CRUD works
- [ ] Leads list loads in dashboard
- [ ] Lead status changes save correctly
- [ ] CRM notes save correctly
- [ ] `/sitemap.xml` and `/robots.txt` are generated

## Build Verification
- `npm run build --workspace @moqawalat/api`
- `npm run build --workspace @moqawalat/web`

## Cloudinary Media Verification
- `npm run cleanup:images`
- [ ] Database contains Cloudinary URLs only for media fields

## Security Verification
- [ ] Protected endpoints return 401 without token
- [ ] Protected endpoints return 403 for invalid role
- [ ] Validation errors return 422 for bad input
- [ ] Rate limiting responds on flood traffic
