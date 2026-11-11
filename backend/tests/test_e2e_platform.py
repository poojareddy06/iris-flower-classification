import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.api.auth import ensure_default_user_seeded
from app.api.datasets import ensure_default_dataset_seeded
from app.api.models import ensure_default_model_seeded

client = TestClient(app)

def setup_module():
    db = SessionLocal()
    try:
        ensure_default_user_seeded(db)
        ensure_default_dataset_seeded(db)
        ensure_default_model_seeded(db)
    finally:
        db.close()

def test_e2e_health_check():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"

def test_e2e_active_model_metrics():
    resp = client.get("/api/models/active")
    assert resp.status_code == 200
    data = resp.json()
    assert data["algorithm"] == "DecisionTreeClassifier"
    assert data["criterion"] == "gini"
    assert data["test_size"] == 0.2
    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data
    assert "confusion_matrix" in data
    assert "feature_importances" in data
    assert len(data["confusion_matrix"]) == 3

def test_e2e_prediction_and_history():
    # Login as default demo/admin user
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@irislab.ai",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Predict Setosa
    pred_resp = client.post("/api/predict", json={
        "sepal_length": 5.1,
        "sepal_width": 3.5,
        "petal_length": 1.4,
        "petal_width": 0.2
    }, headers=headers)
    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    assert "setosa" in pred_data["predicted_species"].lower()
    assert pred_data["confidence"] >= 0.8
    assert len(pred_data["decision_path"]) > 0

    # Retrieve history
    hist_resp = client.get("/api/predict/history", headers=headers)
    assert hist_resp.status_code == 200
    hist = hist_resp.json()
    assert len(hist) >= 1
    assert any(h["id"] == pred_data["id"] for h in hist)

def test_e2e_assistant_local_no_api_key():
    resp = client.post("/api/assistant/chat", json={
        "message": "Explain the Gini criterion in Decision Tree.",
        "language": "English"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "assistant"
    assert "Gini" in data["content"] or "gini" in data["content"]

def test_e2e_dataset_canonical_seeded():
    resp = client.get("/api/datasets")
    assert resp.status_code == 200
    datasets = resp.json()
    assert len(datasets) >= 1
    canonical = next((d for d in datasets if d["is_default"]), None)
    assert canonical is not None
    assert canonical["row_count"] == 150
    assert canonical["col_count"] in [5, 6]
    assert canonical["is_valid"] is True

def test_e2e_admin_dashboard_authorization():
    # Login as admin
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@irislab.ai",
        "password": "password123"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    stats_resp = client.get("/api/admin/stats", headers=admin_headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert "total_users" in stats
    assert "total_predictions" in stats

    # Login as demo standard user
    demo_login = client.post("/api/auth/login", json={
        "email": "demo@irislab.ai",
        "password": "password123"
    })
    assert demo_login.status_code == 200
    demo_token = demo_login.json()["access_token"]
    demo_headers = {"Authorization": f"Bearer {demo_token}"}

    forbidden_resp = client.get("/api/admin/stats", headers=demo_headers)
    assert forbidden_resp.status_code == 403

