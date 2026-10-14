import os
import io
import pandas as pd
from app.services.ml_service import MLService
from app.config import DATA_DIR

def test_inspect_valid_dataset():
    csv_path = DATA_DIR / "iris.csv"
    assert os.path.exists(csv_path)

    res = MLService.inspect_dataset(str(csv_path))
    assert res["is_valid"] is True
    assert res["row_count"] == 150
    assert len(res["class_distribution"]) == 3
    assert "Iris-setosa" in res["class_distribution"]

def test_inspect_invalid_dataset(tmp_path):
    # Missing required features
    bad_csv = tmp_path / "bad.csv"
    bad_df = pd.DataFrame({"random_col": [1, 2, 3], "target": ["A", "B", "C"]})
    bad_df.to_csv(bad_csv, index=False)

    res = MLService.inspect_dataset(str(bad_csv))
    assert res["is_valid"] is False
    assert "does not contain the required features" in res["validation_message"]
