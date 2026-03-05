# Danielas Dream Extensions

Moderne Website für professionelle Haarverlängerung.

## Features

- 🎨 Edles Design mit Custom Farbpalette
- 📱 Mobile-first Optimierung
- 💬 Echtzeit-Chat zwischen Kunden & Daniela
- 📅 Beratungs- & Haarverlängerungstermine
- 🖼️ Galerie & Carousel (Cloudflare R2)
- 🔐 Admin Dashboard mit Passwortschutz
- 🗄️ Neon PostgreSQL Datenbank

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Neon PostgreSQL
- Drizzle ORM
- NextAuth.js
- Cloudflare R2

## Farbpalette

- Dunkel (Hintergrund): `#110c09`
- Akzent Braun: `#44362c`
- Hell (Primär): `#fcefd1`

## Installation

```bash
npm install
```

## Environment Variables

Erstelle eine `.env.local` Datei:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Admin Password (for dashboard)
ADMIN_PASSWORD="DLGZTS10WKBG"

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="danielas-dream"
```

## Database Setup

```bash
# Generate migrations
npm run db:generate

# Push to database
npm run db:push
```

## Development

```bash
npm run dev
```

## Deployment

### Vercel

1. Projekt auf Vercel importieren
2. Environment Variables hinzufügen
3. Neon Datenbank verbinden
4. Deployen

### Cloudflare R2 Setup

1. R2 Bucket erstellen
2. API Tokens generieren
3. In Vercel Environment Variables eintragen

## Admin Zugang

- URL: `/admin`
- Passwort: `DLGZTS10WKBG`

## Lizenz

Privat - Danielas Dream Extensions
