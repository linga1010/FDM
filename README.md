# AI Personality Predictor — React + Flask

**Live Demo (Frontend)**: [https://unique-capybara-238e67.netlify.app/login](https://unique-capybara-238e67.netlify.app/login)

**Backend hosted on**: Render (replace with your Render service URL below)

---

## Overview

A full-stack personality prediction app using a Flask backend (ML model + JWT auth + SQLite) and a React frontend (Tailwind CSS). This repository contains everything needed to run locally and points to the deployed frontend & backend.

---

## Deployed URLs

* **Frontend (Netlify)**: [https://unique-capybara-238e67.netlify.app/login](https://unique-capybara-238e67.netlify.app/login)
* **Backend (Render)**: `https://<your-render-service>.onrender.com`
  *Replace the above placeholder with the actual Render service URL (e.g. `https://my-ai-backend.onrender.com`).*

> The frontend is deployed to Netlify and the backend is deployed to Render. The frontend expects the backend API URL to be available via an environment variable or frontend configuration.

---

## Quick Start — Local Development

### Backend (Flask)

```bash
# From project root
cd FDM
python -m venv .venv
# Activate virtual env
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
# Create DB automatically by running the app
python app.py
```

The backend runs on `http://localhost:5000` by default.

### Frontend (React)

```bash
cd frontend-react
npm install
npm start
```

The frontend runs on `http://localhost:3000` by default.

**Tip:** When developing locally, make sure the frontend's API base URL points to `http://localhost:5000` (or to your deployed Render URL when using the hosted backend).

---

## Environment / Deployment Notes

### Frontend (Netlify)

* Use environment variables in Netlify settings to expose the backend API URL to the React app. Common key name: `REACT_APP_API_URL` or `VITE_API_URL` depending on your setup.
* Example Netlify environment variable:

  * `REACT_APP_API_URL = https://<your-render-service>.onrender.com`
* Configure *redirects* or `_headers` in `public/_redirects` if you need custom path handling.

### Backend (Render)

* Deploy the Flask app to Render as a web service. Make sure to:

  * Set environment variables (e.g. `SECRET_KEY`, any model path config, DB path if needed).
  * Enable CORS (the app already supports CORS if configured).
  * Ensure `gunicorn` is used in `start` command (Render best practice):

    ```bash
    gunicorn app:app
    ```
* If using SQLite on Render, remember Render's ephemeral filesystem caveats. For persistent DB in production consider a managed Postgres service and update `SQLALCHEMY_DATABASE_URI`.

---

## Update Frontend to Use Deployed Backend

1. In your React project, set the API baseURL to the Render URL. Example using an `.env` file:

```
REACT_APP_API_URL=https://<your-render-service>.onrender.com
```

2. In code, read `process.env.REACT_APP_API_URL` and use it for all fetch/axios requests. Example:

```js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE;
```

3. Rebuild and redeploy the frontend to Netlify.

---

## CORS & Security

* Ensure CORS allows requests from the Netlify frontend domain. Example Flask-CORS usage:

```py
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "https://unique-capybara-238e67.netlify.app"}})
```

* Use HTTPS on both frontend and backend in production (Netlify and Render provide HTTPS by default).

---

## Database & Models

* `personality_app.db` — SQLite DB used for development/local runs.
* `joblib/` — contains the trained ML model and encoders. Ensure these files are present in the deployed backend build or accessible via an attached storage if you change infra.

---

## Troubleshooting

* **CORS errors**: Confirm backend CORS origin includes the Netlify domain and that the frontend sends correct headers.
* **Wrong API URL**: Double-check `REACT_APP_API_URL` (Netlify env) or axios baseURL.
* **Database persistence on Render**: If tests/history disappear on redeploy, migrate to a managed DB like Postgres.

---

## Demo Credentials (for quick test)

* Email: `demo@example.com`
* Password: `demo123`

---

## Future Improvements

* Analytics & trend charts
* Exportable PDF reports
* Social / comparison features
* Migrate to Postgres for production data durability

---

## License & Credits

Include your license details here.

---

If you want, I can also replace the Render placeholder with the exact backend URL and update the Netlify environment variable block — just drop the Render service URL and I'll update the README accordingly.
