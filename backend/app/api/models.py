import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MLModel, Dataset, User
from app.schemas import ModelTrainParams, ModelResponse
from app.utils.auth import get_current_user, get_current_user_optional
from app.services.ml_service import MLService
from app.api.datasets import ensure_default_dataset_seeded

router = APIRouter(prefix="/models", tags=["Model Training"])

@router.post("/train", response_model=ModelResponse)
def train_model(
    params: ModelTrainParams,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve dataset
    if params.dataset_id:
        ds = db.query(Dataset).filter(Dataset.id == params.dataset_id).first()
    else:
        ds = db.query(Dataset).filter(Dataset.is_default == True).first()
        if not ds:
            ds = ensure_default_dataset_seeded(db)

    if not ds or not os.path.exists(ds.file_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid training dataset not found. Please upload or select a dataset first."
        )

    if not ds.is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Selected dataset is marked incompatible: {ds.validation_message}"
        )

    model_uid = str(uuid.uuid4())[:8]
    save_name = f"dt_model_{model_uid}"

    try:
        results = MLService.train_model(
            dataset_path=ds.file_path,
            criterion=params.criterion,
            test_size=params.test_size,
            random_state=params.random_state,
            max_depth=params.max_depth,
            min_samples_split=params.min_samples_split,
            min_samples_leaf=params.min_samples_leaf,
            model_save_name=save_name
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training pipeline failed: {str(e)}"
        )

    # Set prior models inactive
    db.query(MLModel).filter(MLModel.user_id == current_user.id).update({"is_active": False})

    model_record = MLModel(
        user_id=current_user.id,
        dataset_id=ds.id,
        model_name=params.model_name or f"Decision Tree (Gini, 80/20) - {model_uid}",
        algorithm="DecisionTreeClassifier",
        criterion=params.criterion,
        test_size=params.test_size,
        random_state=params.random_state,
        hyperparameters={
            "max_depth": params.max_depth,
            "min_samples_split": params.min_samples_split,
            "min_samples_leaf": params.min_samples_leaf,
            "criterion": params.criterion
        },
        feature_names=results["feature_names"],
        target_names=results["target_names"],
        accuracy=results["accuracy"],
        precision=results["precision"],
        recall=results["recall"],
        f1_score=results["f1_score"],
        confusion_matrix=results["confusion_matrix"],
        classification_report=results["classification_report"],
        feature_importances=results["feature_importances"],
        tree_rules=results["tree_rules"],
        model_file_path=results["model_file_path"],
        is_active=True
    )
    db.add(model_record)
    db.commit()
    db.refresh(model_record)

    return model_record

@router.get("", response_model=List[ModelResponse])
def get_models(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ensure_default_model_seeded(db)
    if current_user:
        return db.query(MLModel).filter(
            (MLModel.user_id == current_user.id) | (MLModel.user_id == None)
        ).order_by(MLModel.id.desc()).all()
    else:
        return db.query(MLModel).order_by(MLModel.id.desc()).all()

@router.get("/active", response_model=ModelResponse)
def get_active_model(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ensure_default_model_seeded(db)
    model = None
    if current_user:
        model = db.query(MLModel).filter(MLModel.user_id == current_user.id, MLModel.is_active == True).first()
    if not model:
        model = db.query(MLModel).filter(MLModel.is_active == True).order_by(MLModel.id.desc()).first()
    if not model:
        model = db.query(MLModel).order_by(MLModel.id.desc()).first()
    if not model:
        raise HTTPException(status_code=404, detail="No trained model found. Please train a model first.")
    return model

@router.get("/{model_id}", response_model=ModelResponse)
def get_model(model_id: int, db: Session = Depends(get_db)):
    model = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found.")
    return model

@router.post("/{model_id}/activate")
def activate_model(
    model_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    model = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found.")

    db.query(MLModel).filter(MLModel.user_id == current_user.id).update({"is_active": False})
    model.is_active = True
    db.commit()
    return {"status": "success", "message": f"Model '{model.model_name}' activated."}

@router.delete("/{model_id}")
def delete_model(
    model_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    model = db.query(MLModel).filter(MLModel.id == model_id, MLModel.user_id == current_user.id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found or cannot delete default model.")

    if os.path.exists(model.model_file_path):
        try:
            os.remove(model.model_file_path)
        except Exception:
            pass

    db.delete(model)
    db.commit()
    return {"status": "success", "message": "Model deleted successfully."}

def ensure_default_model_seeded(db: Session):
    existing = db.query(MLModel).first()
    if existing and os.path.exists(existing.model_file_path):
        return existing

    ds = ensure_default_dataset_seeded(db)
    if not ds:
        return None

    try:
        results = MLService.train_model(
            dataset_path=ds.file_path,
            criterion="gini",
            test_size=0.2,
            random_state=42,
            model_save_name="default_iris_tree_model"
        )
        default_model = MLModel(
            user_id=None,
            dataset_id=ds.id,
            model_name="Canonical Decision Tree (Gini Criterion, 80/20 Split)",
            algorithm="DecisionTreeClassifier",
            criterion="gini",
            test_size=0.2,
            random_state=42,
            hyperparameters={"criterion": "gini", "max_depth": None, "min_samples_split": 2, "min_samples_leaf": 1},
            feature_names=results["feature_names"],
            target_names=results["target_names"],
            accuracy=results["accuracy"],
            precision=results["precision"],
            recall=results["recall"],
            f1_score=results["f1_score"],
            confusion_matrix=results["confusion_matrix"],
            classification_report=results["classification_report"],
            feature_importances=results["feature_importances"],
            tree_rules=results["tree_rules"],
            model_file_path=results["model_file_path"],
            is_active=True
        )
        db.add(default_model)
        db.commit()
        db.refresh(default_model)
        return default_model
    except Exception as e:
        print("Failed to seed default model:", e)
        return None
