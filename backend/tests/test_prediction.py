import os
from app.services.ml_service import MLService
from app.config import MODELS_DIR, DATA_DIR

def test_manual_prediction_and_path_trace():
    model_path = str(MODELS_DIR / "test_model_unit.joblib")
    if not os.path.exists(model_path):
        MLService.train_model(
            dataset_path=str(DATA_DIR / "iris.csv"),
            model_save_name="test_model_unit"
        )

    # Obvious Setosa measurements
    pred = MLService.predict(model_path, 5.0, 3.6, 1.4, 0.2)
    assert "setosa" in pred["predicted_species"].lower()
    assert pred["confidence"] >= 0.9
    assert len(pred["decision_path"]) >= 2
    assert "explanation" in pred
    assert len(pred["explanation"]) > 20
