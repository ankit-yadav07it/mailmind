# 🚀 MailMind – Cloud Hosting & Deployment Guide

This guide details how to deploy MailMind to production using **Vercel** (Frontend) and **Render** (Backend).

---

## 1. Push Code to GitHub

Your local git repository is already initialized and all 93 source files have been committed cleanly.

### Steps to Push:
1. Open your browser and go to [github.com/new](https://github.com/new).
2. Create a new repository named `mailmind` (public or private).
3. Do **not** initialize with README or license (the repository is already initialized locally).
4. Run the following commands in your terminal:

```bash
cd C:\Users\vijay\OneDrive\TASK
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/mailmind.git
git push -u origin main
```

---

## 2. Deploy Backend on Render (Free)

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your `mailmind` repository.
4. Configure the Web Service settings:
   * **Name:** `mailmind-api`
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
   * **Instance Type:** `Free`
5. Add Environment Variables:
   * `NODE_ENV` = `production`
   * `JWT_SECRET` = `supersecretjwtkey_prod`
   * `JWT_EXPIRES_IN` = `7d`
   * `OPENAI_API_KEY` = `optional_put_key_here`
6. Click **Deploy Web Service**.
7. Copy your Render Backend URL (e.g. `https://mailmind-api.onrender.com`).

---

## 3. Deploy Frontend on Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New…** → **Project**.
3. Import your `mailmind` repository.
4. Configure Project settings:
   * **Framework Preset:** `Vite`
   * **Root Directory:** Click `Edit` and select `frontend`.
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Add Environment Variable:
   * **Name:** `VITE_API_URL`
   * **Value:** `https://mailmind-api.onrender.com/api` (paste your Render backend URL with `/api`)
6. Click **Deploy**.
7. In ~60 seconds, your frontend will be live at `https://mailmind-....vercel.app`!

---

## ⚡ 4. Instant Live Tunnel (Active Right Now)

For immediate demo and mobile testing without cloud deployment:
* **Frontend Public URL:** `https://small-moles-reply.loca.lt`
* **Tunnel Verification Password:** `223.228.61.146`
