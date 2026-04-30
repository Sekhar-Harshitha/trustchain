# TrustChain 🛡️
"We don't just verify users — we verify whether their story is true."

TrustChain is a next-generation fraud detection e-commerce platform that uses a multi-layered AI approach to verify return requests and secures every decision on a tamper-proof blockchain ledger.

## Setup (copy-paste ready)

### Prerequisites
Node.js 18+, Python 3.9+, npm, pip

### 1. Clone & setup
```bash
git clone https://github.com/Sekhar-Harshitha/trustchain
cd trustchain
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
# Create .env based on .env.template and fill in keys:
# TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID, 
# ANTHROPIC_API_KEY, DEMO_PHONE_NUMBER
python app.py
```

### 3. Frontend setup
```bash
cd client
npm install
npm run dev
```

### OR: Windows one-click
Double-click `start_all.bat` in the root directory.

## Demo Accounts (no signup needed)
| Aadhaar       | Name           | Type                |
|---------------|----------------|---------------------|
| 234567890123  | Priya Sharma   | Clean user          |
| 345678901234  | Rahul Verma    | Clean user          |
| 456789012345  | Ananya Iyer    | Clean user          |
| 111122223333  | Fraud Test     | ⚠️ All AI flags fire |

## Admin Dashboard
**URL**: [http://localhost:5173/admin](http://localhost:5173/admin)
**Password**: `admin123`

## API Health Check
[http://localhost:5000/api/health](http://localhost:5000/api/health)

## How the 3 AI Models Work
TrustChain uses a weighted consensus model (40/40/20) to decide on returns:
1.  **Heuristic Engine**: Scans for 20+ narrative patterns, temporal return frequency (e.g., 7-day windows), and high-value anomalies.
2.  **Claude AI (Anthropic)**: Performs deep linguistic analysis on the return reason to detect narrative inconsistencies or "scam-grammar" common in fraud.
3.  **Trust Score (Scikit-Learn)**: A Random Forest model trained on 200+ synthetic historical records that predicts user reliability based on their lifetime behavior.

## Blockchain Ledger
Every return decision is hashed and committed to a private blockchain. This ensures that once a return is "Rejected" or "Approved," the record cannot be altered by employees or attackers, creating a permanent audit trail of merchant trust.

## Tech Stack
| Component  | Technology |
|------------|------------|
| **Backend**| Flask (Python) |
| **Frontend**| React + Vite + Tailwind CSS |
| **AI**      | Anthropic Claude + Scikit-Learn |
| **Blockchain**| Custom SHA-256 Implementation |
| **Auth**    | Twilio Verify API (SMS) |
| **Database**| In-Memory Store (Phase 1) |
