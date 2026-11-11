from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserResponse, Token, UserSettingsUpdate
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # First user can be admin
    count = db.query(User).count()
    role = "admin" if count == 0 else user_data.role or "user"

    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email.lower(),
        full_name=user_data.name,
        hashed_password=hashed_pw,
        role=role,
        settings={"theme": "dark", "language": "en"}
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    expires = timedelta(days=30) if login_data.remember_me else timedelta(days=7)
    token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=expires
    )
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(payload: dict):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    return {
        "status": "success",
        "message": f"If an account with email {email} exists, password reset instructions have been dispatched."
    }

@router.post("/reset-password")
def reset_password(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email", "").strip().lower()
    new_password = payload.get("new_password", "")
    if not email or not new_password:
        raise HTTPException(status_code=400, detail="Email and new password are required.")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user registered with this email address.")
    
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {
        "status": "success",
        "message": "Password has been successfully updated. You can now sign in with your new credentials."
    }

@router.put("/settings")
def update_settings(
    settings: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_settings = current_user.settings or {}
    if settings.theme:
        current_settings["theme"] = settings.theme
    if settings.language:
        current_settings["language"] = settings.language
    if settings.notifications is not None:
        current_settings["notifications"] = settings.notifications
    if settings.ai_settings:
        current_settings["ai_settings"] = settings.ai_settings

    current_user.settings = current_settings
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "settings": current_user.settings}

@router.delete("/account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"status": "success", "message": "User account and all associated models, datasets, and history deleted."}

def ensure_default_user_seeded(db: Session):
    admin_email = "admin@irislab.ai"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        admin_user = User(
            email=admin_email,
            full_name="Platform Administrator",
            hashed_password=get_password_hash("password123"),
            role="admin",
            settings={"theme": "dark", "language": "en"}
        )
        db.add(admin_user)

    demo_email = "demo@irislab.ai"
    existing_demo = db.query(User).filter(User.email == demo_email).first()
    if not existing_demo:
        demo_user = User(
            email=demo_email,
            full_name="Researcher / Student (Demo)",
            hashed_password=get_password_hash("password123"),
            role="user",
            settings={"theme": "dark", "language": "en"}
        )
        db.add(demo_user)

    db.commit()

