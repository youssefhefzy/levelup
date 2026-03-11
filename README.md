# ⚡ LevelUp — Life OS

> Your personal gamified life operating system. Track habits, manage finances, quit bad habits, earn XP, and become the best version of yourself.

---

## 🚀 Features

- **Habit Tracking** — Daily goals organized by life category with XP rewards
- **Finance Tracker** — Full financial management: salary, expenses, savings, wishlist, budgets
- **Quit Bad Habits** — Counter, milestones, journal integration, slip tracking
- **Dashboard** — Daily habits list sortable by category/difficulty/importance
- **Dark & Light Mode** — Beautiful themes that work everywhere
- **5 Languages** — English, Arabic (RTL), French, Spanish, Chinese
- **Drag & Drop** — Reorder categories and tasks
- **Journal** — Daily entries linked to habits and finances
- **Challenges** — Global community challenges
- **Analytics** — Heatmaps, completion rates, future self projection
- **Store** — Spend coins on cosmetics
- **Share** — Shareable progress cards for social media
- **100% Offline** — Works without internet, all data in localStorage
- **Cloud Sync** — Optional Supabase backend for cross-device sync

---

## 📁 Project Structure

```
levelup-life-os/
├── index.html              ← The entire app (single file)
├── supabase.js             ← Optional cloud sync module
├── package.json
├── vercel.json             ← Vercel deployment config
├── netlify.toml            ← Netlify deployment config
├── .gitignore
├── README.md
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  ← Full database schema
```

---

## 🌐 Deploy to Vercel (Recommended — Free)

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: Vercel Dashboard
1. Push this project to GitHub (see Git section below)
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Click **Deploy** — that's it!

Your app will be live at `https://your-project.vercel.app`

---

## 🌍 Deploy to Netlify (Free)

### Option 1: Drag & Drop (Fastest)
1. Go to [netlify.com](https://netlify.com) → Sites
2. Drag your project folder into the drop zone
3. Done! Live in seconds.

### Option 2: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir .
```

### Option 3: GitHub Integration
1. Push to GitHub (see below)
2. Netlify → New site from Git → Connect GitHub repo
3. Build command: (leave empty)
4. Publish directory: `.`
5. Deploy

---

## 📦 Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "🚀 Initial commit — LevelUp Life OS"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/levelup.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Connect Supabase (Optional — for cloud sync)

The app works perfectly with localStorage only. Add Supabase for:
- ☁️ Cross-device sync
- 🔒 Account login
- 📊 Data backup

### Setup Steps:

**1. Create a Supabase project**
- Go to [supabase.com](https://supabase.com) → New Project
- Choose a name and strong password
- Wait for it to initialize (~2 min)

**2. Run the database schema**
- In Supabase Dashboard → SQL Editor
- Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
- Paste and click **Run**

**3. Get your API keys**
- Supabase Dashboard → Project Settings → API
- Copy **Project URL** and **anon/public key**

**4. Add keys to supabase.js**
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**5. Add the Supabase SDK to index.html**

Find the `<script>` tag near the end of `index.html` and add this BEFORE it:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase.js"></script>
```

**6. Redeploy**

The app will now sync data to Supabase when a user is logged in.

---

## 💰 Finance Tracker Setup

After deploying:
1. Go to **Finance → Setup tab**
2. Enter your current balance
3. Set your monthly salary
4. Set your savings goal
5. Choose your currency

Then start logging transactions in the **Log tab**.

---

## 🚫 Quit Bad Habits Setup

1. Go to **Add Goal**
2. Select **Category: 🚫 Quit Bad Habits**
3. Set type to **Quit bad habit**
4. Save — a counter starts from today
5. Check it off daily to track clean days
6. Open **Journal** → Link Quit Habit to write reflections

---

## ✏️ Editing Categories & Goals

- **From Dashboard**: Hover over any task row → edit ✏️ or delete 🗑️
- **From Life Wheel**: Hover over any category card → edit ✏️ or delete 🗑️
- **From Add Goal page**: Scroll down to "Manage Categories & Goals" section
- **Category detail**: Click any category → edit goals in the modal

---

## 🌙 Dark / Light Mode

- Click the **moon/sun button** in the top-right nav
- Or go to **Settings → Theme**
- Your preference is saved automatically

---

## 🌐 Adding More Languages

Edit `supabase.js` or the `I18N` object in `index.html`. Add a new language object following the same key structure as the `en` object.

---

## 🔒 Security Notes

- Never commit your `.env` or API keys to Git (`.gitignore` handles this)
- The Supabase anon key is safe to expose in frontend code (it's designed for this)
- Row Level Security (RLS) is enabled — users can only access their own data
- For production, consider enabling Supabase Auth email confirmation

---

## 📱 PWA (Install as App)

The app can be installed as a PWA on mobile devices:
1. Open in Chrome/Safari on your phone
2. Tap **Share → Add to Home Screen**
3. It works like a native app with offline support

To enable full PWA features, add a `manifest.json` and service worker.

---

## 🛠️ Local Development

```bash
# Install serve
npm install

# Start local server
npm run dev

# Open http://localhost:3000
```

---

## 📊 Data Export

Go to **Settings → Data → Export JSON** to download all your data as a JSON file. Keep this as a backup.

---

Made with ⚡ by you, powered by LevelUp.
