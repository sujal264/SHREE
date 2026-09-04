# Deployment Guide – SHREE SAI MITRA MANDAL Finance Manager

This fullstack application (React 19 + Express + MongoDB Atlas) is production-ready.

---

## 🚀 Recommended Deployment: Render.com (Free & Easiest)

Render is the best free hosting platform for Node.js fullstack applications. It provides free HTTPS, automatic builds from GitHub, and seamless connection to MongoDB Atlas.

### Step 1: Push Code to GitHub

Open your terminal in the project directory (`SHREE SAI MITRA MANDAL` or `ganesh-utsav-finance-manager`):

```bash
# 1. Initialize Git (if not already done)
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "Ready for deployment: Shree Sai Mitra Mandal Finance Manager"

# 4. Create a repository on GitHub (https://github.com/new), then link it:
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/shree-sai-mitra-mandal.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy on Render.com

1. Go to [https://render.com](https://render.com) and log in (with GitHub).
2. Click **New +** → **Web Service**.
3. Choose **Build and deploy from a Git repository** and select your repository (`shree-sai-mitra-mandal`).
4. Configure the settings:
   - **Name**: `shree-sai-mitra-mandal`
   - **Region**: Singapore or Frankfurt (choose nearest to India)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** → **Add Environment Variable**:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `your MongoDB connection string from .env`
     *(e.g., `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ganesh_utsav_db?retryWrites=true&w=majority`)*
6. Click **Create Web Service**.
7. Render will build and deploy your app in 2–3 minutes and provide you with a live URL like:
   `https://shree-sai-mitra-mandal.onrender.com`

---

## ⚡ Alternative Option: Railway.app

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo** → select `shree-sai-mitra-mandal`.
3. Go to the project **Settings** → **Variables** and add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `<your MongoDB Atlas URI>`
4. Railway will automatically detect the build and start commands from `package.json` (`npm run build` and `npm start`).
5. Under **Networking**, click **Generate Domain** to get your public live URL.

---

## 🛡️ Critical Checklist Before Going Live

1. **MongoDB Atlas IP Whitelist**:
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com).
   - Go to **Network Access** → **IP Access List**.
   - Ensure `0.0.0.0/0` (Allow access from anywhere) is added so cloud hosting servers can connect to your database.
2. **Admin Credentials**:
   - Default admin login password: `admin123`.
   - You can manage committee members, roles, and settings directly from the dashboard.
