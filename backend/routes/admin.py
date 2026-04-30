from flask import Blueprint, jsonify
from store.memory_store import get_all_returns, get_all_orders, sessions
from blockchain.chain import BLOCKCHAIN

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    all_returns = get_all_returns()
    all_orders = get_all_orders()
    valid, tampered_at = BLOCKCHAIN.is_valid()
    
    fraud_flags = sum(1 for r in all_returns if r.get("risk_level") in ["HIGH", "CRITICAL"])
    approved = sum(1 for r in all_returns if r.get("decision") == "APPROVED")
    rejected = sum(1 for r in all_returns if r.get("decision") == "REJECTED")
    under_review = sum(1 for r in all_returns if r.get("decision") == "UNDER REVIEW")
    ai_powered_count = sum(1 for r in all_returns if r.get("ai_powered") == True)
    
    return jsonify({
        "total_orders": len(all_orders),
        "total_returns": len(all_returns),
        "fraud_flags": fraud_flags,
        "approved": approved,
        "rejected": rejected,
        "under_review": under_review,
        "chain_valid": valid,
        "chain_length": len(BLOCKCHAIN.chain),
        "ai_powered_count": ai_powered_count
    })

@admin_bp.route("/returns", methods=["GET"])
def get_returns():
    all_returns = get_all_returns()
    sorted_returns = sorted(
        all_returns, 
        key=lambda r: r.get("timestamp", ""), 
        reverse=True
    )
    return jsonify(sorted_returns)

@admin_bp.route("/chain", methods=["GET"])
def get_chain():
    return jsonify(BLOCKCHAIN.get_chain_data())

@admin_bp.route("/validate", methods=["GET"])
def validate_chain():
    valid, tampered_at = BLOCKCHAIN.is_valid()
    msg = "Chain integrity verified" if valid else f"Tampered at block {tampered_at}"
    return jsonify({
        "valid": valid,
        "tampered_at": tampered_at,
        "chain_length": len(BLOCKCHAIN.chain),
        "message": msg
    })

@admin_bp.route("/users", methods=["GET"])
def get_users():
    unique_users = []
    seen = set()
    for token, user_data in sessions.items():
        aadhaar = user_data.get("aadhaar")
        if aadhaar and aadhaar not in seen:
            seen.add(aadhaar)
            unique_users.append({
                "aadhaar": aadhaar,
                "name": user_data.get("name"),
                "trust_score": user_data.get("trust_score", 100)
            })
    return jsonify(unique_users)
