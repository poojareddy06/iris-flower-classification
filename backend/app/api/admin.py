from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Dataset, MLModel, Prediction, ImageAnalysis
from app.schemas import UserResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Management"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required."
        )
    return current_user

@router.get("/users", response_model=List[UserResponse])
def get_all_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.desc()).all()

@router.get("/stats")
def get_system_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_datasets": db.query(Dataset).count(),
        "total_models": db.query(MLModel).count(),
        "total_predictions": db.query(Prediction).count(),
        "total_image_analyses": db.query(ImageAnalysis).count(),
        "supported_flower_classes": ["Iris-setosa", "Iris-versicolor", "Iris-virginica"],
        "primary_algorithm": "DecisionTreeClassifier (Gini Impurity, 80/20 Stratified Split)"
    }

@router.get("/logs")
def get_system_logs(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    # Compile recent activity logs
    logs = []
    latest_models = db.query(MLModel).order_by(MLModel.id.desc()).limit(5).all()
    for m in latest_models:
        logs.append({
            "timestamp": m.created_at,
            "type": "MODEL_TRAINED",
            "message": f"Trained model '{m.model_name}' (Accuracy: {round(m.accuracy * 100, 1)}%)"
        })

    latest_ds = db.query(Dataset).order_by(Dataset.id.desc()).limit(5).all()
    for d in latest_ds:
        logs.append({
            "timestamp": d.created_at,
            "type": "DATASET_UPLOADED",
            "message": f"Uploaded dataset '{d.filename}' with {d.row_count} rows"
        })

    latest_img = db.query(ImageAnalysis).order_by(ImageAnalysis.id.desc()).limit(5).all()
    for img in latest_img:
        logs.append({
            "timestamp": img.created_at,
            "type": "IMAGE_ANALYZED",
            "message": f"Analyzed image -> {img.predicted_species} ({round(img.confidence * 100, 1)}% confidence)"
        })

    logs.sort(key=lambda x: x["timestamp"] if x["timestamp"] else "", reverse=True)
    return logs
