import secrets
from datetime import datetime
from flask import Blueprint, request, jsonify

from ai.narrative_engine import heuristic_analyze, claude_analyze
from ai.trust_score import calculate_trust_score
from blockchain.chain import BLOCKCHAIN
from store.memory_store import sessions, get_user_returns, orders, add_return
from routes.auth import mask_aadhaar

returns_bp = Blueprint("returns", __name__)

def get_user_from_token(req):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, None
    token = auth_header.split(" ")[1]
    user = sessions.get(token)
    if not user:
        return None, None
    return user, user.get("aadhaar")

@returns_bp.route("/", methods=["POST"])
def process_return():
    user, aadhaar = get_user_from_token(request)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    data = request.get_json() or {}
    order_id = data.get("order_id")
    reason = data.get("reason", "")
    
    if not order_id or order_id not in orders:
        return jsonify({"success": False, "error": "Invalid order_id"}), 400
        
    if len(reason) < 10:
        return jsonify({"success": False, "error": "Reason must be at least 10 characters"}), 400
        
    history = get_user_returns(aadhaar)
    order = orders.get(order_id)
    order_value = float(order.get("total", 0))
    user_name = user.get("name", "Unknown")
    
    heuristic = heuristic_analyze(reason, history, order_value)
    ai_result = claude_analyze(reason, history, order_value, user_name)
    trust_result = calculate_trust_score(user, history)
    
    risk_levels = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    heuristic_risk = risk_levels.get(heuristic.get("risk_level", "LOW"), 1)
    
    rec = ai_result.get("recommendation", "APPROVE")
    if rec == "REJECT":
        ai_risk = 4
    elif rec == "REVIEW":
        ai_risk = 3
    else:
        ai_risk = 2 if heuristic_risk > 1 else 1
        
    trust_score_val = trust_result.get("score", 100)
    
    combined_risk_num = round((heuristic_risk * 0.4) + (ai_risk * 0.4) + ((4 - trust_score_val/25) * 0.2))
    combined_risk_num = max(1, min(4, combined_risk_num))
    combined_risk = ["LOW", "MEDIUM", "HIGH", "CRITICAL"][int(combined_risk_num) - 1]
    
    if trust_score_val >= 80 and combined_risk_num <= 2:
        decision = "APPROVED"
        msg = "Your return request has been instantly approved!"
    elif trust_score_val >= 50 or combined_risk_num == 3:
        decision = "UNDER REVIEW"
        msg = "Your return request requires manual review."
    else:
        decision = "REJECTED"
        msg = "Your return request has been rejected due to policy violations."
        
    block_data = {
        "user": mask_aadhaar(aadhaar),
        "order_id": order_id,
        "reason": reason[:100],
        "risk_level": combined_risk,
        "trust_score": trust_score_val,
        "ai_recommendation": rec,
        "decision": decision,
        "timestamp": datetime.now().isoformat()
    }
    block = BLOCKCHAIN.add_block(block_data)
    
    return_id = "RET-" + secrets.token_hex(4).upper()
    add_return({
        "return_id": return_id,
        "aadhaar": aadhaar,
        "order_id": order_id,
        "reason": reason,
        "risk_level": combined_risk,
        "decision": decision,
        "trust_score": trust_score_val,
        "ai_powered": ai_result.get("ai_powered", False),
        "timestamp": datetime.now().isoformat(),
        "order_value": order_value,
        "block_hash": block.hash,
        "block_index": block.index
    })
    
    return jsonify({
        "success": True,
        "return_id": return_id,
        "decision": decision,
        "risk_level": combined_risk,
        "trust_score": trust_result,
        "ai_analysis": ai_result,
        "heuristic": heuristic,
        "block_hash": block.hash[:16],
        "block_index": block.index,
        "message": msg
    })

@returns_bp.route("/<string:aadhaar>", methods=["GET"])
def get_user_returns_route(aadhaar):
    return jsonify(get_user_returns(aadhaar))
