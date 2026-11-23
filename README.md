# GlamAI — AI-Based Makeup Recommendation and Virtual Makeup Simulation System

**Final Year Project (FYP)**

GlamAI is an AI-powered cosmetic recommendation and virtual makeup simulation platform that calculates facial feature parameters (face shape, skin tone, undertone, eye shape, lip curvature) via computer vision and renders event-tailored cosmetic simulations.

---

## 🎨 Visual Identity & Design System

- **Background:** Warm ivory / off-white (`#FAF6F0`)
- **Cards:** Crisp white (`#FFFFFF`) with multi-level warm shadows
- **Typography:** Dark charcoal (`#1E1B1D`, `#4A4347`) with Google Fonts (Poppins & Inter)
- **Primary Pop:** Berry / Rose Coral (`#C84B66`, `#D95B72`)
- **Accents:** Soft blush (`#F5E1D8`), subtle lavender (`#ECE8F5`), and rose gold (`#D4A373`)

---

## 📁 Repository Structure

```
.
├── frontend/                   # React 18 + Tailwind CSS v3 + React Router + Axios
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js     # Custom GlamAI beauty theme tokens
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx             # React Router layout & responsive navigation
│       ├── main.jsx
│       ├── index.css           # Tailwind directives & custom utilities
│       ├── data/               # Realistic FYP mock data
│       ├── services/           # Axios client & service modules for Flask API
│       ├── components/
│       │   ├── common/         # Badge, ShadeSwatch, BeforeAfterSlider, PhotoUploadModal
│       │   ├── layout/         # Sidebar, Header, NotificationDropdown
│       │   └── dashboard/      # HeroCard, QuickActionCard, EventCard, BeautyProfile, RecommendedLook
│       └── pages/              # Dashboard, New Analysis, Try Makeup, Saved Looks, History, Profile, Settings
│
└── backend/                    # Python Flask API starter
    ├── app.py                  # Flask server with CORS & Blueprint registration
    ├── requirements.txt        # Flask, Flask-CORS, Werkzeug (ready for mediapipe & opencv)
    ├── routes/                 # analysis_routes.py, recommendation_routes.py, user_routes.py
    └── services/               # face_analyzer.py, recommender.py
```

---

## 🚀 How to Run Locally

### 1. Frontend (React + Vite + Tailwind CSS)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will run locally on `http://localhost:3000`.

### 2. Backend (Python Flask API)

```bash
# Navigate to the backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Run the Flask API server
python app.py
```

The Flask server will start on `http://localhost:5000/api`.

---

## 🧪 Key Features Implemented

1. **Top Header**: Dynamic time-based greeting (*"Good Morning, Sophia ✨"*), notification drawer, and user profile switch.
2. **Personalized Journey Hero**: Primary action (*"✨ Start New Analysis"*), photo upload modal trigger, and high-precision SVG facial landmark scanning mesh graphic.
3. **Quick Actions Hub**: Direct access cards for Start Analysis, Choose an Event, Try Different Shades, and Saved Looks.
4. **Choose Your Occasion**: 4 curated presets (*Wedding, Party, Casual, Office*) with signature palettes and deep linking.
5. **Spotlight Recommended Look**: *"Soft Rose Glam"* with interactive Before/After comparison slider, shade breakdown (*Warm Beige, Rose Nude, Soft Brown, Peach*), and live **Shade Preview Studio Modal**.
6. **AI Beauty Profile**: Visual summary of estimated attributes (*Oval face shape [94%], Medium skin tone [#D8A782], Warm golden undertone, Almond eyes*) with FYP algorithmic disclaimer.
7. **Recent Analysis History & Empty State Switcher**: Realistic history with Before/After modal viewer and an interactive toggle for evaluators to test the empty state.
8. **Axios Service Layer**: Separated endpoints for seamless transition from mock mode to live Python Flask + MediaPipe + MongoDB backend.
