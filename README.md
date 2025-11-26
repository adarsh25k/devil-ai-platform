# 👹 I AM DEVIL - Full-Stack AI Platform

![Devil Theme](https://img.shields.io/badge/Theme-Devil%20%F0%9F%94%A5-red)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

A complete, production-ready full-stack AI platform with a stunning devil/hellfire theme. Features admin-controlled user access, full-featured chat interface, and customizable intro video.

## 🔥 Features

### 🎨 **Devil Theme UI**
- Black backgrounds with neon red & orange accents
- Ghost fog overlay with animated effects
- Glitch text animations
- Blinking demon eyes
- Custom skull/demon cursor
- Fire burst and screen shake effects
- Smoke/glitch effects on chat messages

### 🔐 **Authentication System**
- **No public signup** - Users created only by admin
- Admin login: `/admin`
- User login: `/login`
- Access request system for potential users
- Secure token-based authentication

### 🎬 **Custom Splash Screen**
- Auto-playing intro video (5 seconds)
- Admin can upload/replace intro video
- Fallback to static images if no video
- Metadata tracking (uploader, upload date)

### 👨‍💼 **Admin Dashboard**
- User management (create/view users)
- Access request handling (approve/reject/export)
- CSV export of requests
- Intro video upload
- System statistics

### 💬 **Full-Featured Chat**
- Create, rename, pin, delete chats
- Organize chats into folders (Study/Coding/Projects/Notes/Custom)
- Search across all chats
- Download chats (JSON/TXT/PDF)
- LocalStorage persistence per user
- Typing animations: "Summoning Devil..."
- Devil-themed chat bubbles (user: red gradient, AI: smoky glitch)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm/yarn/pnpm/bun

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd i-am-devil
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your admin credentials:
```env
ADMIN_ID=devilbaby
ADMIN_PASS=Har Har Mahadev Ji
```

4. **Run development server**
```bash
npm run dev
# or
bun dev
```

5. **Open your browser**
```
http://localhost:3000
```

### 🎯 First Login

**Admin Login:**
- Username: `devilbaby`
- Password: `Har Har Mahadev Ji`
- Use "Admin Login" tab

The admin account is automatically created on first run.

## 📂 Project Structure

```
i-am-devil/
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── admin/         # Admin-only endpoints
│   │   │   ├── assets/        # Static asset serving
│   │   │   └── request-access/# Access request endpoint
│   │   ├── admin/             # Admin dashboard page
│   │   ├── chat/              # Chat interface page
│   │   ├── globals.css        # Devil theme styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage (splash + login)
│   ├── components/
│   │   ├── ui/                # Shadcn UI components
│   │   ├── SplashScreen.tsx   # Intro video/splash
│   │   ├── LoginModal.tsx     # Login modal
│   │   └── AccessRequestModal.tsx # Request access form
│   └── lib/
│       └── db.ts              # Database utilities (JSON-based)
├── data/                      # JSON database files (auto-created)
│   ├── users.json
│   ├── requests.json
│   └── intro.meta.json
├── storage/                   # Uploaded files (auto-created)
│   └── intro.mp4              # Custom intro video
├── .env.example               # Environment template
├── README.md                  # This file
└── DEPLOY.md                  # Deployment guide
```

## 🎮 Usage

### Admin Workflow

1. **Login as Admin**
   - Go to homepage
   - Click "Admin Login" tab
   - Use admin credentials

2. **Manage Access Requests**
   - View pending requests in "Access Requests" tab
   - Approve: Creates user account with auto-generated password
   - Reject: Marks request as rejected
   - Export: Download CSV of all requests

3. **Create Users Manually**
   - Go to "Users" tab
   - Click "Create User"
   - Enter username and password
   - User can immediately login

4. **Upload Intro Video**
   - Go to "Settings" tab
   - Click "Upload Intro Video"
   - Select MP4 file (max 50MB)
   - Video will play on splash screen

### User Workflow

1. **Request Access**
   - Click "Request ID/PASS from the Devil"
   - Fill in name, email, category, reason
   - Wait for admin approval

2. **Login**
   - Receive credentials from admin
   - Use "User Login" tab
   - Enter credentials

3. **Chat Interface**
   - Create new chats with "New Chat" button
   - Send messages (Enter to send, Shift+Enter for new line)
   - Organize chats into folders
   - Search across all conversations
   - Download chat history

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn/UI + Radix UI
- **State:** React Hooks + LocalStorage

### Backend
- **Runtime:** Node.js / Bun
- **API:** Next.js API Routes
- **Database:** JSON files (SQLite-ready architecture)
- **Auth:** Token-based (expandable to JWT)
- **File Storage:** Local filesystem

## 🎨 Theme Customization

The devil theme is fully customizable in `src/app/globals.css`:

```css
:root {
  --devil-red: #ff0000;
  --devil-orange: #ff4500;
  --devil-glow: #ff6347;
}
```

### Custom Animations
- `.glitch-text` - Glitchy text effect
- `.fire-burst` - Fire explosion animation
- `.screen-shake` - Screen shake effect
- `.neon-text` - Neon glow text
- `.demon-eyes` - Blinking eyes animation

## 🔒 Security Notes

### Current Implementation (Development)
- Simple password hashing (SHA-256)
- Basic token generation
- JSON file storage

### Production Recommendations
- Use bcrypt for password hashing
- Implement proper JWT with secrets
- Switch to PostgreSQL/MySQL database
- Add rate limiting
- Enable HTTPS only
- Add CSRF protection
- Implement refresh tokens

## 📝 API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User/admin login
- `POST /api/request-access` - Submit access request
- `GET /api/assets/intro.mp4` - Serve intro video

### Admin-Only Endpoints (Requires Bearer Token)
- `GET /api/admin/requests` - List all access requests
- `POST /api/admin/requests/[id]/approve` - Approve request
- `POST /api/admin/requests/[id]/reject` - Reject request
- `GET /api/admin/users` - List all users
- `POST /api/admin/create-user` - Create new user
- `POST /api/admin/upload-intro` - Upload intro video

## 🚢 Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions for:
- Vercel (Frontend + API)
- Render / Heroku (Alternative)
- Docker (Containerized)

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Database Schema

### Users
```typescript
{
  id: string;           // user_1234567890
  username: string;     // Username
  password: string;     // Hashed password
  isAdmin: boolean;     // Admin flag
  createdAt: string;    // ISO timestamp
}
```

### Access Requests
```typescript
{
  id: string;           // req_1234567890
  name: string;         // Full name
  email: string;        // Email address
  reason: string;       // Why they want access
  category: string;     // "Student" | "Working"
  status: string;       // "pending" | "approved" | "rejected"
  createdAt: string;    // ISO timestamp
}
```

### Chat (LocalStorage)
```typescript
{
  id: string;           // chat_1234567890
  title: string;        // Chat title
  messages: Message[];  // Array of messages
  folder: string;       // Folder name
  pinned: boolean;      // Pinned status
  createdAt: number;    // Timestamp
  updatedAt: number;    // Timestamp
}
```

## 🤝 Contributing

This is a complete, production-ready implementation. Feel free to fork and customize for your needs.

## 📄 License

MIT License - See LICENSE file for details

## 🔥 Credits

Created with fire and brimstone by the Devil himself. 👹

---

**Need help?** Open an issue or check [DEPLOY.md](./DEPLOY.md) for deployment assistance.

**Har Har Mahadev Ji** 🔱