# AI Personality Predictor — React + Flask Application

## 🌐 Live Deployment

* **Frontend (Netlify):** [https://unique-capybara-238e67.netlify.app/login](https://unique-capybara-238e67.netlify.app/login)
* **Backend (Render):** `https://<your-render-service>.onrender.com`

  > Replace the above URL with your actual Render backend link.

---

## 📘 Overview

The **AI Personality Predictor** is a full-stack web application that predicts a user’s personality using a trained machine learning model. It features a **Flask backend** for authentication, prediction logic, and database management, paired with a **React frontend** for an interactive user experience.

---

## 🛠️ Local Setup Guide

### 1. Backend Setup (Flask)

```bash
cd FDM
python -m venv .venv
.venv\Scripts\activate  # For Windows
# or
source .venv/bin/activate  # For macOS/Linux
pip install -r requirements.txt
python app.py
```

Backend will run at **[http://localhost:5000](http://localhost:5000)**

### 2. Frontend Setup (React)

```bash
cd frontend-react
npm install
npm start
```

Frontend will run at **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Structure

```
FDM/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── features.json          # ML feature definitions
├── joblib/                # Trained ML models
│   ├── final_gnb_personality_model.joblib
│   └── personality_label_encoder.joblib
├── personality_app.db     # SQLite database
└── frontend-react/        # React frontend
    ├── package.json
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── App.js
    │   └── index.js
    └── tailwind.config.js
```

---

## ⚙️ Backend Highlights

* JWT Authentication (Login & Signup)
* SQLite Database Integration
* Trained ML Model (Personality Prediction)
* Confidence Scores & Detailed Advice
* CORS Enabled for Frontend Communication

---

## 💻 Frontend Highlights

* Built with React & Tailwind CSS
* Auth Flow (Signup, Login, Logout)
* Interactive Personality Test (Sliders)
* Live Feedback with Confidence Scores
* Dashboard with Test History
* Fully Responsive Design

---

## 🚀 Deployment Instructions

### Frontend (Netlify)

1. Create a new Netlify site and connect your `frontend-react` folder.
2. Add environment variable in Netlify settings:

   ```bash
   REACT_APP_API_URL=https://<your-render-service>.onrender.com
   ```
3. Deploy the site.

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your repository and set:

   ```bash
   Start Command: gunicorn app:app
   ```
3. Add environment variables if needed (e.g. SECRET_KEY).
4. Deploy and note the backend URL.

---

## 🔒 CORS Configuration Example (Flask)

```python
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "https://unique-capybara-238e67.netlify.app"}})
```

---

## 🧠 Database Schema

```
Users Table:
- id (Primary Key)
- name
- email
- password_hash
- created_at, updated_at

PersonalityTest Table:
- id (Primary Key)
- user_id (Foreign Key)
- features (JSON)
- prediction
- confidence
- probabilities (JSON)
- created_at
```

---

## 👤 Demo Account

* **Email:** [demo@example.com](mailto:demo@example.com)
* **Password:** demo123

---

## 🧩 Common Issues

| Issue            | Cause                                | Fix                                   |
| ---------------- | ------------------------------------ | ------------------------------------- |
| CORS Error       | Backend not allowing frontend origin | Check Flask CORS config               |
| Module Not Found | Missing dependencies                 | Run `pip install -r requirements.txt` |
| Database Missing | SQLite not created                   | Run `python app.py` once              |
| Port Conflict    | Port 5000 or 3000 in use             | Change in `app.py` or `package.json`  |

---

## 📊 Future Enhancements

* Detailed Result Charts
* Personality Trend Analysis
* Social Comparison Features
* Exportable PDF Reports
* Mobile App Version (React Native)

---

## 📜 License

Include your license details or author credits here.

---

This project demonstrates how a simple Flask ML model can be transformed into a **modern, production-ready web app** with full authentication, interactive UI, and deployment-ready architecture.
