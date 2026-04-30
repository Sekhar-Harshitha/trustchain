from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import blueprints
from routes.auth import auth_bp
from routes.products import products_bp
from routes.orders import orders_bp
from routes.returns import returns_bp
from routes.admin import admin_bp

load_dotenv()

app = Flask(__name__)

# Registration
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(products_bp, url_prefix="/api/products")
app.register_blueprint(orders_bp, url_prefix="/api/orders")
app.register_blueprint(returns_bp, url_prefix="/api/returns")
app.register_blueprint(admin_bp, url_prefix="/api/admin")

# Enable CORS for the React frontend
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

@app.route("/api/health")
def health():
    from store.memory_store import PRODUCTS
    from blockchain.chain import BLOCKCHAIN
    return jsonify({
        "status": "ok", 
        "chain_length": len(BLOCKCHAIN.chain),
        "products_loaded": len(PRODUCTS)
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
