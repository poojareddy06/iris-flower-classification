import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Lightweight .env loader (loads root or backend .env if present)
for env_path in [BASE_DIR.parent / ".env", BASE_DIR / ".env"]:
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

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

AI_API_KEY = os.getenv("AI_API_KEY", os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")))
AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini")
GEMINI_API_KEY = AI_API_KEY
