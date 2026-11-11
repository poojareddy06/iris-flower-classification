import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ImageAnalysis, User
from app.schemas import ImageAnalysisResponse
from app.utils.auth import get_current_user, get_current_user_optional
from app.services.image_service import ImageService
from app.config import IMAGES_DIR

router = APIRouter(prefix="/image", tags=["Image Analysis"])

ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB

@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_flower(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP."
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowable limit of 10 MB."
        )

    file_id = str(uuid.uuid4())[:10]
    saved_filename = f"{file_id}{ext}"
    saved_path = str(IMAGES_DIR / saved_filename)

    with open(saved_path, "wb") as f:
        f.write(content)

    # Run computer vision pipeline
    analysis = ImageService.analyze_flower_image(content, file.filename)

    record = ImageAnalysis(
        user_id=current_user.id if current_user else None,
        image_filename=saved_filename,
        image_path=saved_path,
        predicted_species=analysis["predicted_species"],
        confidence=analysis["confidence"],
        is_suitable=analysis["is_suitable"],
        flower_info=analysis.get("flower_info", {}),
        possible_disease=analysis.get("possible_disease", {}),
        notes=analysis.get("error", "")
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    image_url = f"/api/image/file/{saved_filename}"

    return {
        "id": record.id,
        "image_url": image_url,
        "predicted_species": record.predicted_species,
        "confidence": record.confidence,
        "is_suitable": record.is_suitable,
        "is_reliable": analysis.get("is_reliable", True),
        "flower_info": record.flower_info,
        "possible_disease": record.possible_disease,
        "model_pipeline": analysis.get("model_pipeline", "Computer Vision Iris Analyzer"),
        "created_at": record.created_at,
        "alert": analysis.get("alert")
    }

@router.get("/file/{filename}")
def serve_image(filename: str):
    file_path = IMAGES_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image file not found.")
    ext = file_path.suffix.lower()
    media_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else f"image/{ext.replace('.', '')}"
    return FileResponse(str(file_path), media_type=media_type)

@router.get("/history", response_model=List[ImageAnalysisResponse])
def get_image_history(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(ImageAnalysis)
    if current_user:
        query = query.filter(ImageAnalysis.user_id == current_user.id)
    else:
        query = query.filter(ImageAnalysis.user_id == None)

    records = query.order_by(ImageAnalysis.id.desc()).limit(50).all()
    results = []
    for r in records:
        results.append({
            "id": r.id,
            "image_url": f"/api/image/file/{r.image_filename}",
            "predicted_species": r.predicted_species,
            "confidence": r.confidence,
            "is_suitable": r.is_suitable,
            "flower_info": r.flower_info or {},
            "possible_disease": r.possible_disease or {},
            "model_pipeline": "Computer Vision Flower Analysis Engine (Separated from Tabular Decision Tree)",
            "created_at": r.created_at
        })
    return results

@router.delete("/history")
def clear_image_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(ImageAnalysis).filter(ImageAnalysis.user_id == current_user.id).all()
    for r in records:
        if r.image_path and os.path.exists(r.image_path):
            try:
                os.remove(r.image_path)
            except Exception:
                pass
        db.delete(r)
    db.commit()
    return {"status": "success", "message": "All image analysis records cleared."}

@router.delete("/{record_id}")
def delete_image_analysis(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(ImageAnalysis).filter(
        ImageAnalysis.id == record_id,
        ImageAnalysis.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Image record not found.")

    if os.path.exists(record.image_path):
        try:
            os.remove(record.image_path)
        except Exception:
            pass

    db.delete(record)
    db.commit()
    return {"status": "success", "message": "Image record deleted successfully."}
