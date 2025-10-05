# Deployment Guide

## Backend (Render)

### 1. Deploy Backend API
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `fdm-personality-api`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Python Version**: Select `3.11.11`

5. Click "Create Web Service"
6. **Copy the deployed URL** (e.g., `https://fdm-personality-api.onrender.com`)

### Important Notes:
- First deployment takes 5-10 minutes
- Free tier services sleep after 15 minutes of inactivity
- Database is SQLite (stored in instance folder)

---

## Frontend (Netlify)

### 1. Set Environment Variable
Before deploying, create `.env` file in `frontend-react/`:

```bash
cd frontend-react
echo REACT_APP_API_URL=https://your-backend-url.onrender.com > .env
```

Replace `https://your-backend-url.onrender.com` with your actual Render backend URL.

### 2. Deploy to Netlify

#### Option A: Netlify CLI (Recommended)
```bash
cd frontend-react
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

#### Option B: Netlify Dashboard
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure:
   - **Base directory**: `frontend-react`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend-react/build`
   
5. Add Environment Variable:
   - Go to Site settings → Environment variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.onrender.com`

6. Click "Deploy site"

---

## Testing Deployment

### 1. Test Backend
```bash
curl https://your-backend-url.onrender.com/health
# Should return: {"status":"healthy"}
```

### 2. Test Frontend
1. Open your Netlify URL
2. Try to sign up / log in
3. Take a personality test
4. Check if results appear

---

## Troubleshooting

### Backend Issues
- **Port binding error**: Make sure Start Command uses `--bind 0.0.0.0:$PORT`
- **Python version error**: Ensure `runtime.txt` has `python-3.11.11`
- **Module errors**: Check `requirements.txt` has all dependencies

### Frontend Issues
- **404 on routes**: Ensure `netlify.toml` and `_redirects` files exist
- **API errors**: Check `REACT_APP_API_URL` environment variable
- **CORS errors**: Backend has Flask-CORS enabled, should work

### Common Fixes
```bash
# Backend: Clear build cache on Render
# Go to Settings → Clear build cache & deploy

# Frontend: Rebuild on Netlify
# Go to Deploys → Trigger deploy → Clear cache and deploy site
```

---

## Environment Variables Summary

### Backend (Render)
- `PORT` - Auto-set by Render
- `PYTHON_VERSION` - Set to `3.11.11`

### Frontend (Netlify)
- `REACT_APP_API_URL` - Your Render backend URL

---

## Quick Deploy Commands

```bash
# Commit all changes
git add .
git commit -m "Deploy to production"
git push

# Backend will auto-deploy on Render
# Frontend will auto-deploy on Netlify (if connected to GitHub)
```
