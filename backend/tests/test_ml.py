import os
from app.services.ml_service import MLService
from app.config import DATA_DIR

def test_ml_pipeline_execution():
    csv_path = str(DATA_DIR / "iris.csv")

    results = MLService.train_model(
        dataset_path=csv_path,
        criterion="gini",
        test_size=0.2,
        random_state=42,
        model_save_name="test_model_unit"
    )

    # Validate non-hardcoded realistic metrics
    assert 0.8 <= results["accuracy"] <= 1.0
    assert 0.8 <= results["precision"] <= 1.0
    assert 0.8 <= results["recall"] <= 1.0
    assert 0.8 <= results["f1_score"] <= 1.0

    # Validate confusion matrix structure (3x3 for Iris 3 classes)
    assert len(results["confusion_matrix"]) == 3
    assert len(results["confusion_matrix"][0]) == 3

    # Validate feature importances (Petal Length/Width should dominate)
    fi = results["feature_importances"]
    assert "Petal Length" in fi
    assert "Petal Width" in fi
    assert fi["Petal Length"] + fi["Petal Width"] > 0.7

    # Validate tree rules structure
    assert results["tree_rules"]["type"] == "decision"
    assert "rule" in results["tree_rules"]
