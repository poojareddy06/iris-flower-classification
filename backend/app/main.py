
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal

from app.api import (
    auth,
    datasets,
    models,
    predictions,
    images,
    assistant,
    presentation,
    analytics,
    admin,
    export,
)

from app.api.auth import ensure_default_user_seeded
from app.api.datasets import ensure_default_dataset_seeded
from app.api.models import ensure_default_model_seeded


# Initialize database schema
Base.metadata.create_all(bind=engine)


# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()

    try:
        ensure_default_user_seeded(db)
        ensure_default_dataset_seeded(db)
        ensure_default_model_seeded(db)
    finally:
        db.close()

    yield


# Create FastAPI application
app = FastAPI(
    title="Iris Flower Species Classification & Analysis Platform",
    description=(
        "Production-quality ML Web Application based on "
        "Decision Tree Classifier internship project by Pooja V (Edu Tantr)."
    ),
    version="2.0.0",
    lifespan=lifespan,
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routers
app.include_router(auth.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")
app.include_router(presentation.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(export.router, prefix="/api")


# Root endpoint
@app.get("/")
def home():
    return {
        "message": "Iris Flower API is running",
        "status": "success",
        "documentation": "/docs",
    }


# Health check endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Iris AI Classification Backend",
        "internship_title": (
            "Iris Flower Species Classification Using Decision Tree"
        ),
        "author": "Pooja V (Roll: 24691A31H0)",
        "mentor_company": "Edu Tantr, Bangalore",
    }


# Local development entry point
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
