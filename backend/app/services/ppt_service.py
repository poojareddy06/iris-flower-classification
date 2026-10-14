from typing import List, Dict, Any

INTERNSHIP_PRESENTATION_SLIDES: List[Dict[str, Any]] = [
    {
        "slide_number": 1,
        "title": "INTERNSHIP REVIEW - 1",
        "subtitle": "Machine Learning Domain Project Review",
        "category": "Title & Profile",
        "metadata": {
            "student_name": "Pooja V",
            "roll_number": "24691A31H0",
            "class_section": "3rd Year C Section",
            "domain": "Machine Learning"
        },
        "content": [
            "Project Review: Review - 1",
            "Student Name: Pooja V",
            "Roll Number: 24691A31H0",
            "Academic Standing: 3rd Year, C Section",
            "Specialization: Machine Learning Internship"
        ],
        "notes": "Introductory slide outlining academic details and domain of work."
    },
    {
        "slide_number": 2,
        "title": "Company Name & Location",
        "subtitle": "Host Organization Details",
        "category": "Company Overview",
        "metadata": {
            "company_name": "Edu Tantr",
            "location": "Bangalore",
            "internship_domain": "Machine Learning"
        },
        "content": [
            "Host Company: Edu Tantr",
            "Headquarters / Location: Bangalore, India",
            "Focus Area: Practical machine learning using Python and a Decision Tree classification project."
        ],
        "notes": "Edu Tantr provided mentorship and structured industry exposure in applied artificial intelligence."
    },
    {
        "slide_number": 3,
        "title": "About Domain of Internship",
        "subtitle": "Foundations of Machine Learning",
        "category": "Domain Foundations",
        "content": [
            "Machine Learning (ML) is a branch of Artificial Intelligence that enables computers to learn patterns from data.",
            "Instead of manually programming every rule, an ML model learns from examples and uses the learned patterns to make predictions."
        ],
        "notes": "Contrasting traditional deterministic programming against data-driven inductive reasoning."
    },
    {
        "slide_number": 4,
        "title": "Machine Learning - Main Types",
        "subtitle": "Supervised, Unsupervised & Reinforcement Paradigms",
        "category": "ML Taxonomy",
        "content": [
            "Supervised Learning: Learns from labeled data and is used for classification and regression.",
            "Unsupervised Learning: Discovers hidden patterns or natural clusters in data without target labels.",
            "Reinforcement Learning: Learns goal-oriented policies and actions through environmental interaction and feedback rewards."
        ],
        "notes": "Framing where the Iris classification project sits within the broader taxonomy of AI."
    },
    {
        "slide_number": 5,
        "title": "Machine Learning - Supervised Learning",
        "subtitle": "Mapping Features to Labeled Targets",
        "category": "Core Methodology",
        "content": [
            "Supervised learning pairs input features with known output labels during training.",
            "Classification predicts discrete categorical outcomes (e.g. flower species), while regression estimates continuous numerical values.",
            "The Iris project belongs to supervised classification because each sample has a verified ground-truth species label."
        ],
        "notes": "Focusing on supervised classification as the methodology for this project."
    },
    {
        "slide_number": 6,
        "title": "Machine Learning - Decision Tree",
        "subtitle": "Hierarchical Rule-Based Decision Logic",
        "category": "Algorithm",
        "content": [
            "A Decision Tree predicts target classes by applying a sequence of feature-based hierarchical tests.",
            "Internal nodes represent feature condition tests.",
            "Branches represent the binary outcomes of those tests (<= or > threshold).",
            "Leaf nodes represent the terminal predicted classes.",
            "The project uses DecisionTreeClassifier with criterion = 'gini'."
        ],
        "notes": "Decision trees offer exceptional interpretability and transparent human-auditable logic."
    },
    {
        "slide_number": 7,
        "title": "Machine Learning - Model Evaluation",
        "subtitle": "Validation Metrics and Generalization",
        "category": "Evaluation",
        "content": [
            "Model performance is validated strictly using unseen test data.",
            "Accuracy measures the overall proportion of correct classifications.",
            "A confusion matrix compares actual ground truth against predicted class distributions.",
            "The classification report provides precision, recall, and F1-score for each respective class."
        ],
        "notes": "Explaining why accuracy alone is insufficient and how multi-class metrics ensure balanced performance."
    },
    {
        "slide_number": 8,
        "title": "Project Explanation - Data Loading",
        "subtitle": "Ingestion and Cleaning Pipeline",
        "category": "Pipeline: Stage 1",
        "content": [
            "The Iris dataset is obtained in CSV format and loaded into a pandas DataFrame.",
            "An unnecessary ID column, if present, is identified and stripped so only useful physical flower measurements are utilized.",
            "How it works: Data Collection → Loaded into tabular DataFrame → Arbitrary identifiers pruned → Clean dataset ready.",
            "Output: A clean Iris dataset containing flower measurements and their species labels."
        ],
        "notes": "Data hygiene is vital to prevent spurious correlations with arbitrary index numbers."
    },
    {
        "slide_number": 9,
        "title": "Project Explanation - Features & Target",
        "subtitle": "Separating Independent Variables (X) and Dependent Target (y)",
        "category": "Pipeline: Stage 2",
        "content": [
            "The dataset is partitioned into input feature matrix (X) and target vector (y).",
            "Input features: Sepal Length, Sepal Width, Petal Length, and Petal Width.",
            "Target: Flower species (Iris-setosa, Iris-versicolor, Iris-virginica).",
            "How it works: The model takes physical measurements as input and learns their statistical relationship with the species.",
            "Output: Feature data (X) and species labels (y) prepared for training."
        ],
        "notes": "Explicit feature formulation."
    },
    {
        "slide_number": 10,
        "title": "Project Explanation - Train/Test Split",
        "subtitle": "Pareto 80/20 Partitioning",
        "category": "Pipeline: Stage 3",
        "content": [
            "The prepared dataset is split into training data and testing data.",
            "80% is allocated to train the model and 20% is held out for testing.",
            "How it works: Training data teaches the model patterns in flower measurements. The separate test data checks generalization on unseen samples.",
            "Output: Training set = 80% (120 samples); Testing set = 20% (30 samples)."
        ],
        "notes": "Stratified splitting ensures equal representation of all three classes in both sets."
    },
    {
        "slide_number": 11,
        "title": "Project Explanation - Decision Tree",
        "subtitle": "Training and Node Splitting",
        "category": "Pipeline: Stage 4",
        "content": [
            "A Decision Tree classification model is fitted using the Gini criterion.",
            "The model learns decision rules from training data and uses those learned boundaries to predict species of new flowers.",
            "How it works: The tree recursively queries feature values, follows the appropriate branch, and arrives at a leaf node.",
            "Output: Predicted flower species for test samples."
        ],
        "notes": "Fitting the DecisionTreeClassifier."
    },
    {
        "slide_number": 12,
        "title": "Project Explanation - Evaluation & Feature Importance",
        "subtitle": "Interpreting Results and Feature Contribution",
        "category": "Pipeline: Stage 5",
        "content": [
            "Predictions are evaluated against actual labels to assess accuracy, confusion matrix, precision, recall, and F1-score.",
            "Feature importance analysis reveals which flower measurements contributed most strongly to decisions.",
            "How it works: Actual vs. predicted comparison → Performance metrics computed → Gini decrease measured across features.",
            "Output: Quantitative accuracy score, confusion matrix, classification report, and feature-importance rankings."
        ],
        "notes": "Petal dimensions dominate the decision boundaries."
    },
    {
        "slide_number": 13,
        "title": "Project Title and Abstract",
        "subtitle": "Summary of the Internship Undertaking",
        "category": "Project Abstract",
        "content": [
            "Project Title: Iris Flower Species Classification Using Decision Tree",
            "Abstract: The project utilizes the canonical Iris dataset to build a supervised classification model with a Decision Tree.",
            "Flower measurements (Sepal and Petal Length & Width) serve as input features and botanical species is the target.",
            "The model is systematically trained, tested, evaluated, and interpreted using feature importance."
        ],
        "notes": "Comprehensive summary synthesizing the core scope of work."
    },
    {
        "slide_number": 14,
        "title": "Project Duration and Module Description",
        "subtitle": "Internship Milestones & Phases",
        "category": "Timeline",
        "content": [
            "Project Duration: Internship period at Edu Tantr",
            "Module 1: Problem Definition, Environmental Setup, and Botanical Domain Understanding",
            "Module 2: Dataset Loading, Preprocessing, and Exploratory Analysis",
            "Module 3: Decision Tree Formulation, Gini Splitting, and Model Fitting",
            "Module 4: Performance Evaluation, Confusion Matrix Analysis, and Feature Importance Interpretation"
        ],
        "notes": "Structured chronological phases executed during the internship."
    },
    {
        "slide_number": 15,
        "title": "Key Takeaways & Learning Outcomes",
        "subtitle": "Core Competencies Acquired",
        "category": "Outcomes",
        "content": [
            "Hands-on expertise in scikit-learn, pandas, and NumPy for machine learning pipelines.",
            "Clear understanding of decision boundaries, Gini impurity calculation, and tree depth management.",
            "Mastery of evaluation metrics beyond simplistic accuracy, ensuring holistic classification assessment.",
            "Confidence in communicating ML findings through structured presentations and interactive dashboards."
        ],
        "notes": "Reflecting on practical technical growth during the internship."
    },
    {
        "slide_number": 16,
        "title": "Future Scope & Platform Extensions",
        "subtitle": "Advancing Beyond Tabular Classification",
        "category": "Future Scope",
        "content": [
            "Integration of Computer Vision models for direct floral photograph classification.",
            "Agricultural health diagnostics to detect visible foliar blights and leaf spots.",
            "Expansion to broader botanical floras and multilingual conversational AI assistance.",
            "Production deployment with full database persistence and collaborative user management."
        ],
        "notes": "Demonstrating strategic vision and forward-looking system engineering."
    },
    {
        "slide_number": 17,
        "title": "Thank You !!!",
        "subtitle": "Questions & Discussion",
        "category": "Conclusion",
        "content": [
            "Thank you to the faculty, reviewers, and Edu Tantr mentors for their guidance and support.",
            "Presenter: Pooja V | Roll Number: 24691A31H0 | 3rd Year C Section",
            "Open for questions and live system demonstration."
        ],
        "notes": "Concluding the presentation and transitioning to live demonstration."
    }
]

class PPTService:
    @staticmethod
    def get_slides() -> List[Dict[str, Any]]:
        return INTERNSHIP_PRESENTATION_SLIDES

    @staticmethod
    def get_slide_by_number(num: int) -> Dict[str, Any]:
        for s in INTERNSHIP_PRESENTATION_SLIDES:
            if s["slide_number"] == num:
                return s
        return INTERNSHIP_PRESENTATION_SLIDES[0]
