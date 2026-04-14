from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

# Import agents from utils
from utils.low_stock_prediction import predict_low_stock
from utils.auto_reorder import create_reorder
from utils.chatbot import chatbot_query
from utils.barcode_scanner import scan_barcode
from utils.analytics import get_analytics

app = Flask(__name__)
CORS(app)

DATABASE = "warehouse.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# -------------------------
# Example: Use agents as endpoints
# -------------------------

@app.route("/low-stock-prediction", methods=["GET"])
def low_stock_prediction_route():
    return jsonify(predict_low_stock())

@app.route("/auto-reorder", methods=["POST"])
def auto_reorder_route():
    data = request.json
    return jsonify(create_reorder(data["item_id"], data.get("reorder_qty", 50)))

@app.route("/chatbot", methods=["POST"])
def chatbot_route():
    query = request.json.get("query", "")
    return jsonify({"response": chatbot_query(query)})

@app.route("/scan-barcode", methods=["POST"])
def scan_barcode_route():
    barcode = request.json.get("barcode")
    return jsonify(scan_barcode(barcode))

@app.route("/analytics", methods=["GET"])
def analytics_route():
    return jsonify(get_analytics())

if __name__ == "__main__":
    app.run(debug=True)
