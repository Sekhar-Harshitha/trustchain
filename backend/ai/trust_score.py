import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

def _generate_training_data():
    np.random.seed(42)
    X = []
    y = []

    # Class 0: Trusted (100 samples)
    for _ in range(100):
        return_count = np.random.randint(0, 4)
        fraud_flag_count = np.random.randint(0, 2)
        avg_order_value = np.random.uniform(500, 15000)
        account_age_days = np.random.randint(100, 1000)
        return_rate = np.random.uniform(0.0, 0.15)
        high_value_returns = np.random.randint(0, 2) if return_count > 0 else 0
        avg_narrative_score = np.random.uniform(70, 100)
        X.append([return_count, fraud_flag_count, avg_order_value, account_age_days, return_rate, high_value_returns, avg_narrative_score])
        y.append(0)

    # Class 1: Suspicious (60 samples)
    for _ in range(60):
        return_count = np.random.randint(2, 9)
        fraud_flag_count = np.random.randint(1, 5)
        avg_order_value = np.random.uniform(2000, 25000)
        account_age_days = np.random.randint(30, 500)
        return_rate = np.random.uniform(0.1, 0.4)
        high_value_returns = np.random.randint(0, 4)
        avg_narrative_score = np.random.uniform(40, 75)
        X.append([return_count, fraud_flag_count, avg_order_value, account_age_days, return_rate, high_value_returns, avg_narrative_score])
        y.append(1)

    # Class 2: High Risk (40 samples)
    for _ in range(40):
        return_count = np.random.randint(5, 21)
        fraud_flag_count = np.random.randint(3, 11)
        avg_order_value = np.random.uniform(5000, 50000)
        account_age_days = np.random.randint(1, 200)
        return_rate = np.random.uniform(0.3, 1.0)
        high_value_returns = np.random.randint(2, 7)
        avg_narrative_score = np.random.uniform(0, 45)
        X.append([return_count, fraud_flag_count, avg_order_value, account_age_days, return_rate, high_value_returns, avg_narrative_score])
        y.append(2)

    return np.array(X), np.array(y)

X_train, y_train = _generate_training_data()

CLASSIFIER = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=8)
SCALER = StandardScaler()
X_scaled = SCALER.fit_transform(X_train)
CLASSIFIER.fit(X_scaled, y_train)

def calculate_trust_score(user_data, return_history):
    return_count = len(return_history)
    fraud_flag_count = sum(1 for r in return_history if r.get("risk_level") in ["HIGH", "CRITICAL"])
    
    order_values = []
    for r in return_history:
        try:
            order_values.append(float(r.get("order_value", 0)))
        except:
            pass
            
    avg_order_value = sum(order_values) / len(order_values) if order_values else 0
    
    account_age_days = user_data.get("account_age_days", 30)
    return_rate = return_count / max(user_data.get("total_orders", 1), 1)
    high_value_returns = sum(1 for v in order_values if v > 10000)
    avg_narrative_score = user_data.get("avg_narrative_score", 50)
    
    features = [
        return_count,
        fraud_flag_count,
        avg_order_value,
        account_age_days,
        return_rate,
        high_value_returns,
        avg_narrative_score
    ]
    
    features_scaled = SCALER.transform([features])
    ml_class = CLASSIFIER.predict(features_scaled)[0]
    ml_proba = CLASSIFIER.predict_proba(features_scaled)[0]
    ml_confidence = round(float(max(ml_proba)) * 100, 1)
    
    base = 100
    base -= return_count * 4
    base -= fraud_flag_count * 15
    base = max(0, min(100, base))
    
    adjustment_map = {0: 5, 1: -10, 2: -25}
    ml_adjustment = adjustment_map.get(ml_class, 0)
    
    final_score = max(0, min(100, base + ml_adjustment))
    
    class_labels = {
        0: {"label": "Trusted", "color": "green", "ml_class": "trusted"},
        1: {"label": "Under Review", "color": "amber", "ml_class": "suspicious"},
        2: {"label": "High Risk", "color": "red", "ml_class": "high_risk"}
    }
    
    label_info = class_labels.get(ml_class, class_labels[1])
    
    return {
        "score": final_score,
        "label": label_info["label"],
        "color": label_info["color"],
        "ml_class": label_info["ml_class"],
        "ml_confidence": ml_confidence,
        "model": "RandomForestClassifier(n=100)"
    }
