import secrets
from datetime import datetime
from flask import Blueprint, request, jsonify
from store.memory_store import sessions, add_order, get_user_orders

orders_bp = Blueprint("orders", __name__)

def get_user_from_token(req):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None, None
    token = auth_header.split(" ")[1]
    user = sessions.get(token)
    if not user:
        return None, None
    return user, user.get("aadhaar")

@orders_bp.route("/", methods=["POST"])
def create_order():
    user, aadhaar = get_user_from_token(request)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    data = request.get_json() or {}
    items = data.get("items", [])
    total = data.get("total", 0)
    
    if not items or total <= 0:
        return jsonify({"success": False, "error": "Invalid order data"}), 400
        
    order_id = "ORD-" + secrets.token_hex(4).upper()
    
    add_order({
        "order_id": order_id,
        "aadhaar": aadhaar,
        "items": items,
        "total": total,
        "timestamp": datetime.now().isoformat(),
        "status": "delivered",
        "user_name": user.get("name", "Unknown")
    })
    
    user["total_orders"] = user.get("total_orders", 0) + 1
    
    return jsonify({
        "success": True, 
        "order_id": order_id, 
        "status": "delivered", 
        "message": "Order placed and delivered!"
    })

@orders_bp.route("/<string:aadhaar>", methods=["GET"])
def get_orders(aadhaar):
    user, token_aadhaar = get_user_from_token(request)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    
    return jsonify(get_user_orders(aadhaar))
