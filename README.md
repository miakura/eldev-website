# ELDEV

Marketing site for **ELDEV** — full-stack Python/Go, sites, Telegram bots, 3D/WebGL.

Live: [eldev.website](https://eldev.website)

## Stack

- Vite + TypeScript
- Three.js world scene + GSAP motion
- Express CMS (`/admin`) with JSON content + photo uploads

## Local

```bash
npm install
cp .env.example .env   # set ADMIN_PASSWORD
npm run materialize-assets   # restores public/ images from asset-blobs/
npm run dev            # Vite UI (also runs materialize via predev)
npm run start          # API/CMS on PORT (serves dist/ in production)
npm run build
```

Static photos under `public/` are stored as base64 in `asset-blobs/` and written out by `npm run materialize-assets` (hooks: `predev`, `prebuild`).

## Admin

- `/admin` — branding, SEO, about, services/prices, case CRUD, capabilities/process/stack, contacts, SEO, **Заявки**
- Public lead form on `#contact` → `POST /api/leads` → durable `leads.json` in `DATA_DIR`
- Content volume: `DATA_DIR` (see `.env.example`)

## SEO

On-site SEO for intents «написание сайтов», «разработка телеграм ботов», «3д сайты» — title/description/OG, services block, JSON-LD, robots/sitemap. No ranking guarantees.

## Deploy

See `deploy/DEPLOY.md`. Domain: `eldev.website`.

Contacts: Telegram [@pashaevel](https://t.me/pashaevel) · [+7 937 265-62-00](tel:+79372656200)
