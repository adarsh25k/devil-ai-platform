# 🔥 I AM DEVIL v2.0 - AI Platform

> **Version 2.0** - Complete Admin Control & Feature-Rich AI Platform

A full-stack AI platform with comprehensive admin controls, dynamic theming, gamification, analytics, and encrypted API key management.

---

## 🎯 What's New in v2.0

### Major Features Added
- ✅ **Admin Control Panel v2.0** - 11 comprehensive management tabs
- ✅ **API Key Vault** - AES-256-GCM encrypted storage for all API keys
- ✅ **UI Text Manager** - Edit all user-facing text dynamically
- ✅ **Splash Manager** - Full control over intro/splash screen
- ✅ **Theme Engine** - 7 pre-made themes + unlimited custom themes
- ✅ **Model Routing** - AI model routing based on keywords/intents
- ✅ **Plugin Manager** - Enable/disable tools and integrations
- ✅ **Gamification** - XP, levels, streaks, and achievement badges
- ✅ **Analytics** - Usage tracking, model stats, token consumption
- ✅ **System Notes** - Admin broadcasts and announcements
- ✅ **15 New Database Tables** - Complete data infrastructure
- ✅ **40+ New API Endpoints** - Full backend coverage

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# or
bun install
```

### 2. Set Up Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Add required variables:
# - TURSO_CONNECTION_URL (auto-configured)
# - TURSO_AUTH_TOKEN (auto-configured)
# - ENCRYPTION_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
# - ENCRYPTION_SALT (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
```

### 3. Seed Default Data
```bash
npx tsx src/scripts/seed-defaults.ts
```

This creates:
- 7 pre-made themes
- 5 default plugins
- 7 achievement badges
- Global configuration
- Default splash config
- UI texts

### 4. Start Development Server
```bash
npm run dev
# or
bun dev
```

### 5. Access Admin Panel
```
URL: http://localhost:3000/admin
Username: devilbaby
Password: Har Har Mahadev Ji
```

---

## 🎨 Pre-Made Themes

1. **Devil Red** (Default) - Classic hellfire aesthetic
2. **Demon Purple** - Mystical dark purple
3. **Ghost White** - Ethereal white specter
4. **Hellfire Orange** - Intense orange flames
5. **Blood Neon** - Cyberpunk horror vibes
6. **Abyss Blue** - Deep ocean darkness
7. **Shadow Black** - Minimal stealth mode

---

## 🔐 Security Features

### API Key Encryption
- **AES-256-GCM** encryption
- **Scrypt** key derivation
- **16-byte IV** per encryption
- Authentication tags for integrity

### Admin Authentication
- Bearer token authentication
- Token verification on all admin routes
- Audit trails for admin actions

### Input Validation
- Type checking on all endpoints
- Required field validation
- SQL injection protection via Drizzle ORM

---

## 📊 Admin Dashboard

### Available Tabs

1. **Requests** - Access request management
2. **Users** - User management
3. **🔑 API Keys** - Encrypted API key vault
4. **📝 UI Texts** - Dynamic text customization
5. **🎬 Splash** - Splash screen manager
6. **🎨 Themes** - Theme engine
7. **🤖 Model Routing** - AI routing rules
8. **🔌 Plugins** - Plugin management
9. **📢 System Notes** - Announcements
10. **📊 Analytics** - Usage analytics
11. **⚙️ Settings** - System information

---

## 🗄️ Database Schema

### 15 Tables Created

1. **api_keys** - Encrypted API key storage
2. **ui_texts** - Dynamic UI text
3. **splash_config** - Splash screen settings
4. **themes** - Theme definitions
5. **user_themes** - User theme preferences
6. **model_routing_rules** - AI routing logic
7. **global_config** - System configuration
8. **code_execution_logs** - Sandbox tracking
9. **chat_logs** - Chat history
10. **user_stats** - Gamification stats
11. **badges** - Achievement badges
12. **plugins** - Plugin management
13. **rag_files** - RAG file tracking
14. **system_notes** - Admin announcements
15. **analytics_events** - Usage tracking

---

## 🔌 Available Plugins

1. **DuckDuckGo Search** - Web search integration
2. **YouTube Transcripts** - Extract video transcripts
3. **Code Sandbox** - Safe code execution
4. **Image Generation** - AI image creation
5. **RAG Document Search** - Knowledge base search

---

## 🏆 Gamification System

### XP System
- Send message: +10 XP
- Upload file: +20 XP
- Run code: +15 XP
- Level = floor(XP / 100) + 1

### Achievement Badges
- 🩸 **First Blood** - Send first message
- 💬 **Chatterbox** - Send 100 messages
- 👹 **Soul Summoner** - Send 1000 messages
- 💻 **Code Demon** - Execute 50 code runs
- 📚 **Knowledge Seeker** - Upload 10 files
- ⚔️ **Hell's Veteran** - Reach level 10
- 🔥 **Streak Master** - 7-day streak

---

## 📡 API Endpoints

### Public Endpoints (40+)
```
GET  /api/ui-texts/load
GET  /api/splash/config
GET  /api/themes/list
GET  /api/themes/[id]
POST /api/themes/user/set
GET  /api/themes/user/[userId]
GET  /api/global/config
GET  /api/plugins/list
GET  /api/system-notes/active
POST /api/chat/log
POST /api/analytics/track
GET  /api/user/stats/[userId]
POST /api/user/stats/increment
... and 30+ admin endpoints
```

See `UPGRADE_SUMMARY.md` for complete API reference.

---

## 📚 Documentation

- **UPGRADE_SUMMARY.md** - Complete v2.0 feature list
- **POST_UPGRADE_GUIDE.md** - Step-by-step setup guide
- **DEPLOY.md** - Deployment instructions
- **README.md** - Original project documentation

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless functions
- **Drizzle ORM** - Type-safe database queries
- **Turso** - SQLite database
- **Crypto** - AES-256-GCM encryption

### Infrastructure
- **Vercel** - Frontend hosting
- **Turso** - Database hosting
- **Environment Variables** - Configuration management

---

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes (40+)
│   └── ...                 # Other pages
├── components/
│   └── ui/                 # Shadcn components
├── db/
│   ├── schema.ts           # Database schema
│   └── index.ts            # Database client
└── scripts/
    └── seed-defaults.ts    # Seed script
```

### Key Files
- `src/app/admin/page.tsx` - Admin dashboard v2.0
- `src/db/schema.ts` - 15 table definitions
- `src/app/api/*` - 40+ API endpoints
- `src/scripts/seed-defaults.ts` - Default data seeder

---

## 🧪 Testing

### Test API Endpoints
```bash
# Public endpoints
curl http://localhost:3000/api/themes/list
curl http://localhost:3000/api/ui-texts/load

# Admin endpoints (replace TOKEN)
TOKEN="your-token"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/keys/list
```

---

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Database (Turso)
- Auto-configured
- Connection URL in `.env`
- Managed via Drizzle

See `DEPLOY.md` for detailed instructions.

---

## 📈 Monitoring

### Admin Dashboard Shows:
- Total users
- API keys count
- Active themes
- Active routing rules
- Active plugins
- Usage analytics

### Analytics Available:
- Daily active users
- Model usage statistics
- Token consumption
- Code execution logs
- Chat history

---

## 🔒 Environment Variables

Required variables:
```env
# Database (auto-configured)
TURSO_CONNECTION_URL=...
TURSO_AUTH_TOKEN=...

# Encryption (required for API Key Vault)
ENCRYPTION_SECRET=...
ENCRYPTION_SALT=...

# Admin credentials (optional, defaults provided)
ADMIN_ID=devilbaby
ADMIN_PASS=Har Har Mahadev Ji
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Verify connection
echo $TURSO_CONNECTION_URL

# Push schema
npx drizzle-kit push
```

### Seed Script Fails
```bash
# Run with error output
npx tsx src/scripts/seed-defaults.ts
```

### Admin Panel Not Loading
1. Clear browser cache
2. Check console for errors
3. Verify admin credentials
4. Check Bearer token in localStorage

---

## 📝 License

[Your License Here]

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

---

## 🔥 Credits

**I AM DEVIL v2.0** - A complete AI platform with admin controls

Built with:
- Next.js
- Drizzle ORM
- Turso Database
- Shadcn/UI
- Tailwind CSS

---

## 📞 Support

For issues or questions:
1. Check documentation
2. Review API responses
3. Check server logs
4. Test with curl

---

**🔥 Welcome to Hell v2.0! 👹**

*Production Ready* ✅ | *Fully Tested* ✅ | *Complete Documentation* ✅
