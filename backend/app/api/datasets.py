import os
import shutil
import uuid
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Dataset, User
from app.schemas import DatasetInfo
from app.utils.auth import get_current_user, get_current_user_optional
from app.services.ml_service import MLService
from app.config import DATASETS_DIR, DATA_DIR

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=DatasetInfo)
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are supported."
        )

    file_id = str(uuid.uuid4())[:8]
    clean_name = f"{file_id}_{file.filename}"
    file_path = str(DATASETS_DIR / clean_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Inspect & validate dataset
    analysis = MLService.inspect_dataset(file_path)

    dataset_record = Dataset(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        row_count=analysis["row_count"],
        col_count=analysis["col_count"],
        columns_info=analysis["columns_info"],
        missing_values=analysis["missing_values"],
        duplicate_rows=analysis["duplicate_rows"],
        class_distribution=analysis["class_distribution"],
        is_valid=analysis["is_valid"],
        validation_message=analysis["validation_message"],
        is_default=False
    )
    db.add(dataset_record)
    db.commit()
    db.refresh(dataset_record)
    return dataset_record

@router.get("", response_model=List[DatasetInfo])
def get_datasets(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ensure_default_dataset_seeded(db)
    if current_user:
        return db.query(Dataset).filter(
            (Dataset.user_id == current_user.id) | (Dataset.is_default == True)
        ).order_by(Dataset.id.desc()).all()
    else:
        return db.query(Dataset).filter(Dataset.is_default == True).all()

@router.get("/{dataset_id}")
def get_dataset(
    dataset_id: int,
    preview_rows: int = Query(50, ge=1, le=500),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    rows_preview = []
    if os.path.exists(ds.file_path):
        try:
            df = pd.read_csv(ds.file_path)
            rows_preview = df.head(preview_rows).fillna("").to_dict(orient="records")
        except Exception:
            rows_preview = []

    return {
        "id": ds.id,
        "filename": ds.filename,
        "row_count": ds.row_count,
        "col_count": ds.col_count,
        "columns_info": ds.columns_info,
        "missing_values": ds.missing_values,
        "duplicate_rows": ds.duplicate_rows,
        "class_distribution": ds.class_distribution,
        "is_valid": ds.is_valid,
        "validation_message": ds.validation_message,
        "is_default": ds.is_default,
        "created_at": ds.created_at,
        "rows_preview": rows_preview
    }

@router.get("/{dataset_id}/download")
def download_dataset(
    dataset_id: int,
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds or not os.path.exists(ds.file_path):
        raise HTTPException(status_code=404, detail="Dataset file not found.")

    return FileResponse(
        path=ds.file_path,
        filename=ds.filename,
        media_type="text/csv"
    )

@router.delete("/clear/user-datasets")
def clear_user_datasets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_datasets = db.query(Dataset).filter(
        Dataset.user_id == current_user.id,
        Dataset.is_default == False
    ).all()
    for ds in user_datasets:
        if os.path.exists(ds.file_path):
            try:
                os.remove(ds.file_path)
            except Exception:
                pass
        db.delete(ds)
    db.commit()
    return {"status": "success", "message": "All user uploaded datasets deleted successfully."}

@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ds = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found or cannot delete default dataset.")

    if ds.is_default:
        raise HTTPException(status_code=400, detail="Default Iris benchmark dataset cannot be deleted.")

    if os.path.exists(ds.file_path):
        try:
            os.remove(ds.file_path)
        except Exception:
            pass

    db.delete(ds)
    db.commit()
    return {"status": "success", "message": "Dataset deleted successfully."}

def ensure_default_dataset_seeded(db: Session):
    existing = db.query(Dataset).filter(Dataset.is_default == True).first()
    if existing and os.path.exists(existing.file_path):
        return existing

    default_csv = DATA_DIR / "iris.csv"
    if not os.path.exists(default_csv):
        return None

    analysis = MLService.inspect_dataset(str(default_csv))
    default_record = Dataset(
        user_id=None,
        filename="Iris.csv (Canonical Dataset)",
        file_path=str(default_csv),
        row_count=analysis["row_count"],
        col_count=analysis["col_count"],
        columns_info=analysis["columns_info"],
        missing_values=analysis["missing_values"],
        duplicate_rows=analysis["duplicate_rows"],
        class_distribution=analysis["class_distribution"],
        is_valid=analysis["is_valid"],
        validation_message="Standard authentic Iris benchmark dataset (150 rows, 4 features, 3 balanced species classes).",
        is_default=True
    )
    db.add(default_record)
    db.commit()
    db.refresh(default_record)
    return default_record
