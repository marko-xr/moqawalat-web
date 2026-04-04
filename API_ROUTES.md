# API Routes

Base URL: `http://localhost:4000/api`

## Auth
- `POST /auth/login` Login (email, password)
- `GET /auth/me` Current user (JWT required)

## Services
- `GET /services` List all services (public)
- `GET /services/:slug` Get single service by slug (public)
- `POST /services` Create service (Admin/Owner)
- `PUT /services/:id` Update service (Admin/Owner)
- `DELETE /services/:id` Delete service (Admin/Owner)

## Projects
- `GET /projects` List all projects (public)
- `GET /projects/:slug` Get project by slug (public)
- `POST /projects` Create project (Admin/Owner)
- `PUT /projects/:id` Update project (Admin/Owner)
- `DELETE /projects/:id` Delete project (Admin/Owner)

## Blog
- `GET /blog` List published posts (public)
- `GET /blog?all=true` List all posts (for admin screens)
- `GET /blog/:slug` Get single post by slug (public)
- `POST /blog` Create post (Admin/Owner)
- `PUT /blog/:id` Update post (Admin/Owner)
- `DELETE /blog/:id` Delete post (Admin/Owner)

## Leads / CRM
- `POST /leads` Create lead with optional image upload (public)
- `GET /leads` Paginated leads list (Admin/Owner)
- `PATCH /leads/:id/status` Update lead status (Admin/Owner)
- `PATCH /leads/:id/notes` Update CRM notes (Admin/Owner)

## Settings
- `GET /settings` Get public site settings
- `PUT /settings` Create/update settings (Admin/Owner)

## Analytics
- `POST /analytics/click` Track click event (`call`, `whatsapp`, `quote`)
- `GET /analytics/dashboard` Dashboard metrics (Admin/Owner)

## Health
- `GET /health` Health check endpoint

## Auth Header
For protected routes:
`Authorization: Bearer <token>`
