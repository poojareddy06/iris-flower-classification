import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "saved_models"
UPLOADS_DIR = BASE_DIR / "uploads"
DATASETS_DIR = UPLOADS_DIR / "datasets"
IMAGES_DIR = UPLOADS_DIR / "images"

for d in [DATA_DIR, MODELS_DIR, UPLOADS_DIR, DATASETS_DIR, IMAGES_DIR]:
    d.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/iris_app.db")
SECRET_KEY = os.getenv("SECRET_KEY", "iris-ml-secret-key-decision-tree-2026-pooja-v")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
