from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatMessage, MLModel, Dataset, Prediction, User
from app.schemas import ChatMessageRequest, ChatMessageResponse
from app.utils.auth import get_current_user, get_current_user_optional
from app.services.assistant_service import AssistantService

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=ChatMessageResponse)
async def chat_with_assistant(
    req: ChatMessageRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else None

    # Gather live context from the application
    active_model = None
    if user_id:
        active_model = db.query(MLModel).filter(MLModel.user_id == user_id, MLModel.is_active == True).first()
    if not active_model:
        active_model = db.query(MLModel).filter(MLModel.is_active == True).order_by(MLModel.id.desc()).first()

    context = {}
    if active_model:
        context["model_name"] = active_model.model_name
        context["algorithm"] = active_model.algorithm
        context["criterion"] = active_model.criterion
        context["accuracy"] = active_model.accuracy
        context["precision"] = active_model.precision
        context["recall"] = active_model.recall
        context["f1_score"] = active_model.f1_score

    dataset = db.query(Dataset).order_by(Dataset.id.desc()).first()
    if dataset:
        context["dataset_rows"] = dataset.row_count

    last_pred = db.query(Prediction).order_by(Prediction.id.desc()).first()
    if last_pred:
        context["last_prediction"] = f"{last_pred.predicted_species} (Confidence: {round(last_pred.confidence * 100, 1)}%)"

    # Save user message
    user_msg_record = ChatMessage(
        user_id=user_id,
        session_id=req.session_id or "default",
        role="user",
        content=req.message,
        context_used={}
    )
    db.add(user_msg_record)

    # Generate assistant reply
    resp_data = await AssistantService.generate_response(
        message=req.message,
        context=context,
        language=req.language or "English"
    )

    assistant_msg_record = ChatMessage(
        user_id=user_id,
        session_id=req.session_id or "default",
        role="assistant",
        content=resp_data["content"],
        context_used=resp_data.get("context_used", {})
    )
    db.add(assistant_msg_record)
    db.commit()
    db.refresh(assistant_msg_record)

    return {
        "id": assistant_msg_record.id,
        "role": assistant_msg_record.role,
        "content": assistant_msg_record.content,
        "context_used": assistant_msg_record.context_used,
        "timestamp": assistant_msg_record.created_at
    }

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    session_id: str = Query("default"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(ChatMessage).filter(ChatMessage.session_id == session_id)
    if current_user:
        query = query.filter((ChatMessage.user_id == current_user.id) | (ChatMessage.user_id == None))
    else:
        query = query.filter(ChatMessage.user_id == None)

    messages = query.order_by(ChatMessage.id.asc()).limit(50).all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "context_used": m.context_used or {},
            "timestamp": m.created_at
        }
        for m in messages
    ]

@router.delete("/history")
def clear_chat_history(
    session_id: str = Query("default"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id,
        ChatMessage.user_id == current_user.id
    ).delete()
    db.commit()
    return {"status": "success", "message": "Chat history cleared."}
