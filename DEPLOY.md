# 🚀 Deployment Guide - I AM DEVIL

Complete deployment instructions for the I AM DEVIL platform.

## 📋 Pre-Deployment Checklist

- [ ] Set admin credentials in environment variables
- [ ] Build succeeds locally (`npm run build`)
- [ ] All features tested in development
- [ ] Database files initialized
- [ ] Environment variables configured

---

## 🌐 Vercel Deployment (Recommended)

Vercel provides the easiest deployment for Next.js applications.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: I AM DEVIL platform"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Visit [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure Project:**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build` (or leave default)
   - Output Directory: `.next` (or leave default)

### Step 3: Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```env
ADMIN_ID=devilbaby
ADMIN_PASS=Har Har Mahadev Ji
```

### Step 4: Deploy

Click "Deploy" and wait for build to complete.

### Step 5: Test

1. Visit your deployment URL
2. Login as admin
3. Test all features

### ⚠️ Important Notes for Vercel

- **File Storage:** Vercel uses serverless functions with ephemeral filesystem
- **Database:** JSON files work but won't persist between deployments
- **Recommendation:** Add persistent storage (see below)

---

## 💾 Adding Persistent Storage (Vercel)

### Option 1: Vercel Postgres (Recommended)

1. **Install Vercel Postgres:**
```bash
npm install @vercel/postgres
```

2. **Enable in Vercel Dashboard:**
   - Storage → Postgres → Create Database

3. **Update `src/lib/db.ts`** to use Postgres instead of JSON files

### Option 2: Vercel KV (Key-Value Store)

1. **Install Vercel KV:**
```bash
npm install @vercel/kv
```

2. **Enable in Vercel Dashboard:**
   - Storage → KV → Create Store

3. **Update `src/lib/db.ts`** to use KV

### Option 3: External Database

Use Supabase, PlanetScale, or Railway for PostgreSQL:

```bash
npm install @vercel/postgres
# or
npm install @supabase/supabase-js
```

Update connection strings in environment variables.

---

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Use official Node.js runtime
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create data and storage directories
RUN mkdir -p /app/data /app/storage
RUN chown -R nextjs:nodejs /app/data /app/storage

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ADMIN_ID=devilbaby
      - ADMIN_PASS=Har Har Mahadev Ji
    volumes:
      - ./data:/app/data
      - ./storage:/app/storage
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t i-am-devil .

# Run container
docker run -p 3000:3000 \
  -e ADMIN_ID=devilbaby \
  -e ADMIN_PASS="Har Har Mahadev Ji" \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/storage:/app/storage \
  i-am-devil

# Or use docker-compose
docker-compose up -d
```

---

## 🚂 Render Deployment

### Step 1: Create render.yaml

```yaml
services:
  - type: web
    name: i-am-devil
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: ADMIN_ID
        value: devilbaby
      - key: ADMIN_PASS
        value: Har Har Mahadev Ji
      - key: NODE_ENV
        value: production
    disk:
      name: data
      mountPath: /app/data
      sizeGB: 1
```

### Step 2: Deploy

1. Push to GitHub
2. Visit [render.com](https://render.com)
3. New → Web Service
4. Connect repository
5. Render auto-detects `render.yaml`
6. Click "Create Web Service"

---

## 🌊 Heroku Deployment

### Step 1: Prepare Project

Create `Procfile`:
```
web: npm start
```

### Step 2: Deploy

```bash
# Install Heroku CLI
brew install heroku/brew/heroku  # Mac
# or download from heroku.com

# Login
heroku login

# Create app
heroku create i-am-devil

# Set environment variables
heroku config:set ADMIN_ID=devilbaby
heroku config:set ADMIN_PASS="Har Har Mahadev Ji"

# Deploy
git push heroku main

# Open app
heroku open
```

---

## 🗄️ Database Migration Guide

### From JSON to PostgreSQL

1. **Install dependencies:**
```bash
npm install pg
npm install -D @types/pg
```

2. **Create migration script** (`scripts/migrate-to-postgres.ts`):

```typescript
import pg from 'pg';
import fs from 'fs';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  await client.connect();

  // Create tables
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS access_requests (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      reason TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate data from JSON
  const users = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));
  for (const user of users) {
    await client.query(
      'INSERT INTO users (id, username, password, is_admin, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
      [user.id, user.username, user.password, user.isAdmin, user.createdAt]
    );
  }

  const requests = JSON.parse(fs.readFileSync('data/requests.json', 'utf-8'));
  for (const req of requests) {
    await client.query(
      'INSERT INTO access_requests (id, name, email, reason, category, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
      [req.id, req.name, req.email, req.reason, req.category, req.status, req.createdAt]
    );
  }

  console.log('✅ Migration complete!');
  await client.end();
}

migrate().catch(console.error);
```

3. **Run migration:**
```bash
npx tsx scripts/migrate-to-postgres.ts
```

---

## 🔒 Security Best Practices

### Production Environment

1. **Use Strong Admin Credentials**
```env
ADMIN_ID=<complex-username>
ADMIN_PASS=<strong-password-32-chars>
```

2. **Enable HTTPS Only**
Add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        }
      ]
    }
  ];
}
```

3. **Add Rate Limiting**
```bash
npm install express-rate-limit
```

4. **Use bcrypt for Passwords**
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

Update `src/lib/db.ts`:
```typescript
import bcrypt from 'bcrypt';

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
```

---

## 📊 Monitoring & Analytics

### Add Vercel Analytics

```bash
npm install @vercel/analytics
```

Update `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found`
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Database Not Persisting

**Vercel:** Add persistent storage (Vercel Postgres/KV)
**Docker:** Ensure volumes are mounted correctly
**Heroku:** Add Heroku Postgres addon

### Intro Video Not Loading

- Check file size (max 50MB)
- Verify `/storage` directory exists and is writable
- Check API route: `/api/assets/intro.mp4`

### Authentication Issues

- Verify environment variables are set
- Check admin credentials exactly match
- Clear browser localStorage and cookies

---

## 📞 Support

For deployment issues:
1. Check build logs
2. Verify environment variables
3. Test locally first (`npm run build && npm start`)
4. Check database connectivity
5. Review security settings

---

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test admin login
2. ✅ Create a test user
3. ✅ Submit an access request
4. ✅ Upload intro video
5. ✅ Test chat functionality
6. ✅ Verify data persistence
7. ✅ Check mobile responsiveness

---

**Deployment complete! Welcome to Hell! 🔥👹**

Har Har Mahadev Ji 🔱
