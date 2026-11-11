import os
import re
from typing import Dict, Any, Optional
import httpx
from app.config import AI_API_KEY, AI_PROVIDER

STRICT_REFUSAL_MESSAGE = "I'm Iris AI, a project-specific assistant. I can only help with Iris flowers, flower classification, machine learning, datasets, model results, image analysis, and this application."

# Domain keywords allowed
ALLOWED_DOMAIN_PATTERNS = [
    r'\biris\b', r'\bflower\b', r'\bpetal\b', r'\bsepal\b', r'\bspecies\b',
    r'\bdecision tree\b', r'\bgini\b', r'\bentropy\b', r'\bclassification\b',
    r'\bsupervised\b', r'\bdataset\b', r'\btrain\b', r'\btest\b', r'\bsplit\b',
    r'\baccuracy\b', r'\bprecision\b', r'\brecall\b', r'\bf1\b', r'\bconfusion matrix\b',
    r'\bfeature importance\b', r'\bhyperparameter\b', r'\bdepth\b', r'\bmin_samples\b',
    r'\bpredict\b', r'\bmodel\b', r'\bimage\b', r'\bdisease\b', r'\bleaf spot\b',
    r'\bchlorosis\b', r'\bpresentation\b', r'\bppt\b', r'\bpooja\b', r'\bedu tantr\b',
    r'\bhelp\b', r'\bhow to\b', r'\bdashboard\b', r'\bmetric\b', r'\bwhat is\b',
    r'\bwhy\b', r'\bexplain\b', r'\bhello\b', r'\bhi\b', r'\bhey\b', r'\bwho are you\b',
    r'\bsetosa\b', r'\bversicolor\b', r'\bvirginica\b', r'\banalyze\b', r'\bhistory\b',
    r'\bcsv\b', r'\bcleaning\b', r'\bnormalization\b', r'\bscikit-learn\b', r'\bpython\b',
    r'\bexport\b', r'\breport\b', r'\bworkflow\b', r'\blearning\b'
]

FORBIDDEN_PATTERNS = [
    r'\bpresident\b', r'\bjoke\b', r'\bmovie\b', r'\bfilm\b', r'\bsong\b', r'\blyrics\b',
    r'\bcelebrity\b', r'\bpolitics\b', r'\belection\b', r'\bhoroscope\b', r'\bfootball\b',
    r'\bcricket score\b', r'\bweather forecast\b', r'\brecipe for (cake|pizza|biryani)\b',
    r'\bignore (all )?previous instructions\b', r'\bsystem prompt\b', r'\byou are now\b',
    r'\bdan mode\b', r'\bjailbreak\b'
]

class AssistantService:
    @staticmethod
    def is_within_domain(message: str) -> bool:
        """Application-side validator to enforce strict domain restrictions."""
        msg_clean = message.strip().lower()
        if len(msg_clean) < 2:
            return False

        # Check explicit forbidden patterns first
        for pat in FORBIDDEN_PATTERNS:
            if re.search(pat, msg_clean):
                return False

        # Greetings & identity checks are allowed
        if msg_clean in ['hi', 'hello', 'hey', 'who are you', 'help', 'what can you do', 'good morning', 'good afternoon']:
            return True

        # Check if any allowed domain pattern matches
        for pat in ALLOWED_DOMAIN_PATTERNS:
            if re.search(pat, msg_clean):
                return True

        return False

    @staticmethod
    async def generate_response(
        message: str,
        context: Optional[Dict[str, Any]] = None,
        language: str = "English"
    ) -> Dict[str, Any]:
        """Generates domain-restricted, context-aware answers."""
        # Tier 1: Application-side barrier
        if not AssistantService.is_within_domain(message):
            return {
                "role": "assistant",
                "content": AssistantService._translate_refusal(language),
                "context_used": {"domain_check": "rejected_out_of_domain"}
            }

        # Build context prompt
        context_str = ""
        if context:
            context_str = "CURRENT APPLICATION CONTEXT:\n"
            if "model_name" in context:
                context_str += f"- Active Model: {context.get('model_name')}\n"
                context_str += f"- Model Algorithm: {context.get('algorithm', 'DecisionTreeClassifier')}\n"
                context_str += f"- Model Criterion: {context.get('criterion', 'gini')}\n"
                context_str += f"- Accuracy: {round(context.get('accuracy', 0.0) * 100, 2)}%\n"
                context_str += f"- Precision: {round(context.get('precision', 0.0) * 100, 2)}%\n"
                context_str += f"- Recall: {round(context.get('recall', 0.0) * 100, 2)}%\n"
                context_str += f"- F1-Score: {round(context.get('f1_score', 0.0) * 100, 2)}%\n"
            if "dataset_rows" in context:
                context_str += f"- Loaded Dataset Rows: {context.get('dataset_rows')}\n"
            if "last_prediction" in context:
                context_str += f"- Last Prediction: {context.get('last_prediction')}\n"

        # Tier 2: Call Optional External LLM API if configured, else use internal knowledge base
        if AI_API_KEY:
            try:
                system_instruction = (
                    "You are Iris AI, the project-specific assistant for the platform "
                    "'Iris AI – Intelligent Flower Classification and Analysis Platform', built around the ML project "
                    "'Iris Flower Species Classification Using Decision Tree' developed by Pooja V at Edu Tantr.\n"
                    "CRITICAL DOMAIN RESTRICTION:\n"
                    "You MUST ONLY answer questions concerning the Iris project, Iris flowers (Setosa, Versicolor, Virginica), "
                    "Machine Learning, Decision Trees, Gini impurity, 80/20 train-test splits, evaluation metrics (accuracy, precision, recall, f1, confusion matrix, feature importance), "
                    "dataset management, manual flower predictions, and image disease analysis.\n"
                    f"If the user asks an unrelated question, you must respond EXACTLY with:\n'{STRICT_REFUSAL_MESSAGE}'\n"
                    f"Respond in {language}.\n"
                    + context_str
                )
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={AI_API_KEY}"
                payload = {
                    "contents": [
                        {"role": "user", "parts": [{"text": system_instruction + "\n\nUser Question: " + message}]}
                    ],
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                        return {
                            "role": "assistant",
                            "content": text,
                            "context_used": context or {}
                        }
            except Exception:
                pass # Seamless fallback to expert local knowledge engine

        # Expert local knowledge engine (instant, deterministic, zero external API keys required)
        answer = AssistantService._local_knowledge_reply(message, context, language)
        return {
            "role": "assistant",
            "content": answer,
            "context_used": context or {}
        }

    @staticmethod
    def _local_knowledge_reply(message: str, context: Optional[Dict[str, Any]], language: str) -> str:
        q = message.lower()
        lang = language.strip().lower()

        # Localized Greetings
        if any(w in q for w in ['hello', 'hi', 'hey', 'who are you', 'what are you']):
            if 'telugu' in lang:
                return (
                    "👋 నమస్కారం! నేను **ఐరిస్ AI అసిస్టెంట్ (Iris AI)**.\n\n"
                    "నేను ఈ క్రింది అంశాలలో మీకు సహాయం చేయగలను:\n"
                    "- **ఐరిస్ పువ్వులు & జాతులు**: సెటోసా, వర్సికలర్, వర్జినికా లక్షణాలు\n"
                    "- **డెసిషన్ ట్రీ అల్గోరిథం & గిని క్రైటీరియన్** (Gini Impurity)\n"
                    "- **మోడల్ మూల్యాంకనం**: ఖచ్చితత్వం (Accuracy), కన్‌ఫ్యూజన్ మ్యాట్రిక్స్, ప్రెసిషన్, రీకాల్, F1-స్కోర్\n"
                    "- **పువ్వు ప్రిడిక్షన్ & ఇమేజ్ విశ్లేషణ**: దశలవారీ నియమాలు మరియు వ్యాధి గుర్తింపు\n\n"
                    "మీకు ఏ అంశంపై వివరణ కావాలి?"
                )
            elif 'hindi' in lang:
                return (
                    "👋 नमस्ते! मैं **आइरिस एआई सहायक (Iris AI)** हूं।\n\n"
                    "मैं आपको निम्नलिखित विषयों में मदद कर सकता हूं:\n"
                    "- **आइरिस फूल और प्रजातियां**: सेटोसा, वर्सिकलर, वर्जिनिका\n"
                    "- **डिसिजन ट्री (Decision Tree) और गिनी मानदंड (Gini Impurity)**\n"
                    "- **मॉडल मूल्यांकन**: सटीकता (Accuracy), कन्फ्यूजन मैट्रिक्स, प्रिसिजन, रिकॉल, F1-स्कोर\n"
                    "- **फूल भविष्यवाणी और छवि विश्लेषण**\n\n"
                    "आप किस विषय पर जानना चाहते हैं?"
                )
            elif 'tamil' in lang:
                return (
                    "👋 வணக்கம்! நான் **ஐரிஸ் AI உதவியாளர் (Iris AI)**.\n\n"
                    "நான் பின்வரும் தலைப்புகளில் உங்களுக்கு உதவ முடியும்:\n"
                    "- **ஐரிஸ் மலர்கள் மற்றும் இனங்கள்**: செட்டோசா, வெர்சிகலர், விர்ஜினிகா\n"
                    "- **முடிவு மரம் (Decision Tree) மற்றும் கினி அளவுகோல் (Gini Impurity)**\n"
                    "- **மாதிரி மதிப்பீடு**: துல்லியம் (Accuracy), குழப்ப அணி (Confusion Matrix)\n"
                    "- **மலர் கணிப்பு மற்றும் புகைப்பட பகுப்பாய்வு**\n\n"
                    "நீங்கள் எதைப் பற்றி அறிய விரும்புகிறீர்கள்?"
                )
            elif 'kannada' in lang:
                return (
                    "👋 ನಮಸ್ಕಾರ! ನಾನು **ಐರಿಸ್ AI ಸಹಾಯಕ (Iris AI)**.\n\n"
                    "ನಾನು ಈ ಕೆಳಗಿನ ವಿಷಯಗಳಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n"
                    "- **ಐರಿಸ್ ಹೂವುಗಳು ಮತ್ತು ಪ್ರಭೇದಗಳು**: ಸೆಟೋಸಾ, ವರ್ಸಿಕಲರ್, ವರ್ಜಿನಿಕಾ\n"
                    "- **ಡಿಸಿಷನ್ ಟ್ರೀ ಮತ್ತು ಗಿನಿ ಮಾನದಂಡ (Gini Impurity)**\n"
                    "- **ಮಾದರಿ ಮೌಲ್ಯಮಾಪನ**: ನಿಖರತೆ (Accuracy), ಕನ್‌ಫ್ಯೂಷನ್ ಮ್ಯಾಟ್ರಿಕ್ಸ್\n"
                    "- **ಹೂವಿನ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ**\n\n"
                    "ನೀವು ಯಾವ ವಿಷಯವನ್ನು ತಿಳಿಯಲು ಬಯಸುತ್ತೀರಿ?"
                )
            return (
                "👋 Hello! I am **Iris AI**, the project-specific assistant for this platform.\n\n"
                "I can assist you with:\n"
                "- **The Project & Original ML**: Supervised learning with Decision Trees by Pooja V (Edu Tantr).\n"
                "- **Decision Tree Classification**: How nodes split, feature thresholds, and decision paths.\n"
                "- **Gini Impurity Criterion**: Formula, split evaluation, and comparison with entropy.\n"
                "- **Iris Biology & Dataset**: *Iris setosa*, *Iris versicolor*, and *Iris virginica* characteristics.\n"
                "- **Evaluation Metrics**: Explaining your real Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Feature Importance.\n"
                "- **Predictions & Explanations**: Why the model predicted a specific species.\n"
                "- **Flower Image Analysis**: How the separate computer vision foliar screening works.\n\n"
                "What would you like to explore?"
            )

        # 1. Decision Tree
        if any(w in q for w in ['what is a decision tree', 'decision tree', 'how does decision tree work', 'tree classifier']):
            return (
                "### 🌳 What is a Decision Tree?\n\n"
                "A **Decision Tree** is a non-parametric supervised learning algorithm that creates a model to predict the class of a target variable by learning simple decision rules inferred from data features:\n\n"
                "1. **Root Node**: Represents the entire population or sample. The algorithm tests all features and thresholds to find the single partition that yields the highest information gain / purity (in Iris, this is almost always `Petal Length <= 2.45 cm`).\n"
                "2. **Internal Splitting Nodes**: Intermediate conditional branch points where sub-nodes are split based on a feature inequality (e.g., `Petal Width <= 1.75 cm`).\n"
                "3. **Leaf Nodes (Terminal Nodes)**: Nodes that do not split further. They contain the final species classification (*Setosa*, *Versicolor*, or *Virginica*).\n\n"
                "**Advantages in our Project**:\n"
                "- **High Interpretability**: Can be directly converted into human-readable IF-THEN rules.\n"
                "- **No Feature Scaling Required**: Operates invariant to monotonic transformations of feature measurements.\n"
                "- **Deterministic & Fast**: Instant inference with $O(\\text{depth})$ computational complexity."
            )

        # 2. Gini Criterion
        if any(w in q for w in ['why is gini used', 'gini criterion', 'gini impurity', 'gini', 'criterion']):
            return (
                "### 📐 The Gini Impurity Criterion\n\n"
                "In our original supervised learning implementation, `criterion='gini'` is specified for the Decision Tree. "
                "**Gini Impurity** measures the probability of a randomly chosen element from the set being incorrectly labeled if it were randomly labeled according to the distribution of labels in the subset:\n\n"
                "$$\\text{Gini}(p) = 1 - \\sum_{i=1}^{C} p_i^2$$\n\n"
                "Where $C = 3$ is the number of species classes and $p_i$ is the fraction of items with label $i$ in that node.\n\n"
                "- **Gini = 0.0 (Pure Node)**: All samples belong to a single species (e.g., 100% *Iris-setosa*). No further splitting is needed.\n"
                "- **Gini = 0.667 (Max Impurity)**: Samples are equally distributed among all 3 species ($1 - [(\\frac{1}{3})^2 + (\\frac{1}{3})^2 + (\\frac{1}{3})^2] = 1 - \\frac{3}{9} = 0.667$).\n\n"
                "**Why Gini over Entropy?**\n"
                "- **Computationally Efficient**: Gini does not require computing logarithmic functions ($-\\sum p_i \\log_2 p_i$), making it faster during training.\n"
                "- **Equally Reliable**: Both metrics select nearly identical split boundaries in over 98% of real-world botanical cases."
            )

        # 3. Confusion Matrix
        if 'confusion matrix' in q:
            acc_note = ""
            if context and "accuracy" in context:
                acc_note = f"\nCurrently, your active model holds a verified test accuracy of **{round(context['accuracy'] * 100, 1)}%**."
            return (
                "### 📊 Understanding the Confusion Matrix\n\n"
                "A **Confusion Matrix** is a tabular $3 \\times 3$ grid evaluating classification performance on unseen test data:\n\n"
                "$$\\begin{matrix} & \\text{Pred Setosa} & \\text{Pred Versicolor} & \\text{Pred Virginica} \\\\ "
                "\\text{True Setosa} & \\mathbf{TP_{Setosa}} & 0 & 0 \\\\ "
                "\\text{True Versicolor} & 0 & \\mathbf{TP_{Versicolor}} & FN/FP \\\\ "
                "\\text{True Virginica} & 0 & FP/FN & \\mathbf{TP_{Virginica}} \\end{matrix}$$\n\n"
                "- **Diagonal Cells (Top-Left to Bottom-Right)**: Correct predictions (True Positives) for each species.\n"
                "- **Off-Diagonal Cells**: Misclassifications where the actual class differed from the predicted class.\n\n"
                "**Key Insight for Iris**:\n"
                "*Iris setosa* is linearly separable, so its diagonal count is always 100% (0 errors). "
                "Any occasional misclassification occurs strictly between *Iris versicolor* and *Iris virginica* in the narrow borderline petal region between 4.8 cm and 5.1 cm.{acc_note}"
            )

        # 4. Feature Importance
        if any(w in q for w in ['which feature is most important', 'feature importance', 'most important']):
            return (
                "### 🌟 Feature Importance in Iris Classification\n\n"
                "Feature importance is calculated based on **Mean Decrease in Impurity (Gini Importance)**, measuring how much each measurement decreases overall node impurity across all splits:\n\n"
                "1. **Petal Length (~50% - 60%)**: The single most dominant discriminator. A single threshold split (`Petal Length <= 2.45 cm`) cleanly isolates 100% of *Iris setosa* specimens with 0 impurity.\n"
                "2. **Petal Width (~35% - 45%)**: Differentiates *Iris versicolor* (slender petals, $\\le 1.75$ cm) from *Iris virginica* (broad petals, $> 1.75$ cm).\n"
                "3. **Sepal Length & Sepal Width (< 10%)**: Contribute very little because sepal dimensions exhibit significant overlapping distributions between species.\n\n"
                "Together, **Petal dimensions account for over 90%** of the model's total predictive power!"
            )

        # 5. Why did my model predict Iris-setosa? / Specific predictions
        if any(w in q for w in ['why did my model predict iris-setosa', 'predict iris-setosa', 'why setosa']):
            return (
                "### 🌸 Why did the Model Predict *Iris-setosa*?\n\n"
                "The Decision Tree classifies a sample as **Iris-setosa** when:\n\n"
                "1. **Primary Rule**: `Petal Length <= 2.45 cm` (and typically `Petal Width <= 0.8 cm`).\n"
                "2. **Botanical Reality**: *Iris setosa* (Arctic Iris) is biologically unique for having diminutive, bristle-like inner petals (standards) measuring only 1.0 to 1.9 cm in length.\n"
                "3. **Decision Tree Root Node**: When evaluating your input measurements, the very first test at Node #0 evaluates `Petal Length <= 2.45`. Because your flower satisfied this condition, it immediately branched to the left leaf node with **Gini = 0.0 (100% pure Setosa)**.\n\n"
                "No further checks on Sepal Length or Width were needed because Petal Length alone guarantees absolute linear separation!"
            )

        if any(w in q for w in ['why did my model predict iris-versicolor', 'predict iris-versicolor', 'why versicolor']):
            return (
                "### 🌸 Why did the Model Predict *Iris-versicolor*?\n\n"
                "The Decision Tree classifies a sample as **Iris-versicolor** because:\n\n"
                "1. `Petal Length > 2.45 cm` (ruling out *Iris-setosa*).\n"
                "2. `Petal Width <= 1.75 cm` (ruling out the larger *Iris-virginica*).\n"
                "3. **Intermediate Dimensions**: *Iris-versicolor* has medium-sized petals (3.0 to 5.1 cm long, 1.0 to 1.8 cm wide). The decision path navigates past the Setosa split and terminates in the Versicolor leaf node."
            )

        if any(w in q for w in ['why did my model predict iris-virginica', 'predict iris-virginica', 'why virginica']):
            return (
                "### 🌸 Why did the Model Predict *Iris-virginica*?\n\n"
                "The Decision Tree classifies a sample as **Iris-virginica** because:\n\n"
                "1. `Petal Length > 2.45 cm` (ruling out *Iris-setosa*).\n"
                "2. `Petal Width > 1.75 cm` or `Petal Length >= 4.85 cm`.\n"
                "3. **Largest Floral Anatomy**: *Iris-virginica* produces the largest blossoms with substantial petal width ($1.4 - 2.5$ cm) and elongated falls. The decision tree traces right at both splits to reach the Virginica leaf node."
            )

        # 6. Accuracy
        if any(w in q for w in ['what does accuracy mean', 'accuracy']):
            acc_val = ""
            if context and "accuracy" in context:
                acc_val = f" In your currently active model, verified accuracy is **{round(context['accuracy'] * 100, 1)}%**."
            return (
                "### 🎯 What does Accuracy Mean?\n\n"
                "**Accuracy** is the ratio of correctly predicted flower samples to the total number of evaluation samples:\n\n"
                "$$\\text{Accuracy} = \\frac{\\text{Correct Predictions}}{\\text{Total Predictions}} = \\frac{TP + TN}{TP + TN + FP + FN}$$\n\n"
                "- In an 80/20 train/test split of 150 Iris flowers, the test set consists of **30 unseen flowers** (10 Setosa, 10 Versicolor, 10 Virginica).\n"
                "- If the model gets 29 out of 30 flowers correct, the test accuracy is $\\frac{29}{30} \\approx 96.7\\%$.\n\n"
                "**When is Accuracy reliable?**\n"
                "Accuracy is highly reliable for the Iris dataset because the classes are perfectly balanced (33.3% per species).{acc_val}"
            )

        # 7. Precision, Recall, F1-Score
        if any(w in q for w in ['what is precision', 'precision']):
            prec_val = f" (Current model: {round(context['precision'] * 100, 1)}%)" if context and "precision" in context else ""
            return (
                "### 🔍 What is Precision?\n\n"
                "**Precision** measures **exactness** or prediction quality:\n\n"
                "$$\\text{Precision} = \\frac{TP}{TP + FP}$$\n\n"
                "Out of all flowers the model claimed were *Iris-versicolor*, what proportion were actually *Iris-versicolor*? "
                "High precision indicates that when the model identifies a species, it is rarely a false alarm.{prec_val}"
            )

        if any(w in q for w in ['what is recall', 'recall']):
            rec_val = f" (Current model: {round(context['recall'] * 100, 1)}%)" if context and "recall" in context else ""
            return (
                "### 📡 What is Recall?\n\n"
                "**Recall** (also known as Sensitivity or True Positive Rate) measures **completeness**:\n\n"
                "$$\\text{Recall} = \\frac{TP}{TP + FN}$$\n\n"
                "Out of all actual *Iris-virginica* flowers in the wild, how many did our model successfully detect? "
                "High recall ensures that genuine specimens of a species are not missed.{rec_val}"
            )

        if any(w in q for w in ['what is f1', 'f1-score', 'f1 score']):
            f1_val = f" (Current model: {round(context['f1_score'] * 100, 1)}%)" if context and "f1_score" in context else ""
            return (
                "### ⚖️ What is the F1-Score?\n\n"
                "The **F1-Score** is the **harmonic mean** of Precision and Recall:\n\n"
                "$$F_1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$\n\n"
                "Why the harmonic mean instead of arithmetic mean? "
                "The harmonic mean penalizes extreme disparities: if Precision is 100% but Recall is only 10%, the arithmetic mean would be a misleading 55%, whereas the F1-Score plunges to 18.2%, truthfully reflecting unbalanced performance.{f1_val}"
            )

        # 8. Machine Learning & Classification
        if any(w in q for w in ['what is machine learning', 'machine learning', 'supervised learning']):
            return (
                "### 🧠 What is Machine Learning & Supervised Learning?\n\n"
                "- **Machine Learning (ML)**: A branch of Artificial Intelligence where computer algorithms discover patterns and rules directly from empirical data, rather than being explicitly hardcoded.\n"
                "- **Supervised Learning**: The training data includes both the input features (e.g. Sepal Length, Sepal Width, Petal Length, Petal Width) and the ground-truth target labels (e.g. Species). The algorithm learns a mathematical mapping function $y = f(X)$.\n\n"
                "In our project, the Decision Tree algorithm inspects 120 labeled flower measurements (80% training split) to discover boundary thresholds that correctly separate the three species."
            )

        if any(w in q for w in ['what is classification', 'classification']):
            return (
                "### 🏷️ What is Classification?\n\n"
                "**Classification** is a supervised learning task where the target output variable is **categorical** (discrete classes or categories), as opposed to **Regression** where the output is continuous numerical values.\n\n"
                "- **Our Task**: Multi-class classification with $C = 3$ mutually exclusive classes (*Iris-setosa*, *Iris-versicolor*, *Iris-virginica*).\n"
                "- **Inputs**: 4 continuous numerical measurements in centimeters.\n"
                "- **Output**: The predicted botanical species name alongside class probabilities."
            )

        # 9. Model Training Pipeline
        if any(w in q for w in ['model training', 'how is the model trained', 'train the model', 'training pipeline']):
            return (
                "### ⚙️ How the Model is Trained (Training Pipeline)\n\n"
                "The application executes an authentic 6-stage supervised training pipeline:\n\n"
                "1. **Dataset Ingestion**: CSV loading via pandas.\n"
                "2. **Data Cleaning & Validation**: Stripping arbitrary ID columns, imputing/dropping nulls, standardizing column aliases.\n"
                "3. **Feature Selection**: Extracting Sepal Length, Sepal Width, Petal Length, and Petal Width as $X$, and Species as $y$.\n"
                "4. **Stratified 80/20 Train/Test Split**: 120 samples for training, 30 held-out samples for testing with equal class distribution.\n"
                "5. **Decision Tree Fitting**: `DecisionTreeClassifier(criterion='gini', random_state=42)` recursively splits nodes to minimize Gini impurity.\n"
                "6. **Evaluation & Persistence**: Dynamic calculation of Accuracy, Precision, Recall, F1, Confusion Matrix, and saving the model bundle locally using `joblib`."
            )

        # 10. Explain Dataset / Dataset Analysis
        if any(w in q for w in ['explain my dataset', 'explain dataset', 'dataset analysis', 'iris dataset', 'dataset']):
            ds_info = ""
            if context and "dataset_rows" in context:
                ds_info = f"\nCurrently, your loaded dataset contains **{context['dataset_rows']} botanical rows**."
            return (
                "### 🌸 The Iris Botanical Dataset\n\n"
                "Introduced by British statistician Ronald Fisher in 1936:\n\n"
                "- **Total Specimens**: 150 flowers.\n"
                "- **Classes**: 3 balanced species (50 specimens each):\n"
                "  1. *Iris setosa* (Arctic Iris)\n"
                "  2. *Iris versicolor* (Northern Blue Flag)\n"
                "  3. *Iris virginica* (Virginia Iris)\n"
                "- **4 Measurements (cm)**:\n"
                "  - Sepal Length & Sepal Width (outer calyx)\n"
                "  - Petal Length & Petal Width (inner floral petals)\n\n"
                "Our application validates uploaded datasets to ensure all 4 features and target species column are present before allowing training.{ds_info}"
            )

        # 11. 80/20 Train/Test Split
        if any(w in q for w in ['80/20', 'train test split', 'why 80', 'split']):
            return (
                "### ⚖️ Why the 80/20 Train/Test Split?\n\n"
                "The **80/20 split** follows the empirical Pareto principle in machine learning:\n\n"
                "- **80% Training Set (120 samples)**: Provides sufficient sample diversity for the Decision Tree to discover reliable decision boundaries without overfitting or data starvation.\n"
                "- **20% Testing Set (30 samples)**: Exactly 10 flowers of each species (stratified) held out from training to test true generalization performance.\n\n"
                "Evaluating on unseen test data ensures that reported metrics reflect genuine predictive capability rather than rote memorization."
            )

        # 12. Predictions & Inference
        if any(w in q for w in ['how does prediction work', 'prediction', 'predict']):
            if context and "last_prediction" in context:
                return (
                    f"### 🎯 Recent Prediction Analysis\n\n"
                    f"Your latest prediction was: **{context['last_prediction']}**.\n\n"
                    "The model evaluated your 4 input measurements against the trained Decision Tree thresholds. "
                    "You can inspect the full step-by-step decision rules in the **Predict Flower** page or view all historical runs in **Prediction History**."
                )
            return (
                "### 🎯 Manual Flower Prediction\n\n"
                "To classify a flower specimen:\n"
                "1. Open **Predict Flower** from the sidebar.\n"
                "2. Enter or adjust the 4 measurement sliders (Sepal Length, Sepal Width, Petal Length, Petal Width).\n"
                "3. Click **Identify Flower**.\n"
                "The trained model calculates species probabilities, identifies the species, and displays the exact Decision Tree decision path taken!"
            )

        # 13. Application functionality & How to use
        if any(w in q for w in ['how to use this app', 'application functionality', 'what can i do', 'how does this platform work', 'help']):
            return (
                "### 🚀 Platform Workflow & Functionality\n\n"
                "**Iris AI** provides an end-to-end machine learning platform:\n\n"
                "1. **Dashboard**: High-level platform health, active model stats, recent predictions, and quick actions.\n"
                "2. **Predict Flower**: Enter 4 measurements to identify species with instant decision-path explanation.\n"
                "3. **Image Analyzer**: Dedicated computer vision service for floral photography and foliar disease screening.\n"
                "4. **Dataset Lab**: Drag-and-drop CSV upload, validation diagnostics, sorting, searching, and pagination.\n"
                "5. **Model Training Center**: Train scikit-learn Decision Tree models with customizable hyperparameters.\n"
                "6. **Model Analytics**: Interactive Recharts for Confusion Matrix, Feature Importance, Class Distribution, and Prediction Distribution.\n"
                "7. **Education Center**: Step-by-step ML concept guides and visual interactive training workflow.\n"
                "8. **Export Center**: Generate local CSV and PDF reports without any external API."
            )

        # 14. Project Background & Edu Tantr
        if any(w in q for w in ['internship', 'pooja', 'edu tantr', 'presentation', 'ppt']):
            return (
                "### 🎓 Original Machine Learning Project\n\n"
                "- **Title**: *Iris Flower Species Classification Using Decision Tree*\n"
                "- **Author**: Pooja V (Roll: 24691A31H0, 3rd Year C Section)\n"
                "- **Mentoring Organization**: Edu Tantr, Bangalore\n"
                "- **Algorithm**: DecisionTreeClassifier with Gini Impurity Criterion and 80/20 Train-Test Partitioning.\n\n"
                "You can review the original slide deck directly in the **Education & Presentation** viewer!"
            )

        # Default contextual response within domain
        return (
            "### 🤖 Iris Project AI Assistant\n\n"
            f"You asked: *\"{message}\"*\n\n"
            "I specialize exclusively in the Iris Flower Classification project and Decision Tree machine learning. "
            "You can ask me about:\n"
            "- What a Decision Tree is and how nodes split\n"
            "- Why the Gini criterion is used instead of Entropy\n"
            "- How to interpret your Confusion Matrix, Accuracy, Precision, Recall, or F1-Score\n"
            "- Which feature is most important (Petal Length & Width vs Sepal)\n"
            "- Why the model classified a sample as *Setosa*, *Versicolor*, or *Virginica*\n"
            "- How the separate Image Analyzer screens for leaf spots or foliar chlorosis"
        )

    @staticmethod
    def _translate_refusal(language: str) -> str:
        lang = language.strip().lower()
        if 'telugu' in lang:
            return "నేను ఐరిస్ AI అసిస్టెంట్‌ని, ప్రాజెక్ట్-నిర్దిష్ట సహాయకుడిని. నేను ఐరిస్ పువ్వులు, పుష్ప వర్గీకరణ, మెషిన్ లెర్నింగ్, డేటాసెట్‌లు, మోడల్ ఫలితాలు, ఇమేజ్ విశ్లేషణ మరియు ఈ అప్లికేషన్‌కు మాత్రమే సహాయపడగలను."
        elif 'hindi' in lang:
            return "मैं आइरिस एआई सहायक हूं, एक परियोजना-विशिष्ट सहायक। मैं केवल आइरिस फूलों, फूलों के वर्गीकरण, मशीन लर्निंग, डेटासेट, मॉडल परिणामों, छवि विश्लेषण और इस एप्लिकेशन में मदद कर सकता हूं।"
        elif 'tamil' in lang:
            return "நான் ஐரிஸ் AI உதவியாளர், திட்ட-குறிப்பிட்ட உதவியாளர். ஐரிஸ் மலர்கள், மலர் வகைப்பாடு, இயந்திர கற்றல், தரவுத்தொகுப்புகள், மாதிரி முடிவுகள், பட பகுப்பாய்வு மற்றும் இந்த பயன்பாட்டிற்கு மட்டுமே என்னால் உதவ முடியும்."
        elif 'kannada' in lang:
            return "ನಾನು ಐರಿಸ್ AI ಸಹಾಯಕ, ಪ್ರಾಜೆಕ್ಟ್-ನಿರ್ದಿಷ್ಟ ಸಹಾಯಕ. ನಾನು ಐರಿಸ್ ಹೂವುಗಳು, ಹೂವಿನ ವರ್ಗೀಕರಣ, ಯಂತ್ರ ಕಲಿಕೆ, ಡೇಟಾಸೆಟ್‌ಗಳು, ಮಾದರಿ ಫಲಿತಾಂಶಗಳು, ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಈ ಅಪ್ಲಿಕೇಶನ್‌ಗೆ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ."
        return STRICT_REFUSAL_MESSAGE
