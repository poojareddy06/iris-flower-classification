import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional
from pathlib import Path
from sklearn.tree import DecisionTreeClassifier, _tree
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
from app.config import MODELS_DIR

# Standard feature aliases to handle different dataset header variations
FEATURE_ALIASES = {
    'sepal_length': ['sepallengthcm', 'sepal_length', 'sepallength', 'sepal.length', 'sepal length', 'sepal length (cm)'],
    'sepal_width': ['sepalwidthcm', 'sepal_width', 'sepalwidth', 'sepal.width', 'sepal width', 'sepal width (cm)'],
    'petal_length': ['petallengthcm', 'petal_length', 'petallength', 'petal.length', 'petal length', 'petal length (cm)'],
    'petal_width': ['petalwidthcm', 'petal_width', 'petalwidth', 'petal.width', 'petal width', 'petal width (cm)'],
}

TARGET_ALIASES = ['species', 'variety', 'class', 'target', 'flower_species', 'label']
ID_ALIASES = ['id', 'index', 'unnamed: 0', 'serial_number']

def to_serializable(obj):
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    if isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return [to_serializable(x) for x in obj.tolist()]
    if isinstance(obj, dict):
        return {str(k): to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [to_serializable(x) for x in obj]
    return obj

class MLService:
    @staticmethod
    def inspect_dataset(file_path: str) -> Dict[str, Any]:
        """Validates and analyzes an uploaded CSV dataset for Iris classification."""
        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            return {
                "is_valid": False,
                "error": f"Failed to parse CSV file: {str(e)}",
                "row_count": 0,
                "col_count": 0,
                "columns_info": [],
                "missing_values": {},
                "duplicate_rows": 0,
                "class_distribution": {}
            }

        row_count, col_count = df.shape
        missing_values = {col: int(df[col].isnull().sum()) for col in df.columns}
        duplicate_rows = int(df.duplicated().sum())

        # Check column types and preview
        columns_info = []
        for col in df.columns:
            columns_info.append({
                "name": col,
                "type": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "sample_values": df[col].dropna().head(3).tolist()
            })

        # Match columns
        col_lower = {str(c).strip().lower(): c for c in df.columns}
        matched_features = {}
        for feat, aliases in FEATURE_ALIASES.items():
            for alias in aliases:
                if alias in col_lower:
                    matched_features[feat] = col_lower[alias]
                    break

        matched_target = None
        for alias in TARGET_ALIASES:
            if alias in col_lower:
                matched_target = col_lower[alias]
                break

        # Check validation
        missing_features = [f for f in ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'] if f not in matched_features]
        is_valid = True
        validation_msgs = []

        if missing_features:
            is_valid = False
            validation_msgs.append(f"This dataset does not contain the required features for the current Iris classification model. Missing columns: {', '.join(missing_features)}.")
        
        if not matched_target:
            is_valid = False
            validation_msgs.append("This dataset does not contain the required features for the current Iris classification model. Missing target species column (expected 'Species', 'variety', or 'class').")

        class_distribution = {}
        if matched_target and matched_target in df.columns:
            class_counts = df[matched_target].value_counts().to_dict()
            class_distribution = {str(k): int(v) for k, v in class_counts.items()}
            if len(class_distribution) < 2:
                is_valid = False
                validation_msgs.append("Target column contains fewer than 2 classes.")

        if row_count < 10:
            is_valid = False
            validation_msgs.append("Dataset has fewer than 10 rows, which is insufficient for train/test splitting.")

        if is_valid:
            validation_msgs.append("Dataset format matches all Iris classification requirements and is ready for training!")

        return {
            "is_valid": is_valid,
            "validation_message": " ".join(validation_msgs),
            "row_count": row_count,
            "col_count": col_count,
            "columns_info": columns_info,
            "missing_values": missing_values,
            "duplicate_rows": duplicate_rows,
            "class_distribution": class_distribution,
            "matched_features": matched_features,
            "matched_target": matched_target
        }

    @staticmethod
    def train_model(
        dataset_path: str,
        criterion: str = "gini",
        test_size: float = 0.2,
        random_state: int = 42,
        max_depth: Optional[int] = None,
        min_samples_split: int = 2,
        min_samples_leaf: int = 1,
        model_save_name: str = "iris_dt_model"
    ) -> Dict[str, Any]:
        """Executes the authentic supervised ML pipeline using DecisionTreeClassifier."""
        df = pd.read_csv(dataset_path)

        # Drop ID column safely if present
        col_lower = {str(c).strip().lower(): c for c in df.columns}
        for alias in ID_ALIASES:
            if alias in col_lower:
                df = df.drop(columns=[col_lower[alias]], errors='ignore')

        # Identify features and target
        matched_features = {}
        for feat, aliases in FEATURE_ALIASES.items():
            for alias in aliases:
                if alias in col_lower:
                    matched_features[feat] = col_lower[alias]
                    break

        matched_target = None
        for alias in TARGET_ALIASES:
            if alias in col_lower:
                matched_target = col_lower[alias]
                break

        if len(matched_features) < 4 or not matched_target:
            raise ValueError("Dataset does not contain all required Iris features and target species column.")

        # Prepare X and y
        feature_cols = [matched_features['sepal_length'], matched_features['sepal_width'],
                        matched_features['petal_length'], matched_features['petal_width']]
        
        # Clean data (drop rows with nulls in features or target)
        clean_df = df[feature_cols + [matched_target]].dropna()
        X = clean_df[feature_cols].astype(float)
        y = clean_df[matched_target].astype(str)

        # Standard clean feature names for consistent model interface
        standard_feature_names = ['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width']

        # 80/20 train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X.values, y.values, test_size=test_size, random_state=random_state, stratify=y.values
        )

        # DecisionTreeClassifier using Gini criterion
        clf = DecisionTreeClassifier(
            criterion=criterion,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            random_state=random_state
        )
        clf.fit(X_train, y_train)

        # Evaluate on unseen test data
        y_pred = clf.predict(X_test)
        target_classes = sorted(list(set(y.values)))

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
        rec = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        
        cm = confusion_matrix(y_test, y_pred, labels=target_classes).tolist()
        clf_report = classification_report(y_test, y_pred, labels=target_classes, output_dict=True, zero_division=0)
        
        # Calculate feature importances
        importances = {
            standard_feature_names[i]: float(clf.feature_importances_[i])
            for i in range(len(standard_feature_names))
        }

        # Extract hierarchical tree structure for interactive visualization
        tree_structure = MLService._extract_tree_structure(clf, standard_feature_names, clf.classes_.tolist())

        # Save model bundle
        bundle = {
            "model": clf,
            "feature_names": standard_feature_names,
            "target_classes": clf.classes_.tolist(),
            "criterion": criterion,
            "test_size": test_size,
            "random_state": random_state,
            "hyperparameters": {
                "max_depth": max_depth,
                "min_samples_split": min_samples_split,
                "min_samples_leaf": min_samples_leaf
            },
            "metrics": {
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "f1_score": f1
            }
        }

        model_file_path = str(MODELS_DIR / f"{model_save_name}.joblib")
        joblib.dump(bundle, model_file_path)

        return to_serializable({
            "model_file_path": model_file_path,
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "confusion_matrix": cm,
            "classification_report": clf_report,
            "feature_importances": importances,
            "tree_rules": tree_structure,
            "target_names": clf.classes_.tolist(),
            "feature_names": standard_feature_names,
            "train_samples": len(X_train),
            "test_samples": len(X_test)
        })

    @staticmethod
    def _extract_tree_structure(clf: DecisionTreeClassifier, feature_names: List[str], class_names: List[str]) -> Dict[str, Any]:
        """Converts scikit-learn tree object into a traversable JSON hierarchy."""
        tree_ = clf.tree_

        def recurse(node_id: int, depth: int) -> Dict[str, Any]:
            if tree_.feature[node_id] != _tree.TREE_UNDEFINED:
                feat_idx = tree_.feature[node_id]
                threshold = float(round(tree_.threshold[node_id], 4))
                feat_name = feature_names[feat_idx]
                
                return {
                    "node_id": node_id,
                    "type": "decision",
                    "depth": depth,
                    "feature": feat_name,
                    "threshold": threshold,
                    "criterion": clf.criterion,
                    "impurity": float(round(tree_.impurity[node_id], 4)),
                    "samples": int(tree_.n_node_samples[node_id]),
                    "rule": f"{feat_name} <= {threshold}",
                    "left": recurse(tree_.children_left[node_id], depth + 1),
                    "right": recurse(tree_.children_right[node_id], depth + 1)
                }
            else:
                values = tree_.value[node_id][0]
                pred_class_idx = int(np.argmax(values))
                predicted_class = class_names[pred_class_idx]
                return {
                    "node_id": node_id,
                    "type": "leaf",
                    "depth": depth,
                    "predicted_class": predicted_class,
                    "class_counts": {class_names[i]: int(values[i]) for i in range(len(class_names))},
                    "impurity": float(round(tree_.impurity[node_id], 4)),
                    "samples": int(tree_.n_node_samples[node_id])
                }

        return recurse(0, 0)

    @staticmethod
    def predict(
        model_file_path: str,
        sepal_length: float,
        sepal_width: float,
        petal_length: float,
        petal_width: float
    ) -> Dict[str, Any]:
        """Performs inference using the trained Decision Tree model and traces decision rules."""
        if not os.path.exists(model_file_path):
            raise FileNotFoundError("Model binary not found on server.")

        bundle = joblib.load(model_file_path)
        clf: DecisionTreeClassifier = bundle["model"]
        feature_names = bundle["feature_names"]
        target_classes = bundle["target_classes"]

        input_arr = np.array([[sepal_length, sepal_width, petal_length, petal_width]], dtype=float)
        
        # Prediction & probability
        pred_class = clf.predict(input_arr)[0]
        probs = clf.predict_proba(input_arr)[0]
        
        prob_dict = {
            target_classes[i]: float(round(probs[i], 4))
            for i in range(len(target_classes))
        }
        confidence = float(np.max(probs))

        # Trace decision path
        node_indicator = clf.decision_path(input_arr)
        node_index = node_indicator.indices[node_indicator.indptr[0]:node_indicator.indptr[1]]

        decision_steps = []
        tree_ = clf.tree_
        for node_id in node_index:
            if tree_.feature[node_id] != _tree.TREE_UNDEFINED:
                feat_idx = tree_.feature[node_id]
                threshold = float(round(tree_.threshold[node_id], 4))
                feat_name = feature_names[feat_idx]
                user_val = float(input_arr[0][feat_idx])
                passed_left = user_val <= threshold
                decision_steps.append({
                    "step": len(decision_steps) + 1,
                    "node_id": int(node_id),
                    "feature": feat_name,
                    "value": user_val,
                    "threshold": threshold,
                    "operator": "<=" if passed_left else ">",
                    "condition_met": passed_left,
                    "description": f"{feat_name} ({user_val}) {'<=' if passed_left else '>'} {threshold}"
                })
            else:
                decision_steps.append({
                    "step": len(decision_steps) + 1,
                    "node_id": int(node_id),
                    "type": "leaf",
                    "predicted_class": str(pred_class),
                    "leaf_samples": int(tree_.n_node_samples[node_id]),
                    "description": f"Reached leaf node: classified as {pred_class} with Gini impurity {round(float(tree_.impurity[node_id]), 4)}"
                })

        # Explanatory text
        if "setosa" in str(pred_class).lower():
            explanation = (
                f"The model predicted {pred_class} primarily because Petal Length ({petal_length} cm) "
                f"and Petal Width ({petal_width} cm) are substantially smaller than those of Versicolor and Virginica, "
                f"immediately satisfying the initial Decision Tree split condition."
            )
        elif "versicolor" in str(pred_class).lower():
            explanation = (
                f"The model classified this flower as {pred_class} because Petal Length ({petal_length} cm) "
                f"and Petal Width ({petal_width} cm) fall squarely in the intermediate boundary range, separating it "
                f"from both small Setosa and larger Virginica petals."
            )
        else:
            explanation = (
                f"The model classified this flower as {pred_class} because its Petal Length ({petal_length} cm) "
                f"and Petal Width ({petal_width} cm) exceed the threshold boundaries for Setosa and Versicolor, "
                f"characteristic of mature Virginica specimens."
            )

        return {
            "predicted_species": str(pred_class),
            "confidence": confidence,
            "probabilities": prob_dict,
            "explanation": explanation,
            "decision_path": decision_steps,
            "inputs": {
                "Sepal Length": sepal_length,
                "Sepal Width": sepal_width,
                "Petal Length": petal_length,
                "Petal Width": petal_width
            }
        }
