import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

client = TestClient(app)

def setup_module():
    Base.metadata.create_all(bind=engine)

def test_register_and_login():
    email = "researcher_test@irislab.ai"
    password = "securePassword123"

    # Register
    reg_resp = client.post("/api/auth/register", json={
        "name": "Test Researcher",
        "email": email,
        "password": password
    })
    assert reg_resp.status_code in [200, 400] # 400 if already exists

    # Login
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    token = data["access_token"]

    # Verify /me with Bearer token
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email

def test_invalid_login():
    resp = client.post("/api/auth/login", json={
        "email": "nonexistent@user.com",
        "password": "wrongPassword"
    })
    assert resp.status_code == 401

def test_forgot_and_reset_password():
    email = "reset_user@irislab.ai"
    # Register first
    client.post("/api/auth/register", json={
        "name": "Reset User",
        "email": email,
        "password": "initialPassword123"
    })

    # Forgot password
    fp_resp = client.post("/api/auth/forgot-password", json={"email": email})
    assert fp_resp.status_code == 200
    assert fp_resp.json()["status"] == "success"

    # Reset password
    rp_resp = client.post("/api/auth/reset-password", json={
        "email": email,
        "new_password": "updatedPassword456"
    })
    assert rp_resp.status_code == 200
    assert rp_resp.json()["status"] == "success"

    # Login with new password
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "updatedPassword456"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Delete account
    del_resp = client.delete("/api/auth/account", headers={"Authorization": f"Bearer {token}"})
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"

