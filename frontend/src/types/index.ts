export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  settings?: {
    theme?: 'dark' | 'light';
    language?: 'en' | 'te' | 'hi' | 'ta' | 'kn';
    notifications?: boolean;
    ai_settings?: Record<string, any>;
  };
}

export interface Dataset {
  id: number;
  filename: string;
  row_count: number;
  col_count: number;
  columns_info: Array<{
    name: string;
    type: string;
    null_count: number;
    sample_values: any[];
  }>;
  missing_values: Record<string, number>;
  duplicate_rows: number;
  class_distribution: Record<string, number>;
  is_valid: boolean;
  validation_message: string;
  is_default: boolean;
  created_at: string;
  rows_preview?: Array<Record<string, any>>;
}

export interface MLModel {
  id: number;
  model_name: string;
  algorithm: string;
  criterion: string;
  test_size: number;
  random_state: number;
  hyperparameters: Record<string, any>;
  feature_names: string[];
  target_names: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  classification_report: Record<string, any>;
  feature_importances: Record<string, number>;
  tree_rules?: TreeNode;
  is_active: boolean;
  created_at: string;
}

export interface TreeNode {
  node_id: number;
  type: 'decision' | 'leaf';
  depth: number;
  feature?: string;
  threshold?: number;
  criterion?: string;
  impurity: number;
  samples: number;
  rule?: string;
  predicted_class?: string;
  class_counts?: Record<string, number>;
  left?: TreeNode;
  right?: TreeNode;
}

export interface PredictionResult {
  id?: number;
  predicted_species: string;
  confidence: number;
  probabilities: Record<string, number>;
  explanation: string;
  decision_path: Array<{
    step: number;
    node_id: number;
    feature?: string;
    value?: number;
    threshold?: number;
    operator?: string;
    condition_met?: boolean;
    type?: string;
    predicted_class?: string;
    description: string;
  }>;
  model_name: string;
  model_id?: number;
  inputs: Record<string, number>;
  created_at?: string;
}

export interface FlowerKnowledge {
  common_name: string;
  scientific_name: string;
  family: string;
  native_habitat: string;
  general_characteristics: string;
  typical_appearance: {
    sepal_length: string;
    sepal_width: string;
    petal_length: string;
    petal_width: string;
    color_palette: string;
  };
  growing_environment: string;
}

export interface PossibleDisease {
  issue_detected: string;
  observation_status?: string;
  visual_indicators: string[];
  confidence_score?: number;
  confidence_label?: string;
  disclaimer: string;
  suggested_actions: string[];
}

export interface ImageAnalysisResult {
  id?: number;
  image_url: string;
  predicted_species: string;
  confidence: number;
  is_suitable: boolean;
  dimensions?: { width: number; height: number };
  flower_info: FlowerKnowledge;
  possible_disease: PossibleDisease;
  model_pipeline: string;
  created_at?: string;
}

export interface SlideData {
  slide_number: number;
  title: string;
  subtitle: string;
  category: string;
  metadata?: Record<string, string>;
  content: string[];
  notes?: string;
}

export interface DashboardSummary {
  total_predictions: number;
  dataset_rows: number;
  class_distribution: Record<string, number>;
  model_accuracy: number;
  current_model: string;
  last_prediction: {
    species: string;
    confidence: number;
    timestamp: string;
    inputs: Record<string, number>;
  } | null;
  uploaded_images: number;
  model_overview: {
    model_id: number | null;
    model_name: string;
    algorithm: string;
    criterion: string;
    train_test_split: string;
    features_count: number;
    classes_count: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  };
  recent_predictions: Array<{
    id: number;
    species: string;
    confidence: number;
    created_at: string;
    inputs: string;
  }>;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  context_used?: Record<string, any>;
  timestamp?: string;
}
