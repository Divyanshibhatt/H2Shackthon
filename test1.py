# Warehouse Management System Backend in Python
# Tech Stack: Flask + MongoDB (PyMongo)
# Single-file backend suitable for academic / college project

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os

# =============================
# 1. APP CONFIGURATION
# =============================

app = Flask(__name__)
CORS(app)

PORT = 5000

# =============================
# 2. DATABASE CONNECTION
# =============================

client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["warehouseDB"]

items_collection = db["items"]
suppliers_collection = db["suppliers"]
logs_collection = db["logs"]

# =============================
# 3. HELPER FUNCTION
# =============================

def add_log(action, item_name, quantity, user="Admin"):
    log = {
        "action": action,
        "itemName": item_name,
        "quantity": quantity,
        "user": user,
        "timestamp": datetime.utcnow()
    }
    logs_collection.insert_one(log)

# =============================
# 4. INVENTORY ROUTES
# =============================

# GET all items
@app.route("/api/items", methods=["GET"])
def get_items():
    items = []
    for item in items_collection.find():
        item["_id"] = str(item["_id"])
        items.append(item)
    return jsonify(items)


# ADD item
@app.route("/api/items", methods=["POST"])
def add_item():
    data = request.json

    item = {
        "name": data.get("name"),
        "category": data.get("category"),
        "warehouse": data.get("warehouse"),
        "quantity": data.get("quantity"),
        "price": data.get("price"),
        "minStock": data.get("minStock"),
        "supplier": data.get("supplier"),
        "createdAt": datetime.utcnow()
    }

    result = items_collection.insert_one(item)

    add_log("ADD", item["name"], item["quantity"])

    item["_id"] = str(result.inserted_id)

    return jsonify(item), 201


# UPDATE item
@app.route("/api/items/<id>", methods=["PUT"])
def update_item(id):
    data = request.json

    items_collection.update_one(
        {"_id": __import__("bson").ObjectId(id)},
        {"$set": data}
    )

    updated_item = items_collection.find_one(
        {"_id": __import__("bson").ObjectId(id)}
    )

    add_log("UPDATE", updated_item.get("name"), updated_item.get("quantity"))

    updated_item["_id"] = str(updated_item["_id"])

    return jsonify(updated_item)


# DELETE item
@app.route("/api/items/<id>", methods=["DELETE"])
def delete_item(id):
    item = items_collection.find_one_and_delete(
        {"_id": __import__("bson").ObjectId(id)}
    )

    if item:
        add_log("DELETE", item.get("name"), item.get("quantity"))

    return jsonify({"message": "Item deleted"})


# =============================
# 5. SUPPLIER ROUTES
# =============================

# GET suppliers
@app.route("/api/suppliers", methods=["GET"])
def get_suppliers():
    suppliers = []
    for supplier in suppliers_collection.find():
        supplier["_id"] = str(supplier["_id"])
        suppliers.append(supplier)
    return jsonify(suppliers)


# ADD supplier
@app.route("/api/suppliers", methods=["POST"])
def add_supplier():
    data = request.json

    supplier = {
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "status": data.get("status", "Active"),
        "createdAt": datetime.utcnow()
    }

    result = suppliers_collection.insert_one(supplier)

    add_log("ADD SUPPLIER", supplier["name"], 0)

    supplier["_id"] = str(result.inserted_id)

    return jsonify(supplier), 201


# DELETE supplier
@app.route("/api/suppliers/<id>", methods=["DELETE"])
def delete_supplier(id):
    supplier = suppliers_collection.find_one_and_delete(
        {"_id": __import__("bson").ObjectId(id)}
    )

    if supplier:
        add_log("DELETE SUPPLIER", supplier.get("name"), 0)

    return jsonify({"message": "Supplier deleted"})


# =============================
# 6. ACTIVITY LOG ROUTES
# =============================

@app.route("/api/logs", methods=["GET"])
def get_logs():
    logs = []
    for log in logs_collection.find().sort("timestamp", -1):
        log["_id"] = str(log["_id"])
        logs.append(log)
    return jsonify(logs)


# =============================
# 7. DASHBOARD ROUTE
# =============================

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    total_items = items_collection.count_documents({})

    low_stock = items_collection.count_documents({
        "$expr": {"$lte": ["$quantity", "$minStock"]}
    })

    total_value = 0

    for item in items_collection.find():
        total_value += item.get("quantity", 0) * item.get("price", 0)

    return jsonify({
        "totalItems": total_items,
        "lowStock": low_stock,
        "totalValue": total_value
    })


# =============================
# 8. LOGIN ROUTE (DEMO)
# =============================

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json

    role = data.get("role")

    if not role:
        return jsonify({"message": "Role required"}), 400

    return jsonify({
        "message": "Login successful",
        "role": role
    })


# =============================
# 9. RUN SERVER
# =============================

if __name__ == "__main__":
    print("Server running on port", PORT)
    app.run(debug=True, port=PORT)


# =============================
# INSTALLATION COMMANDS
# =============================

"""

pip install flask flask-cors pymongo

python app.py

"""
