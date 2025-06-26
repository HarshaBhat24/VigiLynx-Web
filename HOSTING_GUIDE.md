# VigiLynx-Web Complete Hosting Guide

A comprehensive step-by-step guide to host the VigiLynx-Web cybersecurity threat analysis application from scratch.

## 📋 Project Overview

VigiLynx-Web is a cybersecurity threat analysis application built with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI + Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Chart.js + React Chart.js 2

## 🔧 Prerequisites

Before starting, ensure you have:
- **Node.js** (v18+ recommended) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)
- **Supabase account** - [Sign up here](https://supabase.com/)
- **Hosting platform account** (Vercel/Netlify for frontend, Railway/Heroku for backend)
- **VirusTotal API key** (for threat analysis)
- **Google Gemini API key** (for AI features)

## 🚀 Step 1: Clean Environment Setup

### 1.1 Clone and Navigate to Project
```bash
git clone <your-repo-url>
cd VigiLynx-Web
```

### 1.2 Clean All Previous Installations
```bash
# Remove all existing dependencies and build artifacts
rm -rf node_modules package-lock.json .vite
cd client && rm -rf node_modules package-lock.json
cd ../server && rm -rf node_modules package-lock.json
cd ..
```

### 1.3 Install Client Dependencies
```bash
cd client
npm install --legacy-peer-deps
```

### 1.4 Install Server Dependencies
```bash
cd ../server
npm install
```

## 🗄️ Step 2: Database Setup (Supabase)

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in/Sign up
3. Click "New Project"
4. Choose organization and set project details:
   - **Name**: VigiLynx-Web
   - **Database Password**: Use a strong password (save this!)
   - **Region**: Choose closest to your users
5. Wait for project to be created (2-3 minutes)

### 2.2 Set Up Database Schema
Go to **SQL Editor** in your Supabase dashboard and run:

```sql
-- Create scan_insights table for threat analysis data
CREATE TABLE scan_insights (
  id BIGSERIAL PRIMARY KEY,
  input TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_safe BOOLEAN NOT NULL DEFAULT false,
  safety_score INTEGER DEFAULT 0,
  threat_details JSONB,
  scan_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create saved_passwords table for password management
CREATE TABLE saved_passwords (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  website_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500),
  username VARCHAR(255),
  encrypted_password TEXT NOT NULL,
  strength_score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create community_posts table for user interactions
CREATE TABLE community_posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create news_articles table for cybersecurity news
CREATE TABLE news_articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  url VARCHAR(1000) NOT NULL,
  source VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE,
  category VARCHAR(100) DEFAULT 'cybersecurity',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_settings table for user preferences
CREATE TABLE user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme VARCHAR(20) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  auto_scan BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_scan_insights_created_at ON scan_insights(created_at DESC);
CREATE INDEX idx_scan_insights_type ON scan_insights(type);
CREATE INDEX idx_scan_insights_safety ON scan_insights(is_safe);
CREATE INDEX idx_saved_passwords_user_id ON saved_passwords(user_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_passwords
CREATE POLICY "Users can view their own passwords" ON saved_passwords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passwords" ON saved_passwords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords" ON saved_passwords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords" ON saved_passwords
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for community_posts
CREATE POLICY "Anyone can view community posts" ON community_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON community_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow public read access to news_articles
CREATE POLICY "Anyone can view news articles" ON news_articles
  FOR SELECT USING (true);

-- Allow public read access to scan_insights (for dashboard stats)
CREATE POLICY "Anyone can view scan insights" ON scan_insights
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert scan insights" ON scan_insights
  FOR INSERT WITH CHECK (true);
```

### 2.3 Configure Authentication
1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your domain (for production) and `http://localhost:5173` (for development)
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/auth/callback`
   - `https://yourdomain.com/auth/callback`
4. Enable desired auth providers (Email, Google, etc.)

### 2.4 Get API Keys
1. Go to **Settings** → **API**
2. Copy these values (you'll need them for environment variables):
   - **Project URL**
   - **anon/public** key
   - **service_role** key (for server-side operations)

## 🔑 Step 3: API Keys Setup

### 3.1 Get Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (save this securely!)

### 3.2 Get VirusTotal API Key (Optional but recommended)
1. Go to [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Create an account or sign in
3. Go to your profile → API Key
4. Copy your API key

## ⚙️ Step 4: Environment Configuration

### 4.1 Client Environment Variables
Create `/client/.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
```

### 4.2 Server Environment Variables
Create `/server/.env`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_API_KEY=your_google_generative_ai_api_key
VIRUSTOTAL_API_KEY=your_virustotal_api_key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🛠️ Step 5: Local Development Setup

### 5.1 Test Client Installation
```bash
cd client
npm run dev
```
This should start the client at `http://localhost:5173`

### 5.2 Test Server Installation
```bash
cd ../server
npm start
```
This should start the server at `http://localhost:5000`

### 5.3 Verify Database Connection
Check that your client can connect to Supabase by visiting the app and checking the browser console for any connection errors.

## 🏗️ Step 6: Production Build Setup

## 🏗️ Step 6: Production Build Setup

### 6.1 Update Client Build Script
Ensure `/client/package.json` has proper build script:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --skipLibCheck && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

### 6.2 Update Server for Production
Ensure `/server/package.json` has proper start script:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  }
}
```

### 6.3 Create Production Build
```bash
cd client
npm run build
```
✅ **Status: VERIFIED** - Production build completed successfully with optimized assets

### 6.4 Test Local Production Build
```bash
npm run preview
```

### 6.5 Test Development Servers
```bash
# Terminal 1 - Start backend
cd server
npm start  # ✅ Running on port 5001

# Terminal 2 - Start frontend  
cd client
npm run dev  # ✅ Running on port 3000
```
✅ **Status: VERIFIED** - Both servers running successfully with proper CORS configuration

## 🚀 Step 7: Hosting Options

### Option A: Vercel (Recommended - Full Stack)

#### 7.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 7.2 Deploy with Vercel
```bash
# From project root
vercel --prod
```

Follow the prompts:
- Link to existing project? **No**
- Project name: **vigilynx-web**
- Directory: **.**
- Override settings? **Yes**
- Build Command: **cd client && npm install --legacy-peer-deps && npm run build**
- Output Directory: **client/dist**
- Development Command: **cd client && npm run dev**

#### 7.3 Set Environment Variables in Vercel
```bash
# Add all your environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_API_KEY
vercel env add VIRUSTOTAL_API_KEY
```

### Option B: Railway (Simple Full-Stack)

#### 7.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 7.2 Login and Deploy
```bash
railway login
railway init
railway up
```

#### 7.3 Set Environment Variables
```bash
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_ANON_KEY=your_key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_key
railway variables set GOOGLE_API_KEY=your_google_key
railway variables set VIRUSTOTAL_API_KEY=your_virustotal_key
railway variables set NODE_ENV=production
```

### Option C: Netlify + Heroku (Separate Frontend/Backend)

#### 7.1 Frontend on Netlify
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - **Build command**: `cd client && npm install --legacy-peer-deps && npm run build`
   - **Publish directory**: `client/dist`
   - **Base directory**: `/`
3. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (your Heroku backend URL)

#### 7.2 Backend on Heroku
```bash
# Install Heroku CLI first
# Create Heroku app
heroku create vigilynx-web-server

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_key
heroku config:set GOOGLE_API_KEY=your_google_key
heroku config:set VIRUSTOTAL_API_KEY=your_virustotal_key
heroku config:set NODE_ENV=production

# Deploy server subdirectory
git subtree push --prefix server heroku main
```

## 🌐 Step 8: Domain and SSL Configuration

### 8.1 Custom Domain (Optional)
1. Purchase a domain from a registrar (Namecheap, GoDaddy, etc.)
2. In your hosting platform:
   - **Vercel**: Go to project settings → Domains → Add domain
   - **Railway**: Go to project → Settings → Environment → Domains
   - **Netlify**: Go to Domain management → Add custom domain

### 8.2 SSL Certificate
All modern hosting platforms automatically provide SSL certificates for your domains.

## 🔧 Step 9: Environment-Specific Configurations

### 9.1 Update API URLs for Production
Update your client's API configuration:

Create `/client/src/config/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 'https://your-backend-url.vercel.app' : 'http://localhost:5000');

export { API_BASE_URL };
```

### 9.2 Update CORS Settings
In your server, update CORS settings for production:

`/server/index.js`:
```javascript
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-url.vercel.app', 'https://yourdomain.com']
    : ['http://localhost:5173'],
  credentials: true
};

app.use(cors(corsOptions));
```

## ✅ Step 10: Testing and Validation

### 10.1 Test All Features
1. **Authentication**: Sign up/login functionality
2. **Threat Scanning**: Test URL/hash/domain scanning
3. **Dashboard**: Verify threat analytics display
4. **Community**: Test posting and interactions
5. **Password Manager**: Test saving/retrieving passwords
6. **News Feed**: Verify cybersecurity news loading

### 10.2 Performance Testing
1. Test page load speeds using tools like:
   - Google PageSpeed Insights
   - GTmetrix
   - WebPageTest
2. Check mobile responsiveness
3. Test across different browsers

### 10.3 Security Testing
1. Verify all API endpoints are secured
2. Test RLS policies in Supabase
3. Check for XSS vulnerabilities
4. Verify HTTPS is working properly

## 🚨 Step 11: Monitoring and Maintenance

### 11.1 Set Up Error Monitoring
Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Google Analytics** for usage analytics

### 11.2 Regular Updates
- Keep dependencies updated
- Monitor security vulnerabilities
- Regular database backups (Supabase handles this automatically)

## 📝 Step 12: Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database schema deployed and working
- [ ] Authentication working (signup/login)
- [ ] API endpoints responding correctly
- [ ] SSL certificate installed and working
- [ ] Custom domain configured (if applicable)
- [ ] Error monitoring set up
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Backup strategy confirmed

## ✅ Current Project Status

**Environment Setup:** ✅ Complete
- Dependencies installed successfully (client & server)
- Environment variables configured 
- API keys working (Supabase, Gemini, VirusTotal, News API)

**Local Development:** ✅ Verified  
- Server running on `http://localhost:5001`
- Client running on `http://localhost:3000`
- CORS configured properly
- Production build working

**Ready for Deployment:** ✅ Yes
- All deployment config files created (vercel.json, Procfile, railway.toml)
- Environment templates ready for production
- TypeScript compilation successful
- No blocking errors

---

## 🚀 Quick Deployment Summary

**For Vercel (Recommended):**
1. Update `client/.env.production` with your Vercel deployment URL
2. Push to GitHub
3. Import project in Vercel dashboard
4. Add environment variables from `server/.env.production`
5. Deploy

**For Railway:**
1. Update `server/.env.production` with Railway domain
2. Push to GitHub
3. Connect repository in Railway
4. Add environment variables
5. Deploy

**For Netlify + Heroku:**
1. Deploy client to Netlify (frontend)
2. Deploy server to Heroku (backend)  
3. Update CORS and API URLs
4. Add environment variables to both platforms

---
````
