import os
import re
from typing import Dict, Any, Optional
import httpx
from app.config import GEMINI_API_KEY

STRICT_REFUSAL_MESSAGE = "I’m Iris AI, a project-specific assistant. I can only help with Iris flowers, flower classification, machine learning, datasets, model results, image analysis, and this application."

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
    r'\bcsv\b', r'\bcleaning\b', r'\bnormalization\b', r'\bscikit-learn\b', r'\bpython\b'
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

        # Tier 2: Call Gemini API if available, else use comprehensive internal expert knowledge base
        if GEMINI_API_KEY:
            try:
                system_instruction = (
                    "You are the Iris AI Assistant for an internship ML web application titled "
                    "'Iris Flower Species Classification Using Decision Tree' developed by Pooja V at Edu Tantr.\n"
                    "CRITICAL DOMAIN RESTRICTION:\n"
                    "You MUST ONLY answer questions concerning the Iris project, Iris flowers (Setosa, Versicolor, Virginica), "
                    "Machine Learning, Decision Trees, Gini impurity, 80/20 train-test splits, evaluation metrics (accuracy, precision, recall, f1, confusion matrix, feature importance), "
                    "dataset management, manual flower predictions, and image disease analysis.\n"
                    f"If the user asks an unrelated question, you must respond EXACTLY with:\n'{STRICT_REFUSAL_MESSAGE}'\n"
                    f"Respond in {language}.\n"
                    + context_str
                )
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
                payload = {
                    "contents": [
                        {"role": "user", "parts": [{"text": system_instruction + "\n\nUser Question: " + message}]}
                    ],
                    "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
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
                pass # Fall back to expert local engine

        # Expert local knowledge engine (instant, reliable, no external quota issues)
        answer = AssistantService._local_knowledge_reply(message, context, language)
        return {
            "role": "assistant",
            "content": answer,
            "context_used": context or {}
        }

    @staticmethod
    def _local_knowledge_reply(message: str, context: Optional[Dict[str, Any]], language: str) -> str:
        q = message.lower()

        if any(w in q for w in ['hello', 'hi', 'hey', 'who are you', 'what are you']):
            return (
                "👋 Hello! I am the **Iris AI Assistant** for this machine learning platform.\n\n"
                "I can assist you with:\n"
                "- **The Internship Project**: Objectives, methodology, and workflow from Pooja V's presentation.\n"
                "- **Decision Tree Classification**: How the tree splits nodes, Gini impurity, and feature thresholds.\n"
                "- **Iris Dataset & Biology**: Characteristics of *Iris setosa*, *Iris versicolor*, and *Iris virginica*.\n"
                "- **Model Evaluation**: Explaining your actual Accuracy, Confusion Matrix, Precision, Recall, and Feature Importance.\n"
                "- **Image Analyzer**: Guidance on flower photograph analysis and visible leaf condition detection.\n\n"
                "What would you like to explore?"
            )

        if 'what does the decision tree do' in q or 'how does decision tree work' in q or 'explain decision tree' in q:
            return (
                "### 🌳 How the Decision Tree Works\n\n"
                "A **Decision Tree** is a supervised learning algorithm that makes predictions by recursively splitting the data "
                "based on feature threshold conditions:\n\n"
                "1. **Root Node**: The algorithm starts with the entire dataset and picks the feature and threshold that best separates the flower species (usually Petal Length).\n"
                "2. **Internal Tests**: Each split checks an inequality (e.g., `Petal Length <= 2.45 cm`). Samples answering 'yes' move down the left branch, while 'no' answers move down the right branch.\n"
                "3. **Leaf Nodes**: The tree stops when pure or minimally impure clusters are formed. A new flower sample traverses down the tree until it lands in a terminal leaf node representing the predicted Iris species.\n\n"
                "In our project, the Decision Tree achieves high classification accuracy because petal dimensions provide near-perfect linear separation for *Iris setosa* and clear separating boundaries between *Iris versicolor* and *Iris virginica*."
            )

        if 'why is gini used' in q or 'gini' in q or 'criterion' in q:
            return (
                "### 📐 The Gini Impurity Criterion\n\n"
                "In this internship project, we use `criterion='gini'` to evaluate split quality. "
                "The **Gini Impurity** measures the probability of incorrectly classifying a randomly chosen element from a node if it were randomly labeled according to the class distribution.\n\n"
                "$$\\text{Gini} = 1 - \\sum_{i=1}^{C} p_i^2$$\n\n"
                "Where $p_i$ is the proportion of samples belonging to class $i$.\n\n"
                "- **Gini = 0.0**: The node is **pure** (100% of samples belong to one species, such as *Iris-setosa*).\n"
                "- **Gini = 0.667**: Equal distribution among all 3 Iris species (maximum impurity).\n\n"
                "**Why Gini over Entropy?**\n"
                "Gini does not compute logarithmic functions ($-\\sum p_i \\log_2 p_i$), making it computationally faster while yielding virtually identical split choices."
            )

        if 'confusion matrix' in q:
            acc_note = ""
            if context and "accuracy" in context:
                acc_note = f"\nCurrently, your active model holds an accuracy of **{round(context['accuracy'] * 100, 1)}%**."
            return (
                "### 📊 Understanding the Confusion Matrix\n\n"
                "A **Confusion Matrix** is a tabular summary that contrasts the model's predicted classes against actual ground-truth labels on the test set:\n\n"
                "- **Diagonal Cells (Top-Left to Bottom-Right)**: True Positives (correct predictions) for each species (*Setosa*, *Versicolor*, *Virginica*).\n"
                "- **Off-Diagonal Cells**: Misclassifications (e.g., a *Versicolor* wrongly predicted as *Virginica*).\n\n"
                f"Because *Iris-setosa* is linearly separable, its diagonal count is virtually always 100% without confusion. "
                f"Any minor overlap typically occurs between *Versicolor* and *Virginica* due to borderline petal lengths.{acc_note}"
            )

        if 'feature is most important' in q or 'feature importance' in q:
            return (
                "### 🌟 Feature Importance Analysis\n\n"
                "In Decision Trees, feature importance is calculated based on **mean decrease in Gini impurity** (Gini importance).\n\n"
                "1. **Petal Length & Petal Width**: Typically account for **over 90%** of total importance. Petal Length alone can perfectly isolate *Iris-setosa* with a single test (`Petal Length <= 2.45 cm`).\n"
                "2. **Sepal Length & Sepal Width**: Usually contribute very little (under 10%) because sepal dimensions overlap significantly between species.\n\n"
                "You can inspect the exact percentages on our interactive **Model Analytics** chart!"
            )

        if 'iris dataset' in q or 'dataset' in q:
            return (
                "### 🌸 The Iris Flower Dataset\n\n"
                "The Iris dataset was introduced by British statistician Ronald Fisher in 1936:\n\n"
                "- **Total Samples**: 150 flower specimens.\n"
                "- **Classes**: 3 balanced species (50 each):\n"
                "  - *Iris setosa* (Arctic Iris)\n"
                "  - *Iris versicolor* (Northern Blue Flag)\n"
                "  - *Iris virginica* (Virginia Iris)\n"
                "- **4 Numerical Features**:\n"
                "  1. Sepal Length (cm)\n"
                "  2. Sepal Width (cm)\n"
                "  3. Petal Length (cm)\n"
                "  4. Petal Width (cm)\n\n"
                "Our application strips arbitrary ID columns and standardizes column headers automatically upon upload."
            )

        if 'why do we use 80%' in q or '80/20' in q or 'split' in q:
            return (
                "### ⚖️ Why the 80/20 Train/Test Split?\n\n"
                "The **Pareto principle (80/20 split)** is the standard benchmark in supervised machine learning:\n\n"
                "- **80% Training Data (120 samples)**: Provides sufficient diversity and statistical representation for the Decision Tree to discover reliable decision boundaries without starvation.\n"
                "- **20% Testing Data (30 samples)**: Preserves unseen samples (10 of each species when stratified) to evaluate true generalization performance and check for overfitting.\n\n"
                "Testing on held-out data prevents biased accuracy estimates."
            )

        if 'prediction' in q:
            if context and "last_prediction" in context:
                return (
                    f"### 🎯 Your Recent Prediction Analysis\n\n"
                    f"Your last prediction resulted in: **{context['last_prediction']}**.\n\n"
                    "The Decision Tree evaluated your sepal and petal inputs through successive conditional splits. "
                    "You can review the step-by-step decision path in the **Predict Flower** page or explore your saved records in **Prediction History**."
                )
            return (
                "### 🎯 Manual Flower Prediction\n\n"
                "To classify an Iris specimen:\n"
                "1. Go to the **Predict Flower** tab.\n"
                "2. Enter or slide the 4 flower measurements (Sepal Length, Sepal Width, Petal Length, Petal Width).\n"
                "3. Click **Predict Species**.\n"
                "The trained Decision Tree calculates class probabilities, identifies the species, and details the exact branching path taken!"
            )

        if 'internship' in q or 'pooja' in q or 'edu tantr' in q or 'presentation' in q or 'ppt' in q:
            return (
                "### 🎓 Internship Project Overview\n\n"
                "- **Intern**: Pooja V (Roll: 24691A31H0, 3rd Year C Section)\n"
                "- **Organization**: Edu Tantr, Bangalore\n"
                "- **Domain**: Machine Learning\n"
                "- **Project Title**: *Iris Flower Species Classification Using Decision Tree*\n\n"
                "You can view the complete original slide deck inside this application using our built-in **Internship Presentation** viewer!"
            )

        # Default contextual response within domain
        return (
            "### 🤖 Iris Project AI Assistant\n\n"
            f"You asked: *\"{message}\"*\n\n"
            "This application specializes in the Iris Flower Species Classification project using Decision Trees. "
            "Feel free to ask about our Gini criterion, the 80/20 train/test split, model evaluation metrics (accuracy, precision, recall, F1, confusion matrix), "
            "the 3 Iris species (*Setosa*, *Versicolor*, *Virginica*), or the Image Analyzer pipeline!"
        )

    @staticmethod
    def _translate_refusal(language: str) -> str:
        lang = language.strip().lower()
        if 'telugu' in lang:
            return "నేను ఐరిస్ AI అసిస్టెంట్‌ని, కాబట్టి నేను ఈ ప్రాజెక్ట్, ఐరిస్ పువ్వులు, మెషిన్ లెర్నింగ్, డేటాసెట్లు, అంచనాలు మరియు సంబంధిత విశ్లేషణలకు మాత్రమే సహాయపడగలను."
        elif 'hindi' in lang:
            return "मैं आइरिस एआई सहायक हूं, इसलिए मैं केवल इस प्रोजेक्ट, आइरिस फूलों, मशीन लर्निंग, डेटासेट, भविष्यवाणियों और संबंधित विश्लेषण में मदद कर सकता हूं।"
        elif 'tamil' in lang:
            return "நான் ஐரிஸ் AI உதவியாளர், எனவே இந்த திட்டம், ஐரிஸ் மலர்கள், இயந்திர கற்றல், தரவுத்தொகுப்புகள், கணிப்புகள் மற்றும் தொடர்புடைய பகுப்பாய்வுகளுக்கு மட்டுமே என்னால் உதவ முடியும்."
        elif 'kannada' in lang:
            return "ನಾನು ಐರಿಸ್ AI ಸಹಾಯಕರಾಗಿದ್ದೇನೆ, ಆದ್ದರಿಂದ ನಾನು ಈ ಯೋಜನೆ, ಐರಿಸ್ ಹೂವುಗಳು, ಯಂತ್ರ ಕಲಿಕೆ, ಡೇಟಾಸೆಟ್‌ಗಳು, ಮುನ್ಸೂಚನೆಗಳು ಮತ್ತು ಸಂಬಂಧಿತ ವಿಶ್ಲೇಷಣೆಗೆ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ."
        return STRICT_REFUSAL_MESSAGE
