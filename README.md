# 🧠 Parkinson's Proteomics AI - Full Stack Application

A comprehensive web application for Parkinson's Disease prediction using proteomics data and machine learning.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Integration](#frontend-integration)
- [Model Information](#model-information)
- [Contributing](#contributing)

---

## 🎯 Overview

This application provides a complete solution for predicting Parkinson's Disease risk using proteomics biomarkers. It includes:

- **Machine Learning Backend**: FastAPI service for real-time predictions using a trained LightGBM model
- **User Management**: Django backend for patient registration, authentication, and prediction history
- **Mobile Frontend**: React Native (Expo) app with login/register screens and result visualization
- **Feature Importance Analysis**: Detailed breakdown of the most influential protein biomarkers

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)                    │
│         Login/Register → Upload CSV → View Predictions          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway                              │
├─────────────────────────────┬───────────────────────────────────┤
│                             │                                    │
│  ┌──────────────────────┐   │   ┌──────────────────────────┐   │
│  │    FastAPI (8000)    │   │   │     Django (8001)        │   │
│  │  ─────────────────   │   │   │  ────────────────────    │   │
│  │  • /model/infer      │   │   │  • /auth/login           │   │
│  │  • /model/predict-csv│   │   │  • /auth/signup          │   │
│  │  • /features/import  │   │   │  • /predictions/history  │   │
│  └──────────┬───────────┘   │   └──────────┬───────────────┘   │
│             │               │              │                    │
│             ▼               │              ▼                    │
│  ┌──────────────────────┐   │   ┌──────────────────────────┐   │
│  │   LightGBM Model     │   │   │    SQLite/PostgreSQL     │   │
│  │   (lgb_model.pkl)    │   │   │    User & Predictions    │   │
│  └──────────────────────┘   │   └──────────────────────────┘   │
└─────────────────────────────┴───────────────────────────────────┘
```

---

## ✨ Features

### Backend (FastAPI)
- 🔮 **Real-time Prediction**: Upload CSV with proteomics data and get instant PD risk assessment
- 📊 **Feature Importance**: Ranked list of protein biomarkers with importance scores
- 🩺 **Risk Stratification**: Low, Moderate, High, Very High risk levels
- 📈 **Model Metrics**: Access to accuracy, AUC, precision, recall, F1 scores
- 📁 **CSV/Excel Support**: Accept multiple file formats for data upload

### Backend (Django)
- 👤 **User Authentication**: JWT-based login and registration
- 📜 **Prediction History**: Store and retrieve past predictions
- 🔐 **Secure Password Storage**: Bcrypt hashing
- 👨‍💼 **Admin Dashboard**: Django admin for user management

### Frontend (React Native)
- 🎨 **Modern UI**: Beautiful gradient-based design with animations
- 📱 **Mobile-First**: Optimized for iOS and Android
- 📄 **File Upload**: Pick Excel/CSV files for analysis
- 📊 **Result Visualization**: Interactive biomarker charts
- 🔐 **Secure Auth Flow**: Login/Register with token storage

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| ML Model | LightGBM, scikit-learn |
| Prediction API | FastAPI, Uvicorn |
| Auth API | Django, Django REST Framework |
| Database | SQLite (dev), PostgreSQL (prod) |
| Frontend | React Native, Expo |
| Containerization | Docker, Docker Compose |

---

## 📁 Project Structure

```
Major Project/
├── backend/
│   ├── api/                      # FastAPI Application
│   │   ├── main.py               # FastAPI entry point
│   │   ├── config.py             # Configuration settings
│   │   ├── routes/
│   │   │   ├── auth.py           # Authentication routes
│   │   │   ├── prediction.py     # Prediction routes
│   │   │   └── feature_importance.py
│   │   └── services/
│   │       └── model_service.py  # ML model loading & inference
│   │
│   ├── django_app/               # Django Application
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── apps/
│   │       ├── users/            # User management
│   │       └── predictions/      # Prediction history
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── manage.py
│
├── src/                          # React Native App (from repo)
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── UploadScreen.js
│   │   └── ResultScreen.js
│   └── services/
│       ├── apiClient.js
│       └── authService.js
│
├── data/
│   └── sample_patient_data.csv   # Sample input file
│
├── lgb_model_20251211_093754.pkl # Trained LightGBM model
├── docker-compose.yml
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ (for mobile app)
- Docker & Docker Compose (optional)

### macOS ARM (M1/M2/M3) Specific Setup

LightGBM requires OpenMP on macOS. Install it with:

```bash
# Install libomp
brew install libomp

# Create symlink (if needed)
ln -sf /opt/homebrew/opt/libomp/lib/libomp.dylib /opt/homebrew/lib/libomp.dylib
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# If LightGBM fails to build, install pre-built binary:
pip install lightgbm --prefer-binary

# Run Django migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Install AsyncStorage for auth
npx expo install @react-native-async-storage/async-storage

# Start Expo
npx expo start
```

---

## ▶️ Running the Application

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- FastAPI (Predictions): http://localhost:8000
- Django (Auth): http://localhost:8001
- API Docs: http://localhost:8000/docs

### Option 2: Manual Start

```bash
# Terminal 1: Start FastAPI
cd backend
uvicorn api.main:app --reload --port 8000

# Terminal 2: Start Django
cd backend
python manage.py runserver 8001

# Terminal 3: Start Mobile App
npx expo start
```

---

## 📚 API Documentation

### FastAPI Endpoints (Port 8000)

#### Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/model/infer` | Predict from JSON data |
| POST | `/api/v1/model/predict-csv` | Upload CSV and predict |
| GET | `/api/v1/model/required-features` | Get required feature list |
| GET | `/api/v1/model/sample-data` | Get sample input format |

#### Feature Importance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/features/importance` | Get feature importance |
| GET | `/api/v1/features/biomarkers` | Get biomarker details |
| GET | `/api/v1/features/categories` | Get protein categories |

### Django Endpoints (Port 8001)

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/django/auth/signup/` | Register new user |
| POST | `/api/v1/django/auth/login/` | Login user |
| POST | `/api/v1/django/auth/logout/` | Logout user |
| GET | `/api/v1/django/auth/profile/` | Get user profile |
| POST | `/api/v1/django/auth/change-password/` | Change password |

#### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/django/predictions/history/` | Get prediction history |
| GET | `/api/v1/django/predictions/history/{id}/` | Get prediction detail |

### Example API Calls

#### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "secure123"}'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secure123"}'
```

#### Upload CSV for Prediction
```bash
curl -X POST http://localhost:8000/api/v1/model/predict-csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@data/sample_patient_data.csv"
```

#### Get Feature Importance
```bash
curl http://localhost:8000/api/v1/features/importance?top_n=20
```

---

## 📱 Frontend Integration

The React Native app connects to the backend through `src/services/apiClient.js`. 

### Update API Base URL

Edit `src/services/apiClient.js`:

```javascript
const BASE_URL = 'http://YOUR_IP:8000/api/v1';
// For local development with Expo:
// const BASE_URL = 'http://192.168.x.x:8000/api/v1';
```

### Authentication Flow

1. User registers via `RegisterScreen.js`
2. Login via `LoginScreen.js` returns JWT token
3. Token is stored and sent with subsequent requests
4. Protected routes check for valid token

### Prediction Flow

1. User uploads CSV via `UploadScreen.js`
2. File is sent to FastAPI `/model/predict-csv`
3. Results displayed in `ResultScreen.js`
4. Biomarkers shown in `BiomarkersScreen.js`

---

## 🤖 Model Information

### Training Details
- **Algorithm**: LightGBM Classifier
- **Features**: 50 protein biomarkers (seq_* columns)
- **Selection Method**: Gain-based feature importance
- **Training Data**: Proteomics dataset with PD/Healthy labels

### Model Metrics
| Metric | Value |
|--------|-------|
| Accuracy | ~89% |
| AUC-ROC | ~94% |
| Precision | ~87% |
| Recall | ~91% |
| F1-Score | ~89% |

### Feature Categories
- **Neuroinflammation**: IL-*, TNF-*, NFL markers
- **Synaptic Function**: Synaptic transmission proteins
- **Mitochondrial**: Energy metabolism markers
- **Oxidative Stress**: Antioxidant proteins
- **Alpha-synuclein**: PD-specific markers

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in `backend/`:

```env
# API Settings
DEBUG=True
SECRET_KEY=your-secret-key

# Django Settings
DJANGO_SECRET_KEY=django-secret-key

# Model Paths
MODEL_PATH=../lgb_model_20251211_093754.pkl

# JWT
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 🧪 Testing

### Test Prediction API

```bash
# Using sample data
curl -X POST http://localhost:8000/api/v1/model/predict-csv \
  -F "file=@data/sample_patient_data.csv"
```

### Expected Response

```json
{
  "prediction": 1,
  "probability": 0.7234,
  "confidence": 0.7234,
  "risk_level": "High",
  "risk_percentage": 72.3,
  "top_biomarkers": [
    {
      "name": "Protein 1",
      "importance": 0.156,
      "value": 1.23,
      "category": "Neuroinflammation"
    }
  ],
  "recommendation": "Multiple biomarkers indicate elevated risk..."
}
```

---

## 📄 License

This project is for educational and research purposes.

---

## 👥 Contributors

- **Vishwas Kisaniya** - Developer
- **Manav Rai** - UI/UX Design

---

## 🆘 Support

For issues or questions:
1. Check the [API Documentation](http://localhost:8000/docs)
2. Review Django admin at http://localhost:8001/admin
3. Open an issue on GitHub

---

Made with ❤️ for Parkinson's Disease Research
