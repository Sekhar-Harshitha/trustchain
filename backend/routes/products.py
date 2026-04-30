from flask import Blueprint, jsonify, request
from store.memory_store import PRODUCTS

products_bp = Blueprint("products", __name__)

@products_bp.route("/", methods=["GET"])
def get_products():
    category = request.args.get("category")
    if category:
        filtered = [p for p in PRODUCTS if p.get("category", "").lower() == category.lower()]
        return jsonify(filtered)
    return jsonify(PRODUCTS)

@products_bp.route("/<string:product_id>", methods=["GET"])
def get_product(product_id):
    for p in PRODUCTS:
        if p["id"] == product_id:
            return jsonify(p)
    return jsonify({"success": False, "error": "Product not found"}), 404
