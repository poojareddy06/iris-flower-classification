import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Prediction, MLModel, User
from app.schemas import PredictionRequest, PredictionResponse
from app.utils.auth import get_current_user, get_current_user_optional
from app.services.ml_service import MLService
from app.api.models import ensure_default_model_seeded

router = APIRouter(prefix="/predict", tags=["Predictions"])

@router.post("", response_model=PredictionResponse)
def make_prediction(
    req: PredictionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Select target model
    if req.model_id:
        model = db.query(MLModel).filter(MLModel.id == req.model_id).first()
    else:
        model = None
        if current_user:
            model = db.query(MLModel).filter(MLModel.user_id == current_user.id, MLModel.is_active == True).first()
        if not model:
            model = db.query(MLModel).filter(MLModel.is_active == True).order_by(MLModel.id.desc()).first()
        if not model:
            model = ensure_default_model_seeded(db)

    if not model or not os.path.exists(model.model_file_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No trained model available. Please train a Decision Tree model first."
        )

    try:
        pred_res = MLService.predict(
            model_file_path=model.model_file_path,
            sepal_length=req.sepal_length,
            sepal_width=req.sepal_width,
            petal_length=req.petal_length,
            petal_width=req.petal_width
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}"
        )

    # Save record
    prediction_record = Prediction(
        user_id=current_user.id if current_user else None,
        model_id=model.id,
        prediction_type="manual" if current_user else "demo",
        sepal_length=req.sepal_length,
        sepal_width=req.sepal_width,
        petal_length=req.petal_length,
        petal_width=req.petal_width,
        predicted_species=pred_res["predicted_species"],
        confidence=pred_res["confidence"],
        probabilities=pred_res["probabilities"],
        explanation=pred_res["explanation"],
        decision_path=pred_res["decision_path"]
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    return {
        "id": prediction_record.id,
        "predicted_species": pred_res["predicted_species"],
        "confidence": pred_res["confidence"],
        "probabilities": pred_res["probabilities"],
        "explanation": pred_res["explanation"],
        "decision_path": pred_res["decision_path"],
        "model_name": model.model_name,
        "model_id": model.id,
        "inputs": pred_res["inputs"],
        "created_at": prediction_record.created_at
    }

@router.get("/history", response_model=List[PredictionResponse])
def get_prediction_history(
    species: Optional[str] = None,
    sort_by: str = Query("newest", pattern="^(newest|oldest|confidence)$"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction)
    if current_user:
        query = query.filter((Prediction.user_id == current_user.id) | (Prediction.user_id == None))
    else:
        query = query.filter(Prediction.user_id == None)

    if species:
        query = query.filter(Prediction.predicted_species.ilike(f"%{species}%"))

    if sort_by == "newest":
        query = query.order_by(Prediction.id.desc())
    elif sort_by == "oldest":
        query = query.order_by(Prediction.id.asc())
    elif sort_by == "confidence":
        query = query.order_by(Prediction.confidence.desc())

    records = query.limit(100).all()
    out = []
    for r in records:
        m_name = r.model.model_name if r.model else "Decision Tree Classifier"
        out.append({
            "id": r.id,
            "predicted_species": r.predicted_species,
            "confidence": r.confidence,
            "probabilities": r.probabilities or {},
            "explanation": r.explanation,
            "decision_path": r.decision_path or [],
            "model_name": m_name,
            "model_id": r.model_id,
            "inputs": {
                "Sepal Length": r.sepal_length,
                "Sepal Width": r.sepal_width,
                "Petal Length": r.petal_length,
                "Petal Width": r.petal_width
            },
            "created_at": r.created_at
        })
    return out

@router.delete("/history/{record_id}")
def delete_prediction(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pred = db.query(Prediction).filter(Prediction.id == record_id, Prediction.user_id == current_user.id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction record not found.")

    db.delete(pred)
    db.commit()
    return {"status": "success", "message": "Prediction record deleted."}

@router.delete("/history")
def clear_all_predictions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Prediction).filter(Prediction.user_id == current_user.id).delete()
    db.commit()
    return {"status": "success", "message": "All prediction history cleared."}
