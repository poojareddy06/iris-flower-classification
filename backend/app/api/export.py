import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Prediction, MLModel, User
from app.utils.auth import get_current_user_optional

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/predictions")
def export_predictions_csv(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction)
    if current_user:
        query = query.filter((Prediction.user_id == current_user.id) | (Prediction.user_id == None))
    else:
        query = query.filter(Prediction.user_id == None)

    preds = query.order_by(Prediction.id.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Sepal Length (cm)", "Sepal Width (cm)", "Petal Length (cm)", "Petal Width (cm)", "Predicted Species", "Confidence", "Model ID"])

    for p in preds:
        writer.writerow([
            p.id,
            p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else "",
            p.sepal_length,
            p.sepal_width,
            p.petal_length,
            p.petal_width,
            p.predicted_species,
            round(p.confidence, 4),
            p.model_id
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=iris_predictions_export.csv"}
    )

@router.get("/model-report/{model_id}")
def export_model_report(
    model_id: int,
    db: Session = Depends(get_db)
):
    model = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found.")

    report = {
        "title": "Machine Learning Model Evaluation & Technical Audit Report",
        "project": "Iris Flower Species Classification Using Decision Tree",
        "author": "Pooja V (24691A31H0)",
        "organization": "Edu Tantr, Bangalore",
        "model_id": model.id,
        "model_name": model.model_name,
        "algorithm": model.algorithm,
        "criterion": model.criterion,
        "train_test_split": f"{(1 - model.test_size) * 100:.0f}% Train / {model.test_size * 100:.0f}% Test",
        "random_state": model.random_state,
        "hyperparameters": model.hyperparameters,
        "evaluation_metrics": {
            "accuracy": f"{model.accuracy * 100:.2f}%",
            "precision": f"{model.precision * 100:.2f}%",
            "recall": f"{model.recall * 100:.2f}%",
            "f1_score": f"{model.f1_score * 100:.2f}%"
        },
        "feature_importances": {
            k: f"{v * 100:.2f}%" for k, v in (model.feature_importances or {}).items()
        },
        "confusion_matrix": {
            "labels": model.target_names,
            "matrix": model.confusion_matrix
        },
        "classification_report": model.classification_report,
        "generated_at": model.created_at.isoformat() if model.created_at else None
    }
    return report

@router.get("/model-report/{model_id}/html")
def export_model_report_html(
    model_id: int,
    db: Session = Depends(get_db)
):
    from fastapi.responses import HTMLResponse
    model = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found.")

    feat_rows = "".join(
        f"<tr><td style='padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;'>{k}</td>"
        f"<td style='padding:8px 12px;border:1px solid #e2e8f0;'>{v * 100:.2f}%</td>"
        f"<td style='padding:8px 12px;border:1px solid #e2e8f0;'><div style='background:#e2e8f0;border-radius:4px;width:100%;height:10px;'><div style='background:#7c3aed;width:{v * 100:.1f}%;height:10px;border-radius:4px;'></div></div></td></tr>"
        for k, v in (model.feature_importances or {}).items()
    )

    cm_labels = "".join(f"<th style='padding:8px;border:1px solid #cbd5e1;'>Pred: {lbl}</th>" for lbl in model.target_names)
    cm_rows = ""
    for idx, row in enumerate(model.confusion_matrix or []):
        row_tds = "".join(f"<td style='padding:8px;border:1px solid #cbd5e1;text-align:center;font-weight:bold;'>{val}</td>" for val in row)
        cm_rows += f"<tr><td style='padding:8px;border:1px solid #cbd5e1;font-weight:600;'>True: {model.target_names[idx]}</td>{row_tds}</tr>"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ML Audit Report - {model.model_name}</title>
<style>
  body {{ font-family: 'Segoe UI', Roboto, Helvetica, sans-serif; line-height: 1.5; color: #1e293b; margin: 40px; }}
  .header {{ border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }}
  .header h1 {{ margin: 0 0 6px 0; color: #0f172a; font-size: 24px; }}
  .header p {{ margin: 0; color: #64748b; font-size: 14px; }}
  .metric-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }}
  .metric-val {{ font-size: 26px; font-weight: bold; color: #7c3aed; }}
  .metric-label {{ font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 4px; }}
  .grid-4 {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }}
  h2 {{ color: #1e293b; font-size: 17px; margin-top: 28px; border-left: 4px solid #7c3aed; padding-left: 10px; }}
  .actions {{ margin-bottom: 20px; }}
  @media print {{
    .no-print {{ display: none; }}
    body {{ margin: 10mm; }}
  }}
</style>
</head>
<body>
<div class="actions no-print">
  <button onclick="window.print()" style="background:#7c3aed;color:white;border:none;padding:10px 18px;border-radius:6px;font-weight:bold;cursor:pointer;">
    🖨️ Print / Save to PDF
  </button>
</div>

<div class="header">
  <h1>🌸 Iris Flower Species Classification - Model Audit Report</h1>
  <p><strong>Project:</strong> Iris Flower Species Classification Using Decision Tree | <strong>Author:</strong> Pooja V (Roll: 24691A31H0, 3rd Year C Section) | <strong>Host Organization:</strong> Edu Tantr, Bangalore</p>
  <p style="margin-top: 4px; font-size: 12px;"><strong>Generated At:</strong> {model.created_at.strftime('%Y-%m-%d %H:%M:%S') if model.created_at else 'N/A'} | <strong>Model ID:</strong> #{model.id}</p>
</div>

<div class="grid-4">
  <div class="metric-card">
    <div class="metric-val">{model.accuracy * 100:.1f}%</div>
    <div class="metric-label">Accuracy</div>
  </div>
  <div class="metric-card">
    <div class="metric-val">{model.precision * 100:.1f}%</div>
    <div class="metric-label">Precision</div>
  </div>
  <div class="metric-card">
    <div class="metric-val">{model.recall * 100:.1f}%</div>
    <div class="metric-label">Recall</div>
  </div>
  <div class="metric-card">
    <div class="metric-val">{model.f1_score * 100:.1f}%</div>
    <div class="metric-label">F1-Score</div>
  </div>
</div>

<h2>1. Model Specification</h2>
<table>
  <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;font-weight:600;width:30%;">Model Name</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">{model.model_name}</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;font-weight:600;">Algorithm</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">{model.algorithm}</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;font-weight:600;">Splitting Criterion</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">{model.criterion.upper()} (Gini Impurity)</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;font-weight:600;">Partition Split</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">{(1 - model.test_size) * 100:.0f}% Train / {model.test_size * 100:.0f}% Test (Stratified)</td></tr>
  <tr><td style="padding:6px 10px;border:1px solid #e2e8f0;font-weight:600;">Random State</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">{model.random_state} (Reproducible Seed)</td></tr>
</table>

<h2>2. Gini Feature Importance</h2>
<table>
  <thead>
    <tr style="background:#f1f5f9;"><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left;">Measurement Feature</th><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left;">Importance (%)</th><th style="padding:8px 12px;border:1px solid #e2e8f0;text-align:left;">Visual Proportion</th></tr>
  </thead>
  <tbody>
    {feat_rows}
  </tbody>
</table>

<h2>3. Test Set Confusion Matrix</h2>
<table>
  <thead>
    <tr style="background:#f1f5f9;"><th style="padding:8px;border:1px solid #cbd5e1;">Actual / Predicted</th>{cm_labels}</tr>
  </thead>
  <tbody>
    {cm_rows}
  </tbody>
</table>

<footer style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
  Iris Flower Species Classification Using Decision Tree • Machine Learning Platform • Edu Tantr, Bangalore
</footer>
</body>
</html>
"""
    return HTMLResponse(content=html_content)

