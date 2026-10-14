import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.services.ppt_service import PPTService
from app.config import BASE_DIR

router = APIRouter(prefix="/presentation", tags=["Presentation"])

@router.get("/slides")
def get_all_slides():
    return {
        "title": "Iris Flower Species Classification Using Decision Tree",
        "student": "Pooja V",
        "roll_number": "24691A31H0",
        "class": "3rd Year C Section",
        "company": "Edu Tantr, Bangalore",
        "domain": "Machine Learning",
        "total_slides": len(PPTService.get_slides()),
        "slides": PPTService.get_slides()
    }

@router.get("/slide/{number}")
def get_single_slide(number: int):
    slide = PPTService.get_slide_by_number(number)
    return slide

@router.get("/download-pptx")
def download_original_pptx():
    pptx_path = BASE_DIR / "presentation" / "internship_review.pptx"
    if not pptx_path.exists():
        raise HTTPException(status_code=404, detail="PowerPoint file not found on server.")
    return FileResponse(
        path=str(pptx_path),
        filename="Pooja_V_Internship_Review_ML_Final_Corrected.pptx",
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
