import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="user") # "admin" or "user"
    settings = Column(JSON, default={})
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    datasets = relationship("Dataset", back_populates="user", cascade="all, delete-orphan")
    models = relationship("MLModel", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    image_analyses = relationship("ImageAnalysis", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    columns_info = Column(JSON, default=[]) # list of col metadata
    missing_values = Column(JSON, default={})
    duplicate_rows = Column(Integer, default=0)
    class_distribution = Column(JSON, default={})
    is_valid = Column(Boolean, default=False)
    validation_message = Column(Text, default="")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="datasets")
    models = relationship("MLModel", back_populates="dataset")

class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    model_name = Column(String(255), nullable=False)
    algorithm = Column(String(100), default="DecisionTreeClassifier")
    criterion = Column(String(50), default="gini")
    test_size = Column(Float, default=0.2)
    random_state = Column(Integer, default=42)
    hyperparameters = Column(JSON, default={})
    feature_names = Column(JSON, default=["sepal_length", "sepal_width", "petal_length", "petal_width"])
    target_names = Column(JSON, default=["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
    
    accuracy = Column(Float, default=0.0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    confusion_matrix = Column(JSON, default=[])
    classification_report = Column(JSON, default={})
    feature_importances = Column(JSON, default={})
    tree_rules = Column(JSON, default={})
    model_file_path = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="models")
    dataset = relationship("Dataset", back_populates="models")
    predictions = relationship("Prediction", back_populates="model")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=True)
    prediction_type = Column(String(50), default="manual") # manual, demo, batch
    sepal_length = Column(Float, nullable=False)
    sepal_width = Column(Float, nullable=False)
    petal_length = Column(Float, nullable=False)
    petal_width = Column(Float, nullable=False)
    predicted_species = Column(String(100), nullable=False)
    confidence = Column(Float, default=1.0)
    probabilities = Column(JSON, default={})
    explanation = Column(Text, default="")
    decision_path = Column(JSON, default=[])
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="predictions")
    model = relationship("MLModel", back_populates="predictions")

class ImageAnalysis(Base):
    __tablename__ = "image_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_filename = Column(String(255), nullable=False)
    image_path = Column(String(500), nullable=False)
    predicted_species = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.0)
    is_suitable = Column(Boolean, default=True)
    flower_info = Column(JSON, default={}) # scientific_name, common_name, characteristics, habitat
    possible_disease = Column(JSON, default={}) # issue_detected, observations, confidence, recommendations
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="image_analyses")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), default="default")
    role = Column(String(50), nullable=False) # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    context_used = Column(JSON, default={})
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="chat_messages")
