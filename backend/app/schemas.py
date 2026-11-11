from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# --- Auth ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., pattern=r"^[^@]+@[^@]+\.[^@]+$")
    password: str = Field(..., min_length=6)
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
    settings: Optional[Dict[str, Any]] = {}

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Dataset ---
class DatasetInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    row_count: int
    col_count: int
    columns_info: List[Dict[str, Any]]
    missing_values: Dict[str, int]
    duplicate_rows: int
    class_distribution: Dict[str, int]
    is_valid: bool
    validation_message: str
    is_default: bool
    created_at: datetime

# --- Model ---
class ModelTrainParams(BaseModel):
    dataset_id: Optional[int] = None
    model_name: Optional[str] = "Iris Decision Tree Classifier"
    criterion: str = "gini" # "gini" or "entropy" / "log_loss"
    test_size: float = 0.2
    random_state: int = 42
    max_depth: Optional[int] = None
    min_samples_split: int = 2
    min_samples_leaf: int = 1

class ModelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    model_name: str
    algorithm: str
    criterion: str
    test_size: float
    random_state: int
    hyperparameters: Dict[str, Any]
    feature_names: List[str]
    target_names: List[str]
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    classification_report: Dict[str, Any]
    feature_importances: Dict[str, float]
    tree_rules: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: datetime

# --- Prediction ---
class PredictionRequest(BaseModel):
    model_id: Optional[int] = None
    sepal_length: float = Field(..., ge=0.1, le=15.0)
    sepal_width: float = Field(..., ge=0.1, le=15.0)
    petal_length: float = Field(..., ge=0.1, le=15.0)
    petal_width: float = Field(..., ge=0.01, le=15.0)

class PredictionResponse(BaseModel):
    id: Optional[int] = None
    predicted_species: str
    confidence: float
    probabilities: Dict[str, float]
    explanation: str
    decision_path: List[Dict[str, Any]]
    model_name: str
    model_id: Optional[int] = None
    inputs: Dict[str, float]
    created_at: Optional[datetime] = None

# --- Image Analysis ---
class ImageAnalysisResponse(BaseModel):
    id: Optional[int] = None
    image_url: str
    predicted_species: str
    confidence: float
    is_suitable: bool
    is_reliable: Optional[bool] = True
    flower_info: Dict[str, Any]
    possible_disease: Dict[str, Any]
    model_pipeline: str = "Computer Vision Flower Analysis Engine (Separated from Tabular Decision Tree)"
    created_at: Optional[datetime] = None
    alert: Optional[Dict[str, Any]] = None

# --- AI Chat ---
class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    language: Optional[str] = "English"

class ChatMessageResponse(BaseModel):
    id: Optional[int] = None
    role: str
    content: str
    context_used: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- Settings ---
class UserSettingsUpdate(BaseModel):
    theme: Optional[str] = "dark"
    language: Optional[str] = "en"
    notifications: Optional[bool] = True
    ai_settings: Optional[Dict[str, Any]] = {}
