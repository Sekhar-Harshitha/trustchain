"""
TrustChain ML Fraud Detection Service
Runs on port 5001 - called by Node.js backend
Uses RandomForest trained on synthetic data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────
# 1. SYNTHETIC DATASET GENERATION
# Features: return_frequency, order_value, account_age_days,
#           past_fraud_history, rating_score
# ─────────────────────────────────────────────────────────────
def generate_dataset(n=2000):
    np.random.seed(42)

    return_frequency    = np.random.beta(2, 5, n)          # 0–1, skewed low
    order_value         = np.random.uniform(100, 50000, n) # ₹100 – ₹50,000
    account_age_days    = np.random.randint(1, 1500, n)    # days since signup
    past_fraud_history  = np.random.choice([0, 1], n, p=[0.88, 0.12])
    rating_score        = np.random.uniform(1, 5, n)       # vendor rating

    # Fraud probability formula (NOT rule-based — used only to label training data)
    fraud_prob = (
        return_frequency        * 0.35 +
        (order_value / 50000)   * 0.15 +
        (1 - account_age_days / 1500) * 0.10 +
        past_fraud_history      * 0.30 +
        (1 - rating_score / 5)  * 0.10
    )

    # Add gaussian noise to avoid perfect separation
    noise = np.random.normal(0, 0.05, n)
    fraud_prob = np.clip(fraud_prob + noise, 0, 1)

    is_fraud = (fraud_prob > 0.55).astype(int)

    df = pd.DataFrame({
        'return_frequency':   return_frequency,
        'order_value':        order_value,
        'account_age_days':   account_age_days,
        'past_fraud_history': past_fraud_history,
        'rating_score':       rating_score,
        'is_fraud':           is_fraud
    })
    return df


# ─────────────────────────────────────────────────────────────
# 2. TRAIN MODEL ON STARTUP
# ─────────────────────────────────────────────────────────────
print("[ML ENGINE] Generating synthetic training data...")
df = generate_dataset(2000)

FEATURES = ['return_frequency', 'order_value', 'account_age_days',
            'past_fraud_history', 'rating_score']

X = df[FEATURES]
y = df['is_fraud']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(
    n_estimators=150,
    max_depth=10,
    min_samples_split=5,
    random_state=42,
    class_weight='balanced'
)
model.fit(X_train, y_train)

acc = accuracy_score(y_test, model.predict(X_test))
print(f"[ML ENGINE] Model trained. Test accuracy: {acc:.3f}")
print(f"[ML ENGINE] Fraud rate in training data: {y.mean():.2%}")


# ─────────────────────────────────────────────────────────────
# 3. PREDICT ENDPOINT
# ─────────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)

        # Validate required fields
        required = ['return_frequency', 'order_value', 'account_age_days',
                    'past_fraud_history', 'rating_score']
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({
                'success': False,
                'error': f'Missing fields: {missing}'
            }), 400

        features = np.array([[
            float(data['return_frequency']),
            float(data['order_value']),
            float(data['account_age_days']),
            int(data['past_fraud_history']),
            float(data['rating_score'])
        ]])

        fraud_probability = float(model.predict_proba(features)[0][1])

        # Decision Engine
        if fraud_probability > 0.7:
            decision = 'BLOCK'
        elif fraud_probability > 0.4:
            decision = 'REVIEW'
        else:
            decision = 'APPROVE'

        # Feature importances for explainability
        importances = dict(zip(FEATURES, model.feature_importances_))

        return jsonify({
            'success': True,
            'fraud_probability': round(fraud_probability, 4),
            'decision': decision,
            'feature_importances': {k: round(float(v), 4) for k, v in importances.items()}
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model': 'RandomForestClassifier',
        'features': FEATURES,
        'training_samples': len(df)
    })


if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5001))
    print(f"[ML ENGINE] Starting on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
