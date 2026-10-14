from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Prediction, ImageAnalysis, MLModel, Dataset, User
from app.utils.auth import get_current_user_optional
from app.api.models import ensure_default_model_seeded
from app.api.datasets import ensure_default_dataset_seeded

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_summary(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ensure_default_dataset_seeded(db)
    ensure_default_model_seeded(db)

    user_id = current_user.id if current_user else None

    # Total predictions
    pred_query = db.query(Prediction)
    if user_id:
        total_predictions = pred_query.filter((Prediction.user_id == user_id) | (Prediction.user_id == None)).count()
    else:
        total_predictions = pred_query.count()

    # Total images
    img_query = db.query(ImageAnalysis)
    if user_id:
        total_images = img_query.filter((ImageAnalysis.user_id == user_id) | (ImageAnalysis.user_id == None)).count()
    else:
        total_images = img_query.count()

    # Active model
    active_model = None
    if user_id:
        active_model = db.query(MLModel).filter(MLModel.user_id == user_id, MLModel.is_active == True).first()
    if not active_model:
        active_model = db.query(MLModel).filter(MLModel.is_active == True).order_by(MLModel.id.desc()).first()
    if not active_model:
        active_model = db.query(MLModel).order_by(MLModel.id.desc()).first()

    # Dataset rows
    latest_dataset = None
    if user_id:
        latest_dataset = db.query(Dataset).filter(Dataset.user_id == user_id).order_by(Dataset.id.desc()).first()
    if not latest_dataset:
        latest_dataset = db.query(Dataset).order_by(Dataset.id.desc()).first()

    dataset_rows = latest_dataset.row_count if latest_dataset else 150
    class_dist = latest_dataset.class_distribution if latest_dataset else {"Iris-setosa": 50, "Iris-versicolor": 50, "Iris-virginica": 50}

    # Last prediction
    last_pred = None
    if user_id:
        last_pred = db.query(Prediction).filter(Prediction.user_id == user_id).order_by(Prediction.id.desc()).first()
    if not last_pred:
        last_pred = db.query(Prediction).order_by(Prediction.id.desc()).first()

    last_pred_data = None
    if last_pred:
        last_pred_data = {
            "species": last_pred.predicted_species,
            "confidence": last_pred.confidence,
            "timestamp": last_pred.created_at,
            "inputs": {
                "sepal_length": last_pred.sepal_length,
                "sepal_width": last_pred.sepal_width,
                "petal_length": last_pred.petal_length,
                "petal_width": last_pred.petal_width
            }
        }

    # Model overview
    model_overview = {
        "model_id": active_model.id if active_model else None,
        "model_name": active_model.model_name if active_model else "Decision Tree Classifier",
        "algorithm": active_model.algorithm if active_model else "DecisionTreeClassifier",
        "criterion": active_model.criterion if active_model else "gini",
        "train_test_split": "80 / 20",
        "features_count": len(active_model.feature_names) if active_model and active_model.feature_names else 4,
        "classes_count": len(active_model.target_names) if active_model and active_model.target_names else 3,
        "accuracy": active_model.accuracy if active_model else 0.967,
        "precision": active_model.precision if active_model else 0.967,
        "recall": active_model.recall if active_model else 0.967,
        "f1_score": active_model.f1_score if active_model else 0.967
    }

    # Recent predictions (last 5)
    recent_preds = db.query(Prediction).order_by(Prediction.id.desc()).limit(5).all()
    recent_preds_list = [
        {
            "id": p.id,
            "species": p.predicted_species,
            "confidence": p.confidence,
            "created_at": p.created_at,
            "inputs": f"SL: {p.sepal_length}, SW: {p.sepal_width}, PL: {p.petal_length}, PW: {p.petal_width}"
        }
        for p in recent_preds
    ]

    return {
        "total_predictions": total_predictions,
        "dataset_rows": dataset_rows,
        "class_distribution": class_dist,
        "model_accuracy": model_overview["accuracy"],
        "current_model": model_overview["model_name"],
        "last_prediction": last_pred_data,
        "uploaded_images": total_images,
        "model_overview": model_overview,
        "recent_predictions": recent_preds_list
    }

@router.get("/model/{model_id}")
def get_model_analytics(model_id: int, db: Session = Depends(get_db)):
    model = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found.")

    # Plain-language explanation of feature importances
    sorted_features = sorted(model.feature_importances.items(), key=lambda x: x[1], reverse=True)
    top_feature, top_importance = sorted_features[0] if sorted_features else ("Petal Length", 0.0)

    explanation = (
        f"{top_feature} contributed most strongly to the model's classification decisions "
        f"with an importance score of {round(top_importance * 100, 1)}%. "
        f"This aligns directly with botanical biology, where petal dimensions clearly differentiate Iris species."
    )

    return {
        "model_id": model.id,
        "model_name": model.model_name,
        "algorithm": model.algorithm,
        "criterion": model.criterion,
        "test_size": model.test_size,
        "random_state": model.random_state,
        "accuracy": model.accuracy,
        "precision": model.precision,
        "recall": model.recall,
        "f1_score": model.f1_score,
        "confusion_matrix": model.confusion_matrix,
        "target_names": model.target_names,
        "feature_names": model.feature_names,
        "classification_report": model.classification_report,
        "feature_importances": model.feature_importances,
        "tree_rules": model.tree_rules,
        "interpretation": explanation,
        "hyperparameters": model.hyperparameters,
        "created_at": model.created_at
    }
