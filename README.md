# 🌸 Iris Flower Species Classification & Analysis Platform

> **Supervised Machine Learning Platform**  
> **Project Title:** Iris Flower Species Classification Using Decision Tree  
> **Algorithm:** Scikit-Learn Decision Tree Classifier (Gini Impurity Criterion)  
> **Validation Scheme:** Stratified 80/20 Train-Test Split  
> **Features:** Sepal Length, Sepal Width, Petal Length, Petal Width  

---

## 📌 Executive Summary

This platform is a **production-quality, full-stack AI/ML SaaS application** for supervised botanical classification. It features authentic **Decision Tree classification**, automated dataset schema ingestion and validation, real-time flower measurement classification with step-by-step decision-path rule tracing, a dedicated **Computer Vision flower photograph analyzer** with visible foliar health screening, a **domain-restricted conversational AI assistant**, interactive **confusion matrix heatmaps**, and feature importance rankings.

---

## 🏗️ System Architecture

The application is structured into clearly separated architectural tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite + TS)                    │
│   • Dark/Light Theme      • Multilingual (EN, TE, HI, TA, KN)          │
│   • Model Analytics       • Decision Tree Visualizer   • PPT Viewer    │
│   • Live Prediction GUI   • CV Image Upload Dropzone   • AI Chatbot    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST APIs & Reverse Proxy
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI + Python 3.12)                    │
│   • JWT / Session Auth    • Dataset Ingestion & Validation             │
│   • Model Training Engine • Metric & Audit Persistence                 │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
     ┌─────────────▼─────────────┐     ┌─────────────▼─────────────┐
     │   TABULAR ML PIPELINE     │     │  COMPUTER VISION SERVICE  │
     │ • 4 Continuous Features   │     │ • Separate Image Engine   │
     │ • 80/20 Stratified Split  │     │ • Botanical Species Match │
     │ • DecisionTreeClassifier  │     │ • Foliar Spot/Chlorosis   │
     │ • Gini Impurity Criterion │     │ • Agricultural Disclaimer │
     │ • scikit-learn & joblib   │     └───────────────────────────┘
     └─────────────┬─────────────┘
                   │
     ┌─────────────▼─────────────┐     ┌───────────────────────────┐
     │  SQLAlchemy Database ORM  │     │  IRIS AI PROJECT ASSISTANT│
     │ • User Accounts           │     │ • Strict Domain Firewall  │
     │ • Datasets & Schemas      │     │ • Model Context Injection │
     │ • Model Version Registry  │     │ • Multi-Tier Injection    │
     │ • Audit Inferences & Logs │     │   Defense Mechanism       │
     └───────────────────────────┘     └───────────────────────────┘
```

---

## ✨ Core Features

### 1. 🔐 Authentication & Session Security
- User registration and login with bcrypt password hashing and PyJWT tokens.
- **One-Click Demo Mode**: Reviewers and evaluators can explore the platform instantly with pre-seeded datasets and trained models without manual registration.
- Role-based authorization: Admin console vs. researcher privileges.

### 2. 📊 Dataset Manager
- Drag-and-drop CSV dataset upload with automated schema inspection.
- Column mapping: Identifies `SepalLength`, `SepalWidth`, `PetalLength`, `PetalWidth`, and `Species` across diverse naming conventions.
- Prunes extraneous identifiers (`Id`, `Serial Number`) safely.
- Real-time diagnostics: Row count, column count, null cells, duplicate rows, class distribution, and suitability validation banners.
- Interactive searchable & sortable preview table for the first 50 rows.
- Download original CSV or trigger training directly.

### 3. 🌳 Model Training Pipeline
- Authentic scikit-learn supervised ML pipeline:
  $$\text{Data Ingestion} \longrightarrow \text{Validation} \longrightarrow \text{Stratified 80/20 Split} \longrightarrow \text{DecisionTreeClassifier(criterion='gini')} \longrightarrow \text{Evaluation} \longrightarrow \text{joblib Persistence}$$
- Configurable hyperparameters: `criterion` (Gini / Entropy), `test_size` slider, `max_depth`, `min_samples_split`, `min_samples_leaf`, and `random_state` for reproducible splits.
- Real-time training animation displaying each pipeline step.
- Persists model versions with hyperparameters, metrics, and feature names.

### 4. 📈 Model Analytics & Interpretability
- **Interactive Confusion Matrix Heatmap**: Hover over cells to see exact true-positive and misclassification frequencies.
- **Gini Feature Importance Bar Chart**: Shows the percentage contribution of Petal Length, Petal Width, Sepal Length, and Sepal Width.
- **Hierarchical Decision Tree Flow**: Visual diagram tracing internal conditional split tests down to terminal leaf nodes with Gini impurities and sample counts.
- **Plain-Language Statistical Interpretation**: Plaintext rationale explaining why petal dimensions dominate taxonomic separation.

### 5. 🎯 Manual Flower Prediction
- Synchronized dual-input sliders and numeric fields for Sepal Length, Sepal Width, Petal Length, and Petal Width.
- Pre-set buttons: Quick-load typical *Setosa*, *Versicolor*, or *Virginica* dimensions.
- Real-time prediction display: Predicted botanical species, percentage confidence, and probability distribution across all 3 classes.
- **Rule Traversal Trace**: Step-by-step breakdown of each Decision Tree test evaluated for the specific flower.

### 6. 📷 AI Flower Image Analyzer
- **Architectural Separation**: Separates the tabular Decision Tree model from floral photograph analysis.
- Drag-and-drop photo upload supporting JPG, JPEG, PNG, and WEBP formats (< 10 MB).
- Flower identification with confidence score, scientific name, common name, and typical physical dimensions.
- **Visible Problem & Disease Screening**: Checks for foliar necrotic leaf spot (*Didymellina macrospora*) or chlorosis with transparent uncertainty disclaimers and recommended cultivation next steps.

### 7. 🤖 Iris AI Project Assistant
- Two-tier domain restriction firewall (System prompt + Application-level regex filter).
- **Strictly refuses unrelated questions**:
  > *"I’m Iris AI, a project-specific assistant. I can only help with Iris flowers, flower classification, machine learning, datasets, model results, image analysis, and this application."*
- Context-aware: Injects active model accuracy, training dataset size, and last prediction into answers.
- Suggested prompt chips, markdown rendering, copy-to-clipboard, and multi-turn chat history.

### 8. 🌐 Multilingual Support
- Application-wide language selector in the top navbar:
  - **English**
  - **Telugu (తెలుగు)**
  - **Hindi (हिन्दी)**
  - **Tamil (தமிழ்)**
  - **Kannada (ಕನ್ನಡ)**
- Localizes navigation labels, buttons, dashboard metrics, dataset status banners, and AI assistant responses.

### 9. 📁 History & Data Export
- Auditable history tables for tabular predictions and analyzed flower photographs.
- Inspect modal showing full input dimensions and rule paths.
- Export all prediction logs to CSV.
- Export comprehensive Technical Model Audit Reports to structured JSON.

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti, Vite |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2, PyJWT, Bcrypt, Starlette |
| **Machine Learning** | scikit-learn (`DecisionTreeClassifier`), pandas, NumPy, joblib |
| **Computer Vision** | Pillow (PIL ImageStat, RGB color spectrum heuristic, foliar screening) |
| **Database** | SQLAlchemy ORM (SQLite for zero-config local run; PostgreSQL ready) |
| **Testing** | pytest, pytest-asyncio, FastAPI TestClient |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & **npm**

---

### Step 1: Clone or Navigate to the Workspace
```bash
cd c:\Users\pooja\OneDrive\Desktop\internship
```

### Step 2: Configure Environment Variables
Copy the example environment configuration:
```bash
copy .env.example .env
```
*(The default configuration works out-of-the-box using local SQLite with zero extra setup needed).*

---

### Step 3: Run with Windows Batch Scripts (One-Click)
You can start both frontend and backend using the provided batch scripts:
- **Double-click `start_all.bat`**: Launches both FastAPI backend and Vite frontend in separate terminal windows.
- Or start them individually:
  - `start_backend.bat` (Starts FastAPI backend on `http://127.0.0.1:8000`)
  - `start_frontend.bat` (Starts Vite frontend on `http://localhost:5173`)

---

### Step 4: Run from Terminal (Manual Commands)

#### 1. Start Backend:
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
- API will be active at: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

#### 2. Start Frontend:
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev   # On Windows PowerShell if script execution is restricted: npm.cmd run dev
```
- Frontend will open at: `http://localhost:5173`

---

## 🧪 Running the Test Suite

A comprehensive automated test suite covers authentication, dataset inspection, ML training, inference, image analysis, and AI domain restrictions:

```bash
cd backend
python -m pytest tests
```

Output:
```
backend/tests/test_assistant.py ...    [ 25%]
backend/tests/test_auth.py ...         [ 50%]
backend/tests/test_dataset.py ..       [ 66%]
backend/tests/test_image.py ..         [ 83%]
backend/tests/test_ml.py .             [ 91%]
backend/tests/test_prediction.py .     [100%]
====================== 12 passed in ~3.8s =======================
```

To verify the frontend TypeScript and build bundle:
```bash
cd frontend
npm run build  # or: npm.cmd run build
```

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Login and receive JWT access token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/datasets/upload` | Upload and validate Iris CSV dataset |
| `GET` | `/api/datasets` | List available datasets |
| `GET` | `/api/datasets/{id}` | Inspect dataset schema and first 50 rows |
| `POST` | `/api/models/train` | Train Decision Tree model with custom hyperparameters |
| `GET` | `/api/models` | List trained model versions |
| `GET` | `/api/models/active` | Get currently active model bundle |
| `POST` | `/api/predict` | Run manual flower prediction and decision path tracing |
| `GET` | `/api/predict/history` | Retrieve prediction history with sorting and filtering |
| `POST` | `/api/image/analyze` | Upload flower photo for CV species & foliar screening |
| `GET` | `/api/image/history` | Retrieve past photo analyses |
| `POST` | `/api/assistant/chat` | Send question to domain-restricted Iris AI Assistant |
| `GET` | `/api/presentation/slides` | Fetch all 17 presentation slides and metadata |
| `GET` | `/api/presentation/download-pptx` | Download original `.pptx` presentation file |
| `GET` | `/api/analytics/dashboard` | Get high-level platform summary metrics |
| `GET` | `/api/analytics/model/{id}` | Get confusion matrix, feature importances, and tree rules |
| `GET` | `/api/export/predictions` | Download predictions history as CSV |
| `GET` | `/api/export/model-report/{id}` | Download technical audit report as JSON |

---

## 🔬 Botanical & Machine Learning Details

### 1. Gini Impurity Formulation
The Gini index evaluates the probability of an incorrect label being assigned to a randomly selected sample from a given node:
$$I_G(p) = 1 - \sum_{i=1}^{C} p_i^2$$
Where $C = 3$ (*Setosa*, *Versicolor*, *Virginica*) and $p_i$ is the relative frequency of species $i$ in that partition.

### 2. Feature Importance Dominance
Through recursive Gini minimization, **Petal Length** and **Petal Width** consistently capture **over 90%** of total split importance. Ronald Fisher noted in 1936 that *Iris setosa* possesses distinctly diminutive petals that can be isolated by a single decision boundary ($Petal Length \le 2.45\text{ cm}$).

### 3. Stratified Holdout Validation
A standard 80/20 train/test split partitions the 150 specimens into 120 training samples and 30 testing samples. Stratification ensures exactly 10 samples of each species are held out for unbiased testing.

---

## 📜 Project Metadata & License

- **Project:** Iris Flower Species Classification Platform
- **Core ML Architecture:** Supervised Decision Tree Classification (Gini Criterion, 80/20 Stratified Split)
- **License:** Open Academic and Educational License

